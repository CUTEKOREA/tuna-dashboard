import urllib.request
import urllib.parse

kcs_key = "6438ce04ca4a3ec4bcc72f295ab386baa74e52cacce9f725803e18cd8c6d1030"
unipass_url = f"https://unipass.customs.go.kr/ext/rest/trtImpExpStas/retrieveTrtImpExpStas?crkyCn={kcs_key}&strtYymm=202601&endYymm=202605&hsSgn=030343&lclsNm=&dtyTp=&natCd=&netSlTp=00&imexTp=1&pageIndex=1&pageSize=10&imexCd=I"
proxy_url = f"https://korea-api-proxy-702914606714.asia-northeast3.run.app/proxy?secret=silla-tuna-secret-2026&url={urllib.parse.quote(unipass_url)}"

try:
    req = urllib.request.Request(proxy_url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
