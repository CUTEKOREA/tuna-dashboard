async function fetchWTI() {
  const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1mo&range=6mo');
  const json = await res.json();
  const timestamps = json.chart.result[0].timestamp;
  const closes = json.chart.result[0].indicators.quote[0].close;
  
  const wtiData = [];
  timestamps.forEach((t, i) => {
    const d = new Date(t*1000);
    wtiData.push({ month: d.getMonth() + 1, price: closes[i] });
  });
  console.log(wtiData);
}
fetchWTI();
