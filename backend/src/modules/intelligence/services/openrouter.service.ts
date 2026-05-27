import axios from 'axios';

const BASE = 'https://openrouter.ai/api/v1';

export interface AIProductAnalysis {
  detectedCategory: string;
  materials: Array<{
    name: string;
    estimatedQuantity: number;
    unit: string;
    confidence: number;
  }>;
  suggestedMold: string | null;
  complexityScore: number; // 1–10
  estimatedLaborHours: number; // active work only, exclude drying
  estimatedDryingHours: number;
  productionNotes: string;
  accuracyEstimate: number; // 60–95
}

const SYSTEM_PROMPT = `You are a manufacturing cost analyst for Indian handmade gifting products.

Analyze product images and return ONLY valid JSON. No markdown, no explanation.

Material names MUST match exactly from this list (pick closest):
Candle materials: Soy Wax, Paraffin Wax, Beeswax, Coconut Wax, Gel Wax, Cotton Wick, Wooden Wick, Glass Jar, Ceramic Jar, Tin Container, Fragrance Oil, Liquid Pigment, Glitter, Dried Flowers, Label Sticker, Dust Cover
Clay materials: Air Dry Clay, Polymer Clay, Resin Clay, Hook, Chain, Bead, Charm, Magnet, Ring, Acrylic Paint, Gloss Varnish, Resin Coating, Kraft Packaging, Bubble Wrap, Foam Insert

Return this exact JSON structure:
{
  "detectedCategory": "candle|clay|hamper|jewelry|home_decor|other",
  "materials": [
    { "name": "exact material name from list", "estimatedQuantity": number, "unit": "g|ml|pcs|set", "confidence": 0.0-1.0 }
  ],
  "suggestedMold": "mold name or null",
  "complexityScore": 1-10,
  "estimatedLaborHours": number,
  "estimatedDryingHours": number,
  "productionNotes": "one line",
  "accuracyEstimate": 60-95
}`;

export async function analyzeWithOpenRouter(
  imageBase64List: string[],
  hints: Record<string, any>,
  apiKey: string,
  model: string,
): Promise<AIProductAnalysis> {
  const hintText = [
    hints.approximateWeightGrams ? `Weight: ~${hints.approximateWeightGrams}g` : '',
    hints.dimensions ? `Dimensions: ${hints.dimensions}` : '',
    hints.complexityLevel ? `Complexity: ${hints.complexityLevel}` : '',
    hints.fragranceIntensity && hints.fragranceIntensity !== 'none'
      ? `Fragrance intensity: ${hints.fragranceIntensity}` : '',
    hints.materialHints ? `Material hints: ${hints.materialHints}` : '',
  ].filter(Boolean).join('\n');

  const userContent: any[] = [
    {
      type: 'text',
      text: `Analyze this handmade product for manufacturing cost estimation.${hintText ? `\n\nAdditional context:\n${hintText}` : ''}\n\nReturn only JSON.`,
    },
    ...imageBase64List.map((b64) => ({
      type: 'image_url',
      image_url: { url: b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}` },
    })),
  ];

  const response = await axios.post(
    `${BASE}/chat/completions`,
    {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      max_tokens: 1200,
      temperature: 0.05,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://elva.in',
        'X-Title': 'ELUNORA Product Intelligence',
      },
      timeout: 60000,
    },
  );

  const raw: string = response.data.choices[0].message.content ?? '';

  // Extract JSON — model may wrap in backtick blocks
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`AI returned non-JSON: ${raw.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]) as AIProductAnalysis;
  return parsed;
}
