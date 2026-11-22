const sections = [
  {
    title: 'Digital Image Forensics',
    body: 'Digital image forensics examines photographs as technical artefacts. Practitioners review file structure, embedded metadata, integrity hashes and contextual evidence to support investigative questions. Educational tools such as TraceLens focus on transparent technical examination rather than automated authenticity verdicts.',
  },
  {
    title: 'EXIF Metadata',
    body: 'Exchangeable Image File Format (EXIF) metadata can record camera manufacturer and model, capture timestamps, exposure settings, orientation, software identifiers and GPS coordinates. Not every JPEG contains EXIF. Platforms, editors and privacy tools frequently remove or rewrite tags during export and sharing.',
  },
  {
    title: 'SHA-256 Hashing',
    body: 'SHA-256 is a cryptographic hash function that maps arbitrary file bytes to a fixed-length digest. Identical bytes produce the same digest; any change produces a different digest. TraceLens calculates SHA-256 in the browser using the Web Crypto API so examiners can verify whether a copy matches a known reference.',
  },
  {
    title: 'Metadata Limitations',
    body: 'Metadata can be incomplete, inaccurate, timezone-shifted, stripped or deliberately altered. Camera clocks may be wrong. GPS may be disabled. Editing software may rewrite Software or DateTime fields without changing pictorial content, or content may be changed while tags remain. Metadata is evidence to weigh — not a complete history.',
  },
  {
    title: 'Why Missing Metadata Does Not Prove Manipulation',
    body: 'Absence of EXIF, camera tags, timestamps or GPS is common for benign reasons: messaging apps, social networks, screenshot workflows, privacy scrubbing and some camera configurations. TraceLens therefore flags incompleteness as requiring further examination and never labels an image genuine, fake, manipulated or tampered solely because fields are missing.',
  },
  {
    title: 'Technical Examination vs Conclusive Forensic Opinion',
    body: 'A technical examination documents measurable properties of a digital file. A conclusive forensic opinion about authenticity, authorship or manipulation typically requires broader case context, corroborating evidence, validated methods and a qualified examiner. TraceLens reports are educational technical summaries with explicit limitations — not court-ready authenticity determinations.',
  },
];

export function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="panel p-6">
        <p className="label text-teal-400">TraceLens</p>
        <h2 className="mt-2 text-2xl font-bold text-white">About & Methodology</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          TraceLens is a client-side educational system for digital image forensic examination and
          metadata analysis. Photographs are processed locally; no API keys, user accounts or paid
          cloud vision services are required.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <article key={section.title} className="panel p-5">
            <h3 className="text-base font-semibold text-white">{section.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{section.body}</p>
          </article>
        ))}
      </div>

      <div className="panel border-teal-500/20 p-5">
        <h3 className="text-sm font-semibold text-teal-300">Sample workflow</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
          <li>Open Image Examination and upload a camera-original JPEG or iPhone HEIC (max 10 MB).</li>
          <li>Click Analyse Image to extract EXIF, compute SHA-256 and generate observations.</li>
          <li>Review Metadata, Integrity and Observations pages.</li>
          <li>Optionally compare two images and download a PDF examination report.</li>
        </ol>
        <p className="mt-4 text-xs text-slate-500">
          Sample instructions describe how to use the tool. They never substitute fabricated
          examination results for real analysis of your uploaded files.
        </p>
      </div>
    </div>
  );
}
