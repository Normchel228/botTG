
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateBlockReason(appName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Напиши одну короткую смешную бюрократическую причину, почему сервис "${appName}" нужно заблокировать или замедлить в России. Стиль: сухой чиновничий язык с абсурдным уклоном. Не более 15 слов.`,
      config: {
        temperature: 1,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Выявлено нарушение протоколов здравого смысла.";
  } catch (error) {
    console.error("Gemini error:", error);
    return "Обнаружены признаки деструктивного влияния на атмосферное давление.";
  }
}
