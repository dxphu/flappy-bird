
import { GoogleGenAI } from "@google/genai";

export const getCommentary = async (score: number): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The player just finished a Flappy Bird game with a score of ${score}. 
      Give a very short, witty, and slightly snarky comment in Vietnamese (max 15 words) about their performance. 
      If the score is 0, be extra sarcastic. If it's high (over 20), be impressed.`,
      config: {
        temperature: 0.8,
      }
    });
    return response.text || "Game over!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Cố gắng hơn lần sau nhé!";
  }
};
