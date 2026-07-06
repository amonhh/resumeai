import React from 'react';
import { Mail, Phone, MapPin } from "lucide-react";

export default function MinimalSidebarTemplate({ resume }) {
  const personal = resume.personal_details || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return (
    <div className="bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Photo at Top Center */}
      <div className="text-center pt-12 pb-6">
        {personal.photo_url ? (
          <img 
            src={personal.photo_url} 
            alt={personal.full_name}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-2 border-gray-200"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-6 border-2 border-gray-200" />
        )}
        
        <h1 className="text-4xl font-bold text-gray-900 tracking-wide mb-1">
          {personal.full_name || 'JOSEPH AMON KHALECHI'}
        </h1>
        <p className="text-lg text-gray-600 uppercase tracking-widest">
          {personal.job_title || 'MATHEMATICS TEACHER'} <span className="mx-2">📍</span> {personal.location || 'DUBAI'}
        </p>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-gray-50 p-8 border-r border-gray-200">
          {/* Details Section */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-lg">👤</span> DETAILS
            </h2>
            <div className="space-y-3 text-sm">
              {personal.location && (
                <p className="text-gray-700">{personal.location}</p>
              )}
              {personal.phone && (
                <p className="text-gray-700">{personal.phone}</p>
              )}
              {personal.email && (
                <p className="text-gray-700 break-words">{personal.email}</p>
              )}
            </div>
          </div>

          {/* Skills Section */}
          {skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">⚡</span> SKILLS
              </h2>
              <div className="space-y-3">
                {skills.map((skill, idx) => (
                  <div key={idx}>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {skill.name}
                    </p>
                    <div className="w-full h-1 bg-gray-300 rounded">
                      <div 
                        className="h-1 bg-gray-900 rounded"
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

          {/* Languages */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-lg">🌐</span> LANGUAGES
            </h2>
            <div className="space-y-2 text-sm">
              {resume.languages?.map((lang, idx) => (
                <div key={idx}>
                  <p className="font-medium text-gray-900">{lang.language}</p>
                  <div className="w-full h-1 bg-gray-300 rounded mt-1">
                    <div className="h-1 bg-gray-900 rounded" style={{ width: '90%' }} />
                  </div>
                </div>
              )) || (
                <>
                  <div>
                    <p className="font-medium text-gray-900">English</p>
                    <div className="w-full h-1 bg-gray-300 rounded mt-1">
                      <div className="h-1 bg-gray-900 rounded" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Swahili</p>
                    <div className="w-full h-1 bg-gray-300 rounded mt-1">
                      <div className="h-1 bg-gray-900 rounded" style={{ width: '90%' }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8">
          {/* Profile Section */}
          {resume.summary && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">👨💼</span> PROFILE
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {resume.summary}
              </p>
            </div>
          )}

          {/* Employment History */}
          {experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">💼</span> EMPLOYMENT HISTORY
              </h2>
              <div className="space-y-6">
                {experience.map((exp, idx) => (
                  <div key={idx}>
                    <h3 className="font-bold text-gray-900">
                      {exp.job_title} at {exp.company}{exp.location ? `, ${exp.location}` : ''}
                    </h3>
                    <p className="text-gray-500 text-sm italic mb-2">
                      {exp.start_date} — {exp.current ? 'Present' : exp.end_date}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-none space-y-1 text-sm">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="text-gray-700">
                            - {achievement}
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
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🎓</span> EDUCATION
              </h2>
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <h3 className="font-bold text-gray-900">
                      {edu.degree}, {edu.institution}{edu.location ? `, ${edu.location}` : ''}
                    </h3>
                    <p className="text-gray-500 text-sm italic">
                      {edu.start_date} — {edu.end_date}
                    </p>
                    {edu.description && (
                      <p className="text-gray-700 text-sm mt-1">{edu.description}</p>
                    )}
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