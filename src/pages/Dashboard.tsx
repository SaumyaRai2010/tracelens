import { Link } from 'react-router-dom';
import {
  Aperture,
  ArrowRight,
  Fingerprint,
  GitCompare,
  ScanSearch,
  Shield,
} from 'lucide-react';
import { useExamination } from '../context/ExaminationContext';

const features = [
  {
    title: 'Metadata Extraction',
    description:
      'Parse EXIF fields such as camera make/model, capture timestamps, orientation, exposure data, software tags and GPS coordinates when present.',
    icon: Aperture,
    to: '/metadata',
  },
  {
    title: 'Integrity Verification',
    description:
      'Calculate a SHA-256 digest from the original file bytes to support change detection against a known reference copy.',
    icon: Fingerprint,
    to: '/integrity',
  },
  {
    title: 'Image Comparison',
    description:
      'Upload two photographs, extract metadata independently, and highlight matching, differing or unavailable values.',
    icon: GitCompare,
    to: '/comparison',
  },
];

export function Dashboard() {
  const { primary } = useExamination();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="panel relative overflow-hidden px-6 py-8 sm:px-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-20 h-40 w-40 rounded-full bg-accent-blue/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="label text-teal-400">TraceLens</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Digital Image Forensic Examination System
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
            TraceLens is an educational digital forensic workstation for examining digital
            photographs in your browser. Upload a JPG or iPhone HEIC photo, extract technical
            metadata, calculate file hashes, review rule-based observations, compare two images, and
            export a structured examination report — without sending private photographs to an
            external server.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/examine" className="btn-primary">
              <ScanSearch className="h-4 w-4" />
              Start Image Examination
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/about" className="btn-secondary">
              <Shield className="h-4 w-4" />
              Methodology & Limits
            </Link>
          </div>
          {primary?.status === 'ready' ? (
            <p className="mt-4 text-xs text-teal-300">
              Active examination: {primary.id} · {primary.properties.name}
            </p>
          ) : (
            <p className="mt-4 text-xs text-slate-500">
              Tip: Use a camera-original iPhone HEIC/JPEG when possible. Social platforms often strip EXIF.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ title, description, icon: Icon, to }) => (
          <Link
            key={title}
            to={to}
            className="panel group p-5 transition hover:border-teal-500/40 hover:bg-navy-700/60"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 ring-1 ring-navy-500 group-hover:ring-teal-500/40">
              <Icon className="h-5 w-5 text-teal-400" />
            </div>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
          </Link>
        ))}
      </section>

      <section className="panel p-6">
        <h2 className="section-title">Purpose of the Platform</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <p className="text-sm leading-relaxed text-slate-300">
            Digital photographs often carry embedded technical records. TraceLens helps students,
            analysts and investigators practise structured examination by surfacing those records,
            computing integrity hashes, and documenting observations in a professional workflow.
          </p>
          <p className="text-sm leading-relaxed text-slate-300">
            The system emphasises careful interpretation: missing metadata is treated as incomplete
            information requiring further examination — never as automatic proof that an image is
            fake, genuine, manipulated or tampered.
          </p>
        </div>
      </section>
    </div>
  );
}
