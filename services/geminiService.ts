
import { GoogleGenAI } from "@google/genai";

/**
 * Generates an absurd reason for blocking a service using Gemini.
 */
export async function generateBlockReason(appName: string): Promise<string> {
  try {
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    // Create a new instance right before making an API call to ensure it uses the current key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Use ai.models.generateContent to query GenAI with the model name and prompt.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Напиши одну очень короткую (до 10 слов) смешную и абсурдную причину блокировки сервиса "${appName}". Используй сухой канцелярский язык.`,
      config: {
        temperature: 0.9
      }
    });

    // The GenerateContentResponse features a .text property, not a method.
    return response.text || "Причина засекречена по приказу высшего руководства.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Слишком много свободы слова в данном сегменте сети.";
  }
}
