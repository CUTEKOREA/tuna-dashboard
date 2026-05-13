const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/data/mackerel_real_data_v11.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.widgets = data.widgets.map(w => {
  if (w.id === 'w28') {
    w.sit = "고등어는 단일 상품이 아닙니다. 몰타는 고급 참치 양식 사료용으로 0.78€에 수입하며, 폴란드는 원물을 수입해 가공(필렛/훈제) 후 수출합니다.";
    w.tak = w.takeaway?.desc || "가공 인프라와 시장 포지셔닝에 따라 가격이 최대 7배(0.78€ ➔ 5.74€) 벌어집니다.";
    delete w.takeaway;
  }
  
  if (w.id === 'w29') {
    w.chartType = 'Composed';
    w.xKey = 'year';
    w.unit = '';
    w.bars = [
      { key: 'tuna_aqua_vol_t', color: '#3b82f6' }
    ];
    w.lines = [
      { key: 'mackerel_price_usd', color: '#ef4444' }
    ];
    w.sit = w.insight?.situation || "참다랑어 양식의 성장과 사료 수요";
    w.tak = w.insight?.takeaway || "참다랑어 양식 시장의 팽창이 사료용 고등어에 대한 구조적 증가를 견인합니다.";
    delete w.type;
    delete w.insight;
    delete w.config;
  }
  return w;
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Fixed w28 and w29');
