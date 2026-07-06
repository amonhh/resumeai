import React from 'react';

export default function ProfessionalSidebarTemplate({ resume }) {
  const personal = resume.personal_details || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];
  const certifications = resume.certifications || [];

  return (
    <div className="bg-white flex" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Left Sidebar - Gray */}
      <div className="w-72 bg-gray-100 p-8">
        {/* Header with Name */}
        <div className="mb-8 pb-8 border-b-2 border-gray-900">
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-4">
            {personal.full_name || 'AMON JOSEPH KHALECHI'}
          </h1>
          <p className="text-sm text-gray-700 uppercase tracking-wide">
            {personal.job_title || 'PHYSICAL EDUCATION TEACHER & SPORTS COACH'}
          </p>
        </div>

        {/* Details Section */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide pb-2 border-b border-gray-400">
            DETAILS
          </h2>
          <div className="space-y-3">
            {personal.location && (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">ADDRESS</p>
                <p className="text-sm text-gray-800">{personal.location}</p>
              </div>
            )}
            {personal.phone && (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">PHONE</p>
                <p className="text-sm text-gray-800">{personal.phone}</p>
              </div>
            )}
            {personal.email && (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">EMAIL</p>
                <p className="text-sm text-gray-800 break-words">{personal.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide pb-2 border-b border-gray-400">
              SKILLS
            </h2>
            <div className="space-y-3">
              {skills.map((skill, idx) => (
                <div key={idx}>
                  <p className="text-sm text-gray-900 font-medium mb-1">
                    {skill.name}
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div 
                        key={dot}
                        className={`w-2 h-2 rounded-full ${
                          (skill.level === 'expert' && dot <= 5) ||
                          (skill.level === 'advanced' && dot <= 4) ||
                          (skill.level === 'intermediate' && dot <= 3) ||
                          (skill.level === 'beginner' && dot <= 2)
                            ? 'bg-gray-900' 
                            : 'bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide pb-2 border-b border-gray-400">
              CERTIFICATIONS
            </h2>
            <div className="space-y-2 text-xs text-gray-800">
              {certifications.map((cert, idx) => (
                <p key={idx}>
                  {cert.name} – {cert.issuer} ({cert.date})
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {/* Summary */}
        {resume.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide pb-2 border-b-2 border-gray-900">
              SUMMARY
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {resume.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide pb-2 border-b-2 border-gray-900">
              EXPERIENCE
            </h2>
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {exp.job_title}, {exp.company}
                      </h3>
                      {exp.location && (
                        <p className="text-sm text-gray-600">{exp.location}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 text-right whitespace-nowrap ml-4">
                      {exp.start_date}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-none space-y-1 text-sm text-gray-700">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i}>
                          • {achievement}
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
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide pb-2 border-b-2 border-gray-900">
              EDUCATION
            </h2>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-gray-900">
                    {edu.institution}, {edu.degree}{edu.location ? `, ${edu.location}` : ''}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {edu.start_date}-{edu.end_date}
                  </p>
                  {edu.description && (
                    <p className="text-sm text-gray-700 mt-1">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}