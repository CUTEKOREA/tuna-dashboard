/**
 * 밸류체인 분기도 — 이 페이지의 중심 도해.
 *
 * 참치 산업을 한 장으로 설명하는 사실은 하나다: **어법에서 두 갈래로 갈리고 끝까지 만나지 않는다.**
 * 선망으로 잡은 것은 염수냉동으로 얼려 통조림이 되고, 연승으로 잡은 것은 초저온으로 얼려 사시미가 된다.
 * 그래서 이 도해는 사슬을 일직선이 아니라 **갈라진 두 줄**로 그린다.
 *
 * 각 단계를 누르면 해당 단계로 이동한다.
 */
'use client';

import React from 'react';

import styles from './TunaIndustryDashboard.module.css';

interface SpineStage {
  key: string;
  numeral: string;
  label: string;
  /** 통조림 경로에서 이 단계가 무엇인가 */
  canned: string;
  /** 사시미 경로에서 이 단계가 무엇인가 */
  sashimi: string;
}

/** 01은 갈라지기 전이라 두 경로 값이 같다 — 렌더에서 단일 노드로 처리한다. */
const SPINE: SpineStage[] = [
  { key: 's01', numeral: '01', label: '자원·해역', canned: '5대 RFMO 관할', sashimi: '5대 RFMO 관할' },
  { key: 's02', numeral: '02', label: '어획', canned: '선망', sashimi: '연승' },
  { key: 's03', numeral: '03', label: '환적·운반', canned: '염수냉동 운반', sashimi: '초저온 운반' },
  { key: 's04', numeral: '04', label: '1차 가공', canned: '로인 발골', sashimi: '드레싱·필렛' },
  { key: 's05', numeral: '05', label: '최종 가공', canned: '통조림·파우치', sashimi: '사시미·스테이크' },
  { key: 's06', numeral: '06', label: '교역·통관', canned: '조제품 HS 1604', sashimi: '냉동필렛 HS 0304' },
  { key: 's07', numeral: '07', label: '소비', canned: '유럽·미국 소매', sashimi: '일본 도매' },
];

const VIEW_W = 1120;
const VIEW_H = 330;
const COL_W = 150;
const X0 = 78;
const Y_TOP = 108;
const Y_BOTTOM = 226;
const Y_MID = (Y_TOP + Y_BOTTOM) / 2;
const NODE_W = 124;
const NODE_H = 52;

const colX = (index: number) => X0 + index * COL_W;

export interface ValueChainSpineProps {
  activeKey: string;
  onSelect: (key: string) => void;
}

export default function ValueChainSpine({ activeKey, onSelect }: ValueChainSpineProps) {
  return (
    <figure className={styles.spineFigure}>
      <figcaption className={styles.spineCaption}>
        참치는 어법에서 두 갈래로 갈린 뒤 소비 시장까지 다시 만나지 않는다. 단계를 누르면 그 단계로 이동한다.
      </figcaption>

      <div className={styles.spineScroll}>
        <svg
          className={styles.spineSvg}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="group"
          aria-label="참치 밸류체인 분기도"
        >
          {/* 경로 라벨 */}
          <text x={10} y={Y_TOP - 30} className={styles.spineLaneLabel}>
            통조림 경로
          </text>
          <text x={10} y={Y_BOTTOM + 46} className={styles.spineLaneLabel}>
            사시미 경로
          </text>

          {/* 연결선 — 01에서 갈라진다 */}
          {SPINE.map((stage, index) => {
            if (index === 0) return null;
            const prevX = colX(index - 1) + NODE_W / 2;
            const currX = colX(index) - NODE_W / 2;
            const midX = (prevX + currX) / 2;
            if (index === 1) {
              return (
                <g key={`link-${stage.key}`}>
                  <path
                    d={`M ${prevX} ${Y_MID} C ${midX} ${Y_MID}, ${midX} ${Y_TOP}, ${currX} ${Y_TOP}`}
                    className={styles.spineLinkCanned}
                  />
                  <path
                    d={`M ${prevX} ${Y_MID} C ${midX} ${Y_MID}, ${midX} ${Y_BOTTOM}, ${currX} ${Y_BOTTOM}`}
                    className={styles.spineLinkSashimi}
                  />
                </g>
              );
            }
            return (
              <g key={`link-${stage.key}`}>
                <line x1={prevX} y1={Y_TOP} x2={currX} y2={Y_TOP} className={styles.spineLinkCanned} />
                <line x1={prevX} y1={Y_BOTTOM} x2={currX} y2={Y_BOTTOM} className={styles.spineLinkSashimi} />
              </g>
            );
          })}

          {/* 노드 */}
          {SPINE.map((stage, index) => {
            const cx = colX(index);
            const active = stage.key === activeKey;
            const single = index === 0;
            const rows: { y: number; text: string; tone: 'canned' | 'sashimi' | 'both' }[] = single
              ? [{ y: Y_MID, text: stage.canned, tone: 'both' }]
              : [
                  { y: Y_TOP, text: stage.canned, tone: 'canned' },
                  { y: Y_BOTTOM, text: stage.sashimi, tone: 'sashimi' },
                ];

            return (
              <g
                key={stage.key}
                className={active ? styles.spineNodeActive : styles.spineNode}
                onClick={() => onSelect(stage.key)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(stage.key);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${stage.numeral} ${stage.label}`}
              >
                {/* 단계 머리 */}
                <text x={cx} y={38} className={styles.spineNumeral}>
                  {stage.numeral}
                </text>
                <text x={cx} y={60} className={styles.spineStageLabel}>
                  {stage.label}
                </text>

                {rows.map((row) => (
                  <g key={`${stage.key}-${row.tone}`}>
                    <rect
                      x={cx - NODE_W / 2}
                      y={row.y - NODE_H / 2}
                      width={NODE_W}
                      height={NODE_H}
                      rx={10}
                      className={
                        row.tone === 'canned'
                          ? styles.spineBoxCanned
                          : row.tone === 'sashimi'
                            ? styles.spineBoxSashimi
                            : styles.spineBoxBoth
                      }
                    />
                    <text x={cx} y={row.y + 5} className={styles.spineBoxText}>
                      {row.text}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}
