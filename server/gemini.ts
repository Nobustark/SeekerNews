// The FINAL, COMPLETE, and ROBUST code for server/gemini.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

// We will NOT initialize the client here. We'll do it "lazily" inside the functions.
let genAI: GoogleGenerativeAI | null = null;

function getClient() {
  // This function will run only when an AI feature is requested.
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // If the key is missing, we throw an error that our functions can catch.
      // This will NOT crash the server.
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function generateSummary(content: string): Promise<string> {
  try {
    const ai = getClient();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash"});
    const prompt = `Please create a concise summary (1-2 sentences, max 150 characters) for this article content:\n\n${content}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Error generating summary:", error);
    return "AI summary could not be generated at this time.";
  }
}

export async function generateTitle(content: string): Promise<string> {
  try {
    const ai = getClient();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash"});
    const prompt = `Based on this article content, give me a compelling news headline, just give me the title only with no added extra text (max 80 characters):\n\n${content.substring(0, 1000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Error generating title:", error);
    return "AI title could not be generated at this time.";
  }
}

export async function generateTags(content: string): Promise<string[]> {
  try {
    const ai = getClient();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash"});
    const prompt = `Generate 3-5 relevant tags for this article content. Return only a single line of comma-separated tags:\n\n${content.substring(0, 1000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tagsText = response.text();
    return tagsText.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0).slice(0, 5);
    
  } catch (error) {
    console.error("Error generating tags:", error);
    return [];
  }
}