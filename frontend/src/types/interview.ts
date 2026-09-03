// Types for the interview chat interface

export type MessageSender = 'ai' | 'user';
export type MessageType = 'question' | 'followup' | 'answer' | 'info';
export type InterviewStage = 'intro' | 'technical' | 'behavioral' | 'closing';
export type StageStatus = 'completed' | 'active' | 'upcoming';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
  type: MessageType;
  timestamp: Date;
}

export interface InterviewStageItem {
  id: InterviewStage;
  label: string;
  duration: string;
  status: StageStatus;
}

export interface InterviewSession {
  targetRole: string;
  currentStage: InterviewStage;
  currentQuestion: number;
  totalQuestions: number;
  stages: InterviewStageItem[];
}
