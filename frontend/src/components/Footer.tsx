import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#05060A] border-t border-white/10 pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/5">
          {/* Left Column: Brand & Tagline */}
          <div className="md:col-span-6 space-y-4">
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0A0B10] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Prep<span className="text-indigo-400">AI</span>
              </span>
            </a>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              AI-powered interview practice for your next opportunity. Practice realistic scenarios, adapt to follow-ups, and get detailed actionable feedback.
            </p>
          </div>

          {/* Right Column: Navigation Links */}
          <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#product" className="hover:text-white transition-colors">AI Interviewer</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Resume Parser</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Feedback Reports</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Interview Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Design</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Rights Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 PrepAI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Designed for modern engineers & candidates</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
