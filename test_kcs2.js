const key = '6438ce04ca4a3ec4bcc72f295ab386baa74e52cacce9f725803e18cd8c6d1030';
const url = `https://unipass.customs.go.kr:38010/ext/rest/trtImpExpStas/retrieveTrtImpExpStas?crkyCn=${key}&strtYymm=202401&endYymm=202401&hsSgn=030617&imexTp=1`;
async function run() {
  console.log("fetching:", url);
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log("response:", text);
  } catch (e) {
    console.log("error:", e);
  }
}
run();
