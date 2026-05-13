const fs = require('fs');
const path = require('path');

const brainDir = '/Users/idong-geon/.gemini/antigravity/brain/dabf77bc-2c84-4b34-821d-348ad055c482';
const outputFiles = [
  path.join(brainDir, '.system_generated/steps/313/output.txt'),
  path.join(brainDir, '.system_generated/steps/314/output.txt'),
  path.join(brainDir, '.system_generated/steps/315/output.txt'),
  path.join(brainDir, '.system_generated/steps/323/output.txt'),
  path.join(brainDir, '.system_generated/steps/324/output.txt'),
  path.join(brainDir, '.system_generated/steps/325/output.txt'),
  path.join(brainDir, '.system_generated/steps/326/output.txt')
];

let allUpdates = {};

for (const file of outputFiles) {
  if (fs.existsSync(file)) {
    const text = fs.readFileSync(file, 'utf8');
    try {
      const parsedOuter = JSON.parse(text);
      if (parsedOuter.status === 'success' && parsedOuter.answer) {
        let answerStr = parsedOuter.answer;
        answerStr = answerStr.replace(/```json/gi, '').replace(/```/g, '').trim();
        const updates = JSON.parse(answerStr);
        Object.assign(allUpdates, updates);
      }
    } catch (e) {
      console.error(`Failed to parse ${file}: ${e.message}`);
    }
  } else {
    console.warn(`File not found: ${file}`);
  }
}

console.log(`Found updates for ${Object.keys(allUpdates).length} widgets`);

const jsonPath = 'public/data/tuna_real_data_v3.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let updatedCount = 0;
data.widgets.forEach(widget => {
  const update = allUpdates[widget.id];
  if (update) {
    if (update.situation) widget.situation = update.situation;
    if (update.takeaway) widget.takeaway = update.takeaway;
    updatedCount++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log(`Successfully updated ${updatedCount} widgets in ${jsonPath}`);
