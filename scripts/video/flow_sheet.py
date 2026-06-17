#!/usr/bin/env python3
"""flow_sheet.py — cuts.json → Flow(구글 AI Ultra) 수동 생성용 프롬프트 시트(.md).

Veo를 API(유료) 대신 Flow(구독 포함, 무료)로 만들 때 사용.
컷별 영문 프롬프트 + 저장 파일명을 출력 → 사용자가 Flow에서 생성·다운로드 후 그 파일명으로 저장.
사용: python3 flow_sheet.py out/<name>/cuts.json [out/<name>/cuts.json ...]
출력: 각 영상 out/<name>/FLOW_시트.md  (+ 화면에도 요약)
"""
import json, os, sys

HEADER = """# 🎬 Flow 생성 시트 — {name}

> **Google AI Ultra(Flow)로 무료 생성용.** 아래 컷별 프롬프트를 [Flow](https://labs.google/flow)에 붙여넣어 생성하세요.
> **Flow 설정(중요):** 모델 **Veo 3.1 Fast** · 비율 **9:16(세로)** · 길이 **~8초** · (오디오는 꺼도 됨 — 내레이션은 따로 입힘)
> 생성·다운로드 후, 아래 **저장 파일명** 그대로 `{visdir}/` 에 넣어주세요. 7개 다 채우면 알려주시면 제가 합성합니다.

"""


def main():
    paths = [a for a in sys.argv[1:] if a.endswith('.json')]
    for p in paths:
        cuts = json.load(open(p, encoding='utf-8'))
        outdir = os.path.dirname(p)
        name = os.path.basename(outdir)
        visdir = os.path.relpath(os.path.join(outdir, 'visuals'),
                                 os.path.expanduser('~/연구자동화애이전트들/tuna-dashboard/scripts/video'))
        os.makedirs(os.path.join(outdir, 'visuals'), exist_ok=True)
        lines = [HEADER.format(name=name, visdir=visdir)]
        for c in cuts:
            fn = f"cut_{c['idx']:02d}.mp4"
            lines.append(f"## 컷 {c['idx']}  ({c.get('id','')})  →  저장: `{fn}`")
            lines.append(f"- 자막(참고): {c.get('subtitle','')}")
            lines.append(f"- 내레이션(참고): {c.get('narration_kr','')}")
            lines.append("- **Flow 프롬프트(복사)**:")
            lines.append(f"```\n{c.get('visual_en','').strip()}\n```")
            lines.append("")
        sheet = os.path.join(outdir, 'FLOW_시트.md')
        open(sheet, 'w', encoding='utf-8').write('\n'.join(lines))
        print(f"✅ {name}: {len(cuts)}컷 시트 → {sheet}")
        print(f"   다운로드 클립 저장 위치: {os.path.join(outdir, 'visuals')}/cut_00.mp4 ~ cut_{len(cuts)-1:02d}.mp4")


if __name__ == '__main__':
    main()
