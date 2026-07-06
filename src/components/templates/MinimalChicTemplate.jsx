import React from 'react';

export default function MinimalChicTemplate({ resume, colors = { primary: '#000000' } }) {
  const personal = resume.personal_details || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return (
    <div className="bg-white p-12" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Centered Header */}
      <div className="text-center mb-12 pb-8 border-b-2 border-black">
        {personal.photo_url && (
          <img 
            src={personal.photo_url} 
            alt={personal.full_name}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-2 border-black"
          />
        )}
        <h1 className="text-5xl font-light mb-2 tracking-tight">
          {personal.full_name || 'YOUR NAME'}
        </h1>
        <p className="text-xl text-gray-600 font-light tracking-wide mb-4">
          {personal.job_title || 'Your Job Title'}
        </p>
        <div className="flex justify-center gap-6 text-sm text-gray-600">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>•</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>•</span>}
          {personal.location && <span>{personal.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-10">
          <p className="text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
            {resume.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 text-center">
            Experience
          </h2>
          <div className="space-y-8">
            {experience.map((exp, idx) => (
              <div key={idx} className="max-w-3xl mx-auto">
                <div className="text-center mb-3">
                  <h3 className="text-lg font-semibold">{exp.job_title}</h3>
                  <p className="text-gray-600 font-medium">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-gray-700 text-center mb-2">{exp.description}</p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="space-y-1 text-gray-700 text-center list-none">
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

      {/* Education & Skills Grid */}
      <div className="grid grid-cols-2 gap-12 max-w-3xl mx-auto">
        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-center">
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="text-center">
                  <h3 className="font-semibold text-sm">{edu.degree}</h3>
                  <p className="text-gray-600 text-sm">{edu.institution}</p>
                  <p className="text-xs text-gray-500">
                    {edu.start_date} - {edu.end_date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-center">
              Skills
            </h2>
            <div className="space-y-2">
              {skills.map((skill, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-sm font-medium">{skill.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}