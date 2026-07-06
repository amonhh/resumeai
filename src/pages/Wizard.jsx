import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getResumeDraft, clearResumeDraft } from '@/lib/resumeDraft';

const STEPS = [
  { id: 'personal', title: 'Personal Details' },
  { id: 'summary', title: 'Professional Summary' },
  { id: 'experience', title: 'Work Experience' },
  { id: 'education', title: 'Education' },
  { id: 'skills', title: 'Skills' },
];

export default function Wizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    personal_details: { full_name: '', job_title: '', email: '', phone: '', location: '' },
    summary: '',
    experience: [{ job_title: '', company: '', location: '', start_date: '', end_date: '', current: false, description: '' }],
    education: [{ degree: '', institution: '', location: '', start_date: '', end_date: '' }],
    skills: [{ name: '', level: 'intermediate' }],
  });

  useEffect(() => {
    const draft = getResumeDraft();
    if (draft) {
      setData(prev => ({
        personal_details: { ...prev.personal_details, ...(draft.personal_details || {}) },
        summary: draft.summary || '',
        experience: draft.experience?.length ? draft.experience : prev.experience,
        education: draft.education?.length ? draft.education : prev.education,
        skills: draft.skills?.length ? draft.skills : prev.skills,
      }));
    }
  }, []);

  const updatePersonal = (field, value) => {
    setData(prev => ({ ...prev, personal_details: { ...prev.personal_details, [field]: value } }));
  };

  const updateExperience = (index, field, value) => {
    setData(prev => {
      const ex = [...prev.experience];
      ex[index] = { ...ex[index], [field]: value };
      return { ...prev, experience: ex };
    });
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { job_title: '', company: '', location: '', start_date: '', end_date: '', current: false, description: '' }]
    }));
  };

  const updateEducation = (index, field, value) => {
    setData(prev => {
      const ed = [...prev.education];
      ed[index] = { ...ed[index], [field]: value };
      return { ...prev, education: ed };
    });
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', location: '', start_date: '', end_date: '' }]
    }));
  };

  const updateSkill = (index, field, value) => {
    setData(prev => {
      const sk = [...prev.skills];
      sk[index] = { ...sk[index], [field]: value };
      return { ...prev, skills: sk };
    });
  };

  const addSkill = () => {
    setData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', level: 'intermediate' }]
    }));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      clearResumeDraft();
      navigate(createPageUrl('Editor'), {
        state: {
          resumeData: {
            ...data,
            id: `draft_${Date.now()}`,
            template: location.state?.template || 'modern-blue',
            title: data.personal_details?.job_title ? `${data.personal_details.job_title} Resume` : 'My Resume',
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString(),
          },
          isDraft: true
        }
      });
    }
  };

  const canProceed = () => {
    if (step === 0) return data.personal_details.full_name?.trim();
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${i <= step ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s.title}
                </span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <Card className="p-8">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label>Full Name *</Label>
                  <Input value={data.personal_details.full_name} onChange={e => updatePersonal('full_name', e.target.value)} placeholder="John Doe" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label>Job Title</Label>
                  <Input value={data.personal_details.job_title} onChange={e => updatePersonal('job_title', e.target.value)} placeholder="Software Engineer" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={data.personal_details.email} onChange={e => updatePersonal('email', e.target.value)} placeholder="john@example.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={data.personal_details.phone} onChange={e => updatePersonal('phone', e.target.value)} placeholder="+1 234 567 8900" />
                </div>
                <div className="col-span-2">
                  <Label>Location</Label>
                  <Input value={data.personal_details.location} onChange={e => updatePersonal('location', e.target.value)} placeholder="New York, NY" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Summary</h2>
              <p className="text-sm text-gray-500 mb-2">Write a brief summary of your professional background and career goals.</p>
              <Textarea
                value={data.summary}
                onChange={e => setData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Experienced software engineer with 5+ years building web applications..."
                rows={6}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
                <Button variant="outline" size="sm" onClick={addExperience}>+ Add</Button>
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-3">
                  <h3 className="font-medium text-gray-700">Position {i + 1}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Job Title</Label>
                      <Input value={exp.job_title} onChange={e => updateExperience(i, 'job_title', e.target.value)} placeholder="Senior Developer" />
                    </div>
                    <div>
                      <Label>Company</Label>
                      <Input value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} placeholder="Tech Corp" />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input type="month" value={exp.start_date} onChange={e => updateExperience(i, 'start_date', e.target.value)} />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input type="month" value={exp.end_date} onChange={e => updateExperience(i, 'end_date', e.target.value)} disabled={exp.current} />
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <input type="checkbox" checked={exp.current} onChange={e => updateExperience(i, 'current', e.target.checked)} className="rounded" />
                      <span className="text-sm">I currently work here</span>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} placeholder="Describe your role and achievements..." rows={3} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Education</h2>
                <Button variant="outline" size="sm" onClick={addEducation}>+ Add</Button>
              </div>
              {data.education.map((edu, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-3">
                  <h3 className="font-medium text-gray-700">Education {i + 1}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Degree</Label>
                      <Input value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} placeholder="Bachelor of Science" />
                    </div>
                    <div>
                      <Label>Institution</Label>
                      <Input value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} placeholder="University Name" />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input type="month" value={edu.start_date} onChange={e => updateEducation(i, 'start_date', e.target.value)} />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input type="month" value={edu.end_date} onChange={e => updateEducation(i, 'end_date', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
                <Button variant="outline" size="sm" onClick={addSkill}>+ Add</Button>
              </div>
              {data.skills.map((skill, i) => (
                <div key={i} className="flex gap-3 items-end">
                  <div className="flex-1">
                    {i === 0 && <Label>Skill Name</Label>}
                    <Input value={skill.name} onChange={e => updateSkill(i, 'name', e.target.value)} placeholder="JavaScript" />
                  </div>
                  <div className="w-40">
                    {i === 0 && <Label>Level</Label>}
                    <select
                      value={skill.level}
                      onChange={e => updateSkill(i, 'level', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()} className="bg-blue-600 hover:bg-blue-700">
              {step < STEPS.length - 1 ? (
                <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
              ) : (
                <>Finish <Check className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
