import React, { useRef, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Code2, Volume2, VolumeX } from 'lucide-react';
import { ChatMessageBubble, TypingIndicator } from './ChatMessage';
import type { ChatMessage, InterviewStage } from '../../types/interview';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

interface ChatAreaProps {
  messages: ChatMessage[];
  isTyping: boolean;
  currentStage: InterviewStage;
  currentQuestion: number;
  totalQuestions: number;
  sessionId: string | null;
}

const stageLabels: Record<InterviewStage, string> = {
  intro: 'Introduction',
  technical: 'Technical Interview',
  behavioral: 'Behavioral Interview',
  closing: 'Closing',
};

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  currentStage,
  currentQuestion,
  totalQuestions,
  sessionId,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSpokenIdRef = useRef<string | null>(null);

  const { isSpeaking, isSupported, speak, stop } = useSpeechSynthesis();
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Auto-speak the latest AI message
  useEffect(() => {
    if (!voiceEnabled || !isSupported || messages.length === 0 || !sessionId) return;

    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg.sender === 'ai' &&
      lastMsg.id !== lastSpokenIdRef.current
    ) {
      lastSpokenIdRef.current = lastMsg.id;
      speak(lastMsg.content, sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, voiceEnabled, isSupported, sessionId]);

  const toggleVoice = () => {
    if (voiceEnabled) {
      stop();
    }
    setVoiceEnabled((prev) => !prev);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Interview Context Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-slate-200">
            {stageLabels[currentStage]}
          </span>
          <span className="text-slate-600 text-sm hidden sm:block">·</span>
          <span className="text-xs text-slate-500 hidden sm:block">
            Question{' '}
            <span className="text-slate-300 font-medium">{currentQuestion}</span> of{' '}
            <span className="text-slate-300 font-medium">{totalQuestions}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isSupported && (
            <button
              type="button"
              onClick={toggleVoice}
              title={voiceEnabled ? 'Mute agent voice' : 'Unmute agent voice'}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                isSpeaking ? 'bg-indigo-500/20' : 'hover:bg-white/5'
              }`}
            >
              {voiceEnabled ? (
                <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-indigo-400' : 'text-slate-500'}`} />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2">
            <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.round((currentQuestion / totalQuestions) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 tabular-nums">
              {Math.round((currentQuestion / totalQuestions) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <ChatMessageBubble key={msg.id} message={msg} isLast={i === messages.length - 1} />
          ))}

          {isTyping && <TypingIndicator key="typing" />}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
};