import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validateImageFile } from '../src/utils/validation.ts';
import { extractMetadata } from '../src/utils/exif.ts';
import { calculateSha256 } from '../src/utils/hash.ts';
import { generateObservations } from '../src/utils/observations.ts';
import { buildComparison } from '../src/utils/compare.ts';
import { generateExaminationId, formatBytes } from '../src/utils/format.ts';
import type { ImageExamination } from '../src/types/examination.ts';

const fixtures = resolve('test-fixtures');
const results: Array<{ name: string; pass: boolean; detail: string }> = [];

function ok(name: string, pass: boolean, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} | ${name}${detail ? ` — ${detail}` : ''}`);
}

function fileFrom(path: string, name: string, type = 'image/jpeg') {
  const buf = readFileSync(path);
  return new File([buf], name, { type });
}

function examShell(
  file: File,
  meta: Awaited<ReturnType<typeof extractMetadata>>,
  hash: string,
): ImageExamination {
  return {
    id: generateExaminationId(),
    file,
    previewUrl: '',
    properties: {
      name: file.name,
      size: file.size,
      type: file.type,
      width: 320,
      height: 240,
      lastModified: 0,
    },
    metadata: meta,
    hash,
    observations: [],
    analyzedAt: new Date().toISOString(),
    status: 'ready',
    error: null,
  };
}

async function main() {
  ok(
    'reject txt',
    validateImageFile(
      fileFrom(`${fixtures}/not-an-image.txt`, 'not-an-image.txt', 'text/plain'),
    ) !== null,
  );
  ok(
    'reject oversized',
    validateImageFile(fileFrom(`${fixtures}/too-large.jpg`, 'too-large.jpg')) !== null,
    validateImageFile(fileFrom(`${fixtures}/too-large.jpg`, 'too-large.jpg')) || '',
  );
  ok(
    'accept jpeg',
    validateImageFile(
      fileFrom(`${fixtures}/sample-with-exif.jpg`, 'sample-with-exif.jpg'),
    ) === null,
  );
  ok(
    'accept heic by extension',
    validateImageFile(
      new File([new Uint8Array([0, 0, 0, 0])], 'iphone.heic', { type: 'image/heic' }),
    ) === null ||
      validateImageFile(
        new File([new Uint8Array([1])], 'iphone.heic', { type: 'image/heic' }),
      ) === null,
  );
  // empty-size heic should still fail size check; use 1-byte payload
  ok(
    'accept heic non-empty',
    validateImageFile(
      new File([new Uint8Array([1, 2, 3])], 'iphone.heic', { type: '' }),
    ) === null,
  );

  const f1 = fileFrom(`${fixtures}/sample-with-exif.jpg`, 'sample-with-exif.jpg');
  const f2 = fileFrom(`${fixtures}/sample-with-exif-alt.jpg`, 'sample-with-exif-alt.jpg');
  const f3 = fileFrom(`${fixtures}/sample-no-exif.jpg`, 'sample-no-exif.jpg');

  // readImageDimensions uses browser Image API — covered in UI QA

  const meta1 = await extractMetadata(f1);
  ok('exif present', meta1.hasExif === true);
  ok('make extracted', String(meta1.make).includes('TraceLensCam'), String(meta1.make));
  ok('model extracted', String(meta1.model).includes('TL-100'), String(meta1.model));
  ok('software extracted', Boolean(meta1.software), String(meta1.software));
  ok('datetime original', Boolean(meta1.dateTimeOriginal), String(meta1.dateTimeOriginal));
  ok(
    'gps present',
    Boolean(meta1.gpsLatitude && meta1.gpsLongitude),
    `${meta1.gpsLatitude},${meta1.gpsLongitude}`,
  );

  const meta3 = await extractMetadata(f3);
  ok('no-exif handled', meta3.hasExif === false);
  ok('missing fields nullish', meta3.make == null && meta3.model == null);

  const hash1 = await calculateSha256(f1);
  const hash1b = await calculateSha256(f1);
  const hash2 = await calculateSha256(f2);
  ok('sha256 length 64', hash1.length === 64, hash1);
  ok('sha256 stable', hash1 === hash1b);
  ok('different files different hash', hash1 !== hash2);

  const obs1 = generateObservations(meta1);
  const obs3 = generateObservations(meta3);
  ok('observations for exif image', obs1.some((o) => o.id === 'exif-present'));
  ok('observations for no-exif', obs3.some((o) => o.id === 'exif-absent'));
  ok(
    'no authenticity verdict in observation titles',
    ![...obs1, ...obs3].some((o) =>
      /\b(genuine|fake|tampered)\b/i.test(o.observation),
    ),
  );

  const meta2 = await extractMetadata(f2);
  const obs2 = generateObservations(meta2);
  ok('conflicting dates flagged on alt', obs2.some((o) => o.id === 'datetime-conflict'));

  const rows = buildComparison(examShell(f1, meta1, hash1), examShell(f2, meta2, hash2));
  ok('comparison rows', rows.length >= 10, String(rows.length));
  ok(
    'comparison shows differ on model',
    rows.find((r) => r.field === 'Camera Model')?.status === 'differ',
    JSON.stringify(rows.find((r) => r.field === 'Camera Model')),
  );
  ok('comparison sha differ', rows.find((r) => r.field === 'SHA-256')?.status === 'differ');
  ok('exam id format', /^TL-\d{14}-[A-Z0-9]+$/.test(generateExaminationId()));
  ok('formatBytes', formatBytes(1024).includes('KB'));

  const failed = results.filter((r) => !r.pass);
  console.log(`\nSUMMARY: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
