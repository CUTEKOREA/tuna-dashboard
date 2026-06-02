const quality = "어창 개방 측정온도 -26.0℃. 초저온 동결 상태 양호.";
const normalizedQuality = quality.replace(/[\u2212\u2013\u2014]/g, "-");
const clauses = normalizedQuality.split(/;|\n|\.(?!\d)/);
console.log("Clauses:", clauses);
const tempRegex = /([+-]?\d+(?:\.\d+)?)\s*(?:℃|°C|°|C)/gi;
clauses.forEach(clause => {
  let tempMatch;
  while ((tempMatch = tempRegex.exec(clause)) !== null) {
    console.log("Match:", tempMatch[0], "Val:", parseFloat(tempMatch[1]));
  }
});
