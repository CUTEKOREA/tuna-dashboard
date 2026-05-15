import re
import os
import json

with open('components/ColdStorageDashboard.tsx', 'r') as f:
    content = f.read()

matches = re.finditer(r"id:\s*'([^']+)'[\s\S]*?data:\s*(\[[\s\S]*?\]),\s*sit:", content)

os.makedirs('data/cold_storage', exist_ok=True)
os.makedirs('app/api/cold-storage/widget', exist_ok=True)

file_map = {}
for m in matches:
    wid = m.group(1)
    data_str = m.group(2)
    data_str = re.sub(r'([{,]\s*)([A-Za-z0-9_가-힣\°\-]+)\s*:', r'\1"\2":', data_str)
    data_str = re.sub(r"'([^']*)'", r'"\1"', data_str)
    data_str = re.sub(r',\s*]', ']', data_str) # strip trailing commas
    data_str = re.sub(r',\s*}', '}', data_str)
    
    try:
        data_json = json.loads(data_str)
        filename = f'cold_storage_{wid}.json'
        with open(f'data/cold_storage/{filename}', 'w') as outf:
            json.dump(data_json, outf, ensure_ascii=False)
        file_map[wid] = f'cold_storage/{filename}'
    except Exception as e:
        print(f"Failed to parse {wid}: {e}\n{data_str}\n")

api_route = """import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const fileMap: Record<string, string> = {
"""
for k, v in file_map.items():
    api_route += f"  '{k}': '{v}',\n"
api_route += """};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !fileMap[id]) {
      return NextResponse.json({ error: 'Invalid or missing id parameter' }, { status: 400 });
    }

    const filename = fileMap[id];
    const filePath = path.join(process.cwd(), 'data', filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `File not found: ${filename}` }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API /api/cold-storage/widget error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
"""

with open('app/api/cold-storage/widget/route.ts', 'w') as outf:
    outf.write(api_route)

print("Created JSONs and API route!")
