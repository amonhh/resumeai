import React from 'react';
import { Mail, Phone, MapPin, Calendar } from "lucide-react";

export default function ModernBlueTemplate({ resume }) {
  const personal = resume.personal_details || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return (
    <div className="bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '0', boxSizing: 'border-box' }}>
      {/* Blue Header with Photo */}
      <div className="relative" style={{ backgroundColor: '#5B7FBF' }}>
        <div className="flex items-center gap-8 px-8 py-7">
          {/* Photo Section */}
          <div className="flex-shrink-0">
            {personal.photo_url ? (
              <img 
                src={personal.photo_url} 
                alt={personal.full_name}
                className="w-32 h-32 object-cover border-4 border-white"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-300 border-4 border-white" />
            )}
          </div>

          {/* Name and Title */}
          <div className="text-white flex-1">
            <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">
              {personal.full_name || 'YOUR NAME'}
            </h1>
            <p className="text-xl text-blue-100 font-light">
              {personal.job_title || 'Your Job Title'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Contact Details Section */}
        <div className="mb-8">
          <div className="bg-black text-white px-4 py-2 inline-block font-bold mb-4">
            DETAILS
          </div>
          <div className="space-y-2 ml-4">
            {personal.location && (
              <p className="text-gray-800">{personal.location}</p>
            )}
            {personal.phone && (
              <p className="text-gray-800">{personal.phone}</p>
            )}
            {personal.email && (
              <p className="text-gray-800">{personal.email}</p>
            )}
          </div>
        </div>

        {/* Summary Section */}
        {resume.summary && (
          <div className="mb-8">
            <div className="bg-black text-white px-4 py-2 inline-block font-bold mb-4">
              SUMMARY
            </div>
            <p className="text-gray-800 leading-relaxed ml-4">
              {resume.summary}
            </p>
          </div>
        )}

        {/* Experience Section */}
        {experience.length > 0 && (
          <div className="mb-8">
            <div className="bg-black text-white px-4 py-2 inline-block font-bold mb-4">
              EXPERIENCE
            </div>
            <div className="space-y-6 ml-4">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-gray-900">
                    {exp.job_title}{exp.company ? `, ${exp.company}` : ''}{exp.location ? `, ${exp.location}` : ''}
                  </h3>
                  <p className="text-gray-500 uppercase text-sm tracking-wide mb-2">
                    {exp.start_date} {exp.end_date ? `— ${exp.end_date}` : ''}
                  </p>
                  {exp.description && (
                    <p className="text-gray-800 mb-2">{exp.description}</p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-none space-y-1">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="text-gray-800">
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <div className="mb-8">
            <div className="bg-black text-white px-4 py-2 inline-block font-bold mb-4">
              EDUCATION
            </div>
            <div className="space-y-4 ml-4">
              {education.map((edu, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-gray-900">
                    {edu.degree}{edu.institution ? `, ${edu.institution}` : ''}
                  </h3>
                  <p className="text-gray-500 uppercase text-sm tracking-wide">
                    {edu.start_date} — {edu.end_date}
                  </p>
                  {edu.gpa && (
                    <p className="text-gray-800 mt-1">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <div>
            <div className="bg-black text-white px-4 py-2 inline-block font-bold mb-4">
              SKILLS
            </div>
            <div className="ml-4 grid grid-cols-2 gap-x-8 gap-y-2">
              {skills.map((skill, idx) => (
                <div key={idx}>
                  <p className="text-gray-900">{skill.name}</p>
                  <div className="w-full bg-gray-300 h-1 mt-1">
                    <div 
                      className="bg-black h-1"
                      style={{ 
                        width: skill.level === 'expert' ? '100%' : 
                               skill.level === 'advanced' ? '75%' : 
                               skill.level === 'intermediate' ? '50%' : '25%' 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}