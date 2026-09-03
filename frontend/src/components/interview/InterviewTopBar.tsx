import React, { useState, useEffect, useCallback } from 'react';
import { Timer, Briefcase, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface InterviewTopBarProps {
  targetRole: string;
  currentQuestion: number;
  totalQuestions: number;
}

function useSessionTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hh = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const mm = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

export const InterviewTopBar: React.FC<InterviewTopBarProps> = ({
  targetRole,
  currentQuestion,
  totalQuestions,
}) => {
  const time = useSessionTimer();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEndInterview = useCallback(() => {
    setShowConfirm(false);
    navigate('/');
  }, [navigate]);

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/8 bg-[#09090F]/80 backdrop-blur-md shrink-0">
        {/* Left: Role Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-white/8 shrink-0">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[180px] sm:max-w-none">
              {targetRole}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-slate-600">·</span>
            <span>
              Question{' '}
              <span className="text-slate-300 font-medium">{currentQuestion}</span> of{' '}
              <span className="text-slate-300 font-medium">{totalQuestions}</span>
            </span>
          </div>
        </div>

        {/* Right: Timer + End Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-white/6">
            <Timer className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-mono font-semibold text-slate-200 tabular-nums">
              {time}
            </span>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:block">End Interview</span>
          </button>
        </div>
      </header>

      {/* End Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">End Interview?</h3>
                  <p className="text-xs text-slate-400">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Are you sure you want to end this interview session? Your progress will be saved but the session will be closed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800/80 border border-white/8 hover:bg-slate-700/80 transition-colors"
                >
                  Continue Interview
                </button>
                <button
                  onClick={handleEndInterview}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600/80 hover:bg-red-600 border border-red-500/30 transition-colors"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
