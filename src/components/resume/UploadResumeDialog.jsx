import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import mammoth from "mammoth";
import { toast } from "sonner";

const responseSchema = {
  type: "object",
  properties: {
    personal_details: {
      type: "object",
      properties: {
        full_name: { type: "string" }, job_title: { type: "string" }, email: { type: "string" },
        phone: { type: "string" }, location: { type: "string" }
      }
    },
    summary: { type: "string" },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          job_title: { type: "string" }, company: { type: "string" }, location: { type: "string" },
          start_date: { type: "string" }, end_date: { type: "string" }, current: { type: "boolean" },
          description: { type: "string" }, achievements: { type: "array", items: { type: "string" } }
        }
      }
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          degree: { type: "string" }, institution: { type: "string" }, location: { type: "string" },
          start_date: { type: "string" }, end_date: { type: "string" }
        }
      }
    },
    skills: { type: "array", items: { type: "object", properties: { name: { type: "string" }, level: { type: "string" } } } }
  }
};

async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    const buf = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
    return value;
  }
  if (name.endsWith('.txt')) {
    return await file.text();
  }
  if (name.endsWith('.pdf')) {
    return null;
  }
  if (name.match(/\.(png|jpg|jpeg)$/)) {
    return null;
  }
  return null;
}

export default function UploadResumeDialog({ open, onClose, onResumeExtracted }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const valid = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.doc', '.txt'];
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (valid.includes(ext)) {
      setFile(f);
      setError(null);
    } else {
      toast.error('Please upload a PDF, DOCX, TXT, PNG, or JPG file');
    }
  };

  const handleUploadAndExtract = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setStatus('Reading file...');
    try {
      let text = await extractTextFromFile(file);
      if (!text && file.name.toLowerCase().match(/\.(png|jpg|jpeg)$/)) {
        setStatus('Analyzing image with AI...');
        const b64 = await toBase64(file);
        const result = await db.integrations.Core.InvokeLLM({
          prompt: `Analyze this resume image and extract all information. Return structured resume data.`,
          response_json_schema: responseSchema,
          image: b64
        });
        if (result) {
          onResumeExtracted(result);
          onClose();
          return;
        }
      }
      if (!text || text.trim().length < 20) {
        throw new Error('Could not read text from this file. Try a DOCX or TXT format.');
      }
      setStatus('Extracting resume data with AI...');
      const extracted = await db.integrations.Core.InvokeLLM({
        prompt: `Extract all resume/CV information from the following document text. Parse every section carefully including personal details, work experience, education, and skills. Return structured data.\n\n---\n${text.slice(0, 15000)}`,
        response_json_schema: responseSchema
      });
      if (extracted) {
        onResumeExtracted(extracted);
        onClose();
      } else {
        throw new Error('AI could not extract data from this file.');
      }
    } catch (err) {
      setError(err.message || 'Failed to process file');
    } finally {
      setUploading(false);
      setStatus('');
    }
  };

  function toBase64(f) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(f);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!uploading) { onClose(); setError(null); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Upload className="w-5 h-5 text-blue-600" />
            Import Resume
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-green-300 bg-green-50' : 'border-[#444] hover:border-emerald-500 bg-[#1a1a1a]'}`}>
            <input type="file" id="resume-upload" className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.docx,.doc,.txt"
              onChange={handleFileChange} disabled={uploading} />
            <label htmlFor="resume-upload" className="cursor-pointer block">
              {file ? (
                <div className="space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                  <p className="font-medium text-gray-100">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                  <Button type="button" variant="ghost" size="sm" className="text-blue-600">Change file</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileText className="w-10 h-10 text-blue-400 mx-auto" />
                  <p className="font-medium text-gray-100">Drop your resume here</p>
                  <p className="text-sm text-gray-500">PDF, DOCX, TXT, PNG, JPG</p>
                </div>
              )}
            </label>
          </div>

          {status && (
            <div className="flex items-center gap-2 text-sm text-blue-700 justify-center bg-blue-50 rounded-lg px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              {status}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {file && (
            <Button onClick={handleUploadAndExtract} disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" size="lg">
              {uploading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : <><Upload className="w-5 h-5 mr-2" /> Import & Extract</>}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
