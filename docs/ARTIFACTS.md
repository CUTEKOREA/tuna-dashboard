# 참치 기업 해부 — 아티팩트 원장

2026-09-09 에 **21편 전부가 삭제된 것을 확인하고 같은 날 재발행했다.**
도구가 첫 URL 에 `artifact-deleted` 로 응답했고 `list` 는 계정 전체를 비었다고 답했다.
아래가 현행 URL 이다 — 이전 URL 은 전부 죽었다.

발행본 원본은 `docs/evidence/company-<key>-<yyyy-mm>/보고서.html` 이고 자족 HTML 이다.
ⅩⅨ·ⅩⅩ·ⅩⅩⅠ 셋만 `<html><body>` 를 가진 완전 문서라 추출이 필요하고, 나머지 18편은 이미 아티팩트 형태다.

| 편 | 회사 | 키 | URL |
|---|---|---|---|
| Ⅰ | Frinsa del Noroeste | `frinsa` | https://claude.ai/code/artifact/d34b480c-b01e-4cbb-8f6a-61ded41a9d7f |
| Ⅱ | Thai Union Group | `thaiunion` | https://claude.ai/code/artifact/9409968d-da54-4925-bc1b-eeff1e86acf4 |
| Ⅲ | Albacora, S.A. | `albacora` | https://claude.ai/code/artifact/164384b0-60d6-44ea-a4dc-37dbbcedb1e2 |
| Ⅳ | FCF Co., Ltd. | `fcf` | https://claude.ai/code/artifact/a2fc9379-fce5-49f2-a484-4f43e70a92c2 |
| Ⅴ | ITOCHU Corporation | `itochu` | https://claude.ai/code/artifact/0004def0-99d7-412c-bb38-571f30e60d2f |
| Ⅵ | Bolton Group | `bolton` | https://claude.ai/code/artifact/05ad0389-0945-4e2c-8e46-51ae00dee9e0 |
| Ⅶ | JAIS S.R.L. | `jais` | https://claude.ai/code/artifact/86536b25-07c1-49cb-a058-e28b9b8f2f30 |
| Ⅷ | Frabelle Group | `frabelle` | https://claude.ai/code/artifact/83c55ae4-6c02-4746-b03a-2f239a1a9e8a |
| Ⅸ | Jealsa | `jealsa` | https://claude.ai/code/artifact/8b0269fd-438b-4eb9-995b-e2c5ce5d844c |
| Ⅹ | Nauterra | `nauterra` | https://claude.ai/code/artifact/2ace3267-1fd7-45ae-b8f8-b6efb37a239c |
| ⅩⅠ | StarKist | `starkist` | https://claude.ai/code/artifact/73c8f901-fee0-4788-a4b3-799a0b57581d |
| ⅩⅡ | 동원산업㈜ | `dongwon` | https://claude.ai/code/artifact/008fc6e1-c8e1-476d-b398-c2eb4a39a83e |
| ⅩⅢ | 기업집단 「사조」 | `sajo` | https://claude.ai/code/artifact/dfefd8c4-e4da-472b-bd31-14d767c9afcd |
| ⅩⅣ | Bumble Bee Foods | `bumblebee` | https://claude.ai/code/artifact/7168eae0-1983-4c01-b9d1-58d7a5aded8d |
| ⅩⅤ | Umios株式会社 | `umios` | https://claude.ai/code/artifact/7d830082-d99f-441a-ac8d-8a8d902cf6dc |
| ⅩⅥ | 株式会社極洋 | `kyokuyo` | https://claude.ai/code/artifact/e77d9064-5e6b-49eb-bd70-8bde1dfb93f9 |
| ⅩⅦ | Sea Value Group | `seavalue` | https://claude.ai/code/artifact/41892295-c86f-4b97-9b79-da124c7ec611 |
| ⅩⅧ | 株式会社ニッスイ | `nissui` | https://claude.ai/code/artifact/458be62d-4d4a-433c-b9ec-97503f9ca5bc |
| ⅩⅨ | Century Pacific Food | `centurypacific` | https://claude.ai/code/artifact/6c57b631-82c4-48d3-a35f-ef3ee9685fbd |
| ⅩⅩ | Bolton Food S.p.A. | `boltonfood` | https://claude.ai/code/artifact/a1a641d0-fa5a-4e4d-a28c-6229e2f06fe7 |
| ⅩⅩⅠ | Tri Marine | `trimarine` | https://claude.ai/code/artifact/8abc7ed5-a3e3-4f69-a5c0-64eeb14c900f |

## 다시 지워지면

`docs/evidence` 에서 재료를 만드는 스크립트다. `<body>` 가 있으면 추출하고 없으면 그대로 쓴다.

```python
import pathlib, re
out = pathlib.Path('/tmp/artifacts_new'); out.mkdir(parents=True, exist_ok=True)
for d in sorted(pathlib.Path('docs/evidence').glob('company-*')):
    src = d / '보고서.html'
    if not src.exists():
        continue
    key = d.name.split('company-')[1].rsplit('-2026', 1)[0]
    s = src.read_text(encoding='utf-8')
    if '<body' in s:                      # 완전 문서 — 껍데기를 벗긴다
        g = lambda p: (re.search(p, s, re.S) or [None, ''])[1]
        link = re.search(r'<link rel=.stylesheet.[^>]*>', s)
        s = (f"<title>{g(r'<title>(.*?)</title>')}</title>\n"
             '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
             + (link.group(0) + '\n' if link else '')
             + f"<style>{g(r'<style>(.*?)</style>')}</style>\n{g(r'<body>(.*)</body>')}\n")
    (out / f'{key}.html').write_text(s, encoding='utf-8')
    print(key, (out / f'{key}.html').stat().st_size // 1024, 'KB')
```

그다음 편마다 `Artifact` 로 발행한다 — 파비콘은 🐟 로 고정한다.

재발행하면 URL 이 또 바뀐다. 이 표와 `HANDOFF_*.md`, 그리고
`~/.claude/projects/.../memory/*-anatomy-*.md` 를 같이 고쳐야 한다.
