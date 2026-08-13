const apiKey = process.env.USCENSUS_API_KEY;
if (!apiKey) throw new Error("Missing required environment variable: USCENSUS_API_KEY");
const hsCodes = ["160414", "030343", "030475"]; // Canned tuna, Skipjack, Pollock

async function test() {
  for (const hs of hsCodes) {
    const url = `https://api.census.gov/data/timeseries/intltrade/imports/hs?get=GEN_VAL_MO,GEN_QY1_MO,UNIT_QY1,CTY_CODE,CTY_NAME&I_COMMODITY=${hs}&time=from+2023-01+to+2023-02&key=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(`\nHS Code: ${hs}`);
      console.log(data.slice(0, 3));
    } catch (e) {
      console.error(e.message);
    }
  }
}

test();
