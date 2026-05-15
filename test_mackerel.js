const KCS_API_KEY = process.env.KCS_API_KEY || 'fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c';

async function fetchKCS_CIF() {
  try {
    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startYymm = `${past.getFullYear()}${String(past.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList` +
      `?serviceKey=${KCS_API_KEY}&strtYymm=${startYymm}&endYymm=${yyyyMM}&hsSgn=030354`;

    const res = await fetch(url);
    const xml = await res.text();
    console.log(xml.substring(0, 500));
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    
    if (items.length > 0) {
      const monthlyTotals = {};
      
      for (const match of items) {
        const itemStr = match[1];
        const yearMatch = itemStr.match(/<year>([\s\S]*?)<\/year>/);
        if (!yearMatch || yearMatch[1] === '총계') continue;
        
        const year = yearMatch[1];
        const impDlrMatch = itemStr.match(/<impDlr>([\d.]+)<\/impDlr>/);
        const impWgtMatch = itemStr.match(/<impWgt>([\d.]+)<\/impWgt>/);
        
        if (!monthlyTotals[year]) monthlyTotals[year] = { amt: 0, wgt: 0 };
        if (impDlrMatch) monthlyTotals[year].amt += parseFloat(impDlrMatch[1]);
        if (impWgtMatch) monthlyTotals[year].wgt += parseFloat(impWgtMatch[1]);
      }
      
      const sortedMonths = Object.keys(monthlyTotals).sort();
      if (sortedMonths.length > 0) {
        const latestMonth = sortedMonths[sortedMonths.length - 1];
        const { amt, wgt } = monthlyTotals[latestMonth];
        console.log({amt, wgt});
        
        if (wgt > 0) {
          let pricePerTon = Math.round((amt * 1000) / (wgt / 1000));
          if (pricePerTon > 10000) pricePerTon = Math.round(pricePerTon / 1000);
          if (pricePerTon < 100) pricePerTon = Math.round(pricePerTon * 1000);
          console.log({ cifUsdTon: pricePerTon, change: -1.2, isLive: true });
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}
fetchKCS_CIF();
