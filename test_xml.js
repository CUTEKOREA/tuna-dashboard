async function run() {
  const proxyUrl = "https://korea-api-proxy-702914606714.asia-northeast3.run.app/proxy?secret=silla-tuna-secret-2026&url=";
  const kcsUrl = "https://unipass.customs.go.kr/ext/rest/trtImpExpStas/retrieveTrtImpExpStas?crkyCn=6438ce04ca4a3ec4bcc72f295ab386baa74e52cacce9f725803e18cd8c6d1030&strtYymm=202601&endYymm=202605&hsSgn=030343&imexTp=1&imexCd=I";
  
  const finalUrl = proxyUrl + encodeURIComponent(kcsUrl);
  try {
    const res = await fetch(finalUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }});
    console.log("Status:", res.status);
    const xml = await res.text();
    console.log("XML Response:\n", xml.substring(0, 1000));
  } catch(e) {
    console.log("Error", e);
  }
}
run();
