import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

import { toast } from "sonner";

export default function AIWriterButton({ section, context, onApply }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please provide some details');
      return;
    }

    setGenerating(true);
    try {
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `You are a professional resume writer. Help write a compelling ${section} section for a resume.
        
Context: ${context || 'None provided'}
User input: ${prompt}

Write a professional, concise, and impactful ${section} that highlights achievements and skills. Use bullet points where appropriate. Keep it focused and relevant.`,
      });

      setGeneratedText(response);
    } catch (error) {
      toast.error('Failed to generate content');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const handleApply = () => {
    onApply(generatedText);
    setOpen(false);
    setGeneratedText('');
    setPrompt('');
    toast.success('Content applied');
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Sparkles className="w-4 h-4" />
        Ask AI writer
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Writing Assistant
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tell AI what you want to write about:
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`e.g., "Write about my experience as a marketing manager where I increased social media engagement by 150%"`}
                rows={4}
                className="resize-none"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={generating || !prompt.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>

            {generatedText && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Generated Content:
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {generatedText}
                  </div>
                </div>
                <Button 
                  onClick={handleApply}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Apply to Resume
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
