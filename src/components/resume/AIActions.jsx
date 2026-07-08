import React, { useState, useRef, useEffect } from 'react';
import { db } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, ChevronDown, Copy, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

const ACTIONS = {
  summary: [
    { id: 'generate', label: 'Generate Summary' },
    { id: 'improve', label: 'Improve Summary' },
    { id: 'professional', label: 'Make More Professional' },
    { id: 'ats', label: 'ATS Optimize' },
  ],
  experience: [
    { id: 'rewrite', label: 'Rewrite Achievement' },
    { id: 'metrics', label: 'Add Metrics' },
    { id: 'impact', label: 'Improve Impact' },
    { id: 'professional', label: 'Make More Professional' },
    { id: 'quantify', label: 'Quantify Results' },
  ],
  education: [
    { id: 'improve', label: 'Improve Description' },
    { id: 'achievements', label: 'Highlight Academic Achievements' },
  ],
  skills: [
    { id: 'suggest', label: 'Suggest Skills' },
    { id: 'match_job', label: 'Match Job Description' },
    { id: 'missing', label: 'Identify Missing Skills' },
  ],
};

const ACTION_PROMPTS = {
  'summary.generate': 'Write a compelling professional summary for a {context}. Keep it 2-4 sentences, achievement-focused.',
  'summary.improve': 'Improve this professional summary to be more compelling and achievement-focused. Original: "{content}"',
  'summary.professional': 'Rewrite this summary to sound more professional and polished. Original: "{content}"',
  'summary.ats': 'Optimize this summary for ATS (Applicant Tracking System). Include relevant keywords while keeping it natural. Original: "{content}"',
  'experience.rewrite': 'Rewrite this work experience description to be more impactful and achievement-focused. {context} Original: "{content}"',
  'experience.metrics': 'Add specific metrics and numbers to quantify the achievements in this description. {context} Original: "{content}"',
  'experience.impact': 'Rewrite focusing on business impact and results achieved. {context} Original: "{content}"',
  'experience.professional': 'Make this experience description more professional and polished. Original: "{content}"',
  'experience.quantify': 'Add specific, quantifiable results to each achievement. {context} Original: "{content}"',
  'education.improve': 'Improve this education description, highlighting relevant coursework and achievements. Original: "{content}"',
  'education.achievements': 'Rewrite to highlight academic achievements, honors, and relevant coursework. Original: "{content}"',
  'skills.suggest': 'Suggest 8-12 relevant skills for someone with this background: {context}. Return as JSON array of strings.',
  'skills.match_job': 'Based on this job context: {context}, suggest skills that would match the job requirements. Current skills: {content}. Return JSON array.',
  'skills.missing': 'Identify missing skills that would strengthen this resume given the background: {context}. Return JSON array.',
};

export default function AIActions({ section, currentContent, context, onApply, onAddSkills }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const actions = ACTIONS[section] || [];

  const handleAction = async (actionId) => {
    setLoading(actionId);
    setError(null);
    setResult(null);
    setOpen(false);
    try {
      const promptKey = `${section}.${actionId}`;
      let prompt = ACTION_PROMPTS[promptKey] || `Please help with this resume section. Context: {context}. Content: "{content}"`;
      prompt = prompt.replace(/\{context\}/g, context?.slice(0, 1000) || '').replace(/\{content\}/g, currentContent?.slice(0, 1500) || '');

      const response = await db.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: { type: "object", properties: { text: { type: "string" } } }
      });

      if (response?.text) {
        setResult(response.text);
        setShowResultPanel(true);
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      setError(err.message || 'AI action failed');
      toast.error('AI action failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleApply = () => {
    if (!result) return;
    if (section === 'skills') {
      const skills = result.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || result.split(',').map(s => s.trim()).filter(Boolean);
      if (onAddSkills) onAddSkills(skills);
      toast.success(`${skills.length} skills added`);
    } else {
      if (onApply) onApply(result);
      toast.success('Content applied');
    }
    setShowResultPanel(false);
    setResult(null);
  };

  const handleCancel = () => {
    setShowResultPanel(false);
    setResult(null);
    setError(null);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  if (actions.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} disabled={!!loading}
        className="gap-1 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/30 text-xs h-7 px-2">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        AI
        <ChevronDown className="w-3 h-3" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
          {actions.map(action => (
            <button key={action.id} onClick={() => handleAction(action.id)}
              className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {showResultPanel && result && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/60" onClick={handleCancel}>
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-slate-100">AI Suggestion</h3>
              </div>
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentContent && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Original</p>
                  <div className="bg-slate-900/50 rounded-lg p-4 text-sm text-slate-400 border border-slate-700">
                    {currentContent || <span className="italic">(empty)</span>}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="h-px flex-1 bg-slate-700" />
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <div className="h-px flex-1 bg-slate-700" />
              </div>

              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">AI Generated</p>
                <div className="bg-emerald-950/30 rounded-lg p-4 text-sm text-slate-200 border border-emerald-900/50 whitespace-pre-wrap">
                  {result}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-700 shrink-0 flex-wrap">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction(loading || actions[0]?.id)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Regenerate
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={handleCancel}
                  className="text-slate-400 hover:text-slate-200">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApply}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-900/90 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-200 shadow-xl flex items-center gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
