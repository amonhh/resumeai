import React from 'react';
import ModernBlueTemplate from '../templates/ModernBlueTemplate';
import MinimalSidebarTemplate from '../templates/MinimalSidebarTemplate';
import ProfessionalSidebarTemplate from '../templates/ProfessionalSidebarTemplate';
import ModernGradientTemplate from '../templates/ModernGradientTemplate';
import CreativeTwoToneTemplate from '../templates/CreativeTwoToneTemplate';
import MinimalChicTemplate from '../templates/MinimalChicTemplate';
import BoldModernTemplate from '../templates/BoldModernTemplate';
import ExecutiveTemplate from '../templates/ExecutiveTemplate';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ResumePreview({ resume, template = 'modern', customColors }) {
  if (!resume) return null;

  // Use new templates with custom colors
  if (template === 'modern-blue') {
    return <ModernBlueTemplate resume={resume} />;
  }

  if (template === 'minimal-sidebar') {
    return <MinimalSidebarTemplate resume={resume} />;
  }

  if (template === 'professional-sidebar') {
    return <ProfessionalSidebarTemplate resume={resume} />;
  }

  if (template === 'modern-gradient') {
    return <ModernGradientTemplate resume={resume} colors={customColors} />;
  }

  if (template === 'creative-twotone') {
    return <CreativeTwoToneTemplate resume={resume} colors={customColors} />;
  }

  if (template === 'minimal-chic') {
    return <MinimalChicTemplate resume={resume} colors={customColors} />;
  }

  if (template === 'bold-modern') {
    return <BoldModernTemplate resume={resume} colors={customColors} />;
  }

  if (template === 'executive') {
    return <ExecutiveTemplate resume={resume} colors={customColors} />;
  }

  // Default / fallback template
  const personal = resume.personal_details || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  if (template === 'modern' || template === 'ats') {
    return (
      <div className="bg-white shadow-lg" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
          <h1 className="text-4xl font-bold mb-2">{personal.full_name || 'Your Name'}</h1>
          <p className="text-xl text-blue-100 mb-4">{personal.job_title || 'Your Job Title'}</p>
          <div className="flex flex-wrap gap-4 text-sm text-blue-100">
            {personal.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {personal.email}
              </div>
            )}
            {personal.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {personal.phone}
              </div>
            )}
            {personal.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {personal.location}
              </div>
            )}
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Summary */}
          {resume.summary && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
                Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.job_title}</h3>
                        <p className="text-blue-600">{exp.company}</p>
                      </div>
                      <span className="text-sm text-gray-600">
                        {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 text-sm mb-2">{exp.description}</p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                        <p className="text-blue-600">{edu.institution}</p>
                        {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                      </div>
                      <span className="text-sm text-gray-600">
                        {edu.start_date} - {edu.end_date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}