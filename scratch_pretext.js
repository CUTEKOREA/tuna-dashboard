const { prepare, layoutNextLine } = require('@chenglou/pretext');
const text = "중서부태평양 등 청정 해역에서 참치(가다랑어, 황다랑어 등)를 어획하여 영하 50도 이하로 급속 동결하는 생태계의 가장 첫 단계입니다.";
const font = "14px Arial";
const prepared = prepare(text, font);
let start = { segmentIndex: 0, graphemeIndex: 0 };
while (true) {
  const line = layoutNextLine(prepared, start, 200);
  if (!line) break;
  console.log(line);
  start = line.end;
}
