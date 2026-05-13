// scripts/generate_reefer_20_03_26.js
const fs = require('fs');
const path = require('path');

// Source file containing the exported CSV content (downloaded from Google Sheet)
const srcPath = path.resolve(__dirname, '../.system_generated/steps/1181/content.md');
// Adjust path based on actual location
const absoluteSrc = '/Users/idong-geon/.gemini/antigravity/brain/c3b4935f-0888-496c-bd8b-f0a6c534229a/.system_generated/steps/1181/content.md';
if (!fs.existsSync(absoluteSrc)) {
  console.error('Source file not found:', absoluteSrc);
  process.exit(1);
}
const raw = fs.readFileSync(absoluteSrc, 'utf8');
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

const weekHeader = 'REEFER MOVEMENT FOR 20/03/26 - 26/03/26';
let startIdx = lines.findIndex(l => l.includes(weekHeader));
if (startIdx === -1) {
  console.error('Week header not found');
  process.exit(1);
}
// Find column header line after the week header (starts with CARRIER)
let colIdx = -1;
for (let i = startIdx; i < lines.length; i++) {
  if (lines[i].startsWith('CARRIER')) { colIdx = i; break; }
}
if (colIdx === -1) { console.error('Column header not found'); process.exit(1); }
const headers = lines[colIdx].split(',').map(h => h.trim());

const data = [];
for (let i = colIdx + 1; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith('REEFER MOVEMENT FOR') && i !== startIdx) break; // next week
  if (line.startsWith('SONGKHLA PORT')) break; // stop at other port
  const parts = line.split(',').map(p => p.trim());
  // pad missing columns
  while (parts.length < headers.length) parts.push('');
  const row = {};
  headers.forEach((h, idx) => { row[h] = parts[idx]; });
  const carrier = row['CARRIER'];
  const date = row['DATE'];
  if (!carrier || !date) continue; // skip malformed
  const deliveries = {};
  // exclude meta columns
  const exclude = ['CARRIER', 'DATE', 'FROM', 'SHIPPER'];
  for (const key of headers) {
    if (!exclude.includes(key) && row[key]) {
      deliveries[key] = row[key];
    }
  }
  data.push({ carrier, date, deliveries });
}

const outDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'reefer_20_03_26.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Wrote', data.length, 'records to', outPath);
