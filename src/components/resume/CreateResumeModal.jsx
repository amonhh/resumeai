import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  FileText, 
  Upload, 
  Linkedin, 
  FileCheck,
  ChevronRight,
  Loader2
} from "lucide-react";

export default function CreateResumeModal({ open, onClose, onCreateMethod }) {
  const [loading, setLoading] = useState(false);

  const methods = [
    {
      id: 'new',
      icon: FileText,
      title: 'Create new resume',
      description: 'Start from scratch with a blank template',
      color: 'text-gray-700'
    },
    {
      id: 'ai',
      icon: Sparkles,
      title: 'Create with AI assistance',
      description: 'Answer a few questions and AI will write your resume',
      color: 'text-blue-600',
      badge: true,
      recommended: true
    },
    {
      id: 'upload',
      icon: Upload,
      title: 'Upload resume',
      description: 'Import an existing resume file',
      color: 'text-gray-700'
    },
    {
      id: 'linkedin',
      icon: Linkedin,
      title: 'Create with LinkedIn profile',
      description: 'Import your LinkedIn information',
      color: 'text-blue-700'
    },
    {
      id: 'example',
      icon: FileCheck,
      title: 'Create from example',
      description: 'Start with a pre-filled template',
      color: 'text-gray-700'
    }
  ];

  const handleMethodSelect = async (methodId) => {
    setLoading(true);
    await onCreateMethod(methodId);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center text-gray-100 mb-2">
            Let's get started
          </DialogTitle>
          <p className="text-center text-gray-600 text-lg">
            How do you want to create your resume?
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#333] hover:border-emerald-600 hover:bg-emerald-900/30 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-[#1a1a1a] group-hover:bg-white transition-colors ${method.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-100">{method.title}</h3>
                      {method.badge && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          AI
                        </span>
                      )}
                      {method.recommended && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                {loading ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}