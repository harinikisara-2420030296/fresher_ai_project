import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  Check,
  FileText,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { startNewInterview, uploadResumePdf } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function StartInterviewPage() {
  const { user, setUser, refreshUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [role, setRole] = useState('Backend Developer');
  const [type, setType] = useState('technical');
  const [useResume, setUseResume] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [creating, setCreating] = useState(false);

  const firstName = user?.name ? (user.name.includes('Harini') ? 'Harini' : user.name.split(' ')[0]) : 'Harini';
  const hasSavedResume = Boolean(user?.resume?.text);

  const handleResumeUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      error('Please upload a PDF file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      error('Resume must be smaller than 20MB.');
      return;
    }

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await uploadResumePdf(formData);
      if (res?.success) {
        success('Resume uploaded successfully!');
        await refreshUser();
      }
    } catch (err) {
      error(err.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleStart = async () => {
    if (!role.trim()) {
      error('Please enter a target role.');
      return;
    }

    if (useResume && !hasSavedResume) {
      error('Please upload your resume to enable resume-based questions.');
      return;
    }

    if ((user?.coins ?? 1000) < 50) {
      error('Insufficient coins! Each interview costs 50 coins. Top up using the coins card in sidebar.');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        role: role.trim(),
        type,
        useResume
      };

      const res = await startNewInterview(payload);
      if (res?.success && res.data) {
        if (user) {
          setUser({ ...user, coins: Math.max(0, (user.coins ?? 1000) - 50) });
        }
        success('Interview session prepared! Good luck!');
        navigate(`/interview/${res.data._id}`);
      }
    } catch (err) {
      error(err.message || 'Failed to start interview.');
    } finally {
      setCreating(false);
    }
  };

  const isStartDisabled = !role.trim() || (useResume && !hasSavedResume) || creating;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-5xl bg-[#0B0B0F] border border-white/10 rounded-4xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 text-white">
        {/* Left Half: Overview & Benefits */}
        <div className="p-8 sm:p-12 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between bg-gradient-to-b from-[#121218] to-[#0B0B0F]">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-gray-300 transition-colors mb-8"
            >
              <span>← Back</span>
            </Link>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
              Welcome back,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-purple-300">
                {firstName}
              </span>
            </h1>

            <p className="text-sm text-gray-400 font-normal leading-relaxed mb-8">
              Practice realistic AI interviews, receive instant feedback, and improve before your next job interview.
            </p>

            {/* 4 Feature Checkboxes */}
            <div className="space-y-3.5">
              {[
                'Personalized AI Questions',
                'Resume Based Interview',
                'Detailed Performance Report',
                'Real Interview Experience'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-black shrink-0 shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-200">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Cost: 50 coins / interview</span>
            </span>
            <span>Your Balance: <strong className="text-white">{user?.coins ?? 1000}</strong></span>
          </div>
        </div>

        {/* Right Half: Form Preferences */}
        <div className="p-8 sm:p-12 flex flex-col justify-between bg-[#0E0E14]">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Start Interview</h2>
              <p className="text-xs text-gray-400 mt-1">Configure your interview preferences.</p>
            </div>

            {/* Target Role Input */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Target Role
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Backend Developer"
                  className="w-full bg-[#181820] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Interview Type Segmented Control */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Interview Type
              </label>
              <div className="p-1 bg-[#181820] border border-white/10 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setType('technical')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'technical'
                      ? 'bg-white text-[#121216] shadow-sm'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Technical
                </button>
                <button
                  type="button"
                  onClick={() => setType('hr')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'hr'
                      ? 'bg-white text-[#121216] shadow-sm'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Hr
                </button>
              </div>
            </div>

            {/* Use Resume Toggle Row */}
            <div className="p-4 rounded-2xl bg-[#181820] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Use Resume</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  AI will personalize questions using your resume.
                </p>
              </div>

              {/* iOS Style On/Off Switch */}
              <button
                type="button"
                onClick={() => setUseResume(!useResume)}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none p-0.5 ${useResume ? 'bg-purple-600' : 'bg-gray-700'
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${useResume ? 'translate-x-6' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* Conditional Resume Ready / Upload Box */}
            {useResume && (
              <div className="space-y-3 animate-fadeIn">
                {hasSavedResume && (
                  <div className="p-3.5 rounded-2xl bg-[#0D2416] border border-emerald-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-300">Resume Ready</p>
                        <p className="text-[11px] text-emerald-400/80">
                          {user?.resume?.fileName || 'Resume detected successfully.'}
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  </div>
                )}

                {/* Upload or Update Resume Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl border border-dashed border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 cursor-pointer transition-all flex items-center gap-3.5"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleResumeUpload(e.target.files[0])}
                  />
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                    {uploadingResume ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {hasSavedResume ? 'Upload New Resume' : 'Upload Resume Required'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {hasSavedResume
                        ? 'Upload anytime to update your interview questions.'
                        : 'Upload your PDF resume to let AI ask custom questions.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Start Interview Action Button */}
          <div className="pt-6">
            <button
              onClick={handleStart}
              disabled={isStartDisabled}
              className={`w-full py-4 px-6 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${isStartDisabled
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100 text-[#0B0B0F] shadow-xl hover:scale-[1.01]'
                }`}
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Preparing AI Interview...</span>
                </>
              ) : (
                <>
                  <span>Start Interview</span>
                  <span className="text-base">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

