const fs = require('fs');
const file = 'public/data/salmon_real_data_v4.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

data.widgets.forEach(w => {
  if (w.id === 'k5_nutrition' || w.id === 'k7_chum_coastal') {
    delete w.unit;
    delete w.yUnit;
  }
  if (w.id === 'k8_chinook') {
    w.unit = '%';
    w.yUnit = '%';
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Fixed mixed units');
