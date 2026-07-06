import React from 'react';

export default function ExecutiveTemplate({ resume, colors = { primary: '#1e40af', gold: '#d97706' } }) {
  const personal = resume.personal_details || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return (
    <div className="bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Elegant Header */}
      <div className="px-12 pt-12 pb-8 border-b-4" style={{ borderColor: colors.gold }}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 
              className="text-4xl font-serif font-bold mb-2"
              style={{ color: colors.primary }}
            >
              {personal.full_name || 'Your Name'}
            </h1>
            <p className="text-xl text-gray-600 font-light">
              {personal.job_title || 'Your Job Title'}
            </p>
          </div>
          {personal.photo_url && (
            <img 
              src={personal.photo_url} 
              alt={personal.full_name}
              className="w-28 h-28 rounded-full object-cover border-4 shadow-lg"
              style={{ borderColor: colors.gold }}
            />
          )}
        </div>
        
        {/* Contact Info */}
        <div className="flex gap-8 mt-6 text-sm text-gray-600">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-12 py-8">
        {/* Executive Summary */}
        {resume.summary && (
          <div className="mb-10">
            <h2 
              className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b"
              style={{ color: colors.primary, borderColor: colors.gold }}
            >
              Executive Summary
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              {resume.summary}
            </p>
          </div>
        )}

        {/* Professional Experience */}
        {experience.length > 0 && (
          <div className="mb-10">
            <h2 
              className="text-sm font-bold uppercase tracking-widest mb-6 pb-2 border-b"
              style={{ color: colors.primary, borderColor: colors.gold }}
            >
              Professional Experience
            </h2>
            <div className="space-y-8">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: colors.primary }}>
                        {exp.job_title}
                      </h3>
                      <p className="text-gray-700 font-semibold">{exp.company}</p>
                      {exp.location && (
                        <p className="text-sm text-gray-600">{exp.location}</p>
                      )}
                    </div>
                    <div 
                      className="px-4 py-1 rounded text-sm font-medium text-white"
                      style={{ backgroundColor: colors.gold }}
                    >
                      {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 mb-3 italic">{exp.description}</p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="space-y-2 text-gray-700">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex gap-3">
                          <span 
                            className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: colors.gold }}
                          />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Skills Side by Side */}
        <div className="grid grid-cols-2 gap-12">
          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 
                className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b"
                style={{ color: colors.primary, borderColor: colors.gold }}
              >
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <h3 className="font-bold" style={{ color: colors.primary }}>
                      {edu.degree}
                    </h3>
                    <p className="text-gray-700 font-medium">{edu.institution}</p>
                    <p className="text-sm text-gray-600">
                      {edu.start_date} - {edu.end_date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Competencies */}
          {skills.length > 0 && (
            <div>
              <h2 
                className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b"
                style={{ color: colors.primary, borderColor: colors.gold }}
              >
                Core Competencies
              </h2>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: colors.gold }}
                    />
                    <span className="text-sm text-gray-700">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}