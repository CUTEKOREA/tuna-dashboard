# 참치 기업 해부 — 아티팩트 원장

`Artifact` 도구의 `list` 로 확인한 **정본 URL** 이다(2026-09-09 확인).

| 편 | 회사 | 키 | URL |
|---|---|---|---|
| Ⅰ | Frinsa del Noroeste | `frinsa` | https://claude.ai/code/artifact/bcb8f72e-a34a-40ff-a3f8-3c10be983a7b |
| Ⅱ | Thai Union Group | `thaiunion` | https://claude.ai/code/artifact/6cc64a96-e8fd-4f76-b65f-a85a00650e0f |
| Ⅲ | Albacora, S.A. | `albacora` | https://claude.ai/code/artifact/48fbd576-d493-4821-9046-5c3e1accce87 |
| Ⅳ | FCF Co., Ltd. | `fcf` | https://claude.ai/code/artifact/09f19d9e-9693-46a9-8150-5fef8ead5a61 |
| Ⅴ | ITOCHU Corporation | `itochu` | https://claude.ai/code/artifact/a262eb6a-5385-4b5d-86d5-aa811c29d889 |
| Ⅵ | Bolton Group | `bolton` | https://claude.ai/code/artifact/da304266-d47a-474e-a67d-b2f61da046b9 |
| Ⅶ | JAIS S.R.L. | `jais` | https://claude.ai/code/artifact/0c0fe6f4-d839-4b42-8ef2-4610a3a2a968 |
| Ⅷ | Frabelle Group | `frabelle` | https://claude.ai/code/artifact/fe98c13c-a10e-471d-bebd-c22f3b02a757 |
| Ⅸ | Jealsa | `jealsa` | https://claude.ai/code/artifact/ee0da543-92f5-401a-90e1-7d1f4e833f5f |
| Ⅹ | Nauterra | `nauterra` | https://claude.ai/code/artifact/10d5f4e1-2db1-44e4-a684-d49845896a6d |
| ⅩⅠ | StarKist | `starkist` | https://claude.ai/code/artifact/b379a9aa-d941-4d55-b3ae-196313cfec1d |
| ⅩⅡ | 동원산업㈜ | `dongwon` | https://claude.ai/code/artifact/cb3b7ec1-fdf2-43f1-8a6f-4fc36edada47 |
| ⅩⅢ | 기업집단 「사조」 | `sajo` | https://claude.ai/code/artifact/8dfa34e0-76bd-4334-9751-26a05fd833fc |
| ⅩⅣ | Bumble Bee Foods | `bumblebee` | https://claude.ai/code/artifact/1039ffc6-949c-46b5-9cc3-a86c104e5003 |
| ⅩⅤ | Umios株式会社 | `umios` | https://claude.ai/code/artifact/85364948-a1c8-47d5-9608-223d9dab11c1 |
| ⅩⅥ | 株式会社極洋 | `kyokuyo` | https://claude.ai/code/artifact/d2b13bb3-3163-4e2a-b5f8-bf85890db112 |
| ⅩⅦ | Sea Value Group | `seavalue` | https://claude.ai/code/artifact/4dfc4f93-df08-43ae-9431-4b012f4e9c9a |
| ⅩⅧ | 株式会社ニッスイ | `nissui` | https://claude.ai/code/artifact/e0641fa5-7866-403c-8585-f282abe5348c |
| ⅩⅨ | Century Pacific Food | `centurypacific` | https://claude.ai/code/artifact/4e457f4f-93db-4dc6-985b-575b58bb2ddf |
| ⅩⅩ | Bolton Food S.p.A. | `boltonfood` | https://claude.ai/code/artifact/d02a64ea-4f1a-458a-bd48-a963278b481a |
| ⅩⅩⅠ | Tri Marine | `trimarine` | https://claude.ai/code/artifact/7b6cee13-bf17-47bc-bf5c-87f209b51f90 |
| ⅩⅩⅡ | Princes Group plc | `princes` | https://claude.ai/code/artifact/f376eb72-cb7c-434a-a6a3-1a7b260f6e15 |
| ⅩⅩⅢ | Indian Ocean Tuna Ltd | `iot` | https://claude.ai/code/artifact/bcf1a4b0-59f7-44e4-91af-8f6d6ddb812a |
| ⅩⅩⅣ | PT Aneka Tuna Indonesia | `ati` | https://claude.ai/code/artifact/0848b67a-c969-40c7-a4c3-cb36722bf8e5 |
| ⅩⅩⅤ | NIRSA (Negocios Industriales Real N.I.R.S.A. S.A.) | `nirsa` | https://claude.ai/code/artifact/556e95c6-b36c-4edc-86a3-b4cd11d4c64e |
| ⅩⅩⅥ | Eurofish S.A. | `eurofish` | https://claude.ai/code/artifact/c9f492af-5f2a-4c50-bdd3-5ae548a9e7fc |

그 밖 — 보고서 직판 랜딩 기획서 https://claude.ai/code/artifact/0f98e5a5-686b-4f47-b661-be5aa852f913

## ⚠️ 조회 API 가 실패할 때가 있다 (2026-09-09 사고)

`list` 가 「No published artifacts yet」 을 답하고 개별 `read` 가 not found 를 내며,
`url` 로 재발행하면 `artifact-deleted` 까지 반환한 시간대가 있었다.
**그런데 아티팩트는 하나도 지워지지 않았다** — 나중에 같은 URL 이 전부 정상으로 열렸다.

이 사고에서 중복 아티팩트 22개를 만들었다. 아래 URL 은 **버리는 것들**이고 지우면 된다.

```
d34b480c 9409968d 164384b0 a2fc9379 0004def0 05ad0389 86536b25 83c55ae4
8b0269fd 2ace3267 73c8f901 008fc6e1 dfefd8c4 7168eae0 7d830082 e77d9064
41892295 458be62d 6c57b631 a1a641d0 8abc7ed5 4b4874cf
```

**교훈 — `not found`·`artifact-deleted` 를 삭제로 판정하지 마라.**
조회 실패와 삭제를 도구가 구분해 주지 않는다. 재발행 전에 시간을 두고 `list` 를 다시 부르거나
브라우저로 URL 을 직접 열어 확인한다. 원본이 살아 있으면 `url` 로 갱신해야 링크가 유지된다.

## 재발행이 정말 필요할 때

재료는 `docs/evidence/company-<key>-<yyyy-mm>/보고서.html` 다.
18편은 이미 아티팩트 형태(`<title>` 부터 시작)라 그대로 올리면 되고,
ⅩⅨ·ⅩⅩ·ⅩⅩⅠ 셋만 `<html><head><body>` 껍데기를 벗겨야 한다. 파비콘은 🐟.
