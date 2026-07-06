import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

import { toast } from "sonner";

export default function AIResumeWizard({ open, onClose, onResumeGenerated }) {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    years_experience: '',
    skills: '',
    previous_roles: '',
    achievements: '',
    target_job: ''
  });

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `You are a professional resume writer. Create a complete resume based on the following information:

Name: ${formData.full_name}
Current/Desired Job Title: ${formData.job_title}
Years of Experience: ${formData.years_experience}
Skills: ${formData.skills}
Previous Roles: ${formData.previous_roles}
Key Achievements: ${formData.achievements}
Target Job/Industry: ${formData.target_job}

Create a comprehensive resume with:
1. A compelling professional summary (3-4 sentences)
2. Detailed work experience entries (at least 2-3 positions based on the info provided)
3. An education section (infer reasonable education based on the job title and experience)
4. A skills section organized by category
5. Make all dates reasonable and consistent with the years of experience provided

Make it professional, ATS-friendly, and impressive. Use action verbs and quantify achievements where possible.`,
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
                  achievements: {
                    type: "array",
                    items: { type: "string" }
                  }
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
        toast.success('Resume generated successfully!');
        onResumeGenerated(response);
        onClose();
        setStep(1);
        setFormData({
          full_name: '',
          job_title: '',
          years_experience: '',
          skills: '',
          previous_roles: '',
          achievements: '',
          target_job: ''
        });
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      toast.error('Failed to generate resume');
    } finally {
      setGenerating(false);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.full_name && formData.job_title;
    }
    if (step === 2) {
      return formData.years_experience && formData.skills;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            AI Resume Builder - Step {step} of 3
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Let's start with the basics</h3>

              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="job_title">Current or Target Job Title *</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div>
                <Label htmlFor="target_job">What job/industry are you targeting?</Label>
                <Input
                  id="target_job"
                  value={formData.target_job}
                  onChange={(e) => setFormData({ ...formData, target_job: e.target.value })}
                  placeholder="Tech startups, Senior Developer roles"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tell us about your experience</h3>

              <div>
                <Label htmlFor="years_experience">Years of Experience *</Label>
                <Input
                  id="years_experience"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                  placeholder="5 years"
                />
              </div>

              <div>
                <Label htmlFor="skills">Your Key Skills (comma separated) *</Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="JavaScript, React, Node.js, Python, AWS, Team Leadership"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="previous_roles">Previous Roles & Companies</Label>
                <Textarea
                  id="previous_roles"
                  value={formData.previous_roles}
                  onChange={(e) => setFormData({ ...formData, previous_roles: e.target.value })}
                  placeholder="Software Engineer at Tech Corp (2019-2023), Junior Developer at StartupXYZ (2017-2019)"
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Highlight your achievements</h3>

              <div>
                <Label htmlFor="achievements">
                  Key Achievements & Accomplishments
                </Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  placeholder="Increased system performance by 40%, Led team of 5 developers, Launched 3 major products, Reduced costs by $100K annually"
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Include numbers, percentages, and specific results when possible
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  AI will use this information to create a professional, compelling resume tailored to your goals!
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-4">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={generating}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700 ml-auto"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-green-600 hover:bg-green-700 ml-auto"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate My Resume
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
