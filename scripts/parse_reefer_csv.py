import csv, json, os, re

# Path to the downloaded CSV content
csv_path = os.path.expanduser('/Users/idong-geon/.gemini/antigravity/brain/c3b4935f-0888-496c-bd8b-f0a6c534229a/.system_generated/steps/1181/content.md')

# Read raw CSV (the file contains lines with commas)
with open(csv_path, 'r', encoding='utf-8') as f:
    raw = f.read()

# Split into lines and filter out empty lines
lines = [ln for ln in raw.splitlines() if ln.strip()]

entries = []
current_week = None
in_bangkok = False
headers = []

for i, line in enumerate(lines):
    # Detect week header
    m = re.search(r'REEFER MOVEMENT FOR (\d{2}/\d{2}/\d{2}) - (\d{2}/\d{2}/\d{2})', line)
    if m:
        start, end = m.groups()
        current_week = f"{start}-{end}"
        in_bangkok = False
        continue
    # Detect Bangkok section start
    if 'BANGKOK PORT' in line:
        in_bangkok = True
        continue
    # Detect end of section (empty line or next section marker)
    if in_bangkok and (line.strip() == '' or line.startswith('REEFER MOVEMENT FOR') or line.startswith('SONGKHLA PORT')):
        in_bangkok = False
        continue
    if in_bangkok:
        # Header line (contains column names)
        if line.startswith('CARRIER'):
            headers = [h.strip() for h in line.split(',')]
            continue
        # Data rows
        parts = [p.strip() for p in line.split(',')]
        if len(parts) < len(headers):
            # pad missing columns
            parts += [''] * (len(headers) - len(parts))
        row = dict(zip(headers, parts))
        carrier = row.get('CARRIER')
        date = row.get('DATE')
        if carrier and date:
            # Build deliveries dict excluding known meta columns
            deliveries = {k: v for k, v in row.items() if k not in ('CARRIER', 'DATE', 'FROM', 'SHIPPER') and v}
            entries.append({
                'carrier': carrier,
                'date': date,
                'week_range': current_week,
                'deliveries': deliveries
            })

# Write JSON output
out_path = os.path.abspath('data/reefer_movement_bangkok.json')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as out_f:
    json.dump(entries, out_f, ensure_ascii=False, indent=2)
print(f'Wrote {len(entries)} records to {out_path}')
