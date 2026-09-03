import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#08090D]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40 py-3.5'
          : 'bg-[#08090D]/50 backdrop-blur-md border-b border-white/5 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo: small icon image + live text (crisp at any size, correct
              contrast on dark navbar — unlike the full baked-in PNG lockup
              which was designed for a white background). */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/prep_ai_logo_icon.png" alt="PrepAI" className="h-9 w-9 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              Prep<span className="text-indigo-400">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation — only real, working sections */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              How It Works
            </a>
          </nav>

          {/* Action CTAs — real routes */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="gradient-button text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0C14] border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top-5 duration-200">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-200 hover:text-indigo-400 py-1"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-200 hover:text-indigo-400 py-1"
          >
            How It Works
          </a>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-200 hover:text-indigo-400 py-1"
          >
            Log In
          </Link>
          <div className="pt-2">
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="gradient-button w-full text-center text-white text-base font-semibold py-3 rounded-xl block"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};