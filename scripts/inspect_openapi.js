const fs = require('fs');
const path = require('path');

const openapiPath = path.join(__dirname, '../scratch/openapi.json');
if (!fs.existsSync(openapiPath)) {
  console.error("openapi.json not found!");
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));

console.log("=== API INFO ===");
console.log("Title:", spec.info?.title);
console.log("Description:", spec.info?.description);

console.log("\n=== RPC FUNCTIONS ===");
const paths = Object.keys(spec.paths || {});
const rpcs = paths.filter(p => p.startsWith('/rpc/'));
if (rpcs.length === 0) {
  console.log("No RPC functions exposed.");
} else {
  rpcs.forEach(r => console.log(r));
}

console.log("\n=== TABLES EXPOSED ===");
const tables = paths.filter(p => !p.startsWith('/rpc/') && p !== '/');
tables.forEach(t => console.log(t));

console.log("\n=== UNLOADING REPORTS SCHEMA ===");
const reportDef = spec.definitions?.unloading_reports;
if (reportDef) {
  console.log("Properties of unloading_reports:");
  Object.keys(reportDef.properties || {}).forEach(k => {
    const prop = reportDef.properties[k];
    console.log(`- ${k}: ${prop.type} (${prop.format || ''}) - ${prop.description || ''}`);
  });
} else {
  console.log("No definition for unloading_reports");
}
