import React, { useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface InterviewInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const InterviewInput: React.FC<InterviewInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  disabled,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Jab recognition se text mile, use answer input mein daalo AUR auto-submit karo
  useEffect(() => {
    if (transcript) {
      const finalAnswer = value ? `${value} ${transcript}` : transcript;
      onChange(finalAnswer);
      resetTranscript();

      // Thoda delay dete hain taaki state update ho jaye, phir auto-send
      setTimeout(() => {
        if (finalAnswer.trim() && !isLoading && !disabled) {
          onSend();
        }
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSend();
      }
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 140) + 'px';
    }
  };

  const handleMicClick = () => {
    if (!isSupported || disabled || isLoading) return;
    if (isListening) {
      stopListening();
    } else {
      onChange('');       // fresh recording ke liye purana text clear kar do
      startListening();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-white/8 bg-[#09090F]/60 backdrop-blur-md shrink-0">
      <div
        className={`relative flex items-end gap-3 bg-slate-800/60 border rounded-2xl px-4 py-3.5 transition-all duration-200 ${
          disabled
            ? 'border-white/5 opacity-50'
            : 'border-white/10 focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:shadow-lg focus-within:shadow-indigo-500/10'
        }`}
      >
        <button
          type="button"
          onClick={handleMicClick}
          disabled={!isSupported || disabled || isLoading}
          aria-label={isListening ? 'Stop recording' : 'Start voice input'}
          title={!isSupported ? 'Voice input not supported in this browser' : undefined}
          className={`shrink-0 mb-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
            isListening
              ? 'bg-red-500/20 ring-2 ring-red-500/50 animate-pulse'
              : 'hover:bg-white/5'
          } ${!isSupported ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Mic className={`w-4 h-4 ${isListening ? 'text-red-400' : 'text-slate-500'}`} />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={
            disabled
              ? 'Interview session completed.'
              : isListening
              ? 'Listening... speak your answer'
              : 'Type your answer, or click the mic to speak...'
          }
          rows={1}
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none outline-none min-h-[24px] max-h-[140px] leading-relaxed py-0"
          style={{ height: '24px' }}
        />

        <motion.button
          whileHover={{ scale: canSend ? 1.08 : 1 }}
          whileTap={{ scale: canSend ? 0.92 : 1 }}
          onClick={() => canSend && onSend()}
          disabled={!canSend}
          aria-label="Send answer"
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mb-0.5 transition-all duration-200 ${
            canSend
              ? 'gradient-button shadow-lg shadow-indigo-500/25 cursor-pointer'
              : 'bg-slate-700/60 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
          ) : (
            <Send className={`w-4 h-4 ${canSend ? 'text-white' : 'text-slate-500'}`} />
          )}
        </motion.button>
      </div>

      {!disabled && (
        <p className="text-[10px] text-slate-600 text-center mt-2">
          {isListening
            ? 'Listening... it will submit automatically when you stop speaking'
            : 'Click the mic to answer by voice — it sends automatically'}
        </p>
      )}
    </div>
  );
};