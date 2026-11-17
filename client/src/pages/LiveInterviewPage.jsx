import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Code2,
  Clock,
  Sparkles,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { fetchInterviewSession, submitAnswer } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import CodeEditor from '../components/CodeEditor';
import AiInterviewerSvg from '../assets/ai-interviewer.svg';

export default function LiveInterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error, info } = useToast();

  // Session State
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prevFeedback, setPrevFeedback] = useState(null);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);

  // Timer: 60s per question
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const timerRef = useRef(null);

  // Camera State
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Speech Recognition & Synthesis hooks
  const { isSpeaking, speak, cancel: cancelSpeech } = useSpeechSynthesis();

  const handleSpeechTranscript = useCallback((text) => {
    setAnswerText((prev) => {
      // Append text smoothly
      const separator = prev.length && !prev.endsWith(' ') ? ' ' : '';
      return prev + separator + text;
    });
  }, []);

  const {
    isListening,
    hasSupport: hasSpeechSupport,
    toggleListening,
    stopListening
  } = useSpeechRecognition({ onTranscript: handleSpeechTranscript });

  // Camera toggle handler
  const toggleCamera = async () => {
    if (cameraOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraOn(true);
      } catch (err) {
        error('Could not access camera. Please allow camera permissions.');
        setCameraOn(false);
      }
    }
  };

  // Ensure webcam stream attaches when video element appears
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn]);

  // Cleanup media & speech on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
      cancelSpeech();
    };
  }, [cancelSpeech]);

  // Load session from server
  const loadSession = useCallback(async () => {
    try {
      const res = await fetchInterviewSession(id);
      if (res?.success && res.data) {
        const data = res.data;
        setSession(data);

        if (data.status === 'completed') {
          navigate(`/interview/${id}/report`);
          return;
        }

        const q = data.currentQuestion;
        setCurrentQuestion(q);
        setAnswerText('');
        setCodeSnippet('');
        setShowCodeEditor(false);

        // Calculate remaining seconds if provided by server
        const remaining = data.secondsRemaining ?? 60;
        setSecondsRemaining(Math.max(1, remaining));

        // Set previous feedback if available
        if (data.previousFeedback) {
          setPrevFeedback(data.previousFeedback);
        }

        // AI reads question aloud
        if (q?.text) {
          speak(`Question ${q.index}: ${q.text}`);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to load interview session.');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, speak, error]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Timer countdown countdown effect
  useEffect(() => {
    if (loading || !currentQuestion || submitting) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmitTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentQuestion, submitting, loading]);

  // Handle timeout auto submit
  const handleAutoSubmitTimeout = async () => {
    info("Time's up! Submitting answer...");
    await handleSubmitAnswer(true);
  };

  // Submit Answer
  const handleSubmitAnswer = async (timedOut = false) => {
    if (submitting) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (isListening) stopListening();
    cancelSpeech();

    setSubmitting(true);

    try {
      let finalAnswer = answerText.trim();
      if (codeSnippet.trim()) {
        finalAnswer += `\n\n\`\`\`javascript\n${codeSnippet.trim()}\n\`\`\``;
      }

      if (timedOut && !finalAnswer) {
        finalAnswer = 'No answer provided. Time over.';
      }

      const res = await submitAnswer(id, {
        answer: finalAnswer,
        code: codeSnippet.trim(),
        timedOut: Boolean(timedOut)
      });

      if (res?.success) {
        const resultData = res.data;
        const feedbackMsg = resultData.feedback || 'Answer recorded.';
        setPrevFeedback(feedbackMsg);
        setShowFeedbackBanner(true);

        // Read short feedback aloud
        speak(feedbackMsg);

        if (resultData.finished) {
          setTimeout(() => {
            navigate(`/interview/${id}/report`);
          }, 2500);
        } else {
          // Prepare next question after brief 2s feedback viewing
          setTimeout(() => {
            setShowFeedbackBanner(false);
            setCurrentQuestion(resultData.nextQuestion);
            setAnswerText('');
            setCodeSnippet('');
            setShowCodeEditor(false);
            setSecondsRemaining(60);
            setSubmitting(false);

            if (resultData.nextQuestion?.text) {
              speak(`Question ${resultData.nextQuestion.index}: ${resultData.nextQuestion.text}`);
            }
          }, 2200);
        }
      }
    } catch (err) {
      error(err.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  // Handle Ctrl+Enter shortcut
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleSubmitAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center p-6 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
        <p className="text-sm font-medium text-gray-400">Entering AI Interview Room...</p>
      </div>
    );
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Candidate';

  // Circular timer calculation
  const timerRadius = 18;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerProgress = (secondsRemaining / 60) * timerCircumference;

  const currentIdx = currentQuestion?.index || session?.currentIndex || 1;
  const difficulty = currentQuestion?.difficulty || (currentIdx <= 2 ? 'easy' : currentIdx <= 4 ? 'medium' : 'hard');

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white p-3 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-[#0E0E14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Video Feeds & Controls (5 Cols on LG)         */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between bg-[#111117] space-y-4">
          <div className="space-y-4">
            {/* Top: AI Interviewer Video-Style Tile */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-[#1A1A24] shadow-md group">
              <img
                src={AiInterviewerSvg}
                alt="AI Interviewer"
                className="w-full h-full object-cover"
              />

              {/* AI Speaking Animated Badge */}
              {isSpeaking && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-lg animate-fadeIn">
                  <div className="flex items-center gap-1 h-3">
                    <span className="wave-bar" />
                    <span className="wave-bar" />
                    <span className="wave-bar" />
                    <span className="wave-bar" />
                  </div>
                  <span>AI Speaking</span>
                </div>
              )}
            </div>

            {/* AI Previous Feedback Bubble (Hidden before first answer) */}
            {prevFeedback && (
              <div className="p-3.5 rounded-2xl bg-[#161622] border border-white/10 text-xs text-gray-300 shadow-inner flex items-start gap-2.5 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-white block mb-0.5">AI Interviewer:</strong>
                  {prevFeedback}
                </p>
              </div>
            )}

            {/* User Tile / Webcam Feed */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-[#15151D] flex items-center justify-center">
              {cameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-800 text-gray-300 font-extrabold text-2xl flex items-center justify-center mb-2 shadow-inner border border-white/5">
                    {userInitial}
                  </div>
                  <span className="text-xs font-semibold text-gray-400">{firstName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Media Control Row (Mic, Camera, Code) */}
          <div className="pt-2">
            <div className="flex items-center justify-center gap-3">
              {/* Microphone Toggle Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-emerald-600 text-white shadow-glow-green scale-105'
                    : 'bg-[#261214] text-red-400 border border-red-500/30 hover:bg-[#331618]'
                }`}
                title={isListening ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Camera Toggle Button */}
              <button
                type="button"
                onClick={toggleCamera}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  cameraOn
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#181820] text-gray-400 border border-white/10 hover:text-white'
                }`}
                title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Code Toggle Button */}
              <button
                type="button"
                onClick={() => setShowCodeEditor(!showCodeEditor)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  showCodeEditor
                    ? 'bg-purple-600 text-white shadow-glow-purple'
                    : 'bg-[#181820] text-gray-400 border border-white/10 hover:text-white'
                }`}
                title="Toggle Code Editor"
              >
                <Code2 className="w-5 h-5" />
              </button>
            </div>

            {/* Tiny Hint */}
            <p className="text-center text-[11px] text-gray-500 mt-2 font-medium">
              Coding question? Use &lt;/&gt; to write &amp; add code
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Question, Timer, Answer Area (7 Cols on LG)  */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          {/* Header Row: Difficulty + Countdown Ring */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">AI Interview</h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="capitalize">{difficulty}</span>
              </div>
            </div>

            {/* Circular Countdown Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r={timerRadius}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={timerRadius}
                  stroke="#22C55E"
                  strokeWidth="3.5"
                  strokeDasharray={timerCircumference}
                  strokeDashoffset={timerCircumference - timerProgress}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 linear"
                />
              </svg>
              <div className="absolute text-xs font-black text-red-400 font-mono">
                {secondsRemaining}s
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-[#14141B] border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Question {currentIdx}
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQuestion?.text || 'Loading interview question...'}
            </p>
          </div>

          {/* Progress Bar Row */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-1.5">
              <span>Progress</span>
              <span>{currentIdx}/6</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(currentIdx / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Answer Input Area */}
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">
              Your Answer
            </label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your answer here... or speak if mic is on"
              rows={5}
              className="w-full bg-[#14141B] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all resize-none leading-relaxed"
            />

            {/* Optional Monospace Code Editor Area */}
            {showCodeEditor && (
              <CodeEditor
                code={codeSnippet}
                onChange={setCodeSnippet}
                language="javascript"
              />
            )}

            {/* AI Feedback Box after answer submission */}
            {showFeedbackBanner && (
              <div className="mt-3 p-4 rounded-2xl bg-[#0E2417] border border-emerald-500/40 text-emerald-200 animate-fadeIn">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                    AI Feedback
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {prevFeedback}
                </p>
              </div>
            )}
          </div>

          {/* Footer Controls: Keycap Indicator & Submit Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-400 flex items-center gap-1.5 order-2 sm:order-1">
              <span>Press</span>
              <span className="keycap">Ctrl + Enter</span>
              <span>to submit</span>
            </div>

            <button
              onClick={() => handleSubmitAnswer(false)}
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#0B0B0F] font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Answer</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

