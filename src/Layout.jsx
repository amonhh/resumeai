import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { FileText, LayoutTemplate, LogOut } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';

export default function Layout({ children, currentPageName }) {
  const { logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="bg-[#111] border-b border-[#222] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-100">Stylus CV</span>
            </Link>

            <div className="flex items-center gap-6">
              {!['Home'].includes(currentPageName) && (
                <>
                  <Link to={createPageUrl('Templates')}
                    className={`text-sm font-medium transition-colors ${
                      currentPageName === 'Templates' ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-200'
                    }`}>
                    <LayoutTemplate className="w-4 h-4 inline mr-1" />
                    Templates
                  </Link>
                  {isAuthenticated && (
                    <Link to={createPageUrl('Dashboard')}
                      className={`text-sm font-medium transition-colors ${
                        currentPageName === 'Dashboard' ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-200'
                      }`}>
                      <FileText className="w-4 h-4 inline mr-1" />
                      My Resumes
                    </Link>
                  )}
                  {isAuthenticated && (
                    <Button variant="ghost" size="sm" onClick={handleLogout}
                      className="text-gray-400 hover:text-gray-200">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  )}
                </>
              )}
              {currentPageName === 'Home' && (
                <>
                  <Link to={createPageUrl('Templates')}
                    className="text-sm font-medium text-gray-400 hover:text-gray-200">
                    Templates
                  </Link>
                  <Link to={createPageUrl('Templates')}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-[#111] border-t border-[#222] mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 Stylus CV — AI-Powered Resume Builder</p>
            <p className="mt-2">Create professional resumes with AI assistance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
