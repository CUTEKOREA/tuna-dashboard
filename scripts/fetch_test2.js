const apiKey = process.env.USCENSUS_API_KEY;
if (!apiKey) throw new Error("Missing required environment variable: USCENSUS_API_KEY");

async function test() {
  const url = `https://api.census.gov/data/timeseries/intltrade/imports/hs?get=GEN_VAL_MO,GEN_QY1_MO,UNIT_QY1,CTY_CODE,CTY_NAME,I_COMMODITY_SDESC&I_COMMODITY=160414*&time=from+2023-01+to+2023-02&key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`\nHS Code: 160414*`);
    console.log(data.slice(0, 10));
  } catch (e) {
    console.error(e.message);
  }
}

test();
