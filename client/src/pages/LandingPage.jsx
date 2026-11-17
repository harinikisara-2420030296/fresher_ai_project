import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Mic, BarChart3, Map, Sparkles, Star, ChevronRight, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import SignInModal from '../components/SignInModal';
import { useAuth } from '../context/AuthContext';
import PerformanceRadarChart from '../components/RadarChart';

export default function LandingPage() {
  const [showSignIn, setShowSignIn] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleHeroCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setShowSignIn(true);
    }
  };

  // Sample data for the faithful product preview
  const previewRadarTech = {
    correctness: 82,
    clarity: 78,
    relevance: 85,
    detail: 70,
    efficiency: 75,
    communication: 80,
    problemSolving: 88,
    creativity: 74
  };

  const previewRadarHr = {
    correctness: 75,
    clarity: 88,
    relevance: 90,
    detail: 80,
    efficiency: 70,
    communication: 92,
    problemSolving: 75,
    creativity: 82
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col selection:bg-purple-100 selection:text-purple-900">
      <Navbar onOpenSignIn={() => setShowSignIn(true)} />

      {/* Hero Section with subtle radial grey glow */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        {/* Subtle radial glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-gray-200/50 via-gray-100/30 to-purple-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDEDED] border border-gray-300/60 shadow-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#18181B] tracking-tight">Multi-Agent Interview Platform</span>
          </div>

          {/* Giant 3-Line Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6">
            <span className="block text-[#121216]">Job Interviews</span>
            <span className="block text-gray-400">Don't Have to Suck</span>
            <span className="block text-[#121216]">Anymore!</span>
          </h1>

          {/* Grey Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-500 font-normal leading-relaxed mb-10">
            Fresher.AI is an innovative AI-powered interview preparation platform designed to help job seekers excel in their interviews.
          </p>

          {/* Hero CTA Button */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={handleHeroCTA}
              className="flex items-center gap-2.5 bg-[#18181B] hover:bg-black text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Get started for free</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>

        {/* Product Preview Card - Faithful Static Replica of Dashboard */}
        <div className="relative max-w-6xl mx-auto mt-16">
          <div className="p-3 bg-white/70 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-2xl">
            <div className="bg-[#FAFAFA] rounded-2xl overflow-hidden border border-gray-200/70 p-6 flex flex-col md:flex-row gap-6">
              {/* Mini Preview Sidebar */}
              <div className="w-full md:w-56 bg-white rounded-xl border border-gray-200/80 p-4 shrink-0 hidden sm:block">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-[#121216] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polygon points="12 2 2 8.5 2 15.5 12 22 22 15.5 22 8.5 12 2" />
                    </svg>
                  </div>
                  <span className="font-bold text-sm text-[#121216]">Fresher.AI</span>
                </div>
                <div className="w-full py-2 px-3 bg-[#18181B] text-white rounded-lg text-xs font-semibold text-center mb-4">
                  + Create Interview
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">AGENTS</p>
                <div className="space-y-1.5 text-xs text-gray-600 font-medium">
                  <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100"><FileText className="w-3.5 h-3.5" /> Resume Builder</div>
                  <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100"><Map className="w-3.5 h-3.5" /> Roadmap Builder</div>
                  <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100"><Star className="w-3.5 h-3.5" /> Resume Scorer</div>
                </div>
                <div className="mt-8 p-2.5 bg-[#0F0F14] rounded-xl text-white">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
                    <span className="font-bold flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-400" /> COINS</span>
                  </div>
                  <p className="text-base font-extrabold text-white">3590</p>
                </div>
              </div>

              {/* Main Dashboard Preview Area */}
              <div className="flex-1 space-y-4">
                <div className="border-b border-gray-200/80 pb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overview</span>
                  <h3 className="text-xl font-extrabold text-[#121216]">Hello, Harini 👋</h3>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-3.5 text-white">
                    <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">TOTAL INTERVIEWS</p>
                    <p className="text-2xl font-black text-white my-1">21</p>
                    <div className="flex gap-1">
                      <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">All Time</span>
                      <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">Created</span>
                    </div>
                  </div>

                  <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-3.5 text-white">
                    <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">QUESTIONS SOLVED</p>
                    <p className="text-2xl font-black text-white my-1">126</p>
                    <div className="flex gap-1">
                      <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">Answered</span>
                      <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">Total</span>
                    </div>
                  </div>

                  <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-3.5 text-white">
                    <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">COMPLETED</p>
                    <p className="text-2xl font-black text-white my-1">15</p>
                    <div className="flex gap-1">
                      <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">15 Finished</span>
                      <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">6 Draft</span>
                    </div>
                  </div>

                  <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-3.5 text-white">
                    <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">AVERAGE SCORE</p>
                    <p className="text-2xl font-black text-white my-1">23<span className="text-xs text-gray-400 font-normal">/100</span></p>
                    <div className="flex gap-1">
                      <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">Completed</span>
                      <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">Average</span>
                    </div>
                  </div>
                </div>

                {/* Radar Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-3 h-52 flex flex-col justify-between">
                    <PerformanceRadarChart data={previewRadarTech} title="Technical Interviews" count={12} color="#FFFFFF" />
                  </div>
                  <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-3 h-52 flex flex-col justify-between">
                    <PerformanceRadarChart data={previewRadarHr} title="HR Interviews" count={3} color="#FFFFFF" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: AI Powered Agents */}
      <section className="py-24 px-6 bg-[#FAFAFA] border-t border-gray-200/60">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EDEDED] border border-gray-300/60 shadow-xs mb-5">
              <span className="text-xs font-semibold text-[#18181B] tracking-tight">AI Powered Agents</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
              <span className="text-[#121216]">Specialized Agents For </span>
              <span className="text-gray-400">Every Interview Stage</span>
            </h2>
            <p className="text-base text-gray-500 font-normal leading-relaxed">
              Fresher.AI combines multiple AI agents that work together to help you build your resume, practice interviews, receive detailed feedback, and follow a personalized roadmap to land your dream job.
            </p>
          </div>

          {/* 4 Dark Rounded Cards in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Resume Agent */}
            <div className="bg-[#0E0E12] border border-white/10 rounded-3xl p-6 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A22] border border-white/10 flex items-center justify-center text-white mb-5 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 text-gray-200" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">Resume Agent</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Create ATS-friendly resumes, improve profile strength and maximize interview opportunities.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-medium text-purple-400 gap-1">
                <span>ATS Optimization</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 2. Interview Agent */}
            <div className="bg-[#0E0E12] border border-white/10 rounded-3xl p-6 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A22] border border-white/10 flex items-center justify-center text-white mb-5 group-hover:scale-105 transition-transform">
                  <Mic className="w-5 h-5 text-gray-200" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">Interview Agent</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Conduct realistic HR, Technical and Coding interviews with AI-powered simulations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-medium text-emerald-400 gap-1">
                <span>Voice & Speech AI</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 3. Feedback Agent */}
            <div className="bg-[#0E0E12] border border-white/10 rounded-3xl p-6 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A22] border border-white/10 flex items-center justify-center text-white mb-5 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5 text-gray-200" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">Feedback Agent</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Get detailed answer analysis, scoring reports and improvement recommendations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-medium text-blue-400 gap-1">
                <span>8-Axis Spider Radar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 4. Roadmap Agent */}
            <div className="bg-[#0E0E12] border border-white/10 rounded-3xl p-6 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A22] border border-white/10 flex items-center justify-center text-white mb-5 group-hover:scale-105 transition-transform">
                  <Map className="w-5 h-5 text-gray-200" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">Roadmap Agent</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Generate personalized learning roadmaps based on goals, skills and performance.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-medium text-amber-400 gap-1">
                <span>Curated Study Modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="mt-auto py-10 px-6 border-t border-gray-200/80 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#121216] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="12 2 2 8.5 2 15.5 12 22 22 15.5 22 8.5 12 2" />
              </svg>
            </div>
            <span className="font-extrabold text-[#121216] tracking-tight">Fresher.AI</span>
            <span className="text-xs text-gray-400 ml-2">© 2026 Fresher.AI · Designed & Built by <strong className="text-gray-700 font-semibold">Kisara Harini</strong></span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
            <span>Created by Kisara Harini</span>
            <button onClick={() => setShowSignIn(true)} className="hover:text-black transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </footer>

      {/* Sign-in Modal */}
      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
      />
    </div>
  );
}

