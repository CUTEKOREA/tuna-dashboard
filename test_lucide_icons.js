const lucide = require('lucide-react');
const icons = ['Fish', 'FishSymbol', 'Droplets', 'Snowflake', 'Shrimp', 'Shell', 'Waves', 'Nut', 'Sprout', 'Leaf', 'LeafyGreen', 'Carrot', 'Coffee', 'Cherry', 'Drumstick'];

const existing = [];
const missing = [];

icons.forEach(i => {
  if (lucide[i]) existing.push(i);
  else missing.push(i);
});

console.log("Existing:", existing.join(', '));
if(missing.length > 0) console.log("Missing:", missing.join(', '));
