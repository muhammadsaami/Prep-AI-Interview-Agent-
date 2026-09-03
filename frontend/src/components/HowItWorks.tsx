import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, MessagesSquare, LineChart } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: UploadCloud,
      step: '01',
      title: 'Upload Your Resume',
      description: 'Share your resume and target role. PrepAI reads your skills and projects to build questions specific to you.',
    },
    {
      icon: MessagesSquare,
      step: '02',
      title: 'Take the AI Interview',
      description: 'Answer intro, technical, and behavioral questions out loud or by typing. The AI reacts to what you actually say.',
    },
    {
      icon: LineChart,
      step: '03',
      title: 'Get Your Feedback Report',
      description: 'Receive a scored breakdown of your technical and communication performance, with specific areas to improve.',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight"
          >
            How PrepAI works.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-300 font-normal mt-4 leading-relaxed"
          >
            Three steps between you and a sharper, more confident interview performance.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative glass-card-interactive rounded-3xl p-8"
              >
                <span className="text-5xl font-extrabold text-white/5 absolute top-4 right-6 select-none">
                  {step.step}
                </span>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner mb-6">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};