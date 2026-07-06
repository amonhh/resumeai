import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Palette } from "lucide-react";
import LiveTemplatePreview from '../templates/LiveTemplatePreview';

const templates = [
  { id: 'modern-blue', name: 'Modern Blue', description: 'Professional design with blue header and photo' },
  { id: 'minimal-sidebar', name: 'Minimal Sidebar', description: 'Clean layout with centered photo and side details' },
  { id: 'professional-sidebar', name: 'Professional Sidebar', description: 'Classic design with gray sidebar' },
  { id: 'modern-gradient', name: 'Modern Gradient', description: 'Stunning gradient header with timeline', badge: 'New' },
  { id: 'creative-twotone', name: 'Creative Two-Tone', description: 'Bold dark sidebar with accent colors', badge: 'New' },
  { id: 'minimal-chic', name: 'Minimal Chic', description: 'Ultra-clean centered layout', badge: 'New' },
  { id: 'bold-modern', name: 'Bold Modern', description: 'Eye-catching diagonal cut design', badge: 'New' },
  { id: 'executive', name: 'Executive', description: 'Sophisticated serif design for senior roles', badge: 'New' },
  { id: 'modern', name: 'Modern Professional', description: 'Contemporary design with gradient accents' },
  { id: 'ats', name: 'ATS Optimized', description: 'Simple format guaranteed to pass ATS systems' },
];

const ASPECT = 'aspect-[210/297]';

export default function TemplateSelector({ open, onClose, currentTemplate, onSelectTemplate }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Palette className="w-6 h-6 text-blue-600" />
            Choose Your Template
          </DialogTitle>
          <p className="text-stone-600">Select a professional template for your resume</p>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-5 mt-6">
          {templates.map((template, i) => (
            <Card key={template.id}
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl group ${
                currentTemplate === template.id ? 'ring-2 ring-blue-600 shadow-xl' : ''
              }`}
              onClick={() => {
                onSelectTemplate(template.id);
                onClose();
              }}>
              {currentTemplate === template.id && (
                <div className="absolute top-3 right-3 z-10 bg-blue-600 rounded-full p-1">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}
              {template.badge && (
                <div className="absolute top-3 left-3 z-10 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                  {template.badge}
                </div>
              )}

              <div className={`${ASPECT} bg-white overflow-hidden relative`}>
                <LiveTemplatePreview templateId={template.id} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
              </div>

              <div className="p-4 bg-white">
                <h3 className="font-semibold text-stone-900 mb-1">{template.name}</h3>
                <p className="text-sm text-stone-600">{template.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
