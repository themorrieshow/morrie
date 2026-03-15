import { encryptFile } from 'pagecrypt';

const password = process.env.WORK_PASSWORD;

if (!password) {
  console.error('Error: WORK_PASSWORD environment variable is not set.');
  process.exit(1);
}

const files = [
  'work.html',
  'work/northbeam-revamp.html',
  'work/gamma.html',
  'work/footprint.html',
  'work/avail.html',
  'work/binge.html',
  'work/connected-nursery.html',
  'work/custodial-banking.html',
  'work/oshi-health.html',
];

for (const file of files) {
  await encryptFile(file, file, password);
  console.log(`Encrypted: ${file}`);
}

console.log('Done.');
