import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  User,
  RotateCcw,
  Loader2,
  FileCheck
} from 'lucide-react';
import { analyzeResumeScore } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function ResumeScorerPage() {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Drag and drop handling
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      error('Please select a valid PDF file. Other formats are not supported.');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      error('File exceeds the 20MB size limit. Please upload a smaller PDF.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      error('Please select a PDF resume to analyze.');
      return;
    }

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await analyzeResumeScore(formData);
      if (res?.success) {
        setAnalysis(res.data);
        setStep(2);
        success('Resume analyzed successfully!');
        await refreshUser();
      }
    } catch (err) {
      error(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReupload = () => {
    setStep(1);
    setFile(null);
    setAnalysis(null);
  };

  // Score color ring calculations
  const score = analysis?.score ?? 0;
  let ringStrokeColor = '#EF4444'; // Red < 40
  if (score >= 80) {
    ringStrokeColor = '#8B5CF6'; // Purple >= 80
  } else if (score >= 40) {
    ringStrokeColor = '#F59E0B'; // Amber 40-79
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Thin Top Bar */}
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
            Resume Scorer
          </span>
        </div>

        <Link
          to="/dashboard"
          className="text-xs font-semibold text-gray-600 hover:text-black transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center p-6">
        {step === 1 ? (
          /* STEP 1: Upload Card (~340px-400px wide, rounded 24px) */
          <div className="w-full max-w-[380px] bg-[#0E0E12] border border-white/10 rounded-3xl p-6 shadow-card text-white animate-scaleUp">
            {/* Step Indicator & 2-segment progress bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2">
                <span>Step 1 of 2</span>
              </div>
              <div className="flex gap-1.5 h-1 w-full">
                <div className="flex-1 bg-white rounded-full" />
                <div className="flex-1 bg-white/15 rounded-full" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
              Upload Your Resume
            </h2>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              We'll score it and give you actionable feedback
            </p>

            {/* Dashed Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-950/20'
                  : 'border-white/15 bg-[#14141A] hover:border-white/30 hover:bg-[#181822]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />

              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-white">
                {file ? <FileCheck className="w-6 h-6 text-emerald-400" /> : <UploadCloud className="w-6 h-6" />}
              </div>

              {file ? (
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-[240px] mx-auto">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-1">Ready for ATS analysis</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    Click to browse or drag file
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    PDF only · Max 20MB
                  </p>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!file || analyzing}
              className={`w-full mt-6 py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                !file || analyzing
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100 text-[#121216] shadow-lg hover:scale-[1.01]'
              }`}
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze</span>
              )}
            </button>
          </div>
        ) : (
          /* STEP 2: Analysis Results View */
          <div className="w-full max-w-4xl space-y-6 animate-fadeIn pb-12">
            {/* Top Bar inside results */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Your Resume Analysis
                </span>
                <h1 className="text-3xl font-extrabold text-[#121216]">
                  {analysis?.candidateName || 'Candidate Profile'}
                </h1>
              </div>

              <button
                onClick={handleReupload}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:border-gray-900 rounded-xl text-xs font-bold text-[#121216] bg-white transition-all shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-upload</span>
              </button>
            </div>

            {/* Wide Dark Score Card */}
            <div className="bg-[#0E0E12] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col sm:flex-row items-center gap-8">
              {/* Circular Progress Ring */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={ringStrokeColor}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white">{score}</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">/ 100</span>
                </div>
              </div>

              {/* Score Meta */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-bold tracking-wider uppercase text-gray-400">
                  Resume Score
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white my-1">
                  {analysis?.label || 'Average'}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold mt-2">
                  <User className="w-3.5 h-3.5" />
                  <span>{analysis?.detectedRole || 'Software Engineer'}</span>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses 2-Column Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths Card */}
              <div className="bg-[#0E0E12] border border-white/10 rounded-3xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Strengths</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis?.strengths?.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weaknesses Card */}
              <div className="bg-[#0E0E12] border border-white/10 rounded-3xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Weaknesses</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis?.weaknesses?.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-950/40 text-amber-300 border border-amber-500/30"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Full-Width Missing Skills Card */}
            <div className="bg-[#0E0E12] border border-white/10 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Missing Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis?.missingSkills?.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-950/40 text-red-300 border border-red-500/30"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Full-Width Recommendations Card */}
            <div className="bg-[#0E0E12] border border-white/10 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Recommendations</h3>
              </div>
              <div className="space-y-3">
                {analysis?.recommendations?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

