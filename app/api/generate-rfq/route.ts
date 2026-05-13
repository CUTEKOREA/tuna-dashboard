import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { supplier, query } = await req.json();

    // Ensure we have the necessary data
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier information is required.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Build the system prompt
    const systemPrompt = `You are an expert procurement officer for Silla Co., a major South Korean food & seafood importer.
Write a highly professional, persuasive B2B Request for Quotation (RFQ) email to a supplier.
Supplier Info:
Name: ${supplier.name}
Country: ${supplier.country}
Products: ${supplier.products}
Trust Score: ${supplier.trust}/100

User's Search Query Context: ${query || 'General sourcing'}

The email should:
1. Introduce Silla Co. as a strong potential long-term partner.
2. Highlight that we noticed their strong export record in ${supplier.country}.
3. Ask for FOB pricing, minimum order quantities (MOQ), and lead times to Busan Port, Korea.
4. Keep it concise, formal, and structured.
Do not use placeholders like [Your Name]. Sign off as "Silla Co. Procurement Team".`;

    if (apiKey) {
      // Use OpenAI API if available
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // or gpt-3.5-turbo
          messages: [
            { role: 'system', content: systemPrompt }
          ],
          temperature: 0.7,
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rfqText = data.choices[0].message.content;
        return NextResponse.json({ rfq: rfqText });
      } else {
        console.warn('OpenAI API request failed, falling back to smart template.');
      }
    }

    // Fallback: Advanced Template (Smart Mock)
    const productTarget = query ? query.toUpperCase() : supplier.products.split(',')[0];
    
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    const smartTemplate = `Subject: URGENT: Request for Quotation (RFQ) - ${productTarget}

Dear Sales Director at ${supplier.name},

I hope this email finds you well. 

We are the Procurement Team at Silla Co., a leading food processing and trading enterprise based in South Korea. We are currently actively expanding our reliable supplier network for high-quality ${productTarget} and related commodities. 

Our data systems (Trademo Intel) highlighted your company's impressive export records and strong market presence in ${supplier.country}. Given your excellent vendor trust score (${supplier.trust}/100), we are highly interested in establishing a strategic, long-term supply partnership with you.

Could you please provide us with your best commercial terms for ${productTarget}? Specifically, we require:
1. Best FOB ${supplier.country} Pricing (per MT)
2. Detailed Product Specifications / Quality Certificates
3. Minimum Order Quantity (MOQ)
4. Estimated Lead Time for delivery to Busan Port, South Korea
5. Standard Payment Terms

We anticipate an initial trial order of 1-2 FCLs, with the potential to quickly scale to 10+ FCLs monthly based on quality and pricing competitiveness.

We look forward to receiving your prompt response and catalog.

Best regards,

Procurement Team
Silla Co., Ltd.
Seoul, South Korea
`;

    return NextResponse.json({ rfq: smartTemplate });

  } catch (error) {
    console.error('Error generating RFQ:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
