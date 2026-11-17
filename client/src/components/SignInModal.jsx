import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Loader2, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export default function SignInModal({ isOpen, onClose }) {
  const { signInWithGoogle, signInAsDemo, signInCustom } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('Kisara Harini');
  const [customEmail, setCustomEmail] = useState('harini.kisara@college.edu');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      success('Welcome to Fresher.AI!');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        error('Sign-in cancelled. Please try again.');
      } else {
        error(err.message || 'Google sign-in failed. You can also use Demo Student mode.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoadingDemo(true);
    try {
      await signInAsDemo();
      success('Logged in as Demo Student: Kisara Harini');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      error('Failed to log in as demo student.');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleCustomSignIn = async (e) => {
    e.preventDefault();
    if (!customName.trim()) {
      error('Please enter your name.');
      return;
    }
    setLoadingCustom(true);
    try {
      await signInCustom(customName, customEmail);
      success(`Welcome back, ${customName.split(' ')[0]}!`);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      error('Sign-in failed. Please try again.');
    } finally {
      setLoadingCustom(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-[420px] bg-[#0E0E12] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-8 pt-8 pb-5 text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#1A1A22] border border-white/10 items-center justify-center mb-3.5 shadow-inner">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 8.5 2 15.5 12 22 22 15.5 22 8.5 12 2" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Sign in to <span className="font-extrabold text-white">Fresher.AI</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Choose your preferred sign-in method
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-8 pb-7 space-y-3">
          {/* 1. Quick Demo Mode Login (Kisara Harini) */}
          <button
            onClick={handleDemoSignIn}
            disabled={loadingGoogle || loadingDemo || loadingCustom}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-900/80 hover:to-indigo-900/80 border border-purple-500/40 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-lg shadow-purple-900/20"
          >
            {loadingDemo ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-300" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-300" />
            )}
            <span>Continue as Kisara Harini (1-Click Demo)</span>
          </button>

          {/* 2. Custom Name / Email Sign In Toggle */}
          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#18181F] hover:bg-[#20202A] border border-white/10 rounded-2xl text-gray-300 hover:text-white font-medium text-xs transition-colors"
            >
              <User className="w-4 h-4 text-gray-400" />
              <span>Sign in with Name & Email</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSignIn} className="bg-[#14141A] border border-white/10 rounded-2xl p-3.5 space-y-2.5 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Name</label>
                <div className="flex items-center gap-2 bg-[#0B0B0F] border border-white/10 rounded-xl px-3 py-2 text-white">
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-2 bg-[#0B0B0F] border border-white/10 rounded-xl px-3 py-2 text-white">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loadingCustom}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-gray-100 text-black font-semibold text-xs rounded-xl transition-all"
                >
                  {loadingCustom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Sign In</span>}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="py-2 px-3 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* 3. Continue with Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loadingDemo || loadingCustom}
            className="w-full flex items-center justify-center gap-3.5 py-2.5 px-4 bg-[#18181F] hover:bg-[#22222B] border border-white/10 rounded-2xl text-white font-medium text-xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loadingGoogle ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer Strip */}
        <div className="bg-[#09090C] py-3.5 px-6 border-t border-white/5 text-center">
          <p className="text-[11px] text-gray-500 font-medium tracking-tight">
            Secure authentication · Created by Kisara Harini
          </p>
        </div>
      </div>
    </div>
  );
}
