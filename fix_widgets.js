const fs = require('fs');

const filePath = 'public/data/tuna_real_data_v3.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Colors for default series
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"];

data.widgets.forEach(w => {
  if (w.id.match(/^w(9[4-9]|10[0-3])_/)) {
    // 1. Move chartData to data
    if (w.chartData && !w.data) {
      w.data = w.chartData;
      delete w.chartData;
    }
    
    // 2. Change type to chartType
    if (w.type && !w.chartType) {
      w.chartType = w.type;
      delete w.type;
    }
    
    // 3. Mark format as new
    w.format = 'new';
    
    // 4. Set xKey to 'name' or 'subject' depending on data
    if (!w.xKey && !w.radarKey) {
      if (w.data && w.data.length > 0 && w.data[0].subject) {
        w.radarKey = 'subject';
      } else {
        w.xKey = 'name';
      }
    }
    
    // 5. Build series arrays (bars, lines, areas, radars) based on data keys
    if (w.data && w.data.length > 0) {
      const sample = w.data[0];
      const dataKeys = Object.keys(sample).filter(k => k !== 'name' && k !== 'subject' && k !== 'displayLabel');
      
      let cType = w.chartType;
      // Convert composed without arrays to bar
      if (cType === 'composed' && !w.bars && !w.lines && !w.areas) {
        cType = 'bar';
        w.chartType = 'bar';
      }
      
      if (cType === 'bar' && !w.bars) {
        w.bars = dataKeys.map((k, i) => ({
          key: k,
          name: k === 'value' ? '값' : k,
          color: COLORS[i % COLORS.length]
        }));
      } else if (cType === 'area' && !w.areas) {
        w.areas = dataKeys.map((k, i) => ({
          key: k,
          name: k === 'value' ? '값' : k,
          color: COLORS[i % COLORS.length]
        }));
      } else if (cType === 'line' && !w.lines) {
        w.lines = dataKeys.map((k, i) => ({
          key: k,
          name: k === 'value' ? '값' : k,
          color: COLORS[i % COLORS.length]
        }));
      } else if (cType === 'radar' && !w.radars) {
        w.radars = dataKeys.map((k, i) => ({
          key: k,
          name: k === 'A' ? '대상' : (k === 'B' ? '비교군' : k),
          color: COLORS[i % COLORS.length]
        }));
      }
    }
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log("Widgets fixed!");
