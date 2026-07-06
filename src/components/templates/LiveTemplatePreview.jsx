import React, { useRef, useState, useLayoutEffect } from 'react';
import ModernBlueTemplate from './ModernBlueTemplate';
import MinimalSidebarTemplate from './MinimalSidebarTemplate';
import ProfessionalSidebarTemplate from './ProfessionalSidebarTemplate';
import ModernGradientTemplate from './ModernGradientTemplate';
import CreativeTwoToneTemplate from './CreativeTwoToneTemplate';
import MinimalChicTemplate from './MinimalChicTemplate';
import BoldModernTemplate from './BoldModernTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import ResumePreview from '../resume/ResumePreview';

const SAMPLE_RESUME = {
  personal_details: {
    full_name: 'Alex Morgan',
    job_title: 'Product Designer',
    email: 'alex@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexmorgan',
    website: 'alexmorgan.design'
  },
  summary: 'Senior product designer with 8+ years crafting intuitive digital products for fast-growing startups and enterprise clients.',
  experience: [
    {
      job_title: 'Senior Product Designer',
      company: 'Acme Corp',
      location: 'San Francisco, CA',
      start_date: '2021',
      end_date: 'Present',
      current: true,
      description: 'Led the design of the flagship analytics platform.',
      achievements: ['Increased user retention by 40%', 'Shipped 12 major features']
    },
    {
      job_title: 'Product Designer',
      company: 'Beta Studio',
      location: 'Remote',
      start_date: '2018',
      end_date: '2021',
      description: 'Designed end-to-end UX for SaaS clients.',
      achievements: ['Built the core design system']
    }
  ],
  education: [
    {
      degree: 'B.A. Design',
      institution: 'Stanford University',
      location: 'Stanford, CA',
      start_date: '2012',
      end_date: '2016'
    }
  ],
  skills: [
    { name: 'Figma', level: 'expert' },
    { name: 'Prototyping', level: 'expert' },
    { name: 'Research', level: 'advanced' },
    { name: 'UI/UX', level: 'expert' }
  ],
  certifications: [{ name: 'UX Certified', issuer: 'NN/g', date: '2020' }],
  languages: [{ language: 'English', proficiency: 'native' }]
};

const RENDERERS = {
  'modern-blue': () => <ModernBlueTemplate resume={SAMPLE_RESUME} />,
  'modern-gradient': () => <ModernGradientTemplate resume={SAMPLE_RESUME} />,
  'creative-twotone': () => <CreativeTwoToneTemplate resume={SAMPLE_RESUME} />,
  'bold-modern': () => <BoldModernTemplate resume={SAMPLE_RESUME} />,
  'executive': () => <ExecutiveTemplate resume={SAMPLE_RESUME} />,
  'minimal-chic': () => <MinimalChicTemplate resume={SAMPLE_RESUME} />,
  'minimal-sidebar': () => <MinimalSidebarTemplate resume={SAMPLE_RESUME} />,
  'professional-sidebar': () => <ProfessionalSidebarTemplate resume={SAMPLE_RESUME} />,
  'modern': () => <ResumePreview resume={SAMPLE_RESUME} template="modern" />
};

const PAGE_W = 794;  // 210mm @96dpi
const PAGE_H = 1123; // 297mm @96dpi

export default function LiveTemplatePreview({ templateId }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.3);
  const Render = RENDERERS[templateId];

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / PAGE_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!Render) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-400">
        Preview unavailable
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-white" style={{ height: PAGE_H * scale }}>
      <div
        className="origin-top-left absolute top-0 left-0"
        style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, pointerEvents: 'none' }}
      >
        <Render />
      </div>
    </div>
  );
}