# TraceLens

**Digital Image Forensic Examination and Metadata Analysis System**

TraceLens is an educational, client-side web application for examining digital photographs. Upload a JPEG or HEIC in your browser to extract EXIF metadata, calculate SHA-256 file integrity hashes, generate rule-based forensic observations, compare two images, and download a PDF examination report.

Private photographs are processed locally. No API keys, user accounts, or external image uploads are required.

## Project naming

| Item | Value |
| --- | --- |
| Product name | TraceLens |
| Subtitle | Digital Image Forensic Examination System |
| npm package | `tracelens-forensics` |
| Folder / repo | `tracelens-forensics` |

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- [exifr](https://github.com/MikeKovarik/exifr) — EXIF extraction
- Web Crypto API — SHA-256
- jsPDF — PDF report generation
- lucide-react — icons

## Requirements

- Node.js **20+** (recommended; see `.nvmrc`)

```bash
nvm use
```

## Setup

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Other scripts

```bash
npm run build    # production build
npm run preview  # preview production build
npm run lint     # oxlint
```

## Features

1. **Dashboard** — overview and quick access
2. **Image Examination** — drag-and-drop JPG/JPEG upload (max 10 MB), preview, Analyse Image
3. **Metadata Analysis** — real EXIF fields via exifr (unavailable → Not Available)
4. **File Integrity** — SHA-256 of original bytes + Copy Hash
5. **Forensic Observations** — rule-based findings (never authenticity verdicts from missing tags alone)
6. **Image Comparison** — two-image metadata + hash comparison table
7. **Forensic Report** — downloadable PDF with examination ID, metadata, hash, observations, disclaimer
8. **About & Methodology** — EXIF, hashing, limitations, technical vs conclusive opinion

## Educational disclaimer

TraceLens is for learning and structured technical examination. Missing or incomplete metadata does **not** prove that an image is fake, manipulated, or tampered. A hash verifies byte identity against a reference; it does not alone prove photographic authenticity.
