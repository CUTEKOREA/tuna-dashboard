const fs = require('fs');
const file = 'public/data/salmon_real_data_v4.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

data.widgets.forEach(w => {
  if (w.id.startsWith('k')) {
    // Remove [KFAS] prefix
    w.title = w.title.replace(/\[KFAS\]\s*/g, '').trim();

    // Determine unit
    if (w.id === 'k1_ras_photoperiod') { w.unit = 'g'; w.yUnit = 'g'; }
    else if (w.id === 'k2_smolt_offseason') { w.unit = 'g'; w.yUnit = 'g'; }
    else if (w.id === 'k3_temp_cataract') { w.unit = '%'; w.yUnit = '%'; }
    else if (w.id === 'k4_listeria') { w.unit = '%'; w.yUnit = '%'; }
    else if (w.id === 'k5_nutrition') { w.unit = 'mg/100g'; w.yUnit = 'mg'; }
    else if (w.id === 'k6_jerky') { w.unit = '점수'; w.yUnit = '점'; }
    else if (w.id === 'k7_chum_coastal') { w.unit = '마리/km²'; w.yUnit = '마리'; }
    else if (w.id === 'k8_chinook') { w.unit = 'cm'; w.yUnit = 'cm'; }
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Fixed kfas widgets in salmon_real_data_v4.json');
