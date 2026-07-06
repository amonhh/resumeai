import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Linkedin, Loader2, AlertCircle } from "lucide-react";

import { toast } from "sonner";

export default function LinkedInImportDialog({ open, onClose, onDataImported }) {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!linkedinUrl.trim()) {
      toast.error('Please enter your LinkedIn profile URL');
      return;
    }

    if (!linkedinUrl.includes('linkedin.com/in/')) {
      toast.error('Please enter a valid LinkedIn profile URL');
      return;
    }

    setImporting(true);

    try {
      const response = await db.integrations.Core.InvokeLLM({
        prompt: `Extract professional information from this LinkedIn profile URL: ${linkedinUrl}
        
Please search for and extract the following information:
- Full name
- Current job title
- Location
- Professional summary/about section
- Work experience (company, title, dates, description)
- Education (degree, institution, dates)
- Skills
- Contact information if available

Return the data in the following JSON format:`,
        response_json_schema: {
          type: "object",
          properties: {
            personal_details: {
              type: "object",
              properties: {
                full_name: { type: "string" },
                job_title: { type: "string" },
                location: { type: "string" },
                linkedin: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" }
              }
            },
            summary: { type: "string" },
            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  job_title: { type: "string" },
                  company: { type: "string" },
                  location: { type: "string" },
                  start_date: { type: "string" },
                  end_date: { type: "string" },
                  current: { type: "boolean" },
                  description: { type: "string" }
                }
              }
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  degree: { type: "string" },
                  institution: { type: "string" },
                  start_date: { type: "string" },
                  end_date: { type: "string" }
                }
              }
            },
            skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  level: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response && response.personal_details) {
        toast.success('LinkedIn data imported successfully!');
        onDataImported(response);
        onClose();
      } else {
        toast.error('Could not extract data from LinkedIn profile');
      }
    } catch (error) {
      console.error('Error importing LinkedIn:', error);
      toast.error('Failed to import LinkedIn profile');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-blue-700" />
            Import from LinkedIn
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">How to get your LinkedIn URL:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Go to your LinkedIn profile</li>
                <li>Click on your profile picture</li>
                <li>Copy the URL from your browser</li>
              </ol>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
            <Input
              id="linkedin-url"
              type="url"
              placeholder="https://www.linkedin.com/in/yourname"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={importing}
            />
          </div>

          <Button 
            onClick={handleImport}
            disabled={importing || !linkedinUrl.trim()}
            className="w-full bg-blue-700 hover:bg-blue-800"
            size="lg"
          >
            {importing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Importing from LinkedIn...
              </>
            ) : (
              <>
                <Linkedin className="w-5 h-5 mr-2" />
                Import Profile Data
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            We'll use AI to extract your professional information
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
