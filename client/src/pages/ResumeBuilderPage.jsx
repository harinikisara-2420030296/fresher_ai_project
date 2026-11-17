import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Download,
  Save,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  FileCheck2,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { fetchResumeDraft, saveResumeDraft, generateAIBullets } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Resume Draft State
  const [formData, setFormData] = useState({
    personal: {
      fullName: user?.name || 'Kisara Harini',
      email: user?.email || 'harini.kisara@college.edu',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      linkedin: 'linkedin.com/in/kisara-harini',
      github: 'github.com/kisara-harini',
      portfolio: '',
      summary: 'Passionate Computer Science graduate with strong foundations in full-stack web development, data structures, and cloud-native applications.'
    },
    education: [
      {
        institution: 'National Institute of Technology',
        degree: 'Bachelor of Technology',
        fieldOfStudy: 'Computer Science and Engineering',
        startYear: '2022',
        endYear: '2026',
        gpa: '8.8 / 10'
      }
    ],
    skills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'Git'],
    projects: [
      {
        title: 'Fresher.AI — Multi-Agent Interview Platform',
        description: 'Engineered an AI mock interview system using LangGraph and Node.js microservices with real-time speech evaluation and BullMQ reporting queues.',
        technologies: ['React', 'Node.js', 'LangGraph', 'Redis', 'MongoDB'],
        link: 'https://github.com/kisara-harini/fresher-ai'
      }
    ],
    experience: [
      {
        company: 'TechCorp Solutions',
        role: 'Software Engineering Intern',
        duration: 'Jun 2025 - Aug 2025',
        highlights: [
          'Developed high-performance REST APIs with Express and MongoDB, improving endpoint response time by 28%.',
          'Collaborated with frontend engineers to integrate responsive React components and automated Jest integration tests.'
        ]
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        year: '2025'
      }
    ]
  });

  // Load existing draft if present
  useEffect(() => {
    let isMounted = true;
    const loadDraft = async () => {
      try {
        const res = await fetchResumeDraft();
        if (isMounted && res?.success && res.data?.data) {
          setFormData(res.data.data);
        }
      } catch (err) {
        console.warn('Draft load note:', err.message);
      }
    };
    loadDraft();
    return () => { isMounted = false; };
  }, []);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await saveResumeDraft(formData);
      success('Resume draft saved successfully!');
    } catch (err) {
      error(err.message || 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // AI Bullet Points Enhancer
  const handleEnhanceWithAI = async (projectIndex = null, expIndex = null) => {
    setGeneratingAI(true);
    try {
      let rawText = '';
      let targetRole = 'Software Engineer';

      if (projectIndex !== null) {
        rawText = formData.projects[projectIndex].description;
        targetRole = formData.projects[projectIndex].title;
      } else if (expIndex !== null) {
        rawText = formData.experience[expIndex].highlights.join(' ');
        targetRole = formData.experience[expIndex].role;
      }

      if (!rawText || rawText.length < 5) {
        error('Please enter at least a few words to enhance.');
        return;
      }

      const res = await generateAIBullets({
        role: targetRole,
        rawText
      });

      if (res?.success && res.data?.bullets) {
        if (projectIndex !== null) {
          const updatedProjects = [...formData.projects];
          updatedProjects[projectIndex].description = res.data.bullets.join(' ');
          setFormData({ ...formData, projects: updatedProjects });
        } else if (expIndex !== null) {
          const updatedExp = [...formData.experience];
          updatedExp[expIndex].highlights = res.data.bullets;
          setFormData({ ...formData, experience: updatedExp });
        }
        success('Bullet points enhanced into high-impact ATS statements!');
      }
    } catch (err) {
      error(err.message || 'AI Enhancement failed.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'certifications', label: 'Certifications' }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Top Bar */}
      <header className="no-print w-full bg-white border-b border-gray-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
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
            Resume Builder
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-xs font-bold text-white transition-colors shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Form on Left / Live ATS A4 Preview on Right) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Multi-Step Editor Form (5 Cols) */}
        <div className="no-print lg:col-span-5 space-y-4">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#14141A] rounded-2xl border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#121216] shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Form Card */}
          <div className="bg-[#0E0E12] border border-white/10 rounded-3xl p-6 text-white shadow-xl space-y-4">
            {activeTab === 'personal' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white mb-2">Personal Information</h3>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Full Name</label>
                  <input
                    type="text"
                    value={formData.personal.fullName}
                    onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, fullName: e.target.value } })}
                    className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400">Email</label>
                    <input
                      type="email"
                      value={formData.personal.email}
                      onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, email: e.target.value } })}
                      className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400">Phone</label>
                    <input
                      type="text"
                      value={formData.personal.phone}
                      onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, phone: e.target.value } })}
                      className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Location</label>
                  <input
                    type="text"
                    value={formData.personal.location}
                    onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, location: e.target.value } })}
                    className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Professional Summary</label>
                  <textarea
                    value={formData.personal.summary}
                    onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, summary: e.target.value } })}
                    rows={3}
                    className="w-full bg-[#181820] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Education History</h3>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      education: [...formData.education, { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', gpa: '' }]
                    })}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {formData.education.map((edu, idx) => (
                  <div key={idx} className="p-3 bg-[#181820] rounded-2xl border border-white/5 space-y-2 relative">
                    <button
                      onClick={() => {
                        const updated = formData.education.filter((_, i) => i !== idx);
                        setFormData({ ...formData, education: updated });
                      }}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      placeholder="University / College Name"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...formData.education];
                        updated[idx].institution = e.target.value;
                        setFormData({ ...formData, education: updated });
                      }}
                      className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white font-bold focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Degree (e.g. B.Tech)"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...formData.education];
                          updated[idx].degree = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        className="bg-white/5 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Graduation Year (e.g. 2026)"
                        value={edu.endYear}
                        onChange={(e) => {
                          const updated = [...formData.education];
                          updated[idx].endYear = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        className="bg-white/5 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white mb-2">Technical Skills</h3>
                <p className="text-xs text-gray-400">Comma-separated skills list:</p>
                <textarea
                  value={formData.skills.join(', ')}
                  onChange={(e) => {
                    const parsed = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    setFormData({ ...formData, skills: parsed });
                  }}
                  rows={4}
                  className="w-full bg-[#181820] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Key Projects</h3>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      projects: [...formData.projects, { title: '', description: '', technologies: [], link: '' }]
                    })}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="p-3.5 bg-[#181820] rounded-2xl border border-white/5 space-y-2 relative">
                    <button
                      onClick={() => {
                        const updated = formData.projects.filter((_, i) => i !== idx);
                        setFormData({ ...formData, projects: updated });
                      }}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...formData.projects];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, projects: updated });
                      }}
                      className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white font-bold focus:outline-none"
                    />
                    <textarea
                      placeholder="Describe what you built, architecture, and impact..."
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...formData.projects];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, projects: updated });
                      }}
                      rows={3}
                      className="w-full bg-white/5 rounded-lg p-2 text-xs text-white focus:outline-none resize-none"
                    />

                    {/* AI Enhance Button */}
                    <button
                      type="button"
                      onClick={() => handleEnhanceWithAI(idx, null)}
                      disabled={generatingAI}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 hover:text-purple-200 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/30"
                    >
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>Generate ATS Bullets with AI</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Experience & Internships</h3>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      experience: [...formData.experience, { company: '', role: '', duration: '', highlights: [''] }]
                    })}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="p-3.5 bg-[#181820] rounded-2xl border border-white/5 space-y-2 relative">
                    <button
                      onClick={() => {
                        const updated = formData.experience.filter((_, i) => i !== idx);
                        setFormData({ ...formData, experience: updated });
                      }}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...formData.experience];
                        updated[idx].company = e.target.value;
                        setFormData({ ...formData, experience: updated });
                      }}
                      className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white font-bold focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Role (e.g. Frontend Intern)"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[idx].role = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        className="bg-white/5 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Dates (e.g. Jun - Aug 2025)"
                        value={exp.duration}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[idx].duration = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        className="bg-white/5 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Certifications</h3>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      certifications: [...formData.certifications, { name: '', issuer: '', year: '' }]
                    })}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {formData.certifications.map((cert, idx) => (
                  <div key={idx} className="p-3 bg-[#181820] rounded-2xl border border-white/5 space-y-2 relative">
                    <button
                      onClick={() => {
                        const updated = formData.certifications.filter((_, i) => i !== idx);
                        setFormData({ ...formData, certifications: updated });
                      }}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Certificate Name"
                      value={cert.name}
                      onChange={(e) => {
                        const updated = [...formData.certifications];
                        updated[idx].name = e.target.value;
                        setFormData({ ...formData, certifications: updated });
                      }}
                      className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white font-bold focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Issuer (e.g. AWS, Coursera)"
                        value={cert.issuer}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[idx].issuer = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        className="bg-white/5 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Year"
                        value={cert.year}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[idx].year = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        className="bg-white/5 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live ATS A4 Resume Preview (7 Cols) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-[620px] bg-white text-gray-900 border border-gray-300 rounded-lg shadow-2xl p-8 sm:p-10 font-sans text-xs leading-relaxed print:shadow-none print:border-none print:p-0">
            {/* Header: Name and Contact */}
            <div className="text-center border-b border-gray-800 pb-3 mb-4">
              <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                {formData.personal.fullName || 'Candidate Name'}
              </h1>
              <p className="text-[11px] text-gray-600 mt-1 flex flex-wrap justify-center gap-x-2">
                {formData.personal.email && <span>{formData.personal.email}</span>}
                {formData.personal.phone && <span>• {formData.personal.phone}</span>}
                {formData.personal.location && <span>• {formData.personal.location}</span>}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 flex flex-wrap justify-center gap-x-2">
                {formData.personal.linkedin && <span>{formData.personal.linkedin}</span>}
                {formData.personal.github && <span>• {formData.personal.github}</span>}
              </p>
            </div>

            {/* Professional Summary */}
            {formData.personal.summary && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase text-black border-b border-gray-300 pb-0.5 mb-1.5 tracking-wider">
                  Professional Summary
                </h2>
                <p className="text-gray-700 leading-normal text-[11px]">
                  {formData.personal.summary}
                </p>
              </div>
            )}

            {/* Education */}
            {formData.education && formData.education.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase text-black border-b border-gray-300 pb-0.5 mb-1.5 tracking-wider">
                  Education
                </h2>
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="flex justify-between font-bold text-gray-900 text-[11px]">
                      <span>{edu.institution || 'University'}</span>
                      <span>{edu.endYear}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-[10px]">
                      <span>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {formData.skills && formData.skills.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase text-black border-b border-gray-300 pb-0.5 mb-1.5 tracking-wider">
                  Technical Skills
                </h2>
                <p className="text-gray-800 text-[11px]">
                  <strong>Core Competencies:</strong> {formData.skills.join(', ')}
                </p>
              </div>
            )}

            {/* Projects */}
            {formData.projects && formData.projects.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase text-black border-b border-gray-300 pb-0.5 mb-1.5 tracking-wider">
                  Projects
                </h2>
                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="mb-2.5">
                    <div className="flex justify-between font-bold text-gray-900 text-[11px]">
                      <span>{proj.title}</span>
                      {proj.link && <span className="text-[10px] text-gray-500">{proj.link}</span>}
                    </div>
                    <p className="text-gray-700 text-[10px] mt-0.5">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Experience */}
            {formData.experience && formData.experience.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-black uppercase text-black border-b border-gray-300 pb-0.5 mb-1.5 tracking-wider">
                  Work Experience
                </h2>
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="mb-2.5">
                    <div className="flex justify-between font-bold text-gray-900 text-[11px]">
                      <span>{exp.company} — {exp.role}</span>
                      <span className="text-[10px] text-gray-600">{exp.duration}</span>
                    </div>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc list-inside text-gray-700 text-[10px] space-y-0.5 mt-0.5 pl-1">
                        {exp.highlights.map((h, hIdx) => (
                          <li key={hIdx}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {formData.certifications && formData.certifications.length > 0 && (
              <div>
                <h2 className="text-xs font-black uppercase text-black border-b border-gray-300 pb-0.5 mb-1.5 tracking-wider">
                  Certifications
                </h2>
                {formData.certifications.map((cert, idx) => (
                  <div key={idx} className="flex justify-between text-gray-700 text-[10px]">
                    <span><strong>{cert.name}</strong> {cert.issuer ? `— ${cert.issuer}` : ''}</span>
                    <span>{cert.year}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

