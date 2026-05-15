 // Or built-in node fetch

async function run() {
  const key = process.env.KCS_API_KEY;
  if (!key) {
    console.log("No key");
    return;
  }
  try {
    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startYymm = `${past.getFullYear()}${String(past.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList` +
      `?serviceKey=${key}&strtYymm=${startYymm}&endYymm=${yyyyMM}&hsSgn=030343`;
    
    console.log(url);
    const res = await fetch(url);
    console.log("Status:", res.status);
    const xml = await res.text();
    console.log("XML length:", xml.length);
    console.log(xml.substring(0, 500));
    
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    console.log("Items found:", items.length);
    
    if (items.length > 0) {
      const monthlyTotals: Record<string, { amt: number, wgt: number }> = {};
      
      for (const match of items) {
        const itemStr = match[1];
        const yearMatch = itemStr.match(/<year>([\s\S]*?)<\/year>/);
        if (!yearMatch || yearMatch[1] === '총계') continue;
        
        const year = yearMatch[1];
        const impDlrMatch = itemStr.match(/<impDlr>([\d.]+)<\/impDlr>/);
        const impWghtMatch = itemStr.match(/<impWght>([\d.]+)<\/impWght>/);
        
        if (!monthlyTotals[year]) monthlyTotals[year] = { amt: 0, wgt: 0 };
        if (impDlrMatch) monthlyTotals[year].amt += parseFloat(impDlrMatch[1]);
        if (impWghtMatch) monthlyTotals[year].wgt += parseFloat(impWghtMatch[1]);
      }
      
      const sortedMonths = Object.keys(monthlyTotals).sort();
      console.log("Months:", sortedMonths);
      if (sortedMonths.length > 0) {
        const latestMonth = sortedMonths[sortedMonths.length - 1];
        const { amt, wgt } = monthlyTotals[latestMonth];
        console.log("Latest month:", latestMonth, "amt:", amt, "wgt:", wgt);
        
        if (wgt > 0) {
          let pricePerTon = Math.round((amt * 1000) / (wgt / 1000));
          console.log("Initial PPT:", pricePerTon);
          
          if (pricePerTon > 10000) pricePerTon = Math.round(pricePerTon / 1000);
          if (pricePerTon < 100) pricePerTon = Math.round(pricePerTon * 1000);
          
          console.log("Final PPT:", pricePerTon);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
