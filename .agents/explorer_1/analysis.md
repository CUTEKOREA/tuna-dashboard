# Technical Analysis & Implementation Plan: Unloading Page Upgrade

This report outlines the technical design, data parsing logic, visual aesthetics (SVG schematic, radial progress gauges, shipping lane timeline, glassmorphic styles), and a comprehensive verification plan to upgrade the Unloading Page (`components/UnloadingStatus.tsx` and `components/UnloadingStatus.module.css`) while preserving R3 functional equivalence.

---

## 1. Data Analysis: Parsing Unique Holds, Volumes, and Temperatures

To transition the unloading page from a textual log to a highly interactive visual representation, the frontend must dynamically parse the target vessel's `timeline` array.

### A. Raw Data Structure & Parsing Challenges
A typical timeline entry from `UnloadingStatus.tsx` contains:
```typescript
{
  date: '5/25',
  time: '08:10 ~ 19:00',
  targetHol: 'S/HAR(#2-A), S/EXP(#4-A)',
  dailyAmount: 216.090,
  cumAmount: 362.980,
  quality: '어창 온도 -21.0℃ ~ -24.0℃. 외관상태 양호.'
}
```
**Challenges:**
1. `targetHol` contains concatenated text with different carriers and hold numbers (e.g. `S/HAR(#2-A), S/EXP(#4-A)` or `S/SPR(#4-A, #4-B)`).
2. `dailyAmount` represents the total tonnage unloaded during that day across all targeted holds.
3. `quality` contains raw Korean strings specifying temperature ranges (e.g. `측정온도 -24.0℃ ~ -25.0℃`) and general inspection text.

### B. Regex & Parsing Logic Implementation plan
To extract data programmatically:
1. **Hold ID Extraction:** Use the regex `/#([1-4])-([A-C])/g` to parse unique hold codes (e.g., `#2-A`, `#4-B`).
2. **Temperature Extraction:** Use the regex `/-\d+(?:\.\d+)?\s*(?:℃|°C)/g` to extract all negative decimal values representing temperatures.
3. **Volume Distribution:** Since daily volume is reported as a single total, split the `dailyAmount` evenly among the holds targeted on that day (or apply custom weights if a shipper-to-hold mapping database is available).

#### TypeScript Parser Code
```typescript
interface HoldParsedData {
  dischargedVolume: number;    // Cumulative volume unloaded from this hold
  lastTemperature: number | null; // Last recorded temperature
  tempHistory: { date: string; temp: number }[];
  timeline: { date: string; amount: number }[];
}

export function parseVesselHoldData(timeline: any[]): Record<string, HoldParsedData> {
  const holdsData: Record<string, HoldParsedData> = {};

  // Initialize all standard compartments
  for (let h = 1; h <= 4; h++) {
    for (const c of ['A', 'B', 'C']) {
      holdsData[`#${h}-${c}`] = {
        dischargedVolume: 0,
        lastTemperature: null,
        tempHistory: [],
        timeline: []
      };
    }
  }

  timeline.forEach(entry => {
    if (entry.dailyAmount === 0 || entry.targetHol === '-') return;

    // 1. Extract holds
    const holdRegex = /#([1-4])-([A-C])/g;
    const matchedHolds: string[] = [];
    let holdMatch;
    while ((holdMatch = holdRegex.exec(entry.targetHol)) !== null) {
      matchedHolds.push(`#${holdMatch[1]}-${holdMatch[2]}`);
    }

    // Fallback: If no hold specified in targetHol, scan quality string
    if (matchedHolds.length === 0) {
      holdRegex.lastIndex = 0;
      while ((holdMatch = holdRegex.exec(entry.quality)) !== null) {
        matchedHolds.push(`#${holdMatch[1]}-${holdMatch[2]}`);
      }
    }

    // 2. Extract temperatures
    const tempRegex = /(-\d+(?:\.\d+)?)\s*(?:℃|°C)/g;
    const parsedTemps: number[] = [];
    let tempMatch;
    while ((tempMatch = tempRegex.exec(entry.quality)) !== null) {
      const val = parseFloat(tempMatch[1]);
      if (!isNaN(val)) parsedTemps.push(val);
    }
    const averageTemp = parsedTemps.length > 0 
      ? parsedTemps.reduce((a, b) => a + b, 0) / parsedTemps.length 
      : null;

    // 3. Allocate volume & temperature
    if (matchedHolds.length > 0) {
      const allocatedVolume = entry.dailyAmount / matchedHolds.length;
      matchedHolds.forEach(holdId => {
        const hold = holdsData[holdId];
        if (hold) {
          hold.dischargedVolume += allocatedVolume;
          hold.timeline.push({ date: entry.date, amount: allocatedVolume });
          if (averageTemp !== null) {
            hold.lastTemperature = averageTemp;
            hold.tempHistory.push({ date: entry.date, temp: averageTemp });
          }
        }
      });
    }
  });

  return holdsData;
}
```

---

## 2. SVG Cargo Hold Schematic Design

A premium ship silhouette visualizes the holds and their compartments dynamically.

```
       +--- Cabin/Superstructure (Left/Stern)
       |
    |__|_                     Bow (Right) ---\
  __|    |_________________________________   \___
  \  #4      #3       #2       #1(Slanted) \      /
   \ A(35px) A(35px)  A(35px)  A(35px)     |_____/
    \ B(35px) B(35px)  B(35px)  B(35px,sl) /
     \ C(30px) C(30px)  C(30px)  C(30px,sl)/
      \___________________________________/
