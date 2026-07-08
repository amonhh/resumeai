import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Sparkles, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function ScoreRing({ score, size = 120, strokeWidth = 8 }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
}

const subScores = [
  { key: 'formatting', label: 'Formatting' },
  { key: 'content', label: 'Content' },
  { key: 'keywords', label: 'Keywords' },
  { key: 'readability', label: 'Readability' },
  { key: 'grammar', label: 'Grammar' },
];

export default function ScoreFeedbackDialog({ open, onClose, score, feedback }) {
  if (!feedback) return null;

  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
  const label = score >= 90 ? 'Excellent!' : score >= 75 ? 'Good job!' : score >= 60 ? 'Getting there!' : 'Needs improvement';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-slate-100">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Resume ATS Score
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Score Ring */}
          <div className="flex flex-col items-center py-4">
            <div className="relative">
              <ScoreRing score={score || 0} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${scoreColor}`}>{score}%</span>
              </div>
            </div>
            <p className={`text-sm font-medium mt-2 ${scoreColor}`}>{label}</p>
            <p className="text-xs text-slate-400 mt-1">ATS Compatibility Score</p>
          </div>

          {/* Sub-scores */}
          <div className="grid grid-cols-2 gap-3">
            {subScores.map(ss => {
              const val = feedback[ss.key] ?? score;
              const col = val >= 80 ? 'bg-emerald-900/30 border-emerald-800/50' : val >= 60 ? 'bg-amber-900/30 border-amber-800/50' : 'bg-red-900/30 border-red-800/50';
              const txt = val >= 80 ? 'text-emerald-300' : val >= 60 ? 'text-amber-300' : 'text-red-300';
              return (
                <Card key={ss.key} className={`p-3 border ${col}`}>
                  <p className="text-xs text-slate-400">{ss.label}</p>
                  <p className={`text-lg font-bold ${txt}`}>{val}%</p>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          {feedback.summary && (
            <Card className="p-4 bg-slate-900/50 border-slate-700">
              <p className="text-sm text-slate-300 leading-relaxed">{feedback.summary}</p>
            </Card>
          )}

          {/* Strengths */}
          {feedback.strengths?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                What's Working Well
              </h3>
              <div className="space-y-1.5">
                {feedback.strengths.map((s, i) => (
                  <div key={i} className="flex gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {feedback.improvements?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Areas to Improve
              </h3>
              <div className="space-y-1.5">
                {feedback.improvements.map((imp, i) => (
                  <div key={i} className="flex gap-2 text-sm text-slate-300">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {feedback.recommendations?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recommendations
              </h3>
              <div className="space-y-1.5">
                {feedback.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-2 text-sm text-slate-300">
                    <span className="text-blue-400 shrink-0">→</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={onClose} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200">
            Continue Editing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
