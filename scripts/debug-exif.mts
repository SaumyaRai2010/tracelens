import exifr from 'exifr';
import { readFileSync } from 'fs';

async function main() {
  const buf = readFileSync('test-fixtures/sample-with-exif.jpg');
  console.log('size', buf.length);
  console.log('soi', buf[0].toString(16), buf[1].toString(16));
  const parsed = await exifr.parse(buf, { gps: true });
  console.log(parsed);
}

main();
