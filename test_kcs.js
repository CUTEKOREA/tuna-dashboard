const apiKey = '6438ce04ca4a3ec4bcc72f295ab386baa74e52cacce9f725803e18cd8c6d1030';
const hsCode = '070320'; // 마늘
const year = '2024';

async function test() {
  const params = new URLSearchParams({
    serviceKey: apiKey,
    strtYymm: `${year}01`,
    endYymm: `${year}12`,
    hsSgn: hsCode,
    statCd: 'CN' // Try statCd for China
  });
  
  // To avoid percent-encoding the API key which is already decoded
  const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList?${params.toString().replace(/%25/g, '%')}`;
  
  console.log('Fetching:', url);
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(text.substring(0, 1000));
  } catch(e) {
    console.error(e);
  }
}
test();
