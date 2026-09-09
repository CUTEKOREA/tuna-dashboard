/**
 * 지구본 연출 — three.js 쪽 장치만 모았다.
 *
 * 여기 있는 것은 **보는 방식**이지 사실이 아니다. 별·림글로·블룸·톤매핑은
 * 좌표도 관계도 만들지 않는다. 데이터를 바꾸는 코드는 이 파일에 한 줄도 없고
 * `company-geo.ts` · `company-relations.ts` 의 다섯 규칙은 렌더와 무관하게 선다.
 *
 * 연출이 사실을 만드는 자리 하나만 조심하면 된다 — **밝기로 중요도를 말하지 않는다.**
 * 블룸은 층 강조색 하나에만 걸리고, 미확인 관계는 색이 흐려서 자연히 덜 빛난다.
 * 굵기(값)와 밝기(확정 여부)가 같은 축을 두 번 말하지 않도록 임계값을 높게 잡았다.
 */

import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/** globe.gl 의 지구 반지름은 100 단위다. */
const R = 100;

export interface Cinematics {
  /** 층이 바뀔 때 강조색을 갈아 끼운다. */
  setAccent(hex: string): void;
  /** 매 프레임 별을 아주 느리게 흘린다. */
  tick(dt: number): void;
  dispose(): void;
}

/* ── 별 ─────────────────────────────────────────────────────────── */

