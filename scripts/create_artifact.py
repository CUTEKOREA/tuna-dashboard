import json

with open("scripts/all_parsed.json", "r", encoding="utf-8") as f:
    vessels = json.load(f)

md = "# 🇰🇷 2025 원양산업 통계연보 전체 등록선박 명부 (Unfiltered Master List)\n\n"
md += "> [!NOTE]\n> 이 문서는 『2025 원양산업 통계연보』 원문 PDF에서 추출한 **필터링 없는 대한민국 전체 원양어선(305척) 전체 명부**입니다. 기업별/어종별 필터를 모두 해제하고, 통계청 원장에 등재된 모든 원양 선박의 조업선명, 총톤수, 진수일자 데이터를 복원했습니다.\n\n"

md += "| 연번 | 선박명 (OCR 원본 표기) | 총톤수(GT) | 진수일자 (선령 추정) |\n"
md += "|------|-------------------|------------|--------------------|\n"

for i, v in enumerate(vessels):
    md += f"| {i+1} | **{v['name']}** | {v['tonnage']} 톤 | {v['launch_date']} |\n"

with open("scripts/all_korean_deepsea_vessels.md", "w", encoding="utf-8") as f:
    f.write(md)

print("Artifact written to scripts/all_korean_deepsea_vessels.md")
