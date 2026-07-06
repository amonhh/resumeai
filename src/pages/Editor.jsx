import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Save, Eye, Download, Plus, Trash2, ArrowLeft, Sparkles, TrendingUp, Loader2, Upload,
  FileText, FileDown, Search, UserPlus, X, ChevronRight, Printer
} from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { useClerk } from '@clerk/react';
import AIAssistButton from '../components/resume/AIAssistButton';
import AISkillsSuggestButton from '../components/resume/AISkillsSuggestButton';
import ResumePreview from '../components/resume/ResumePreview';
import TemplateSelector from '../components/resume/TemplateSelector';
import ScoreFeedbackDialog from '../components/resume/ScoreFeedbackDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function Editor() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { openSignIn } = useClerk();
  const urlParams = new URLSearchParams(window.location.search);
  const resumeId = urlParams.get('id');

  const [activeTab, setActiveTab] = useState('personal');
  const [showPreview, setShowPreview] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [calculatingScore, setCalculatingScore] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showScoreFeedback, setShowScoreFeedback] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const previewRef = useRef(null);
  const resumeContentRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(0.5);
  const pendingActionRef = useRef(null);
  const prevAuthRef = useRef(false);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const PAGE_W = 794;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width - 48;
        if (w > 0) { setPreviewScale(Math.min(w / PAGE_W, 0.9)); }
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [showPreview]);

  useEffect(() => {
    if (isAuthenticated && !prevAuthRef.current && pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action();
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: async () => {
      const resumes = await db.entities.Resume.filter({ id: resumeId });
      return resumes[0];
    },
    enabled: !!resumeId && !location.state?.resumeData
  });

  useEffect(() => {
    if (location.state?.resumeData) {
      setResumeData({
        ...location.state.resumeData,
        id: location.state.resumeData.id || `draft_${Date.now()}`,
        created_date: location.state.resumeData.created_date || new Date().toISOString(),
        updated_date: new Date().toISOString()
      });
      setIsDraft(true);
    } else if (resume) {
      setResumeData(resume);
      setIsDraft(false);
    }
  }, [resume, location.state]);

  const updateResumeMutation = useMutation({
    mutationFn: (data) => db.entities.Resume.update(resumeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      toast.success('Resume saved');
    }
  });

  const createResumeMutation = useMutation({
    mutationFn: (data) => db.entities.Resume.create(data),
    onSuccess: (newResume) => {
      setIsDraft(false);
      setResumeData(prev => ({ ...prev, id: newResume.id }));
      window.history.replaceState(null, '', createPageUrl(`Editor?id=${newResume.id}`));
      toast.success('Resume saved! You can now download and export.');
    }
  });

  const handleSave = async () => {
    if (isDraft && !isAuthenticated) {
      pendingActionRef.current = () => handleSave();
      openSignIn({ mode: 'modal' });
      return;
    }
    if (isDraft) {
      const { id, created_date, updated_date, score, score_feedback, ...rest } = resumeData;
      await createResumeMutation.mutateAsync({
        ...rest, score: score || 0, score_feedback: score_feedback || {}
      });
    } else {
      updateResumeMutation.mutate(resumeData);
    }
  };

  const copyStyles = () => {
    const nodes = document.head.querySelectorAll('style, link[rel="stylesheet"]');
    return Array.from(nodes).map(el => el.outerHTML).join('\n');
  };

  const doDownload = async (format) => {
    setDownloading(true);
    try {
      let html;
      const contentEl = resumeContentRef.current;
      if (contentEl) {
        const clone = contentEl.cloneNode(true);
        clone.style.transform = '';
        clone.style.position = '';
        clone.style.width = '210mm';
        clone.style.minHeight = '297mm';
        html = clone.outerHTML;
      } else {
        const div = document.createElement('div');
        div.style.cssText = 'position:absolute;left:-9999px;top:0;width:210mm;';
        document.body.appendChild(div);
        const root = createRoot(div);
        root.render(<ResumePreview resume={resumeData} template={resumeData.template} />);
        await new Promise(r => setTimeout(r, 800));
        html = div.innerHTML;
        root.unmount();
        document.body.removeChild(div);
      }
      const styles = copyStyles();
      if (format === 'pdf') {
        const pw = window.open('', '_blank', 'width=800,height=600');
        if (!pw) { toast.error('Pop-up blocked. Please allow pop-ups.'); return; }
        pw.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><title>${resumeData.title || 'Resume'}</title>
${styles}
<style>
  @page { size: A4; margin: 0; }
  body { margin: 0; padding: 0; background: white; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style>
</head><body>${html}</body></html>`);
        pw.document.close();
        setTimeout(() => { pw.focus(); pw.print(); }, 500);
      } else {
        const fullDoc = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
${styles}
<style>
  body { margin: 0; padding: 0; background: white; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style>
</head><body>${html}</body></html>`;
        const blob = new Blob([fullDoc], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(resumeData.title || 'resume').replace(/\s+/g, '_')}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (e) {
      toast.error('Download failed: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = (format) => {
    if (isDraft && !isAuthenticated) {
      setShowDownloadDialog(false);
      pendingActionRef.current = () => doDownload(format);
      openSignIn({ mode: 'modal' });
      return;
    }
    doDownload(format);
  };

  const handlePersonalChange = (field, value) => {
    setResumeData(prev => ({ ...prev, personal_details: { ...prev.personal_details, [field]: value } }));
  };

  const handleAddExperience = () => {
    setResumeData(prev => ({ ...prev, experience: [...(prev.experience || []), { job_title: '', company: '', location: '', start_date: '', end_date: '', current: false, description: '' }] }));
  };

  const handleExperienceChange = (index, field, value) => {
    setResumeData(prev => {
      const e = [...(prev.experience || [])];
      e[index] = { ...e[index], [field]: value };
      return { ...prev, experience: e };
    });
  };

  const handleRemoveExperience = (index) => {
    setResumeData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  const handleAddEducation = () => {
    setResumeData(prev => ({ ...prev, education: [...(prev.education || []), { degree: '', institution: '', location: '', start_date: '', end_date: '', gpa: '' }] }));
  };

  const handleEducationChange = (index, field, value) => {
    setResumeData(prev => {
      const e = [...(prev.education || [])];
      e[index] = { ...e[index], [field]: value };
      return { ...prev, education: e };
    });
  };

  const handleAddSkill = () => {
    setResumeData(prev => ({ ...prev, skills: [...(prev.skills || []), { name: '', level: 'intermediate' }] }));
  };

  const handleSkillChange = (index, field, value) => {
    setResumeData(prev => {
      const s = [...(prev.skills || [])];
      s[index] = { ...s[index], [field]: value };
      return { ...prev, skills: s };
    });
  };

  const calculateResumeScore = async () => {
    setCalculatingScore(true);
    try {
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `Analyze this resume and provide detailed feedback with a score.
Resume data: ${JSON.stringify(resumeData, null, 2)}
Evaluate: completeness, formatting, achievements, skills relevance, grammar, impact.
Provide JSON with score (0-100), strengths[], improvements[], summary.`,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });
      const score = response.score || 0;
      const feedback = { strengths: response.strengths || [], improvements: response.improvements || [], summary: response.summary || '' };
      setResumeData(prev => ({ ...prev, score, score_feedback: feedback }));
      if (!isDraft && resumeId) {
        await updateResumeMutation.mutateAsync({ ...resumeData, score, score_feedback: feedback });
      }
      toast.success(`Score: ${score}%`);
      setShowScoreFeedback(true);
    } catch (error) {
      toast.error('Failed to calculate score');
    } finally {
      setCalculatingScore(false);
    }
  };

  if ((isLoading && !location.state?.resumeData) || !resumeData) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Bar */}
      <div className="bg-slate-900/90 backdrop-blur border-b border-slate-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Home'))} className="shrink-0 text-slate-400 hover:text-slate-200">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <Input value={resumeData.title || ''}
                  onChange={(e) => setResumeData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-base font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent truncate text-slate-100"
                  placeholder="Untitled Resume" />
                <p className="text-xs text-slate-400">
                  {isDraft ? 'Unsaved draft' : `Saved ${new Date(resumeData.updated_date).toLocaleDateString()}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setShowTemplateSelector(true)}
                className="hidden sm:inline-flex text-slate-400 hover:text-slate-200">
                <FileText className="w-4 h-4 mr-1.5" /> Template
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                if (window.innerWidth < 1024) setMobilePreviewOpen(!mobilePreviewOpen);
                else setShowPreview(!showPreview);
              }} className="text-slate-400 hover:text-slate-200">
                <Eye className="w-4 h-4 mr-1.5" /> {showPreview || mobilePreviewOpen ? 'Hide' : 'Preview'}
              </Button>
              <Button variant="ghost" size="sm" onClick={calculateResumeScore} disabled={calculatingScore}
                className="text-slate-400 hover:text-slate-200">
                {calculatingScore ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Search className="w-4 h-4 mr-1.5" />}
                Score
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDownloadDialog(true)} disabled={downloading}
                className="border-slate-600 text-slate-200 hover:bg-slate-700/50">
                <Download className="w-4 h-4 mr-1.5" /> Download
              </Button>
              {isDraft && !isAuthenticated ? (
                <Button onClick={() => openSignIn({ mode: 'modal' })}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md" size="sm">
                  <UserPlus className="w-4 h-4 mr-1.5" /> Save
                </Button>
              ) : (
                <Button onClick={handleSave} variant="outline" size="sm"
                  className="border-emerald-800 text-emerald-400 hover:bg-emerald-950/50">
                  <Save className="w-4 h-4 mr-1.5" /> Save
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Editor */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
                <TabsTrigger value="personal" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-slate-400">
                  <FileText className="w-4 h-4 mr-1.5 hidden sm:inline" /> Personal
                </TabsTrigger>
                <TabsTrigger value="experience" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-slate-400">
                  Experience
                </TabsTrigger>
                <TabsTrigger value="education" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-slate-400">
                  Education
                </TabsTrigger>
                <TabsTrigger value="skills" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-slate-400">
                  Skills
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 mt-6">
                <Card className="p-6 border border-slate-700 shadow-sm bg-slate-800">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-bold text-slate-100">Personal Details</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</Label>
                        <Input value={resumeData.personal_details?.full_name || ''} onChange={e => handlePersonalChange('full_name', e.target.value)} placeholder="John Doe" className="mt-1.5" /></div>
                      <div><Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Job Title</Label>
                        <Input value={resumeData.personal_details?.job_title || ''} onChange={e => handlePersonalChange('job_title', e.target.value)} placeholder="Software Engineer" className="mt-1.5" /></div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</Label>
                        <Input type="email" value={resumeData.personal_details?.email || ''} onChange={e => handlePersonalChange('email', e.target.value)} placeholder="john@example.com" className="mt-1.5" /></div>
                      <div><Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</Label>
                        <Input value={resumeData.personal_details?.phone || ''} onChange={e => handlePersonalChange('phone', e.target.value)} placeholder="+1 234 567 8900" className="mt-1.5" /></div>
                    </div>
                    <div><Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Location</Label>
                      <Input value={resumeData.personal_details?.location || ''} onChange={e => handlePersonalChange('location', e.target.value)} placeholder="New York, NY" className="mt-1.5" /></div>
                    <div>
                      <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Photo</Label>
                      <div className="mt-1.5">
                        {resumeData.personal_details?.photo_url ? (
                          <div className="flex items-center gap-3">
                            <img src={resumeData.personal_details.photo_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" />
                            <Button variant="outline" size="sm" onClick={() => handlePersonalChange('photo_url', '')}>Remove</Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400">
                            <Upload className="w-4 h-4" /> Upload Photo
                            <input type="file" accept="image/*" className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const { file_url } = await db.integrations.Core.UploadFile({ file });
                                  handlePersonalChange('photo_url', file_url);
                                }
                              }} />
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Professional Summary</Label>
                        <AIAssistButton section="Professional Summary" currentContent={resumeData.summary || ''}
                          context={JSON.stringify({ job_title: resumeData.personal_details?.job_title })}
                          onApply={(text) => setResumeData(prev => ({ ...prev, summary: text }))} />
                      </div>
                      <Textarea value={resumeData.summary || ''} onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="Write a brief professional summary..." rows={4} className="mt-1.5 resize-none" />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-100">Work Experience</h2>
                  <Button onClick={handleAddExperience} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="w-4 h-4 mr-1.5" /> Add
                  </Button>
                </div>
                {(resumeData.experience || []).map((exp, index) => (
                  <Card key={index} className="p-6 border border-slate-700 shadow-sm bg-slate-800 relative group">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wider">
                        {exp.job_title || 'New Role'} <span className="text-slate-500 font-normal">at {exp.company || 'Company'}</span>
                      </h3>
                      <div className="flex gap-1">
                        <AIAssistButton section={`Experience — ${exp.job_title || 'Role'}`} currentContent={exp.description || ''}
                          context={JSON.stringify({ ...exp, full_name: resumeData.personal_details?.full_name })}
                          onApply={(text) => handleExperienceChange(index, 'description', text)} />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveExperience(index)}
                          className="text-slate-500 hover:text-red-500 h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><Label className="text-xs text-slate-400">Job Title</Label>
                        <Input value={exp.job_title || ''} onChange={e => handleExperienceChange(index, 'job_title', e.target.value)} placeholder="Senior Developer" /></div>
                      <div><Label className="text-xs text-slate-400">Company</Label>
                        <Input value={exp.company || ''} onChange={e => handleExperienceChange(index, 'company', e.target.value)} placeholder="Tech Corp" /></div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 mt-3">
                      <div><Label className="text-xs text-slate-400">Start</Label>
                        <Input type="month" value={exp.start_date || ''} onChange={e => handleExperienceChange(index, 'start_date', e.target.value)} /></div>
                      <div><Label className="text-xs text-slate-400">End</Label>
                        <div className="flex gap-2 items-center">
                          <Input type="month" value={exp.end_date || ''} onChange={e => handleExperienceChange(index, 'end_date', e.target.value)} disabled={exp.current} className="flex-1" />
                        </div>
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 text-sm text-slate-200">
                          <input type="checkbox" checked={exp.current || false} onChange={e => handleExperienceChange(index, 'current', e.target.checked)}
                            className="rounded border-slate-600 text-emerald-400 focus:ring-emerald-400" />
                          Current
                        </label>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs text-slate-400">Description</Label>
                      <Textarea value={exp.description || ''} onChange={e => handleExperienceChange(index, 'description', e.target.value)}
                        placeholder="Describe your role and achievements..." rows={3} className="mt-1 resize-none" />
                    </div>
                  </Card>
                ))}
                {(!resumeData.experience || resumeData.experience.length === 0) && (
                  <Card className="p-12 text-center border-dashed border-2 border-slate-700 bg-slate-800">
                    <p className="text-slate-400 mb-4">No experience added yet</p>
                    <Button onClick={handleAddExperience} variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-700/50"><Plus className="w-4 h-4 mr-2" />Add Your First Experience</Button>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="education" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-100">Education</h2>
                  <Button onClick={handleAddEducation} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="w-4 h-4 mr-1.5" /> Add
                  </Button>
                </div>
                {(resumeData.education || []).map((edu, index) => (
                  <Card key={index} className="p-6 border border-slate-700 shadow-sm bg-slate-800">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><Label className="text-xs text-slate-400">Degree</Label>
                        <Input value={edu.degree || ''} onChange={e => handleEducationChange(index, 'degree', e.target.value)} placeholder="Bachelor of Science" /></div>
                      <div><Label className="text-xs text-slate-400">Institution</Label>
                        <Input value={edu.institution || ''} onChange={e => handleEducationChange(index, 'institution', e.target.value)} placeholder="University Name" /></div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 mt-3">
                      <div><Label className="text-xs text-slate-400">Start</Label>
                        <Input type="month" value={edu.start_date || ''} onChange={e => handleEducationChange(index, 'start_date', e.target.value)} /></div>
                      <div><Label className="text-xs text-slate-400">End</Label>
                        <Input type="month" value={edu.end_date || ''} onChange={e => handleEducationChange(index, 'end_date', e.target.value)} /></div>
                      <div><Label className="text-xs text-slate-400">GPA</Label>
                        <Input value={edu.gpa || ''} onChange={e => handleEducationChange(index, 'gpa', e.target.value)} placeholder="3.8" /></div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="skills" className="space-y-4 mt-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-lg font-bold text-slate-100">Skills</h2>
                  <div className="flex gap-2">
                    <AISkillsSuggestButton
                      context={JSON.stringify({ job_title: resumeData.personal_details?.job_title, experience: resumeData.experience?.map(e => `${e.job_title} at ${e.company}`), education: resumeData.education?.map(ed => ed.degree) })}
                      existingSkills={resumeData.skills || []}
                      onAddSkills={(newSkills) => {
                        const items = newSkills.map(function(n) { return { name: n, level: 'intermediate' }; });
                        setResumeData(function(prev) {
                          return { ...prev, skills: [...(prev.skills || []), ...items] };
                        });
                      }} />
                    <Button onClick={handleAddSkill} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="w-4 h-4 mr-1.5" /> Add
                    </Button>
                  </div>
                </div>
                <Card className="p-6 border border-slate-700 shadow-sm bg-slate-800">
                  {(resumeData.skills || []).map((skill, index) => (
                    <div key={index} className="flex gap-3 mb-3 items-center">
                      <Input value={skill.name || ''} onChange={e => handleSkillChange(index, 'name', e.target.value)} placeholder="Skill name" className="flex-1" />
                      <Select value={skill.level || 'intermediate'} onValueChange={(value) => handleSkillChange(index, 'level', value)}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  {(!resumeData.skills || resumeData.skills.length === 0) && (
                    <p className="text-center text-slate-400 py-4">No skills added. Click "Add" or use "Suggest Skills".</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>

            {resumeData.score && (
              <Card className="p-4 bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 border-emerald-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-emerald-300">ATS Score: {resumeData.score}%</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowScoreFeedback(true)} className="border-emerald-800 text-emerald-400 hover:bg-emerald-950/50">
                    View Details
                  </Button>
                </div>
              </Card>
            )}

            <div className="text-center text-xs text-slate-400 pb-8">
              All changes are saved locally until you sign in.
            </div>
          </div>

          {/* Right: Preview */}
          {(showPreview || mobilePreviewOpen) && (
            <div className={mobilePreviewOpen ? 'fixed inset-0 z-50 bg-slate-950 lg:static lg:bg-transparent' : ''}>
              {mobilePreviewOpen && (
                <div className="flex items-center justify-between p-4 border-b border-slate-700 lg:hidden">
                  <h3 className="font-semibold text-slate-200">Resume Preview</h3>
                  <Button variant="ghost" size="icon" onClick={() => setMobilePreviewOpen(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </Button>
                </div>
              )}
              <div className="lg:sticky lg:top-24" ref={previewRef}>
                <Card className="p-0 bg-slate-800/70 border border-slate-700 shadow-sm overflow-hidden"
                  style={{ maxHeight: 'calc(100vh - 100px)' }}>
                  <div className="p-4 relative" style={{ height: Math.round(1123 * previewScale) + 32 }}>
                    <div ref={resumeContentRef} className="shadow-xl ring-1 ring-slate-700 bg-white absolute"
                      style={{ width: 794, minHeight: 1123, transform: `scale(${previewScale})`, transformOrigin: '0 0' }}>
                      <ResumePreview resume={resumeData} template={resumeData.template} />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <TemplateSelector open={showTemplateSelector} onClose={() => setShowTemplateSelector(false)}
        currentTemplate={resumeData?.template}
        onSelectTemplate={(templateId) => { setResumeData(prev => ({ ...prev, template: templateId })); toast.success('Template changed'); }} />

      <ScoreFeedbackDialog open={showScoreFeedback} onClose={() => setShowScoreFeedback(false)}
        score={resumeData?.score} feedback={resumeData?.score_feedback} />

      {/* Download Dialog */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-slate-100">
              <Download className="w-5 h-5 text-emerald-400" />
              Download Resume
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <button onClick={() => handleDownload('pdf')} disabled={downloading}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-700 hover:border-emerald-500 hover:bg-emerald-950/50 transition-all group">
              <div className="w-12 h-12 bg-red-900/30 rounded-xl flex items-center justify-center group-hover:bg-red-800/50 transition-colors">
                <FileDown className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-slate-100">PDF Format</p>
                <p className="text-sm text-slate-400">Printer-friendly, universal format</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>
            <button onClick={() => handleDownload('doc')} disabled={downloading}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-700 hover:border-emerald-500 hover:bg-emerald-950/50 transition-all group">
              <div className="w-12 h-12 bg-emerald-900/30 rounded-xl flex items-center justify-center group-hover:bg-emerald-800/50 transition-colors">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-slate-100">DOC Format</p>
                <p className="text-sm text-slate-400">Editable Word document</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          </div>
          {isDraft && !isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <strong>Sign in required:</strong> Create a free account to download.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Save prompt bar */}
      {isDraft && !isAuthenticated && !resumeData._continueAsGuest && (
        <div data-save-bar className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 text-slate-100 px-4 py-3 shadow-2xl z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Save your resume for free</p>
                <p className="text-xs text-slate-400">Create an account to keep it forever.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                setResumeData(prev => ({ ...prev, _continueAsGuest: true }));
                const bar = document.querySelector('[data-save-bar]');
                if (bar) bar.style.display = 'none';
              }} className="text-slate-400 text-xs">
                Continue as Guest
              </Button>
              <Button size="sm" onClick={() => openSignIn({ mode: 'modal' })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                <UserPlus className="w-4 h-4 mr-1.5" /> Create Free Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
