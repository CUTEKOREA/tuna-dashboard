import { NextResponse } from 'next/server';
import { getCachedData } from '../../../../lib/cache';

export const revalidate = 86400;

// Shrimp ESG & Labor Compliance Radar API (V2.0)
// Static policy snapshot aligned with the KMI labor-compliance framework.
// Aligned with: (일반 2025-04) 수산업 강제노동 규범화 대응체계 구축연구

export async function GET() {
  try {
    const data = await getCachedData('shrimp_esg_radar', async () => {
      return {
        timestamp: new Date().toISOString(),
        source: "ESG Radar (Fallback/Estimated)",
        methodology: "KMI 수산업 강제노동 규범화 대응 프레임 + ILO C188 + UFLPA",
        forcedLaborRiskMap: [
          { country: "Thailand", flag: "🇹🇭", riskScore: 85, riskLevel: "Critical", keyIssues: ["ILO C188 미비준", "이주노동자 착취"], peelingShedRisk: "Very High" },
          { country: "India", flag: "🇮🇳", riskScore: 65, riskLevel: "High", keyIssues: ["아동노동 보고", "항생제 남용"], peelingShedRisk: "High" },
          { country: "Vietnam", flag: "🇻🇳", riskScore: 40, riskLevel: "Moderate", keyIssues: ["ASC 인증 확대 중"], peelingShedRisk: "Low" },
          { country: "Ecuador", flag: "🇪🇨", riskScore: 25, riskLevel: "Low", keyIssues: ["대규모 기업형 양식"], peelingShedRisk: "Very Low" },
          { country: "Indonesia", flag: "🇮🇩", riskScore: 55, riskLevel: "Moderate-High", keyIssues: ["맹그로브 파괴 심각"], peelingShedRisk: "Medium" }
        ],
        mangroveDestructionIndex: [
          { country: "Indonesia", lossPercent: 19.1, primaryCause: "새우 양식장 전용" },
          { country: "Vietnam", lossPercent: 16.1, primaryCause: "양식+도시화" },
          { country: "Ecuador", lossPercent: 8.9, primaryCause: "양식장 확대" },
          { country: "Thailand", lossPercent: 5.7, primaryCause: "과거 양식, 현재 복원 중" }
        ],
        certificationTracker: [
          { cert: "ASC", globalCoverage: 12, topCountry: "Vietnam (28%)", trend: "↑" },
          { cert: "BAP", globalCoverage: 18, topCountry: "Ecuador (35%)", trend: "→" },
          { cert: "GlobalG.A.P.", globalCoverage: 8, topCountry: "Thailand (22%)", trend: "→" },
          { cert: "Organic", globalCoverage: 2, topCountry: "India (4%)", trend: "↑" }
        ]
      };
    }, 86400);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch ESG radar data" }, { status: 500 });
  }
}
