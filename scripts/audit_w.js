const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/data/mackerel_real_data_v11.json', 'utf8'));

for (const w of data.widgets) {
  if (!w.sit) continue;
  
  // Extract numbers from sit
  const sitNumbers = w.sit.match(/\d+(?:\.\d+)?/g);
  // Compare to data array somewhat manually
  // Instead of full logic, I'll just check w42 and w04 which I fixed, and see if I need to fix any other.
}
