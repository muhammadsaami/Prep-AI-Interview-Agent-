import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronDown } from 'lucide-react';
import { AIChatCard } from './AIChatCard';

export const Hero: React.FC = () => {
  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide backdrop-blur-md shadow-inner shadow-indigo-500/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI-Powered Interview Practice</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]"
            >
              Practice interviews with AI that actually{' '}
              <span className="gradient-text-blue-purple inline-block">
                pushes back
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed"
            >
              Practice realistic interviews, get instant feedback, and build the confidence to perform when it actually matters.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                to="/onboarding"
                className="gradient-button text-white text-base font-semibold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2.5 w-full sm:w-auto group shadow-lg shadow-indigo-500/25"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Scrolls to the real "How It Works" section instead of
                  pretending there's a separate demo mode. */}
              <a
                href="#how-it-works"
                onClick={scrollToHowItWorks}
                className="glass-card-interactive text-slate-200 text-base font-semibold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2.5 w-full sm:w-auto hover:text-white"
              >
                <span>See How It Works</span>
                <ChevronDown className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5">
            <AIChatCard />
          </div>
        </div>
      </div>
    </section>
  );
};