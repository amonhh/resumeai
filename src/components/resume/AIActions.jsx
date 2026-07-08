import React, { useState, useRef, useEffect } from 'react';
import { db } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, ChevronDown } from "lucide-react";
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
  const menuRef = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const actions = ACTIONS[section] || [];

  const handleAction = async (actionId) => {
    setLoading(actionId);
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
        if (actionId === 'suggest' || actionId === 'match_job' || actionId === 'missing') {
          const skills = response.text.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || response.text.split(',').map(s => s.trim()).filter(Boolean);
          if (onAddSkills) onAddSkills(skills);
          toast.success(`${skills.length} skills suggested`);
        } else {
          if (onApply) onApply(response.text);
          toast.success('Content updated');
        }
      }
    } catch (err) {
      toast.error('AI action failed. Please try again.');
    } finally {
      setLoading(null);
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

      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setResult(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg mx-4 max-h-80 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{result}</p>
            <Button size="sm" onClick={() => setResult(null)} className="mt-4 bg-emerald-600 hover:bg-emerald-700">Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}
