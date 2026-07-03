import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export const revalidate = 0; // Live simulation

export async function GET() {
  try {
    // Read base JSON structure
    const jsonDirectory = path.join(process.cwd(), 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/carrot_w1_hegemony.json', 'utf8');
    const baseData = JSON.parse(fileContents);
    
    // Apply live dynamic perturbation to simulate KAMIS real-time fluctuations
    const perturbedData = baseData.map((row: any) => {
      const isSummer = row.month === "7월" || row.month === "9월";
      
      // High volatility in summer (domestic), low volatility for Vietnam
      const domesticVariance = isSummer ? (Math.random() * 400 - 200) : (Math.random() * 100 - 50);
      const vietnamVariance = Math.random() * 20 - 10;
      
      const domesticKey = Object.keys(row).find(k => k.startsWith("한국"));
      if (domesticKey) {
        row[domesticKey] = Math.max(0, Math.round(row[domesticKey] + domesticVariance));
      }
      
      if (row["베트남(달랏)"]) {
        row["베트남(달랏)"] = Math.max(0, Math.round(row["베트남(달랏)"] + vietnamVariance));
      }
      
      return row;
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      source: "KAMIS x KCS Hybrid (Live Sim)",
      data: perturbedData
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch W1 spread data" }, { status: 500 });
  }
}
