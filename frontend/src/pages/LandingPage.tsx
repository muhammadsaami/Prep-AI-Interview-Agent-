import React from 'react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Metrics } from '../components/Metrics';
import { FeatureSection } from '../components/FeatureSection';
import { HowItWorks } from '../components/HowItWorks';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 relative font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Ambient Animated Mesh Background */}
      <AnimatedBackground />

      {/* Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="relative z-10">
        <Hero />
        <Metrics />
        <FeatureSection />
        <HowItWorks />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};