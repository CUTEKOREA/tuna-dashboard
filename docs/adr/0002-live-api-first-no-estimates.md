# Live API First — 휴리스틱 추정 데이터 금지, 모든 위젯에 TelemetryBadge 의무

위젯 데이터는 항상 실시간 API(KCS, UN Comtrade, KAMIS, FAOSTAT, NOAA 등) 연동을 우선하며, 추정·휴리스틱·하드코딩 데이터는 금지한다. 모든 위젯에 `TelemetryBadge`(`LIVE`/`SYNCED`/`STATIC` + syncDate)를 부착해 신선도를 사용자에게 명시적으로 노출한다. 외주 자문 자료가 "그럴듯한 추정"으로 의사결정을 오도한 실패 후 도입했으며, 데이터 비용·개발 속도가 늘어나더라도 C레벨 신뢰가 더 비싸다는 trade-off의 결과다.
