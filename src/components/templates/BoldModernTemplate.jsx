import React from 'react';

export default function BoldModernTemplate({ resume, colors = { primary: '#ef4444', accent: '#fbbf24' } }) {
  const personal = resume.personal_details || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return (
    <div className="bg-gray-50" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Bold Header with Diagonal Cut */}
      <div 
        className="relative p-12 pb-20 text-white"
        style={{ 
          backgroundColor: colors.primary,
          clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
        }}
      >
        <div className="flex items-end gap-8">
          {personal.photo_url && (
            <img 
              src={personal.photo_url} 
              alt={personal.full_name}
              className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-2xl"
            />
          )}
          <div className="flex-1 pb-2">
            <h1 className="text-5xl font-black mb-3 uppercase tracking-tight">
              {personal.full_name || 'Your Name'}
            </h1>
            <p className="text-2xl font-light opacity-95">
              {personal.job_title || 'Your Job Title'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 -mt-8 relative z-10">
        {/* Contact Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-700">
            {personal.email && <span className="font-medium">✉ {personal.email}</span>}
            {personal.phone && <span className="font-medium">📱 {personal.phone}</span>}
            {personal.location && <span className="font-medium">📍 {personal.location}</span>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 pb-12">
          {/* Left Column - Summary & Skills */}
          <div className="space-y-8">
            {resume.summary && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div 
                  className="w-16 h-1 rounded mb-4"
                  style={{ backgroundColor: colors.accent }}
                />
                <h2 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>
                  About
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {resume.summary}
                </p>
              </div>
            )}

            {skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div 
                  className="w-16 h-1 rounded mb-4"
                  style={{ backgroundColor: colors.accent }}
                />
                <h2 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {education.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div 
                  className="w-16 h-1 rounded mb-4"
                  style={{ backgroundColor: colors.accent }}
                />
                <h2 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>
                  Education
                </h2>
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div key={idx}>
                      <h3 className="font-bold text-sm">{edu.degree}</h3>
                      <p className="text-gray-600 text-xs">{edu.institution}</p>
                      <p className="text-gray-500 text-xs">{edu.start_date} - {edu.end_date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Experience */}
          <div className="col-span-2">
            {experience.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div 
                  className="w-24 h-1 rounded mb-6"
                  style={{ backgroundColor: colors.accent }}
                />
                <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
                  Experience
                </h2>
                <div className="space-y-8">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="relative pl-8 border-l-2" style={{ borderColor: colors.accent }}>
                      <div 
                        className="absolute -left-2.5 top-0 w-5 h-5 rounded-full border-4 border-white"
                        style={{ backgroundColor: colors.primary }}
                      />
                      <div className="mb-2">
                        <h3 className="text-lg font-bold">{exp.job_title}</h3>
                        <p className="font-semibold" style={{ color: colors.primary }}>
                          {exp.company}
                        </p>
                        <p className="text-sm text-gray-500">
                          {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                        </p>
                      </div>
                      {exp.description && (
                        <p className="text-gray-700 text-sm mb-2">{exp.description}</p>
                      )}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="space-y-1 text-sm text-gray-700">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i} className="flex gap-2">
                              <span style={{ color: colors.accent }}>●</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}