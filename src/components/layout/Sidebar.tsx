import { NavLink } from 'react-router-dom';
import {
  Aperture,
  FileText,
  Fingerprint,
  GitCompare,
  Home,
  Info,
  ScanSearch,
  ShieldAlert,
  X,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/examine', label: 'Image Examination', icon: ScanSearch },
  { to: '/metadata', label: 'Metadata Analysis', icon: Aperture },
  { to: '/integrity', label: 'File Integrity', icon: Fingerprint },
  { to: '/observations', label: 'Forensic Observations', icon: ShieldAlert },
  { to: '/comparison', label: 'Image Comparison', icon: GitCompare },
  { to: '/report', label: 'Forensic Report', icon: FileText },
  { to: '/about', label: 'About & Methodology', icon: Info },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-navy-500 bg-navy-850/95 backdrop-blur transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-navy-500 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 ring-1 ring-teal-500/40">
              <Aperture className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-white">TraceLens</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                Forensic Lab
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-navy-700 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-navy-500 p-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Educational technical examination only. All processing stays in your browser.
          </p>
        </div>
      </aside>
    </>
  );
}
