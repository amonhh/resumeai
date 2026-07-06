import React from 'react';

export default function ModernGradientTemplate({ resume, colors = { primary: '#6366f1', secondary: '#8b5cf6' } }) {
  const personal = resume.personal_details || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return (
    <div className="bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Gradient Header */}
      <div 
        className="relative p-8 text-white"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
        }}
      >
        <div className="flex items-center gap-6">
          {personal.photo_url && (
            <img 
              src={personal.photo_url} 
              alt={personal.full_name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{personal.full_name || 'Your Name'}</h1>
            <p className="text-xl opacity-90">{personal.job_title || 'Your Job Title'}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm opacity-90">
              {personal.email && <span>✉ {personal.email}</span>}
              {personal.phone && <span>📱 {personal.phone}</span>}
              {personal.location && <span>📍 {personal.location}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Summary */}
        {resume.summary && (
          <div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: colors.primary }}>
              About Me
            </h2>
            <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>
              Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative pl-6 border-l-2" style={{ borderColor: colors.secondary }}>
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <h3 className="font-bold text-lg text-gray-900">{exp.job_title}</h3>
                  <p className="text-gray-600 font-medium">{exp.company} • {exp.location}</p>
                  <p className="text-sm text-gray-500 mb-2">{exp.start_date} - {exp.current ? 'Present' : exp.end_date}</p>
                  {exp.description && <p className="text-gray-700 mb-2">{exp.description}</p>}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
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

        <div className="grid grid-cols-2 gap-8">
          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.start_date} - {edu.end_date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}