```

### A. Premium Ship Silhouette Paths (Viewport: 800x260)
The outer hull and deck superstructure are drawn with custom bezier curves and lines:
```xml
<path 
  d="M 60,90 
     L 100,90 L 100,50 L 170,50 L 170,90 
     L 700,90 C 730,90 765,120 780,150 L 780,155 C 775,170 760,175 750,175 L 730,175
     L 710,210 C 700,215 680,215 670,215 
     L 120,215 C 90,215 60,195 60,150 Z" 
  fill="rgba(15, 23, 42, 0.4)" 
  stroke="rgba(255, 255, 255, 0.15)" 
  stroke-width="2" 
/>
<line x1="20" y1="215" x2="780" y2="215" stroke="rgba(56, 189, 248, 0.3)" stroke-width="2" stroke-dasharray="8, 4" />
```

### B. Hold Mapping Coordinates (#1 to #4) & Levels (A, B, C)
The holds section spans from $x=200$ to $x=650$. Below are the precise coordinates:

| Compartment | Type | Coordinates / Geometry | Width | Height | Location Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#4-A** | Rect | `x=200, y=95` | 100px | 35px | Stern / Top |
| **#4-B** | Rect | `x=200, y=135` | 100px | 35px | Stern / Middle |
| **#4-C** | Rect | `x=200, y=175` | 100px | 30px | Stern / Bottom |
| **#3-A** | Rect | `x=310, y=95` | 100px | 35px | Mid-Stern / Top |
| **#3-B** | Rect | `x=310, y=135` | 100px | 35px | Mid-Stern / Middle |
| **#3-C** | Rect | `x=310, y=175` | 100px | 30px | Mid-Stern / Bottom |
| **#2-A** | Rect | `x=420, y=95` | 100px | 35px | Mid-Bow / Top |
| **#2-B** | Rect | `x=420, y=135` | 100px | 35px | Mid-Bow / Middle |
| **#2-C** | Rect | `x=420, y=175` | 100px | 30px | Mid-Bow / Bottom |
| **#1-A** | Rect | `x=530, y=95` | 100px | 35px | Bow / Top |
| **#1-B** | Poly | `points="530,135 630,135 620,170 530,170"` | ~100px | 35px | Bow / Middle (Slanted) |
| **#1-C** | Poly | `points="530,175 620,175 590,205 530,205"` | ~90px | 30px | Bow / Bottom (Heavily Slanted) |

### C. Drawing Dynamic Fill Heights
To display "Actual Volume Unloaded vs Nominal/Reported Capacity", there are two visual paradigms:
1. **Draining Cargo Look (Remaining Tonnage):** The fill level decreases as unloading progresses.
2. **Discharging Progress Look (Unloaded Tonnage):** The fill level rises to show the percentage completed. We will implement the **Discharging Progress Look** as standard progress indicators.

#### Gradient Fill Stop Method (Highly Performant)
We apply a vertical gradient fill dynamically to each polygon with sharp color stops:
```xml
<linearGradient id="fill-2-C" x1="0%" y1="100%" x2="0%" y2="0%">
  <!-- Completed portion (Teal) -->
  <stop offset="0%" stop-color="#10b981" stop-opacity="0.8" />
  <stop offset="65%" stop-color="#10b981" stop-opacity="0.8" />
  <!-- Remaining portion (Dark semi-transparent) -->
  <stop offset="65%" stop-color="rgba(15, 23, 42, 0.6)" />
  <stop offset="100%" stop-color="rgba(15, 23, 42, 0.6)" />
