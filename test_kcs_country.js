const KCS_API_KEY = process.env.KCS_API_KEY || 'fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c';

async function fetchKCS() {
  const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList` +
    `?serviceKey=${KCS_API_KEY}&strtYymm=202308&endYymm=202401&hsSgn=030354`;

  const res = await fetch(url);
  const xml = await res.text();
  console.log(xml.substring(0, 1500));
}
fetchKCS();
