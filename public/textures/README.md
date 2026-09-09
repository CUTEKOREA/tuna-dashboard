# 지구본 텍스처

`components/market-understanding/TunaPowerGlobe.tsx` 와 `globe-cinematics.ts` 가 쓴다.

| 파일 | 크기 | 쓰이는 자리 |
|---|---:|---|
| `earth-blue-marble.jpg` | 4096×2048 · 1,461,877 B | 지구 표면 (`globeImageUrl`) |
| `earth-topology.png` | 2048×1024 · 378,243 B | 지형 범프 (`bumpImageUrl`) — 산맥이 빛을 받는다 |
| `earth-water.png` | 1600×800 · 430,200 B | 스페큘러 마스크 — **바다만** 반사하고 육지는 안 한다 |
| `earth-dark.jpg` | 2048×1024 · 94,795 B | 안 쓴다. 아래 참조 |

## `earth-dark.jpg` 를 버린 이유

**최대 휘도가 40/255 다.** 평균 11.4. 어떤 조명·자체발광을 걸어도 대륙이 안 나온다 —
실제로 이 텍스처로 렌더했을 때 화면이 검은 원 하나였다. 어두운 대시보드에 맞춰
고른 텍스처였는데 어두운 게 아니라 **비어 있는** 것이었다.

밤 텍스처(`earth-night.jpg`, 도시 불빛)도 후보였지만 아프리카·아마존·태평양 섬이
통째로 사라진다. 참치 산업의 거점이 그쪽에 몰려 있어 쓸 수 없다.

낮 텍스처를 재질에서 눌러 쓴다 — `surface.color = 0x6f7f8c`.
어둡게 만드는 일은 데이터가 아니라 조명이 한다.

측정 방법:

```
python3 -c "from PIL import Image, ImageStat; \
im=Image.open('public/textures/earth-blue-marble.jpg').convert('L'); \
print(im.size, ImageStat.Stat(im).mean[0], im.getextrema())"
```

## 왜 로컬에 두는가

`components/PacificGlobe.tsx` 는 텍스처를 `//unpkg.com/three-globe/example/img/...`
에서 런타임에 받는다. 국기는 CDN 요청 0건 원칙으로 `public/flags/` 에 고정해 뒀는데
지구본만 외부에 매달려 있어, 차단·장애 시 검은 구가 된다.

새 위젯은 같은 실수를 하지 않는다. 파일을 저장소에 넣고 `/textures/…` 로 읽는다.

## 출처

전부 `node_modules/three-globe/example/img/` 에서 그대로 복사했다 (`three-globe@2.31.0`).
내려받은 날 2026-09-09. 색을 바꾸거나 자르지 않았다 — 밝기는 재질에서 조정한다.

```
shasum -a 256 public/textures/*.jpg public/textures/*.png
```

`earth-dark.jpg` SHA-256 `8b8f3a4e258428b6e669a0799fb8b6f2db15c6240825d6a7c75963829b576994`