function makeStarfield(count = 2600): THREE.Points {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color();

  for (let i = 0; i < count; i++) {
    // 껍질 안에 고르게 — 극에 뭉치지 않게 z 를 균등분포로 뽑는다.
    const u = (i * 2.399963) % (Math.PI * 2);
    const z = 1 - 2 * ((i + 0.5) / count);
    const r = Math.sqrt(Math.max(0, 1 - z * z));
    const d = 900 + ((i * 137) % 900);
    pos[i * 3] = Math.cos(u) * r * d;
    pos[i * 3 + 1] = z * d;
    pos[i * 3 + 2] = Math.sin(u) * r * d;

    // 색온도를 조금 흩는다. 푸른 별과 누런 별이 섞여야 하늘로 읽힌다.
    const t = ((i * 61) % 100) / 100;
    c.setHSL(t < 0.72 ? 0.58 : 0.09, 0.35, 0.62 + (t % 0.3));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 2.4, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0.85, depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const p = new THREE.Points(geo, mat);
  p.renderOrder = -1;
  return p;
}

/* ── 대기 림 ─────────────────────────────────────────────────────── */

const RIM_VERT = `
varying vec3 vN; varying vec3 vP;
void main() {
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vP = mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

const RIM_FRAG = `
uniform vec3 uColor; uniform float uPower; uniform float uGain;
varying vec3 vN; varying vec3 vP;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), uPower);
  gl_FragColor = vec4(uColor, clamp(f * uGain, 0.0, 1.0));
}`;

function makeRim(color: THREE.Color): THREE.Mesh {
  const mat = new THREE.ShaderMaterial({
    vertexShader: RIM_VERT,
    fragmentShader: RIM_FRAG,
    uniforms: {
      uColor: { value: color.clone() },
      uPower: { value: 4.6 },
      uGain: { value: 0.40 },
    },
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(R * 1.035, 64, 48), mat);
  m.renderOrder = 1;
  return m;
}

/* ── 설치 ───────────────────────────────────────────────────────── */

/**
 * 지구본 인스턴스에 연출을 얹는다. 두 번 불러도 안전하도록 이름표를 붙여
 * 이미 있는 것은 다시 만들지 않는다.
 */
export function installCinematics(globe: any, accentHex: string): Cinematics | null {
  const scene: THREE.Scene | undefined = globe?.scene?.();
  const renderer: THREE.WebGLRenderer | undefined = globe?.renderer?.();
  const camera: THREE.Camera | undefined = globe?.camera?.();
  if (!scene || !renderer) return null;

  const accent = new THREE.Color(accentHex);

  /* 톤매핑 — 블룸이 흰색으로 타 버리지 않게 필름 커브를 건다. */
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  /* 지구 표면 — 낮 텍스처를 어둡게 눌러 쓴다.
     밤 텍스처(도시 불빛)는 아프리카·아마존이 통째로 사라져 지리가 안 읽히고,
     원래 쓰던 earth-dark 는 최대 휘도가 40/255 라 어떤 조명으로도 대륙이 안 나온다. */
  const surface: THREE.MeshPhongMaterial | undefined = globe.globeMaterial?.();
  if (surface) {
    surface.color = new THREE.Color(0x6f7f8c);   // 낮 색을 눌러 야간 화면에 앉힌다
    surface.shininess = 26;
    surface.specular = new THREE.Color(accent).multiplyScalar(0.3);
    surface.emissive = new THREE.Color('#0e2230');
    surface.emissiveIntensity = 0.55;
    surface.needsUpdate = true;

    // 바다만 반사하고 육지는 안 반사한다 — 스페큘러 맵이 그 경계를 준다.
    new THREE.TextureLoader().load('/textures/earth-water.png', (tex) => {
      tex.colorSpace = THREE.NoColorSpace;
      surface.specularMap = tex;
      surface.needsUpdate = true;
    });
  }

  /* 별 */
  let stars = scene.getObjectByName('tuna-stars') as THREE.Points | undefined;
  if (!stars) {
    stars = makeStarfield();
    stars.name = 'tuna-stars';
    scene.add(stars);
  }

  /* 림 */
  let rim = scene.getObjectByName('tuna-rim') as THREE.Mesh | undefined;
  if (!rim) {
    rim = makeRim(accent);
    rim.name = 'tuna-rim';
    scene.add(rim);
  }

  /* 빛 — 기본 조명은 정면이라 평평하다. 키를 옆으로 밀고 반대편에 림을 둔다. */
  const lights: THREE.Light[] = globe.lights?.() ?? [];
  const dir = lights.find((l) => (l as any).isDirectionalLight) as THREE.DirectionalLight | undefined;
  if (dir) {
    dir.position.set(-0.45, 0.42, 1.0);
    dir.intensity = 1.5;
  }
  const amb = lights.find((l) => (l as any).isAmbientLight) as THREE.AmbientLight | undefined;
  if (amb) amb.intensity = 1.05;

  let rimLight = scene.getObjectByName('tuna-rimlight') as THREE.DirectionalLight | undefined;
  if (!rimLight) {
    rimLight = new THREE.DirectionalLight(accent, 0.55);
    rimLight.name = 'tuna-rimlight';
    rimLight.position.set(1.1, -0.4, -0.9);
    scene.add(rimLight);
  }

  /* 블룸 — 선과 기둥만 번지게 임계값을 높인다. 지구 표면은 안 탄다. */
  const composer = globe.postProcessingComposer?.();
  let bloom: UnrealBloomPass | null = null;
  if (composer && !composer.passes.some((p: any) => p.__tunaBloom)) {
    bloom = new UnrealBloomPass(new THREE.Vector2(1024, 1024), 0.46, 0.42, 0.58);
    (bloom as any).__tunaBloom = true;
    composer.addPass(bloom);
    const out = new OutputPass();
    (out as any).__tunaOut = true;
    composer.addPass(out);
  }

  let t = 0;
  const KEY = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);

  return {
    setAccent(hex: string) {
      const c = new THREE.Color(hex);
      const rm = rim!.material as THREE.ShaderMaterial;
      rm.uniforms.uColor.value.copy(c);
      rimLight!.color.copy(c);
      if (surface) {
        surface.specular.copy(c).multiplyScalar(0.2);
        surface.needsUpdate = true;
      }
    },
    tick(dt: number) {
      t += dt;
      /* 키라이트를 카메라에 물린다.
         빛을 씬에 고정하면 층을 옮길 때마다 보고 있는 면이 밤이 돼 점이 사라진다.
         카메라에서 좌상단으로 살짝 비켜 둬야 3/4 조명이 되고 구가 납작해지지 않는다. */
      if (dir && camera) {
        KEY.copy(camera.position).normalize();
        KEY.applyAxisAngle(UP, -0.42);
        KEY.y += 0.3;
        dir.position.copy(KEY.normalize());
      }
      // 별이 지구보다 훨씬 느리게 돈다 — 시차가 있어야 깊이로 읽힌다.
      stars!.rotation.y += dt * 0.0045;
      const rm = rim!.material as THREE.ShaderMaterial;
      rm.uniforms.uGain.value = 0.38 + Math.sin(t * 0.55) * 0.06;
    },
    dispose() {
      for (const name of ['tuna-stars', 'tuna-rim', 'tuna-rimlight']) {
        const o = scene.getObjectByName(name);
        if (!o) continue;
        scene.remove(o);
        const anyO = o as any;
        anyO.geometry?.dispose?.();
        anyO.material?.dispose?.();
      }
      if (composer && bloom) {
        composer.passes = composer.passes.filter((p: any) => !p.__tunaBloom && !p.__tunaOut);
        bloom.dispose?.();
      }
    },
  };
}

/* ── 카메라 안무 ─────────────────────────────────────────────────── */

export interface View { lat: number; lng: number; altitude: number }

/**
 * 층 전환. 한 번에 밀어 넣으면 지도 이동으로 보이고, **뒤로 빠졌다 들어가면**
 * 장면 전환으로 읽힌다. 두 단계로 나누는 이유가 그것뿐이다.
 */
export function flyToLayer(globe: any, view: View): number[] {
  if (!globe?.pointOfView) return [];
  globe.pointOfView({ ...view, altitude: view.altitude + 1.05 }, 620);
  const id = window.setTimeout(() => globe.pointOfView?.(view, 1450), 640);
  return [id];
}

/** 처음 들어올 때 한 번. 멀리서 붙는다. */
export function flyIntro(globe: any, view: View): number[] {
  if (!globe?.pointOfView) return [];
  globe.pointOfView({ lat: view.lat, lng: view.lng, altitude: 4.8 }, 0);
  const id = window.setTimeout(() => globe.pointOfView?.(view, 2600), 120);
  return [id];
}

/** 점을 찍으면 그 자리로 내려간다. */
export function flyToPoint(globe: any, lat: number, lng: number) {
  globe?.pointOfView?.({ lat, lng, altitude: 1.2 }, 950);
}
