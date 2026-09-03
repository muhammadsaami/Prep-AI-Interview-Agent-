import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Clock, Code2, Users, Handshake, FileText } from 'lucide-react';
import type { InterviewStageItem, InterviewStage } from '../../types/interview';

interface InterviewSidebarProps {
  stages: InterviewStageItem[];
  currentStage: InterviewStage;
}

const stageIcons: Record<string, React.ElementType> = {
  intro: FileText,
  technical: Code2,
  behavioral: Users,
  closing: Handshake,
};

export const InterviewSidebar: React.FC<InterviewSidebarProps> = ({ stages, currentStage }) => {
  return (
    <aside className="hidden md:flex flex-col w-[220px] lg:w-[240px] shrink-0 h-screen bg-[#07080C] border-r border-white/8 relative z-10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-[1px] shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0A0B10] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Prep<span className="text-indigo-400">AI</span>
          </span>
        </a>
      </div>

      {/* Stage Progress Stepper */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-2 mb-5">
          Interview Progress
        </p>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[19px] top-7 bottom-7 w-px bg-white/8 z-0" />

          <div className="space-y-1 relative z-10">
            {stages.map((stage, index) => {
              const Icon = stageIcons[stage.id] || FileText;
              const isActive = stage.status === 'active';
              const isCompleted = stage.status === 'completed';

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className={`relative flex items-start gap-3 px-2 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-indigo-500/10 border border-indigo-500/20'
                      : 'hover:bg-white/3'
                  }`}
                >
                  {/* Stage Icon Circle */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 border ${
                      isCompleted
                        ? 'bg-emerald-500/15 border-emerald-500/30'
                        : isActive
                        ? 'bg-indigo-500/20 border-indigo-500/40 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800/60 border-white/8'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-indigo-400' : 'text-slate-500'
                        }`}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30"
                      />
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="pt-0.5 min-w-0">
                    <p
                      className={`text-sm font-semibold tracking-tight truncate transition-colors ${
                        isCompleted
                          ? 'text-emerald-400'
                          : isActive
                          ? 'text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {stage.label}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-[11px] text-slate-600">{stage.duration}</span>
                    </div>
                    {isActive && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        In Progress
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="px-5 py-4 border-t border-white/8">
        <p className="text-[11px] text-slate-600 text-center">AI-Powered by Groq</p>
      </div>
    </aside>
  );
};
