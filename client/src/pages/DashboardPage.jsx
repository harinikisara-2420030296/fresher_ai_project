import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileCheck2,
  Loader2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PerformanceRadarChart from '../components/RadarChart';
import { fetchDashboardStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { error } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name ? (user.name.includes('Harini') ? 'Harini' : user.name.split(' ')[0]) : 'Harini';

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const res = await fetchDashboardStats();
        if (isMounted && res?.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Dashboard stats fetch failed:', err.message);
        // Fallback for initial demo state if backend isn't populated yet
        if (isMounted) {
          setStats({
            totals: 0,
            questionsSolved: 0,
            completed: 0,
            averageScore: 0,
            counts: { technical: 0, hr: 0 },
            radar: {
              technical: { correctness: 0, clarity: 0, relevance: 0, detail: 0, efficiency: 0, communication: 0, problemSolving: 0, creativity: 0 },
              hr: { correctness: 0, clarity: 0, relevance: 0, detail: 0, efficiency: 0, communication: 0, problemSolving: 0, creativity: 0 }
            },
            recentInterviews: []
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStats();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row">
      {/* App Shell Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Header Greeting */}
        <div className="mb-8 pb-4 border-b border-gray-200/80">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Overview
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#121216] tracking-tight">
              Hello, {firstName} 👋
            </h1>
            <button
              onClick={() => navigate('/interview/new')}
              className="inline-flex items-center gap-2 bg-[#18181B] hover:bg-black text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all self-start sm:self-auto"
            >
              <span>+ Create Interview</span>
            </button>
          </div>
        </div>

        {/* 4 Dark Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Card 1: TOTAL INTERVIEWS */}
          <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between">
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              TOTAL INTERVIEWS
            </span>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-black text-white">
                {loading ? <Loader2 className="w-7 h-7 animate-spin inline" /> : (stats?.totals ?? 0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                All Time
              </span>
              <span className="text-[10px] font-semibold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                Interviews Created
              </span>
            </div>
          </div>

          {/* Card 2: QUESTIONS SOLVED */}
          <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between">
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              QUESTIONS SOLVED
            </span>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-black text-white">
                {loading ? <Loader2 className="w-7 h-7 animate-spin inline" /> : (stats?.questionsSolved ?? 0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                Answered
              </span>
              <span className="text-[10px] font-semibold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                Across All Interviews
              </span>
            </div>
          </div>

          {/* Card 3: COMPLETED */}
          <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between">
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              COMPLETED
            </span>
            <div className="my-2">
              <span className="text-3xl sm:text-4xl font-black text-white">
                {loading ? <Loader2 className="w-7 h-7 animate-spin inline" /> : (stats?.completed ?? 0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                {stats?.completed ?? 0} Total
              </span>
              <span className="text-[10px] font-semibold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                Interviews Finished
              </span>
            </div>
          </div>

          {/* Card 4: AVERAGE SCORE */}
          <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between">
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              AVERAGE SCORE
            </span>
            <div className="my-2 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-white">
                {loading ? <Loader2 className="w-7 h-7 animate-spin inline" /> : (stats?.averageScore ?? 0)}
              </span>
              <span className="text-sm font-semibold text-gray-400">/100</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                Completed Only
              </span>
              <span className="text-[10px] font-semibold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                Average Performance
              </span>
            </div>
          </div>
        </div>

        {/* PERFORMANCE Section Header */}
        <div className="mb-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Performance
          </p>
          <h2 className="text-2xl font-bold text-[#121216] tracking-tight">
            Interview History
          </h2>
        </div>

        {/* 2 Large Dark Radar Cards Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <PerformanceRadarChart
            title="Technical Interviews"
            count={stats?.counts?.technical ?? 0}
            data={stats?.radar?.technical}
            color="#FFFFFF"
          />

          <PerformanceRadarChart
            title="HR Interviews"
            count={stats?.counts?.hr ?? 0}
            data={stats?.radar?.hr}
            color="#FFFFFF"
          />
        </div>

        {/* Recent Interviews List [INFERRED] */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-[#121216]">Recent Interviews</h3>
              <p className="text-xs text-gray-500">Track and review your mock sessions and evaluation scores</p>
            </div>
            <Link
              to="/interview/new"
              className="text-xs font-semibold text-[#18181B] hover:underline flex items-center gap-1"
            >
              <span>Start New</span>
              <span>→</span>
            </Link>
          </div>

          {stats?.recentInterviews && stats.recentInterviews.length > 0 ? (
            <div className="divide-y divide-gray-100 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Role & Type</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Score</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {stats.recentInterviews.map((item) => {
                    const isCompleted = item.status === 'completed';
                    const dateFormatted = new Date(item.startedAt || item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-gray-900">{item.role}</div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            item.type === 'technical'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-gray-500">
                          {dateFormatted}
                        </td>
                        <td className="py-3.5 px-3">
                          {isCompleted ? (
                            <span className="font-bold text-gray-900">
                              {item.overallScore}<span className="text-xs font-normal text-gray-400">/100</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">In progress</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                              <Clock className="w-3.5 h-3.5" />
                              <span>In Progress ({item.currentIndex || 0}/6)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {isCompleted ? (
                            <Link
                              to={`/interview/${item._id}/report`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <span>View Report</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <Link
                              to={`/interview/${item._id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#18181B] hover:bg-black px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <span>Resume</span>
                              <PlayCircle className="w-3 h-3" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-800">No interviews yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
                Configure your target role and jump into your first 6-question AI mock interview.
              </p>
              <button
                onClick={() => navigate('/interview/new')}
                className="bg-[#18181B] hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Start First Mock Interview
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

