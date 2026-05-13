import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    // Simulated World Bank / DFI Green Finance Data
    // In production, fetch from World Bank API / IMF data
    
    const response = {
      timestamp: new Date().toISOString(),
      source: "World Bank / DFI Syndicate",
      region: "Sub-Saharan Africa (Nigeria)",
      rates: {
        localCommercialRate: 28.5, // High local inflation/risk rate
        dfiGuaranteedRate: 7.5,    // Standard DFI backed loan
        esgSllRate: 4.2            // Sustainability Linked Loan (SLL) with Zero-Waste targets
      },
      spreads: {
        commercialVsEsg: 24.3
      },
      apiStatus: {
        WorldBank: "active"
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch DFI Finance data" }, { status: 500 });
  }
}
