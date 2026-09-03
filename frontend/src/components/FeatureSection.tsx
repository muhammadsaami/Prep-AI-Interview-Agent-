import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, BarChart3, FileText, ArrowRight } from 'lucide-react';

export const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: BrainCircuit,
      title: 'Realistic AI Interviews',
      description: 'Practice with an AI interviewer that adapts in real-time and pushes back on weak or vague answers.',
      badge: 'Adaptive Engine',
      glowColor: 'from-blue-500/20 to-indigo-500/20',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    },
    {
      icon: BarChart3,
      title: 'Instant Feedback',
      description: 'Understand exactly where your technical knowledge and communication skills need targeted improvement.',
      badge: 'Deep Analytics',
      glowColor: 'from-indigo-500/20 to-purple-500/20',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    },
    {
      icon: FileText,
      title: 'Personalized Practice',
      description: 'Upload your resume and target role to generate a completely customized set of interview questions.',
      badge: 'Resume Parsing',
      glowColor: 'from-purple-500/20 to-pink-500/20',
      iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    },
  ];

  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight"
          >
            Everything you need to ace your next interview.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-300 font-normal mt-4 leading-relaxed"
          >
            From realistic AI conversations to detailed performance feedback, PrepAI helps you practice smarter.
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group relative glass-card-interactive rounded-3xl p-8 flex flex-col justify-between overflow-hidden"
              >
                {/* Background Ambient Glow */}
                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full bg-gradient-to-br ${feature.glowColor} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} border flex items-center justify-center shadow-inner`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase bg-slate-800/60 px-3 py-1 rounded-full border border-white/5">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white tracking-tight mb-3 group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Card Action Footer — now a real link to signup, since that's
                    the actual next step to experience this feature (no
                    separate per-feature detail pages exist). */}
                <Link
                  to="/signup"
                  className="pt-6 mt-6 border-t border-white/5 flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 gap-1.5 transition-colors"
                >
                  <span>Try it now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};