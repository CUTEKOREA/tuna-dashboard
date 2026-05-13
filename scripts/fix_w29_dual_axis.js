const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/data/mackerel_real_data_v11.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.widgets = data.widgets.map(w => {
  if (w.id === 'w29') {
    w.dualAxis = true;
    w.bars = [
      { key: 'tuna_aqua_vol_t', color: '#3b82f6', yAxisId: 'left' }
    ];
    w.lines = [
      { key: 'mackerel_price_usd', color: '#ef4444', yAxisId: 'right' }
    ];
  }
  return w;
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Fixed w29 dual axis');
