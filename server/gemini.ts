import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateSummary(content: string): Promise<string> {
  try {
    const prompt = `Please create a concise summary (1-2 sentences, max 150 characters) for this article content:\n\n${content}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    return response.text || "Summary could not be generated";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Summary could not be generated";
  }
}

export async function generateTitle(content: string): Promise<string> {
  try {
    const prompt = `Based on this article content, suggest a compelling news headline (max 80 characters):\n\n${content.substring(0, 500)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", 
      contents: prompt,
    });

    return response.text || "Title could not be generated";
  } catch (error) {
    console.error("Error generating title:", error);
    return "Title could not be generated";
  }
}

export async function generateTags(content: string): Promise<string[]> {
  try {
    const prompt = `Generate 3-5 relevant tags for this article content. Return only comma-separated tags:\n\n${content.substring(0, 500)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    const tagsText = response.text || "";
    return tagsText.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0).slice(0, 5);
  } catch (error) {
    console.error("Error generating tags:", error);
    return [];
  }
}