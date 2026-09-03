import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Circle } from 'lucide-react';

export const AIChatCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative w-full max-w-lg mx-auto lg:max-w-none"
    >
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />

      {/* Floating Card Container */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative glass-card rounded-2xl p-5 sm:p-6 shadow-2xl shadow-indigo-950/50 border border-white/10 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">AI Senior Interviewer</h3>
              <p className="text-xs text-slate-400">System Architecture & Backend</p>
            </div>
          </div>

          {/* Honest label: this is a static sample conversation illustrating
              the product, not a real live session. */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-700/40 border border-white/10">
            <Circle className="w-2 h-2 text-indigo-400 fill-indigo-400" />
            <span className="text-[11px] font-semibold text-slate-300 tracking-wider">SAMPLE</span>
          </div>
        </div>

        {/* Conversation Message List */}
        <div className="space-y-4">
          {/* AI Message 1 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 bg-slate-800/60 rounded-2xl rounded-tl-none p-3.5 border border-white/5 shadow-sm">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Tell me about a time you had to design a system that scaled to millions of users.
              </p>
              <span className="text-[10px] text-slate-500 mt-1.5 block text-right">10:42 AM</span>
            </div>
          </div>

          {/* User Response */}
          <div className="flex items-start gap-3 flex-row-reverse">
            <div className="w-7 h-7 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <div className="flex-1 bg-indigo-600/20 rounded-2xl rounded-tr-none p-3.5 border border-indigo-500/20 shadow-sm">
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                In my last role we had to redesign our notification service to handle over 10M peak daily events...
              </p>
              <span className="text-[10px] text-indigo-300/70 mt-1.5 block text-right">10:43 AM</span>
            </div>
          </div>

          {/* AI Follow-up (Pushes Back) */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 bg-slate-800/60 rounded-2xl rounded-tl-none p-3.5 border border-white/5 shadow-sm">
              <div className="inline-block px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-400 mb-1.5">
                Probing Follow-Up
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Interesting. What were the exact bottlenecks in your initial queueing approach before the redesign?
              </p>
              <span className="text-[10px] text-slate-500 mt-1.5 block text-right">10:43 AM</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-400">Example conversation from a real session</span>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
            <Circle className="w-2 h-2 text-indigo-400 fill-indigo-400" />
            <span>Adapts to your answers</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};