import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Map,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  Sparkles,
  BookOpen,
  ExternalLink,
  Loader2,
  FileText
} from 'lucide-react';
import { generateRoadmap, fetchAllRoadmaps } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function RoadmapPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [roleInput, setRoleInput] = useState('');
  const [salary, setSalary] = useState('10 LPA');
  const [useResume, setUseResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const salaryOptions = ['5 LPA', '8 LPA', '10 LPA', '15 LPA', '20 LPA', '30 LPA'];
  const quickPicks = ['Frontend Dev', 'Backend Eng', 'ML Engineer'];

  const handleGenerate = async (customRole) => {
    const targetRole = customRole || roleInput.trim();
    if (!targetRole) {
      error('Please enter a target role or click one of the quick-picks.');
      return;
    }

    setLoading(true);
    try {
      const res = await generateRoadmap({
        role: targetRole,
        salaryLPA: salary,
        useResume
      });

      if (res?.success && res.data) {
        setActiveRoadmap(res.data);
        // Expand first module by default
        setExpandedModules({ 0: true });
        success('Roadmap generated successfully!');
      }
    } catch (err) {
      error(err.message || 'Failed to generate roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (index) => {
    setExpandedModules((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between selection:bg-purple-100">
      {/* Top Bar */}
      <header className="w-full bg-white border-b border-gray-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#121216] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="12 2 2 8.5 2 15.5 12 22 22 15.5 22 8.5 12 2" />
              </svg>
            </div>
            <span className="font-extrabold text-[#121216] text-lg tracking-tight">Fresher.AI</span>
          </Link>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EDEDED] text-gray-700">
            Roadmap Generator
          </span>
        </div>

        <Link
          to="/dashboard"
          className="text-xs font-semibold text-gray-600 hover:text-black transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 pb-36">
        {loading ? (
          /* Loading Skeleton */
          <div className="py-20 text-center animate-pulse">
            <div className="w-16 h-16 rounded-3xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Building Your Custom Learning Roadmap...
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Our Roadmap Agent is analyzing market demands, salary expectations ({salary}), and structuring sequential milestones.
            </p>
          </div>
        ) : !activeRoadmap ? (
          /* Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-lg mx-auto animate-fadeIn">
            <span className="text-6xl mb-6">🚀</span>
            <h1 className="text-3xl font-extrabold text-[#121216] tracking-tight mb-3">
              AI Roadmap Generator
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Generate a personalised roadmap for your dream job. Choose a role and let AI build a complete learning path.
            </p>

            {/* 3 Dark Rounded Quick-Pick Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {quickPicks.map((pick) => (
                <button
                  key={pick}
                  onClick={() => {
                    setRoleInput(pick);
                    handleGenerate(pick);
                  }}
                  className="px-5 py-3 rounded-2xl bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95"
                >
                  {pick}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Result View */
          <div className="space-y-6 animate-fadeIn">
            {/* Large Dark Header Card */}
            <div className="bg-[#0E0E12] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
              <button
                onClick={() => setActiveRoadmap(null)}
                className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close roadmap"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Your Roadmap
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeRoadmap.title}
              </h2>
              <p className="text-xs text-purple-300 font-semibold mt-1">
                Target: {activeRoadmap.targetSalaryLPA || salary}
              </p>

              {/* 3 Inner Tiles */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Difficulty</span>
                  <p className="text-sm font-bold text-white mt-0.5">{activeRoadmap.difficulty}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Duration</span>
                  <p className="text-sm font-bold text-white mt-0.5">{activeRoadmap.durationMonths} Months</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Modules</span>
                  <p className="text-sm font-bold text-white mt-0.5">{activeRoadmap.modules?.length || 0} Topics</p>
                </div>
              </div>
            </div>

            {/* Learning Modules Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Map className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Learning Modules
                </span>
              </div>

              {/* Accordion List */}
              <div className="space-y-3">
                {activeRoadmap.modules?.map((mod, idx) => {
                  const isExpanded = Boolean(expandedModules[idx]);
                  const diff = mod.difficulty?.toLowerCase();

                  let diffColor = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
                  let numColor = 'text-emerald-400';
                  if (diff === 'medium') {
                    diffColor = 'bg-purple-950/60 text-purple-300 border-purple-500/30';
                    numColor = 'text-purple-400';
                  } else if (diff === 'hard') {
                    diffColor = 'bg-red-950/60 text-red-400 border-red-500/30';
                    numColor = 'text-red-400';
                  }

                  return (
                    <div
                      key={idx}
                      className="bg-[#0E0E12] border border-white/10 rounded-2xl overflow-hidden transition-all shadow-md"
                    >
                      {/* Accordion Row Header */}
                      <div
                        onClick={() => toggleModule(idx)}
                        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Numbered Rounded Square Badge */}
                          <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 font-bold text-sm flex items-center justify-center shrink-0 ${numColor}`}>
                            {mod.order || idx + 1}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-sm sm:text-base font-bold text-white truncate">
                              {mod.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span>{mod.durationMonths} Month{mod.durationMonths > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${diffColor}`}>
                            {mod.difficulty}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Accordion Details [INFERRED] */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-white/5 text-xs text-gray-300 space-y-3 bg-[#13131A] animate-fadeIn">
                          <p className="leading-relaxed text-gray-400">
                            {mod.description}
                          </p>

                          {/* Key Topics */}
                          {mod.topics && mod.topics.length > 0 && (
                            <div>
                              <strong className="text-white block mb-1 font-semibold">Key Topics to Master:</strong>
                              <div className="flex flex-wrap gap-1.5">
                                {mod.topics.map((t, tIdx) => (
                                  <span key={tIdx} className="bg-white/10 text-gray-200 px-2.5 py-1 rounded-lg text-[11px]">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Free Resources */}
                          {mod.resources && mod.resources.length > 0 && (
                            <div className="pt-1">
                              <strong className="text-white block mb-1 font-semibold">Recommended Free Resources:</strong>
                              <ul className="space-y-1 text-gray-400 pl-1">
                                {mod.resources.map((res, rIdx) => (
                                  <li key={rIdx} className="flex items-center gap-1.5 text-purple-300">
                                    <BookOpen className="w-3 h-3 text-purple-400" />
                                    <span>{res}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Prompt Bar (Chat-Style, Rounded, White with Shadow) */}
      <div className="fixed bottom-6 inset-x-0 max-w-3xl mx-auto px-4 z-40">
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xl p-2.5 flex items-center gap-2">
          {/* Role Input */}
          <input
            type="text"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerate();
            }}
            placeholder="Enter role or dream goal (e.g. Full Stack MERN Developer)..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[#121216] placeholder-gray-400 focus:outline-none"
          />

          {/* Target Salary Dropdown */}
          <div className="border-l border-gray-200 pl-2">
            <select
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 rounded-xl px-2.5 py-2 border-0 focus:outline-none cursor-pointer"
            >
              {salaryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Resume Toggle Chip */}
          <button
            type="button"
            onClick={() => setUseResume(!useResume)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              useResume
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Personalize with uploaded resume"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Resume</span>
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="w-10 h-10 rounded-xl bg-[#18181B] hover:bg-black text-white flex items-center justify-center transition-all shadow-md shrink-0 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

