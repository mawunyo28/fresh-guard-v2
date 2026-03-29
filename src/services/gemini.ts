import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  return process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');
};

export const hasAIKey = async () => {
  if (process.env.GEMINI_API_KEY) return true;
  if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return false;
};

export const openAIKeySelector = async () => {
  if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
    await (window as any).aistudio.openSelectKey();
    return true;
  }
  return false;
};

export interface SpoilageAnalysis {
  daysUntilSpoilt: number;
  confidence: number;
  reasoning: string;
  recommendations: string[];
}

export async function analyzeFruitSpoilage(base64Image: string): Promise<SpoilageAnalysis> {
  const apiKey = getApiKey();
  if (!apiKey) {
    const hasKey = await hasAIKey();
    if (!hasKey) {
      throw new Error("AI API Key not found. Please connect your API key.");
    }
  }

  const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY! });
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this image of a fruit. 
    1. Identify the fruit.
    2. Estimate how many days it has before it starts to spoil significantly.
    3. Provide a confidence score (0-1).
    4. Explain the reasoning based on visual cues (spots, color, texture).
    5. Give 3 recommendations to prolong its freshness.
    
    Return the response in JSON format with the following schema:
    {
      "daysUntilSpoilt": number,
      "confidence": number,
      "reasoning": "string",
      "recommendations": ["string", "string", "string"]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return {
      daysUntilSpoilt: result.daysUntilSpoilt || 0,
      confidence: result.confidence || 0,
      reasoning: result.reasoning || "Unable to analyze image.",
      recommendations: result.recommendations || [],
    };
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to analyze image.");
  }
}
