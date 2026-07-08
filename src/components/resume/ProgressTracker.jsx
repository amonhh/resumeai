import React from 'react';
import { Check, Circle, ChevronRight } from "lucide-react";

const SECTIONS = [
  { id: 'personal', label: 'Personal Information' },
  { id: 'summary', label: 'Professional Summary' },
  { id: 'experience', label: 'Work Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'review', label: 'Review' },
  { id: 'download', label: 'Download' },
];

function isSectionComplete(id, data) {
  if (!data) return false;
  switch (id) {
    case 'personal':
      return !!(data.personal_details?.full_name && data.personal_details?.email);
    case 'summary':
      return !!(data.summary && data.summary.length > 20);
    case 'experience':
      return !!(data.experience && data.experience.length > 0 && data.experience.some(e => e.job_title && e.company));
    case 'education':
      return !!(data.education && data.education.length > 0 && data.education.some(e => e.degree && e.institution));
    case 'skills':
      return !!(data.skills && data.skills.length > 0 && data.skills.some(s => s.name));
    case 'review':
      return !!(data.score && data.score > 0);
    case 'download':
      return true;
    default:
      return false;
  }
}

function getPercentComplete(data) {
  if (!data) return 0;
  const required = ['personal', 'summary', 'experience', 'education', 'skills'];
  const done = required.filter(id => isSectionComplete(id, data)).length;
  return Math.round((done / required.length) * 100);
}

function getMessage(pct) {
  if (pct === 100) return "Your resume is ready to download!";
  if (pct >= 80) return "Almost there!";
  if (pct >= 60) return "Your resume is looking great.";
  if (pct >= 40) return "Good progress, keep going!";
  if (pct >= 20) return "Only one more section left.";
  return "Let's start building your resume.";
}

export default function ProgressTracker({ resumeData, activeSection, onNavigate }) {
  const pct = getPercentComplete(resumeData);
  const msg = getMessage(pct);

  return (
    <div className="bg-slate-900/90 backdrop-blur border-b border-slate-700 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
          <div className="shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-emerald-400">{pct}%</span>
              <span className="text-xs text-slate-400 whitespace-nowrap">{msg}</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }} />
            </div>
          </div>

          <nav className="flex items-center gap-1 text-xs">
            {SECTIONS.map((sec, i) => {
              const complete = isSectionComplete(sec.id, resumeData);
              const active = sec.id === activeSection;
              return (
                <React.Fragment key={sec.id}>
                  {i > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
                  <button
                    onClick={() => complete && onNavigate?.(sec.id)}
                    disabled={!complete && !active}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors whitespace-nowrap shrink-0
                      ${active ? 'bg-emerald-600/20 text-emerald-300' : complete ? 'text-emerald-400 hover:bg-slate-800 cursor-pointer' : 'text-slate-600'}`}
                  >
                    {complete ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    <span className="hidden sm:inline">{sec.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
