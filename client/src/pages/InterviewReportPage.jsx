import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Download,
  Award,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { fetchInterviewReport } from '../services/api';
import { useToast } from '../components/Toast';

export default function InterviewReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer = null;
    let isMounted = true;

    const checkReport = async () => {
      try {
        const res = await fetchInterviewReport(id);
        if (isMounted && res?.success && res.data) {
          setReport(res.data);
          if (res.data.reportStatus === 'ready' || res.data.status === 'completed') {
            setLoading(false);
          } else {
            // Still generating via BullMQ: poll every 2 seconds
            timer = setTimeout(checkReport, 2000);
          }
        }
      } catch (err) {
        if (isMounted) {
          error(err.message || 'Failed to fetch interview report.');
          setLoading(false);
        }
      }
    };

    checkReport();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [id, error]);

  const handleDownloadPdf = () => {
    window.print();
  };

  if (loading || report?.reportStatus === 'pending') {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-3xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Generating your report...
        </h2>
        <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
          The Feedback Agent and BullMQ background worker are evaluating your 6 responses and computing your performance report.
        </p>
      </div>
    );
  }

  const overallScore = report?.overallScore ?? 0;
  const questionsCount = report?.questions?.length || 6;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#121216] p-4 sm:p-8 selection:bg-purple-100">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Actions & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <Link
              to="/dashboard"
              className="no-print inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181B] text-white hover:bg-black text-xs font-semibold transition-colors mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#121216] tracking-tight">
              Interview Report
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              AI Generated Performance Analysis · {report?.role || 'Developer'} ({report?.type?.toUpperCase()})
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Completed Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#18181B] text-white text-xs font-semibold shadow-xs">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>Completed</span>
            </div>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* 3 Dark Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Stat 1: Overall Score */}
          <div className="dark-card p-6 text-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Overall Score
              </p>
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="text-3xl font-black text-white">{overallScore}</span>
                <span className="text-xs font-medium text-gray-400">/100</span>
              </div>
            </div>
          </div>

          {/* Stat 2: Questions */}
          <div className="dark-card p-6 text-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Questions
              </p>
              <p className="text-3xl font-black text-white my-0.5">
                {questionsCount}
              </p>
            </div>
          </div>

          {/* Stat 3: Status */}
          <div className="dark-card p-6 text-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Status
              </p>
              <p className="text-xl font-bold text-emerald-400 my-1">
                Completed
              </p>
            </div>
          </div>
        </div>

        {/* Interview Summary Card */}
        <div className="dark-card p-6 sm:p-8 text-white">
          <h3 className="text-lg font-bold text-white mb-2">Interview Summary</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {report?.summary || 'The candidate demonstrated a solid grasp of core fundamentals and problem-solving concepts.'}
          </p>
        </div>

        {/* 2-Column: Strengths & Areas to Improve */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="dark-card p-6 text-white">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Strengths</h3>
            </div>
            <div className="space-y-2.5">
              {report?.strengths?.map((str, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#0E2215] border border-emerald-500/25 text-emerald-200 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Areas to Improve */}
          <div className="dark-card p-6 text-white">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400">
                <XCircle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Areas to Improve</h3>
            </div>
            <div className="space-y-2.5">
              {report?.areasToImprove?.map((area, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#281014] border border-red-500/25 text-red-200 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Card */}
        <div className="dark-card p-6 sm:p-8 text-white">
          <h3 className="text-base font-bold text-white mb-4">Recommendations</h3>
          <div className="space-y-3">
            {report?.recommendations?.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs sm:text-sm text-gray-300">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Question Breakdown (6 Cards) */}
        <div className="space-y-6 pt-4">
          <h2 className="text-xl font-extrabold text-[#121216] tracking-tight">
            Question-by-Question Evaluation
          </h2>

          {report?.questions?.map((q, idx) => {
            const scores = q.scores || {};
            return (
              <div key={idx} className="dark-card p-6 text-white space-y-4 break-inside-avoid">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Question {q.index || idx + 1}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-semibold capitalize">
                    {q.difficulty || 'medium'}
                  </span>
                </div>

                <p className="text-base sm:text-lg font-bold text-white">
                  {q.text}
                </p>

                {/* User Answer */}
                <div className="p-4 rounded-xl bg-[#14141A] border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Your Answer
                  </span>
                  <p className="text-xs sm:text-sm text-gray-200 whitespace-pre-wrap font-sans">
                    {q.answer || 'No answer provided.'}
                  </p>
                </div>

                {/* 4 Score Metric Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Score</span>
                    <p className="text-2xl font-black text-white mt-0.5">{scores.score ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Clarity</span>
                    <p className="text-2xl font-black text-white mt-0.5">{scores.clarity ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Relevance</span>
                    <p className="text-2xl font-black text-white mt-0.5">{scores.relevance ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Communication</span>
                    <p className="text-2xl font-black text-white mt-0.5">{scores.communication ?? 0}</p>
                  </div>
                </div>

                {/* AI Feedback Box */}
                <div className="p-4 rounded-xl bg-[#0D2417] border border-emerald-500/30 text-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    AI Feedback
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {q.feedback || 'Good attempt.'}
                  </p>
                </div>

                {/* Suggested Improvements */}
                {q.suggestedImprovements && q.suggestedImprovements.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-gray-400">Suggested Improvements:</span>
                    <ul className="list-disc list-inside text-xs text-gray-300 space-y-1 pl-1">
                      {q.suggestedImprovements.map((imp, impIdx) => (
                        <li key={impIdx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

