import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Check, ArrowLeft, FileText, Bot, Upload } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

import LiveTemplatePreview from '../components/templates/LiveTemplatePreview';
import AIChatDialog from '../components/resume/AIChatDialog';
import UploadResumeDialog from '../components/resume/UploadResumeDialog';
import { getResumeDraft, clearResumeDraft } from '@/lib/resumeDraft';

const TEMPLATES = [
  { id: 'modern-blue', name: 'Modern Blue', category: 'modern', description: 'Blue header with photo section' },
  { id: 'modern-gradient', name: 'Modern Gradient', category: 'modern', description: 'Gradient header, timeline design', badge: 'New' },
  { id: 'modern', name: 'Classic Modern', category: 'modern', description: 'Contemporary, any industry' },
  { id: 'creative-twotone', name: 'Creative Two-Tone', category: 'creative', description: 'Dark sidebar, vibrant accents', badge: 'New' },
  { id: 'bold-modern', name: 'Bold Modern', category: 'creative', description: 'Diagonal cut header design', badge: 'New' },
  { id: 'executive', name: 'Executive', category: 'professional', description: 'Serif design for senior roles', badge: 'New' },
  { id: 'professional-sidebar', name: 'Professional Sidebar', category: 'professional', description: 'Gray sidebar for skills' },
  { id: 'minimal-chic', name: 'Minimal Chic', category: 'simple', description: 'Clean centered typography', badge: 'New' },
  { id: 'minimal-sidebar', name: 'Minimal Sidebar', category: 'simple', description: 'Centered photo, side details' },
  { id: 'ats', name: 'ATS Optimized', category: 'ats', description: 'Passes applicant tracking systems' }
];

const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'modern', label: 'Modern' },
  { id: 'creative', label: 'Creative' },
  { id: 'professional', label: 'Professional' },
  { id: 'simple', label: 'Simple' },
  { id: 'ats', label: 'ATS' }
];

const ASPECT = 'aspect-[210/297]';

export default function Templates() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [creating, setCreating] = useState(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [draftData, setDraftData] = useState(null);

  useEffect(() => {
    const draft = getResumeDraft();
    if (draft) setDraftData(draft);
  }, []);

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (templateId) => {
    setCreating(templateId);
    const data = draftData || { title: 'Untitled Resume', personal_details: {}, summary: '', experience: [], education: [], skills: [] };
    if (draftData) clearResumeDraft();
    navigate(createPageUrl('Editor'), {
      state: { resumeData: { ...data, template: templateId }, isDraft: true }
    });
  };

  const jobTitle = draftData?.personal_details?.job_title || '';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header Banner */}
      {draftData ? (
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <button onClick={() => { clearResumeDraft(); setDraftData(null); }}
              className="flex items-center gap-1.5 text-sm text-emerald-200/60 hover:text-emerald-200 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Start over
            </button>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Your resume is ready!</h1>
                <p className="text-emerald-200/80">
                  {jobTitle ? `Built for "${jobTitle}". ` : ''}
                  Choose a template to style it.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-14 pb-8 text-center">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 bg-emerald-900/30 border border-emerald-800/40 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-4 h-4" /> Professional Resume Templates
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-100 mb-3">
            Pick your perfect template
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            ATS-friendly designs that recruiters love. Customize everything.
          </p>
        </div>
      )}

      {/* Category filters */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-gray-200 border border-[#333]'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, i) => (
            <div key={template.id}
              className="group bg-[#141414] rounded-2xl border border-[#222] overflow-hidden transition-all duration-300 hover:border-emerald-800/50 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="relative overflow-hidden">
                {template.badge && (
                  <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
                    {template.badge}
                  </div>
                )}
                <div className={`${ASPECT} bg-white`}>
                  <LiveTemplatePreview templateId={template.id} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                  <Button size="sm" onClick={() => handleSelectTemplate(template.id)}
                    disabled={creating === template.id}
                    className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg">
                    {creating === template.id ? 'Loading...' : (
                      <><Check className="w-4 h-4 mr-1.5" /> {draftData ? 'Apply Template' : 'Use this template'}</>
                    )}
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-200">{template.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{template.description}</p>
                <Button variant="outline" size="sm" onClick={() => handleSelectTemplate(template.id)}
                  disabled={creating === template.id}
                  className="w-full mt-3 border-[#333] bg-transparent text-gray-300 hover:bg-emerald-900/30 hover:text-emerald-400 hover:border-emerald-800/50">
                  {creating === template.id ? 'Loading...' : draftData ? 'Apply Template' : 'Use this template'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!draftData && (
          <div className="mt-14 text-center bg-[#141414] rounded-2xl border border-[#222] p-10 max-w-2xl mx-auto">
            <p className="text-gray-400 mb-6 font-medium">Want to start with content first?</p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => setShowAIChat(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-12 px-8 shadow-lg">
                <Bot className="w-5 h-5 mr-2" /> Build with AI
              </Button>
              <Button variant="outline" size="lg" onClick={() => setShowUpload(true)}
                className="border-[#333] text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200 h-12 px-8">
                <Upload className="w-5 h-5 mr-2" /> Upload Resume
              </Button>
            </div>
          </div>
        )}
      </div>

      <AIChatDialog open={showAIChat} onClose={() => setShowAIChat(false)} />

      <UploadResumeDialog open={showUpload} onClose={() => setShowUpload(false)}
        onResumeExtracted={async (data) => {
          if (isAuthenticated) {
            try {
              const resume = await db.entities.Resume.create({
                title: data.personal_details?.full_name ? `${data.personal_details.full_name}'s Resume` : 'Imported Resume',
                template: 'modern-blue', ...data
              });
              navigate(createPageUrl(`Editor?id=${resume.id}`));
            } catch (err) {
              toast.error('Failed to save resume');
            }
          } else {
            navigate(createPageUrl('Editor'), {
              state: { resumeData: { title: 'Imported Resume', template: 'modern-blue', ...data }, isDraft: true }
            });
          }
          setShowUpload(false);
        }} />
    </div>
  );
}
