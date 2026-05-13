// scripts/generate_reefer_20_03_26_v2.js
const fs = require('fs');
const path = require('path');

// Path to the raw CSV content (downloaded from Google Sheet)
const srcPath = '/Users/idong-geon/.gemini/antigravity/brain/c3b4935f-0888-496c-bd8b-f0a6c534229a/.system_generated/steps/1181/content.md';
if (!fs.existsSync(srcPath)) {
  console.error('Source file not found:', srcPath);
  process.exit(1);
}
const raw = fs.readFileSync(srcPath, 'utf8');
const lines = raw.split(/\r?\n/);

const weekHeader = 'REEFER MOVEMENT FOR 20/03/26 - 26/03/26';
let weekIdx = lines.findIndex(l => l.includes(weekHeader));
if (weekIdx === -1) {
  console.error('Week header not found');
  process.exit(1);
}

// Find the start of Bangkok port section after the week header
let bangkokIdx = -1;
for (let i = weekIdx; i < lines.length; i++) {
  if (lines[i].includes('BANGKOK PORT')) {
    bangkokIdx = i;
    break;
  }
}
if (bangkokIdx === -1) {
  console.error('Bangkok port section not found');
  process.exit(1);
}

// The column header line is the first line after bangkokIdx that starts with 'CARRIER'
let headerIdx = -1;
for (let i = bangkokIdx; i < lines.length; i++) {
  if (lines[i].trim().startsWith('CARRIER')) {
    headerIdx = i;
    break;
  }
}
if (headerIdx === -1) {
  console.error('Column header not found');
  process.exit(1);
}

const headerLine = lines[headerIdx];
const headers = headerLine.split(',').map(h => h.trim());

// Collect data rows until a blank line or a line that starts a new section (e.g., another week header or 'SONGKHLA PORT')
const data = [];
for (let i = headerIdx + 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) break; // stop at empty line
  if (line.startsWith('REEFER MOVEMENT FOR') && i !== headerIdx) break; // next week
  if (line.startsWith('SONGKHLA PORT')) break; // another port
  // Split CSV respecting quoted commas
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let char of lines[i]) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  // Pad missing columns
  while (parts.length < headers.length) parts.push('');
  const rowObj = {};
  headers.forEach((h, idx) => rowObj[h] = parts[idx]);
  const carrier = rowObj['CARRIER'];
  const date = rowObj['DATE'];
  if (!carrier || !date) continue; // skip malformed rows
  // Build deliveries object excluding meta columns
  const exclude = ['CARRIER', 'DATE', 'FROM', 'SHIPPER'];
  const deliveries = {};
  for (const key of headers) {
    if (!exclude.includes(key) && rowObj[key]) {
      deliveries[key] = rowObj[key];
    }
  }
  data.push({ carrier, date, deliveries });
}

// Write JSON output
const outDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'reefer_20_03_26.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Wrote', data.length, 'records to', outPath);
