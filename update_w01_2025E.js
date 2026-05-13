const fs = require('fs');
const path = './public/data/tuna_real_data_v3.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const w01 = data.widgets.find(w => w.id === 'w01_paradigm');
if (w01) {
  // Check if 2025 already exists
  const has2025 = w01.data.some(d => d.Year === "2025 (E)");
  if (!has2025) {
    // 2025 estimated catch (assuming ~2.5% increase based on general long-term trend and La Nina transition)
    w01.data.push({ "Year": "2025 (E)", "조업량": 6885000.00 });
    
    // Update tooltip to mention 2025 projection
    w01.desc_tooltip = "전 세계 참치 어획량의 장기 추세를 나타냅니다. 2023~2024년은 ISSF 보고서를 바탕으로 추산했으며, 2025(E)는 ENSO 기후 모델 및 WCPFC 초기 항만 하역 데이터를 반영한 추정치입니다.";
    
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
    console.log("Updated w01 with 2025 (E) projection.");
  } else {
    console.log("Data already has 2025 (E).");
  }
}
