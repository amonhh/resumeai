import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Upload, Bot, Linkedin, Sparkles, ArrowRight, FileText, CheckCircle, Zap } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { setResumeDraft } from '@/lib/resumeDraft';
import AIChatDialog from '../components/resume/AIChatDialog';
import UploadResumeDialog from '../components/resume/UploadResumeDialog';
import LinkedInImportDialog from '../components/resume/LinkedInImportDialog';

const options = [
  {
    id: 'new', icon: Plus, title: 'Blank Resume', desc: 'Start from scratch',
    gradient: 'from-emerald-600 to-emerald-500', iconBg: 'bg-emerald-600/20', iconColor: 'text-emerald-400',
  },
  {
    id: 'ai', icon: Bot, title: 'AI Resume', desc: 'Describe and AI builds it',
    gradient: 'from-violet-600 to-purple-600', iconBg: 'bg-violet-600/20', iconColor: 'text-violet-400',
  },
  {
    id: 'import', icon: Upload, title: 'Import File', desc: 'Upload existing resume',
    gradient: 'from-blue-600 to-blue-500', iconBg: 'bg-blue-600/20', iconColor: 'text-blue-400',
  },
  {
    id: 'linkedin', icon: Linkedin, title: 'LinkedIn', desc: 'Import your profile',
    gradient: 'from-sky-600 to-sky-500', iconBg: 'bg-sky-600/20', iconColor: 'text-sky-400',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [showAIChat, setShowAIChat] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);

  const handleSelect = (id) => {
    if (id === 'ai') { setShowAIChat(true); return; }
    if (id === 'import') { setShowUpload(true); return; }
    if (id === 'linkedin') { setShowLinkedIn(true); return; }
    setResumeDraft({ title: 'Untitled Resume', template: null, personal_details: {}, summary: '', experience: [], education: [], skills: [] });
    navigate(createPageUrl('Templates'));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-emerald-800/50 text-emerald-400 px-5 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Free AI Resume Builder — No Sign-up Required
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-100 mb-4 leading-tight">
            Build a <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Standout Resume</span><br />in Minutes
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Pick how you want to start. AI writes the content, templates do the styling.
          </p>
        </div>

        {/* Option Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button key={opt.id} onClick={() => handleSelect(opt.id)}
                className="group relative bg-[#141414] rounded-2xl p-6 border border-[#222] hover:border-emerald-800/50 hover:bg-[#1a1a1a] transition-all duration-300 hover:-translate-y-1 text-left">
                <div className={`w-12 h-12 rounded-xl ${opt.iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${opt.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-200 text-lg mb-1 group-hover:text-emerald-400 transition-colors">{opt.title}</h3>
                <p className="text-sm text-gray-500">{opt.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0">
                  Get started <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Trust bar */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Free download</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> ATS-friendly</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> AI-powered</span>
          </div>
        </div>

        {/* Sign in link */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-600">
            Returning user?{' '}
            <button onClick={() => {
              const clerkBtn = document.querySelector('[data-clerk-component="SignInButton"]');
              if (clerkBtn) clerkBtn.click();
            }} className="text-emerald-400 hover:underline font-medium">Sign in</button>
            {' '}to access your saved resumes.
          </p>
        </div>
      </div>

      <AIChatDialog open={showAIChat} onClose={() => setShowAIChat(false)} />
      <UploadResumeDialog open={showUpload} onClose={() => setShowUpload(false)}
        onResumeExtracted={(data) => {
          setResumeDraft({ title: data.personal_details?.full_name ? `${data.personal_details.full_name}'s Resume` : 'Imported Resume', template: null, ...data });
          setShowUpload(false);
          navigate(createPageUrl('Templates'));
        }} />
      <LinkedInImportDialog open={showLinkedIn} onClose={() => setShowLinkedIn(false)}
        onDataImported={(data) => {
          setResumeDraft({ title: data.personal_details?.full_name ? `${data.personal_details.full_name}'s Resume` : 'LinkedIn Import', template: null, ...data });
          setShowLinkedIn(false);
          navigate(createPageUrl('Templates'));
        }} />
    </div>
  );
}
