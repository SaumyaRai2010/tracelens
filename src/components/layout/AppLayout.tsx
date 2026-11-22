import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Eraser, Menu } from 'lucide-react';
import { useExamination } from '../../context/ExaminationContext';
import { Sidebar } from './Sidebar';

const titles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Digital Image Forensic Examination System',
  },
  '/examine': {
    title: 'Image Examination',
    subtitle: 'Upload and analyse a photograph locally (JPG/HEIC)',
  },
  '/metadata': {
    title: 'Metadata Analysis',
    subtitle: 'EXIF fields extracted from the uploaded image',
  },
  '/integrity': {
    title: 'File Integrity',
    subtitle: 'SHA-256 digest of the original file bytes',
  },
  '/observations': {
    title: 'Forensic Observations',
    subtitle: 'Rule-based findings from extracted technical data',
  },
  '/comparison': {
    title: 'Image Comparison',
    subtitle: 'Side-by-side metadata and hash comparison',
  },
  '/report': {
    title: 'Forensic Report',
    subtitle: 'Generate a downloadable examination PDF',
  },
  '/about': {
    title: 'About & Methodology',
    subtitle: 'Scope, limitations, and responsible interpretation',
  },
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { primary, comparisonA, comparisonB, clearExamination, isBusy } =
    useExamination();
  const page = titles[location.pathname] ?? titles['/'];
  const hasWork = Boolean(primary || comparisonA || comparisonB);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-navy-500/80 bg-navy-900/85 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-300 hover:bg-navy-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white sm:text-base">
                  {page.title}
                </p>
                <p className="truncate text-xs text-slate-400">{page.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-danger shrink-0"
              disabled={!hasWork || isBusy}
              onClick={() => {
                if (
                  window.confirm(
                    'Clear the current examination, comparison uploads, and derived results?',
                  )
                ) {
                  clearExamination();
                }
              }}
            >
              <Eraser className="h-4 w-4" />
              <span className="hidden sm:inline">Clear Examination</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
