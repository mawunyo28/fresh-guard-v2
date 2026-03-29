import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  return process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');
};

export const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeFoodFreshness = async (foodName: string, notes: string = '') => {
  const ai = getAI();
  if (!ai) throw new Error("AI not configured. Please connect your API key.");

  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the freshness and provide storage tips for: ${foodName}. ${notes ? `Additional notes: ${notes}` : ''}. 
    Provide the response in JSON format with fields: "status" (fresh/warning/critical), "tips" (string), "recipeSuggestion" (string).`,
    config: {
      responseMimeType: "application/json",
    }
  });

  const response = await model;
  return JSON.parse(response.text);
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
