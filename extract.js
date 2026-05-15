const fs = require('fs');
const content = fs.readFileSync('components/ColdStorageDashboard.tsx', 'utf-8');
const match = content.match(/const mockData = (\{[\s\S]*?\});\n    setData/);
if (match) {
  fs.mkdirSync('app/api/cold-storage/widget', { recursive: true });
  const data = match[1];
  const routeContent = `import { NextResponse } from 'next/server';

export async function GET() {
  const data = ${data};
  return NextResponse.json(data);
}
`;
  fs.writeFileSync('app/api/cold-storage/widget/route.ts', routeContent);
  const newContent = content.replace(/const mockData = \{[\s\S]*?\};\n    setData\(mockData\);/, `fetch('/api/cold-storage/widget')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));`);
  fs.writeFileSync('components/ColdStorageDashboard.tsx', newContent);
  console.log("Extraction successful!");
} else {
  console.error("Match failed.");
}
