import { NextResponse } from 'next/server';

export const revalidate = 0; 

export async function GET() {
  try {
    const now = new Date();
    
    // Simulate TRQ exhaustion based on the current month/day
    // Assuming 50,000 MT total. Starts at 0 in Jan, hits 100% near Oct.
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysPassed = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    
    const totalQuota_MT = 50000;
    
    // Base daily consumption ~ 140 MT + random noise
    const baseConsumption = daysPassed * 145;
    const noise = Math.floor(Math.random() * 2000) - 1000;
    
    let consumed_MT = baseConsumption + noise;
    if (consumed_MT < 0) consumed_MT = 0;
    if (consumed_MT > totalQuota_MT) consumed_MT = totalQuota_MT;
    
    const remaining_MT = totalQuota_MT - consumed_MT;
    const exhaustionRate_percent = +( (consumed_MT / totalQuota_MT) * 100 ).toFixed(1);

    let alertLevel = "INFO";
    let alertMessage = "TRQ remaining volume is stable.";

    if (exhaustionRate_percent >= 95) {
      alertLevel = "CRITICAL";
      alertMessage = "TRQ nearly exhausted. Immediate switch to FTA-origin (Vietnam) required to avoid 30% tariff.";
    } else if (exhaustionRate_percent >= 80) {
      alertLevel = "WARNING";
      alertMessage = `TRQ exhaustion at ${exhaustionRate_percent}%. High risk of reverting to 30% out-of-quota tariff.`;
    }

    const response = {
      timestamp: now.toISOString(),
      itemCode: "0706101000",
      itemName: "Carrots (Fresh or Chilled)",
      trqStatus: {
        totalQuota_MT,
        consumed_MT: Math.floor(consumed_MT),
        remaining_MT: Math.floor(remaining_MT),
        exhaustionRate_percent
      },
      alerts: [
        { level: alertLevel, message: alertMessage }
      ],
      apiStatus: {
        KCS: "active_live_sim"
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch TRQ data" }, { status: 500 });
  }
}
