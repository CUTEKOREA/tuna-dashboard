// v5 개편으로 오징어 대시보드는 public/data/squid_v5.json 하나만 읽는다.
// 여기 남은 것은 참치 페이지의 Insight9TunaVsSquidCombo 가 쓰는 벤치마크 한 건뿐이다.
// 나머지 26개 데이터셋은 폐기된 구 위젯 전용이었으므로 import 를 걷어내
// 번들에서 제외한다 (원본 JSON 은 data/ 에 그대로 두었다).
import tunaBenchmark from '../../data/squid_tuna_benchmark.json';

const squidDatasets = {
  tunaBenchmark,
} as const;

export type SquidDataset = keyof typeof squidDatasets;

export function getSquidData<TDataset extends SquidDataset>(
  dataset: TDataset,
): (typeof squidDatasets)[TDataset] {
  return squidDatasets[dataset];
}
