import { GoogleGenAI } from "@google/genai"

const API_KEY = process.env.GEMINI_API_KEY!

async function runChat(prompt: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY })

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    })

    return response.text
  } catch (error) {
    console.error("Gemini API error:", error)
    throw new Error("Failed to generate response from Gemini")
  }
}

export default runChat
