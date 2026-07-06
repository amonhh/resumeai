import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function AIAssistButton({ section, currentContent = '', context = '', onApply }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setOptions([]);
    setSelected(null);
    try {
      const ctx = typeof context === 'string' ? context.slice(0, 2000) : '';
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `You are a resume writing expert. Generate 3 professional options for the "${section}" section.

Current content: "${currentContent?.slice(0, 1000) || '(empty)'}"
Context: ${ctx || 'N/A'}

Each option must be different in tone and style. Write compelling, achievement-focused content. Keep each option to 2-4 sentences.

Return JSON: { "options": ["option1", "option2", "option3"] }`,
        response_json_schema: {
          type: "object",
          properties: {
            options: { type: "array", items: { type: "string" } }
          }
        }
      });
      if (response?.options?.length > 0) {
        setOptions(response.options);
      } else {
        toast.error('AI could not generate options');
      }
    } catch (error) {
      toast.error('AI assist failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (selected == null) return;
    onApply(options[selected]);
    setOpen(false);
    setOptions([]);
    setSelected(null);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}
        className="gap-1 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/30 text-xs h-7 px-2">
        <Sparkles className="w-3 h-3" /> AI
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setOptions([]); setSelected(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-gray-100">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              AI Assist — {section}
            </DialogTitle>
          </DialogHeader>

          {options.length === 0 && !loading && (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-blue-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Generate AI-powered content for this section</p>
              <Button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-700">
                <Sparkles className="w-4 h-4 mr-2" /> Generate Options
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Generating...</span>
            </div>
          )}

          {options.length > 0 && (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {options.map((opt, i) => (
                <button key={i} onClick={() => setSelected(i)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selected === i ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-400 uppercase">Option {i + 1}</span>
                    {selected === i && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-sm text-gray-800">{opt}</p>
                </button>
              ))}
            </div>
          )}

          {options.length > 0 && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleApply} disabled={selected == null} className="bg-blue-600 hover:bg-blue-700">
                <Check className="w-4 h-4 mr-1.5" /> Apply
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
