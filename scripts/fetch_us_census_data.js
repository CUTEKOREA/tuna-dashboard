const fs = require('fs');
const path = require('path');

const API_KEY = process.env.USCENSUS_API_KEY;
if (!API_KEY) throw new Error("Missing required environment variable: USCENSUS_API_KEY");
const BASE_URL = "https://api.census.gov/data/timeseries/intltrade/imports/hs";

// 비통조림(사시미급) 참치 수입 HS6 — 신선(0302)·냉동(0303)·필렛(0304) + 기존 코드 보존
//  신선: 030232 황다랑어 · 030234 눈다랑어 · 030235 대서양 참다랑어
//  냉동: 030342 황다랑어 · 030343 가다랑어(기존) · 030344 눈다랑어 · 030345 대서양 참다랑어
//  필렛: 030487 냉동 참치 필렛 · 030475 냉동 어류 필렛(기존)
//  통조림: 160414 (기존, 범위 밖이나 다른 소비처 보존)
const HS_CODES = [
  "160414",
  "030232", "030234", "030235",
  "030342", "030343", "030344", "030345",
  "030487", "030475",
];
const TIME_RANGE = "from+2021-01+to+2025-12";

async function fetchCensusData(hsCode) {
    const url = `${BASE_URL}?get=GEN_VAL_MO,CTY_CODE,CTY_NAME&I_COMMODITY=${hsCode}&time=${TIME_RANGE}&key=${API_KEY}`;
    console.log(`Fetching ${hsCode}...`);
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.error(`Error fetching ${hsCode}:`, e.message);
        return [];
    }
}

async function fetchCensusData10Digit(hsCode) {
    const url = `${BASE_URL}?get=GEN_VAL_MO,GEN_QY1_MO,UNIT_QY1,CTY_CODE,CTY_NAME&I_COMMODITY=${hsCode}*&time=${TIME_RANGE}&key=${API_KEY}`;
    console.log(`Fetching 10-digit for ${hsCode}...`);
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.error(`Error fetching 10-digit ${hsCode}:`, e.message);
        return [];
    }
}

function parseData(rawData) {
    if (!rawData || rawData.length < 2 || rawData.error) return [];
    const headers = rawData[0];
    return rawData.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i]; });
        return obj;
    });
}

async function main() {
    // 기존 prefetch를 로드해 merge 베이스로 사용 (신규 fetch가 빈 코드는 기존 값 보존)
    const outDirEarly = path.join(__dirname, '..', 'public', 'data');
    const outFileEarly = path.join(outDirEarly, 'us_census_timeseries.json');
    let results = {};
    try {
        if (fs.existsSync(outFileEarly)) results = JSON.parse(fs.readFileSync(outFileEarly, 'utf8'));
        console.log(`기존 prefetch 로드: ${Object.keys(results).join(', ')}`);
    } catch (e) { console.warn('기존 prefetch 로드 실패, 신규 생성'); }

    for (const hs of HS_CODES) {
        console.log(`Processing HS: ${hs}`);
        const raw6 = await fetchCensusData(hs);
        const data6 = parseData(raw6);
        
        const raw10 = await fetchCensusData10Digit(hs);
        const data10 = parseData(raw10);
        
        const agg = {};
        
        data6.forEach(row => {
            const t = row.time;
            const cty = row.CTY_NAME;
            const val = parseFloat(row.GEN_VAL_MO) || 0;
            const key = `${t}_${cty}`;
            agg[key] = { time: t, country: cty, value: val, quantity_kg: 0 };
        });
        
        data10.forEach(row => {
            if (row.UNIT_QY1 === 'KG') {
                const t = row.time;
                const cty = row.CTY_NAME;
                const qy = parseFloat(row.GEN_QY1_MO) || 0;
                const key = `${t}_${cty}`;
                if (agg[key]) {
                    agg[key].quantity_kg += qy;
                }
            }
        });
        
        const finalList = Object.values(agg).map(v => {
            v.unit_value_usd_per_kg = v.quantity_kg > 0 ? v.value / v.quantity_kg : 0;
            return v;
        });
        
        finalList.sort((a, b) => a.time.localeCompare(b.time));
        // 신규 fetch가 빈 결과면 기존 데이터 보존 (부분 실패 방어)
        if (finalList.length > 0) {
            results[hs] = finalList;
            console.log(`  HS ${hs}: ${finalList.length}행 갱신`);
        } else {
            console.warn(`  HS ${hs}: 신규 fetch 0행 → 기존 데이터 보존(${(results[hs] || []).length}행)`);
        }
    }

    const outDir = path.join(__dirname, '..', 'public', 'data');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    const outFile = path.join(outDir, 'us_census_timeseries.json');
    fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
    console.log(`Saved data to ${outFile}`);
}

main();
