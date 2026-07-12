import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  FileText,
  MoreVertical,
  Download,
  Copy,
  Trash2,
  Eye,
  Edit,
  Target
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CreateResumeModal from '../components/resume/CreateResumeModal';
import UploadResumeDialog from '../components/resume/UploadResumeDialog';
import LinkedInImportDialog from '../components/resume/LinkedInImportDialog';
import AIResumeWizard from '../components/resume/AIResumeWizard';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showLinkedInDialog, setShowLinkedInDialog] = useState(false);
  const [showAIWizard, setShowAIWizard] = useState(false);

  const { data: resumes, isLoading } = useQuery({
    queryKey: ['resumes', isAuthenticated],
    queryFn: () => db.entities.Resume.list(),
    initialData: [],
  });

  const createResumeMutation = useMutation({
    mutationFn: (data) => db.entities.Resume.create(data),
    onSuccess: (newResume) => {
      queryClient.invalidateQueries({ queryKey: ['resumes', isAuthenticated] });
      navigate(createPageUrl(`Editor?id=${newResume.id}`));
      toast.success('Resume created successfully');
    },
    onError: () => {
      toast.error('Failed to create resume. Please try again.');
    }
  });

  const deleteResumeMutation = useMutation({
    mutationFn: (id) => db.entities.Resume.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes', isAuthenticated] });
      toast.success('Resume deleted');
    },
    onError: () => {
      toast.error('Failed to delete resume. Please try again.');
    }
  });

  const duplicateResumeMutation = useMutation({
    mutationFn: async (resume) => {
      const { id: _id, created_date: _cd, updated_date: _ud, ...resumeData } = resume;
      return db.entities.Resume.create({
        ...resumeData,
        title: `${resumeData.title} (Copy)`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes', isAuthenticated] });
      toast.success('Resume duplicated');
    },
    onError: () => {
      toast.error('Failed to duplicate resume. Please try again.');
    }
  });

  const handleCreateMethod = async (method) => {
    setShowCreateModal(false);

    if (method === 'ai') {
      setShowAIWizard(true);
    } else if (method === 'new') {
      try {
        await createResumeMutation.mutateAsync({
          title: 'Untitled Resume',
          template: 'modern-blue',
          personal_details: {},
          experience: [],
          education: [],
          skills: []
        });
      } catch {
        // onError handles toast
      }
    } else if (method === 'upload') {
      setShowUploadDialog(true);
    } else if (method === 'linkedin') {
      setShowLinkedInDialog(true);
    } else {
      toast.info('This feature is coming soon!');
    }
  };

  const handleResumeDataImported = async (data) => {
    await createResumeMutation.mutateAsync({
      title: data.personal_details?.full_name ? `${data.personal_details.full_name}'s Resume` : 'Imported Resume',
      template: 'modern-blue',
      ...data
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">My Resumes</h1>
            <p className="text-gray-400">Manage and create your professional resumes</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 h-12 px-6">
            <Plus className="w-5 h-5 mr-2" />
            Create Resume
          </Button>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#141414] border-[#222] overflow-hidden">
                <Skeleton className="aspect-[210/297] rounded-none bg-slate-800" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-slate-800" />
                  <Skeleton className="h-4 w-1/2 bg-slate-800" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && resumes.length === 0 && (
          <Card className="p-16 text-center bg-[#141414] border-[#222]">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-200 mb-3">No resumes yet</h2>
              <p className="text-gray-500 mb-8">Create your first professional resume with AI assistance</p>
              <Button onClick={() => setShowCreateModal(true)} size="lg"
                className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Resume
              </Button>
            </div>
          </Card>
        )}

        {resumes.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="group hover:shadow-xl transition-all duration-300 bg-[#141414] border-[#222]">
                <div className="aspect-[210/297] bg-[#1a1a1a] relative overflow-hidden border-b border-[#222]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="w-16 h-16 text-gray-700" />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-3">
                      <Button size="sm" variant="secondary"
                        onClick={() => navigate(createPageUrl(`Editor?id=${resume.id}`))}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="secondary"
                        onClick={() => navigate(createPageUrl(`Editor?id=${resume.id}`))}>
                        <Eye className="w-4 h-4 mr-1" /> Preview
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-200 truncate mb-1">
                        {resume.title || 'Untitled'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Updated {format(new Date(resume.updated_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" aria-label="More actions">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-[#333] text-gray-200">
                        <DropdownMenuItem onClick={() => navigate(createPageUrl(`Editor?id=${resume.id}`))}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateResumeMutation.mutate(resume)}>
                          <Copy className="w-4 h-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(createPageUrl(`Editor?id=${resume.id}`))}>
                          <Download className="w-4 h-4 mr-2" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteResumeMutation.mutate(resume.id)} className="text-red-400">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {resume.score && (
                    <div className="flex items-center gap-2 mt-3">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">{resume.score}% Resume Score</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateResumeModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateMethod={handleCreateMethod}
      />

      <AIResumeWizard
        open={showAIWizard}
        onClose={() => setShowAIWizard(false)}
        onResumeGenerated={handleResumeDataImported}
      />

      <UploadResumeDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onResumeExtracted={handleResumeDataImported}
      />

      <LinkedInImportDialog
        open={showLinkedInDialog}
        onClose={() => setShowLinkedInDialog(false)}
        onDataImported={handleResumeDataImported}
      />
    </div>
  );
}
