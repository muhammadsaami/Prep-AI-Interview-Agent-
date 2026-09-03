import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { InterviewSidebar } from '../components/interview/InterviewSidebar';
import { InterviewTopBar } from '../components/interview/InterviewTopBar';
import { ChatArea } from '../components/interview/ChatArea';
import { InterviewInput } from '../components/interview/InterviewInput';
import { MobileStageBar } from '../components/interview/MobileStageBar';
import type {
  ChatMessage,
  InterviewSession,
  InterviewStageItem,
  InterviewStage,
} from '../types/interview';

const API_BASE_URL = 'http://localhost:8000';

const STAGE_ORDER: InterviewStage[] = ['intro', 'technical', 'behavioral', 'closing'];

function buildStages(currentStage: InterviewStage): InterviewStageItem[] {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const labels: Record<InterviewStage, { label: string; duration: string }> = {
    intro: { label: 'Intro', duration: '5 min' },
    technical: { label: 'Technical', duration: '15–20 min' },
    behavioral: { label: 'Behavioral', duration: '15 min' },
    closing: { label: 'Closing', duration: '5 min' },
  };

  return STAGE_ORDER.map((id, i) => ({
    id,
    label: labels[id].label,
    duration: labels[id].duration,
    status: i < currentIndex ? 'completed' : i === currentIndex ? 'active' : 'upcoming',
  }));
}

interface RawMessage {
  id?: number;
  sender: string;
  content: string;
  stage?: string;
  created_at?: string;
}

function mapRawMessage(raw: RawMessage): ChatMessage | null {
  if (raw.sender === 'system') return null;

  return {
    id: `${raw.sender}-${raw.id ?? raw.created_at ?? raw.content.slice(0, 20)}`,
    sender: raw.sender === 'agent' ? 'ai' : 'user',
    content: raw.content,
    type: raw.sender === 'agent' ? 'question' : 'answer',
    timestamp: raw.created_at ? new Date(raw.created_at) : new Date(),
  };
}

export const InterviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [targetRole, setTargetRole] = useState('');
  const [currentStage, setCurrentStage] = useState<InterviewStage>('intro');
  const [stages, setStages] = useState<InterviewStageItem[]>(buildStages('intro'));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSessionDone, setIsSessionDone] = useState(false);

  const isMounted = useRef(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ─── Load session + history on mount ────────────────────────────────────
  useEffect(() => {
    if (!sessionId) {
      setLoadError('No session ID found. Please start a new interview from the onboarding page.');
      setIsLoadingSession(false);
      return;
    }

    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadSession = async () => {
      try {
        const [sessionRes, historyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/sessions/${sessionId}`),
          fetch(`${API_BASE_URL}/interview/${sessionId}/history`),
        ]);

        if (!sessionRes.ok) {
          throw new Error('Could not load this interview session.');
        }
        const sessionData = await sessionRes.json();

        if (!isMounted.current) return;

        setTargetRole(sessionData.target_role || 'Interview');
        const stage: InterviewStage = STAGE_ORDER.includes(sessionData.stage)
          ? sessionData.stage
          : 'intro';
        setCurrentStage(stage);
        setStages(buildStages(stage));
        setIsSessionDone(sessionData.status === 'completed');

        if (historyRes.ok) {
          const historyResponse = await historyRes.json();
          const historyData: RawMessage[] = Array.isArray(historyResponse)
            ? historyResponse
            : historyResponse.messages || [];
          const mapped = historyData
            .map(mapRawMessage)
            .filter((m): m is ChatMessage => m !== null);
          setMessages(mapped);
        }
      } catch (err) {
        if (isMounted.current) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load interview session.');
        }
      } finally {
        if (isMounted.current) setIsLoadingSession(false);
      }
    };

    loadSession();
  }, [sessionId]);

  // ─── Send answer to backend ──────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping || isSessionDone || !sessionId) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: trimmed,
      type: 'answer',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/interview/${sessionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'The interview agent failed to respond.');
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: data.reply,
        type: 'followup',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      const newStage: InterviewStage = STAGE_ORDER.includes(data.stage) ? data.stage : currentStage;
      if (newStage !== currentStage) {
        setCurrentStage(newStage);
        setStages(buildStages(newStage));
      }

      if (data.status === 'completed') {
        setIsSessionDone(true);
        try {
          await fetch(`${API_BASE_URL}/session/${sessionId}/feedback`, { method: 'POST' });
        } catch {
          // Non-fatal — the Feedback page will retry fetching/generating.
        }
        setTimeout(() => {
          navigate(`/feedback?session_id=${sessionId}`);
        }, 1800);
      }
    } catch (err) {
      const errMsg: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        content:
          err instanceof Error
            ? `Something went wrong: ${err.message}`
            : 'Something went wrong. Please try again.',
        type: 'info',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      if (isMounted.current) setIsTyping(false);
    }
  }, [inputValue, isTyping, isSessionDone, sessionId, currentStage, navigate]);

  // ─── Loading / error states ───────────────────────────────────────────────
  if (isLoadingSession) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090F]">
        <p className="text-slate-400 text-sm">Loading your interview...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-[#09090F] gap-4">
        <p className="text-red-400 text-sm">{loadError}</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="gradient-button text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
        >
          Go to Onboarding
        </button>
      </div>
    );
  }

  const dummySession: InterviewSession = {
    targetRole,
    currentStage,
    currentQuestion: 1,
    totalQuestions: 1,
    stages,
  };

  return (
    <div className="flex h-screen w-screen bg-[#09090F] overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-700/8 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-700/8 rounded-full blur-[120px]"
        />
      </div>

      <InterviewSidebar stages={stages} currentStage={currentStage} />

      <main className="flex flex-col flex-1 min-w-0 min-h-0 relative z-10">
        <InterviewTopBar
          targetRole={dummySession.targetRole}
          currentQuestion={1}
          totalQuestions={1}
        />

        <MobileStageBar currentStage={currentStage} stages={stages} />

        <ChatArea
          messages={messages}
          isTyping={isTyping}
          currentStage={currentStage}
          currentQuestion={1}
          totalQuestions={1}
          sessionId={sessionId}
        />

        <InterviewInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          isLoading={isTyping}
          disabled={isSessionDone}
        />
      </main>
    </div>
  );
};