</linearGradient>

<rect x="420" y="175" width="100" height="30" fill="url(#fill-2-C)" stroke="rgba(255, 255, 255, 0.2)" />
```

#### Clipping Path Method (Robust for Slanted Bows)
For slanted polygons like `#1-C`, we write a custom `<clipPath>` and animate a vertical rect inside:
```xml
<clipPath id="clip-1-C">
  <polygon points="530,175 620,175 590,205 530,205" />
</clipPath>

<!-- Background Track -->
<polygon points="530,175 620,175 590,205 530,205" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(255,255,255,0.15)" />

<!-- Dynamic Fill (e.g. 60% complete, Y goes from bottom 205 down to 205 - (30 * 0.60) = 187) -->
<rect x="520" y="187" width="120" height="20" fill="#10b981" clip-path="url(#clip-1-C)" />
```

### D. Temperature Color Mapping Rules
To maintain the safety threshold of frozen tuna, color-code the compartments:

| Temperature Range | Quality State | Render Color | CSS Hex | Glow Class |
| :--- | :--- | :--- | :--- | :--- |
| **$< -24.0^{\circ}\text{C}$** | Super-Freezing (Optimal) | Deep Cyber Blue | `#0284c7` | `glow-blue` |
| **$-20.0^{\circ}\text{C}$ to $-24.0^{\circ}\text{C}$** | Safe Freezing (Standard) | Emerald / Teal | `#10b981` | `glow-teal` |
| **$-17.0^{\circ}\text{C}$ to $-19.9^{\circ}\text{C}$** | Warning State (Monitored) | Amber / Orange | `#f59e0b` | `glow-amber` |
| **$> -17.0^{\circ}\text{C}$** | Critical State (Spoilage Risk)| Red | `#ef4444` | `glow-red` |

---

## 3. Circular Progress Gauges

To render high-fidelity radial dials representing overall vessel discharge completion, we use SVG circle strokes and mathematical offsets.

```
       , - ~ - ,
   , '           ' ,
 ,                   ,  <-- Background track (100%)
,    Progress (75%)   ,
,                     ,  <-- Stroke-dashoffset makes this part visible
 ,                   ,
   ,               ,
     ' - _ _ _ _ '
```

### A. Mathematical Formulation
1. **Circumference ($C$):** For a circle with radius $r$:
   $$C = 2 \times \pi \times r$$
2. **Stroke Dash Offset ($S$):** The length of the gap in the border stroke. For a target progress percentage $P \in [0, 100]$:
   $$S = C \times \left(1 - \frac{P}{100}\right)$$

*Example calculation for a circular progress dial ($r = 45$):*
- $C = 2 \times 3.141592 \times 45 = 282.743\text{ px}$
- If progress is $81.5\%$ complete:
  $$S = 282.743 \times (1 - 0.815) = 282.743 \times 0.185 = 52.307\text{ px}$$

### B. SVG & React Component Structure
To make it start at 12 o'clock, rotate the circle by $-90^{\circ}$.
```typescript
interface RadialGaugeProps {
  progress: number; // 0 to 100
  radius?: number;
  strokeWidth?: number;
  color?: string;
  glowColor?: string;
}

export function RadialGauge({ 
  progress, 
  radius = 45, 
  strokeWidth = 8, 
  color = "var(--accent-primary)",
  glowColor = "rgba(56, 189, 248, 0.4)" 
}: RadialGaugeProps) {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 100) / 100);

  return (
    <div style={{ position: 'relative', width: (radius + strokeWidth)*2, height: (radius + strokeWidth)*2 }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${(radius+strokeWidth)*2} ${(radius+strokeWidth)*2}`}>
        <defs>
          <filter id="radial-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Track circle */}
        <circle 
          cx={radius + strokeWidth} 
          cy={radius + strokeWidth} 
          r={radius} 
          fill="transparent" 
          stroke="rgba(255, 255, 255, 0.08)" 
          strokeWidth={strokeWidth} 
        />
        
        {/* Progress circle */}
        <circle 
          cx={radius + strokeWidth} 
          cy={radius + strokeWidth} 
          r={radius} 
          fill="transparent" 
          stroke={color} 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#radial-glow)"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </svg>
      {/* Center text overlay */}
      <div className={styles.radialGaugeLabel}>
        {progress.toFixed(1)}%
      </div>
    </div>
  );
}
```

---

## 4. Vertical Shipping Lane Timeline

A vertical lane visualizes the vessel's journey milestones (Fishing Grounds $\rightarrow$ Voyage $\rightarrow$ Port of Discharge).

### A. Layout Structure
We use a flex/grid split layout:
- **Left Column (width: 48px):** Contains the vertical SVG path representing the sea lane (dashed blue path with pulsing indicators).
- **Right Column (flex: 1):** Timeline card details (Waypoint, status, volume, ETA).

```
   (Start) [Anchor Icon]     --- Fishing Ground Departure
                 |
                 :  <-- Glowing Vertical Path
                 |
         [Ship Icon]         --- Active Voyage Position (Pulsing)
                 |
                 :
                 |
     (End) [Port Icon]       --- Port of Bangkok (Discharging)
