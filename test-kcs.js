const key = '6438ce04ca4a3ec4bcc72f295ab386baa74e52cacce9f725803e18cd8c6d1030';
const url = `https://unipass.customs.go.kr:38010/ext/rest/trtImpExpStas/retrieveTrtImpExpStas?crkyCn=${key}&strtYymm=202401&endYymm=202401&hsSgn=030343&lclsNm=&dtyTp=&natCd=&netSlTp=00&imexTp=1&pageIndex=1&pageSize=10&imexCd=I`;
async function run() {
  const res = await fetch(url);
  const text = await res.text();
  console.log(text);
}
run();
