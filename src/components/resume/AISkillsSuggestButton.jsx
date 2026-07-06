import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Loader2, Plus, Check } from "lucide-react";

import { toast } from "sonner";

export default function AISkillsSuggestButton({ context, existingSkills = [], onAddSkills }) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setOpen(true);
    if (suggestions.length > 0) return;
    setLoading(true);
    try {
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `You are a career expert. Based on the candidate's resume context, suggest relevant skills that would strengthen their profile.

Context: ${context || 'N/A'}
Already listed skills: ${existingSkills.map(s => s.name).join(', ') || 'None'}

Suggest 10-12 relevant, marketable skills NOT already listed. Include a mix of technical and soft skills. Return as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            skills: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      const existingLower = existingSkills.map(s => s.name.toLowerCase());
      const filtered = (response.skills || []).filter(s => !existingLower.includes(s.toLowerCase()));
      setSuggestions(filtered);
      setSelected(new Set());
    } catch (error) {
      toast.error('AI could not suggest skills');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (skill) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const handleAdd = () => {
    const toAdd = suggestions.filter(s => selected.has(s));
    if (toAdd.length === 0) {
      toast.error('Select at least one skill');
      return;
    }
    onAddSkills(toAdd);
    setOpen(false);
    setSuggestions([]);
    setSelected(new Set());
    toast.success(`Added ${toAdd.length} skill${toAdd.length > 1 ? 's' : ''}`);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSuggest}
        className="gap-1.5 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/30"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Suggest skills
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Suggested Skills
            </DialogTitle>
            <DialogDescription>Select the skills you'd like to add to your resume.</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Finding relevant skills...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {suggestions.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggle(skill)}
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                    selected.has(skill)
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {selected.has(skill) && <Check className="w-3.5 h-3.5 inline mr-1" />}
                  {skill}
                </button>
              ))}
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1.5" />
                Add {selected.size > 0 ? `(${selected.size})` : ''}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
