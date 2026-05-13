const yahooFinance = require('yahoo-finance2');
async function run() {
  const result = await yahooFinance.default.historical('CL=F', {
    period1: '2026-01-01',
    period2: '2026-05-01',
    interval: '1mo'
  });
  console.log(result);
}
run();
