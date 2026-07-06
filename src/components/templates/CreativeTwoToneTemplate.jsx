import React from 'react';

export default function CreativeTwoToneTemplate({ resume, colors = { accent: '#10b981', dark: '#1f2937' } }) {
  const personal = resume.personal_details || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return (
    <div className="bg-white flex" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Left Column - Dark */}
      <div className="w-1/3 text-white p-8" style={{ backgroundColor: colors.dark }}>
        {/* Photo */}
        {personal.photo_url && (
          <div className="mb-6">
            <img 
              src={personal.photo_url} 
              alt={personal.full_name}
              className="w-full aspect-square object-cover rounded-lg shadow-xl"
            />
          </div>
        )}

        {/* Contact */}
        <div className="mb-8">
          <div className="h-1 w-12 mb-4" style={{ backgroundColor: colors.accent }} />
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wide">Contact</h2>
          <div className="space-y-3 text-sm opacity-90">
            {personal.email && <p className="break-words">✉ {personal.email}</p>}
            {personal.phone && <p>📱 {personal.phone}</p>}
            {personal.location && <p>📍 {personal.location}</p>}
            {personal.website && <p>🌐 {personal.website}</p>}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8">
            <div className="h-1 w-12 mb-4" style={{ backgroundColor: colors.accent }} />
            <h2 className="text-lg font-bold mb-4 uppercase tracking-wide">Skills</h2>
            <div className="space-y-3">
              {skills.map((skill, idx) => (
                <div key={idx}>
                  <p className="text-sm font-medium mb-1">{skill.name}</p>
                  <div className="w-full bg-gray-700 h-1.5 rounded">
                    <div 
                      className="h-1.5 rounded"
                      style={{ 
                        backgroundColor: colors.accent,
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

        {/* Certifications */}
        {resume.certifications?.length > 0 && (
          <div>
            <div className="h-1 w-12 mb-4" style={{ backgroundColor: colors.accent }} />
            <h2 className="text-lg font-bold mb-4 uppercase tracking-wide">Certifications</h2>
            <div className="space-y-2 text-sm opacity-90">
              {resume.certifications.map((cert, idx) => (
                <div key={idx}>
                  <p className="font-medium">{cert.name}</p>
                  <p className="text-xs opacity-75">{cert.issuer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - White */}
      <div className="flex-1 p-8">
        {/* Name & Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2" style={{ color: colors.dark }}>
            {personal.full_name || 'Your Name'}
          </h1>
          <div className="h-1 w-24 mb-4" style={{ backgroundColor: colors.accent }} />
          <p className="text-xl text-gray-600">{personal.job_title || 'Your Job Title'}</p>
        </div>

        {/* Summary */}
        {resume.summary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-3" style={{ color: colors.dark }}>
              Profile
            </h2>
            <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.dark }}>
              Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: colors.dark }}>
                        {exp.job_title}
                      </h3>
                      <p className="font-medium" style={{ color: colors.accent }}>
                        {exp.company}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                    </span>
                  </div>
                  {exp.description && <p className="text-gray-700 mb-2">{exp.description}</p>}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="space-y-1 text-gray-700">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex gap-2">
                          <span style={{ color: colors.accent }}>▸</span>
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

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.dark }}>
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx}>
                  <h3 className="font-bold" style={{ color: colors.dark }}>
                    {edu.degree}
                  </h3>
                  <p className="font-medium" style={{ color: colors.accent }}>
                    {edu.institution}
                  </p>
                  <p className="text-sm text-gray-500">
                    {edu.start_date} - {edu.end_date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}