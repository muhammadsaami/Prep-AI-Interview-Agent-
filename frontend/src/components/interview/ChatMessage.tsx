import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { ChatMessage } from '../../types/interview';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isLast: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, isLast }) => {
  const isAI = message.sender === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`flex items-end gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      {/* AI Avatar */}
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mb-1 shadow-md shadow-blue-500/20">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Message Bubble */}
      <div className={`max-w-[72%] sm:max-w-[65%] flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
        {/* Type badge for AI follow-ups */}
        {isAI && message.type === 'followup' && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Follow-Up ↩
            </span>
          </div>
        )}

        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isAI
              ? 'bg-slate-800/70 border border-white/8 text-slate-100 rounded-bl-sm'
              : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-sm shadow-lg shadow-blue-500/20'
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-slate-600 mt-1.5 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

// Typing indicator component
export const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="flex items-end gap-3"
    >
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mb-1 shadow-md shadow-blue-500/20">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>

      {/* Animated dots bubble */}
      <div className="px-4 py-3.5 bg-slate-800/70 border border-white/8 rounded-2xl rounded-bl-sm shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -5, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.18,
                ease: 'easeInOut',
              }}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
