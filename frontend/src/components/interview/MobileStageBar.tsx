import React from 'react';
import { ChevronRight, Code2, Users, Handshake, FileText } from 'lucide-react';
import type { InterviewStage, StageStatus } from '../../types/interview';

interface MobileStageBarProps {
  currentStage: InterviewStage;
  stages: Array<{ id: InterviewStage; label: string; status: StageStatus }>;
}

const stageIcons: Record<string, React.ElementType> = {
  intro: FileText,
  technical: Code2,
  behavioral: Users,
  closing: Handshake,
};

export const MobileStageBar: React.FC<MobileStageBarProps> = ({ currentStage, stages }) => {
  return (
    <div className="flex md:hidden items-center gap-1 px-4 py-2.5 border-b border-white/8 bg-[#07080C] overflow-x-auto scrollbar-none">
      {stages.map((stage, i) => {
        const Icon = stageIcons[stage.id] || FileText;
        const isActive = stage.id === currentStage;
        const isCompleted = stage.status === 'completed';

        return (
          <React.Fragment key={stage.id}>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                isActive
                  ? 'bg-indigo-500/15 border border-indigo-500/25 text-indigo-300'
                  : isCompleted
                  ? 'text-emerald-400'
                  : 'text-slate-600'
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span className="text-[11px] font-semibold">{stage.label}</span>
            </div>
            {i < stages.length - 1 && (
              <ChevronRight className="w-3 h-3 text-slate-700 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
