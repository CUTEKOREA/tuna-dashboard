"use client";

/**
 * 기업 조사 표 — 전 어종 공용.
 *
 * 참치 페이지에서 검증된 형식(2026-08-17): 수치의 성격(기관/자사/자칭)을 행마다
 * 드러내고, 찾지 못한 값은 「확인불가/공표 없음」으로 싣는다. 빈칸 자체가 정보다.
 * 개인(자연인) 이름은 데이터 단계에서 이미 배제돼 있다.
 */

import React from 'react';

import type {
  TraderRow,
  CarrierProfileRow,
  CanneryCountryRow,
  BrandMarketRow,
} from '@/lib/data/valuechain-companies';

import styles from './TunaIndustryDashboard.module.css';

/** 트레이더 표 — 수치 성격(기관/자사/자칭)을 행마다 드러낸다. */
export function TraderTable({ rows }: { rows: TraderRow[] }) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>
          캐닝용 원어 트레이딩의 주요 회사. 「빅3」 합산 수치는 2011~2015년 기준이고 최신
          공표치는 3사 모두 없다 — 빈칸 자체가 이 시장의 불투명성이다.
        </caption>
        <thead>
          <tr>
            <th scope="col">회사</th>
            <th scope="col">위치</th>
            <th scope="col">규모 (성격)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.회사}>
              <th scope="row">
                {row.회사}
                <span className={styles.factNote}>{row.내용}</span>
              </th>
              <td>{row.위치}</td>
              <td>
                {row.규모}
                <span className={styles.factNote}>{row.성격} — {row.출처}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 운반선사 보강 표 — 등록부 집계가 못 잡는 실세(명의 분산)를 함께 보여준다. */
export function CarrierProfileTable({ rows }: { rows: CarrierProfileRow[] }) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>
          등록부 소유사 상위와 실제 국제 리퍼 업계는 다르다 — 대형 리퍼 선사는 선박을
          개별 명의로 분산 등록해 집계에 이름이 안 보인다. 그 실세를 여기서 보강한다.
        </caption>
        <thead>
          <tr>
            <th scope="col">회사</th>
            <th scope="col">유형</th>
            <th scope="col">근거</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.회사}>
              <th scope="row">
                {row.회사}
                <span className={styles.factNote}>{row.내용}</span>
              </th>
              <td>{row.유형}</td>
              <td>{row.출처}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 국가별 캔공장 표 — 「공장 수」가 무엇을 센 것인지 행마다 명시한다. */
export function CanneryCountryTable({ rows }: { rows: CanneryCountryRow[] }) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>
          국가별 캔참치 공장을 한 기준으로 세는 통계는 없다 — 행마다 무엇을 센 것인지
          (협회 공표·EU 승인 등재·정부 언급)를 적었다. 등급 A는 기관 공표, B는 협회·목록
          기반, C는 언론·자사뿐.
        </caption>
        <thead>
          <tr>
            <th scope="col">국가</th>
            <th scope="col">공장 (기준 명시)</th>
            <th scope="col">주요 기업</th>
            <th scope="col">등급</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.국가}>
              <th scope="row">{row.국가}</th>
              <td>
                {row.공장}
                <span className={styles.factNote}>{row.출처}</span>
              </td>
              <td>{row.기업}</td>
              <td>{row.등급}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 국가별 브랜드 표 — 점유율의 성격(기관/자사/자칭)을 구분해 싣는다. */
export function BrandMarketTable({ rows }: { rows: BrandMarketRow[] }) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>
          브랜드 단위 매출을 공표하는 회사는 사실상 없고, 점유율의 기관 공표가 실재하는
          시장은 한국(닐슨)과 미국(2015년이 마지막)뿐이다. 수치의 성격을 행마다 구분했다.
        </caption>
        <thead>
          <tr>
            <th scope="col">시장</th>
            <th scope="col">브랜드 (소유)</th>
            <th scope="col">공표 실적</th>
            <th scope="col">점유율 (성격)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.시장}-${row.브랜드}`}>
              <th scope="row">{row.시장}</th>
              <td>
                {row.브랜드}
                <span className={styles.factNote}>{row.소유}</span>
              </td>
              <td>{row.실적}</td>
              <td>
                {row.점유율}
                <span className={styles.factNote}>{row.성격}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