```

### B. SVG Shipping Lane Path & Animation
The track is animated to look like sea currents flowing:
```xml
<svg width="40" height="300" viewBox="0 0 40 300" style="overflow: visible;">
  <defs>
    <linearGradient id="lane-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  </defs>

  <!-- Background path line -->
  <line x1="20" y1="10" x2="20" y2="290" stroke="rgba(255, 255, 255, 0.08)" stroke-width="4" stroke-linecap="round" />

  <!-- Active shipping lane route line -->
  <line x1="20" y1="10" x2="20" y2="220" 
        stroke="url(#lane-grad)" stroke-width="4" stroke-linecap="round"
        stroke-dasharray="8, 5" 
        style="animation: seaCurrent 15s linear infinite;" />
</svg>
```
**CSS Keyframe Animation:**
```css
@keyframes seaCurrent {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: -100;
  }
}
```

### C. Placing Ship / Anchor Icons
We absolute-position Lucide icons over the line nodes at proportional height offsets:
- **0% Height:** Anchor icon representing the fishing ground.
- **70% Height (Dynamic):** A ship icon placed dynamically based on current transit time or progress.
- **100% Height:** Factory/Port icon representing the cannery port of Bangkok.

---

## 5. Glassmorphism Design Tokens

To achieve a high-fidelity glassmorphic look that aligns with modern dashboard panels:

```css
/* Glassmorphism Panel Core Styles */
.glassPanel {
  background: linear-gradient(
    135deg, 
    rgba(15, 23, 42, 0.5) 0%, 
    rgba(30, 41, 59, 0.3) 100%
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.37),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glassPanel:hover {
  border-color: rgba(56, 189, 248, 0.2);
  box-shadow: 
    0 12px 40px 0 rgba(0, 0, 0, 0.45),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.08),
    0 0 15px 0 rgba(56, 189, 248, 0.05);
  transform: translateY(-2px);
}

/* Glassmorphism Inner Card (Nested panels) */
.glassCardInner {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 12px;
}
```

---

## 6. Verification Plan: Ensuring R3 Functional Preservation

R3 requires that upgraded features preserve all existing business logic, states, and data contracts.

### Step-by-Step Manual & Automated Checks

#### 1. Data Integrity and Merging Validation
* **Verification Action:** Inspect and assert that live API data and DB override logic behaves exactly as before.
* **Test Case:** Select `sein-phoenix`. Check if `totalReportedActive`, `actualTotal`, and `surplus` values match the static/DB baseline.
* **Check Formula:**
  - `percent = (actualTotal / reportedTotal) * 100`
  - `remainingTotal = reportedTotal - actualTotal`

#### 2. Vessel Selection State Retention
* **Verification Action:** Verify that clicking on a vessel card updates the `selectedVessel` state, re-renders the detailed timeline panel, updates the Recharts ComposedChart, and updates the new SVG Ship Hold schematic correctly.

#### 3. Interactive SVG and Chart Correspondence
* **Verification Action:** Hover over a specific compartment on the SVG Ship schematic (e.g. `#2-B`).
* **Expected Result:** Tooltip should display the parsed historical average temperature (e.g., `-22.5°C`) and the sum of volume unloaded from that compartment. Clicking it should highlight or filter the timeline logs to show only entries containing `#2-B`.

#### 4. Responsiveness and Mobile View (Scale Checks)
* **Verification Action:** Resize viewport to Mobile (e.g., width $< 768\text{px}$).
* **Expected Result:**
  - The SVG Ship silhouette scales down responsively without overflowing the panel bounds (`svg { width: 100%; height: auto; }` works with its `viewBox` settings).
  - Flex layout stacks columns vertically.

#### 5. Build and Dev Integration
* **Verification Action:** Execute `npm run build` locally.
* **Expected Result:** No TypeScript compiler errors, Next.js page generation succeeds, and assets load successfully.
