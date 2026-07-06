import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { db } from '@/lib/db';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { setResumeDraft } from '@/lib/resumeDraft';

export default function AIChatDialog({ open, onClose, onComplete }) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState('input');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setStep('input');
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const quickOptions = [
    'Housekeeper CV with 3 years experience',
    'Software engineer with React and 5 years experience',
    'Nursing resume with 10 years ER experience',
    'Marketing manager CV with social media focus',
    'Teacher resume with 7 years experience',
  ];

  const handleGenerate = async (text) => {
    const promptText = text || input;
    if (!promptText.trim() || generating) return;
    setGenerating(true);
    setStep('generating');
    try {
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `Create a professional resume based on this request: "${promptText.trim()}"

Generate complete, realistic content. Include:
- A compelling professional summary
- Relevant work experience entries with job titles, companies, dates, and achievements
- Education details
- Categorized skills

Make all content specific and professional. Use action verbs and quantify achievements.

Return ONLY valid JSON matching the schema.`,
        response_json_schema: {
          type: "object",
          properties: {
            personal_details: {
              type: "object",
              properties: {
                full_name: { type: "string" },
                job_title: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                location: { type: "string" }
              }
            },
            summary: { type: "string" },
            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  job_title: { type: "string" },
                  company: { type: "string" },
                  location: { type: "string" },
                  start_date: { type: "string" },
                  end_date: { type: "string" },
                  current: { type: "boolean" },
                  description: { type: "string" },
                  achievements: { type: "array", items: { type: "string" } }
                }
              }
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  degree: { type: "string" },
                  institution: { type: "string" },
                  location: { type: "string" },
                  start_date: { type: "string" },
                  end_date: { type: "string" }
                }
              }
            },
            skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  level: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response) {
        const resumeData = {
          title: response.personal_details?.job_title
            ? `${response.personal_details.job_title} Resume`
            : 'My CV',
          template: null,
          ...response
        };
        setResumeDraft(resumeData);
        onClose();
        if (onComplete) onComplete(resumeData);
        navigate(createPageUrl('Templates'));
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      setStep('input');
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleTrySuggestion = (text) => {
    setInput(text);
    handleGenerate(text);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!generating) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Tell us about your ideal CV
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              Describe the CV you want and our AI will create it for you instantly.
            </div>

            <div className="flex flex-wrap gap-2">
              {quickOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleTrySuggestion(opt)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>

            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. I want a housekeeper CV with 3 years experience in hotels..."
              rows={4}
              className="resize-none"
              disabled={generating}
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={generating}>
                Cancel
              </Button>
              <Button
                onClick={() => handleGenerate()}
                disabled={!input.trim() || generating}
                className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
                size="lg"
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Create My CV</>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-lg font-medium text-gray-900">Creating your CV...</p>
            <p className="text-sm text-gray-500">AI is generating professional content based on your description</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
