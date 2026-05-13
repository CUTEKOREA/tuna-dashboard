import csv, os, re

# Path to the raw CSV content (downloaded from Google Sheet)
csv_path = os.path.expanduser('/Users/idong-geon/.gemini/antigravity/brain/c3b4935f-0888-496c-bd8b-f0a6c534229a/.system_generated/steps/1181/content.md')

# Read raw lines
with open(csv_path, 'r', encoding='utf-8') as f:
    raw = f.read()

lines = [ln for ln in raw.splitlines() if ln.strip()]

# Find the start of the desired week
week_header = 'REEFER MOVEMENT FOR 20/03/26 - 26/03/26'
start_idx = None
for i, line in enumerate(lines):
    if week_header in line:
        start_idx = i
        break
if start_idx is None:
    raise ValueError('Week header not found')

# After the header, find the line that contains column names (starts with CARRIER)
col_idx = None
for j in range(start_idx, len(lines)):
    if lines[j].startswith('CARRIER'):
        col_idx = j
        break
if col_idx is None:
    raise ValueError('Column header not found')

headers = [h.strip() for h in lines[col_idx].split(',')]

# Collect data rows until a blank line or a line that starts a new week
data = []
for k in range(col_idx+1, len(lines)):
    line = lines[k]
    if not line.strip():
        break
    if line.startswith('REEFER MOVEMENT FOR'):
        break
    parts = [p.strip() for p in line.split(',')]
    # pad if needed
    if len(parts) < len(headers):
        parts += [''] * (len(headers) - len(parts))
    row = dict(zip(headers, parts))
    data.append(row)

# Write to CSV file
out_path = os.path.abspath('data/reefer_week_20_03_26.csv')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', newline='', encoding='utf-8') as out_f:
    writer = csv.DictWriter(out_f, fieldnames=headers)
    writer.writeheader()
    writer.writerows(data)
print(f'Wrote {len(data)} rows to {out_path}')
