import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const modifyHtmlWithAI = async (currentHtml: string, instruction: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure your API key.");
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are an expert Frontend Developer.
      
      Task: Modify or Generate HTML based on the user's instruction.
      
      Current HTML Context:
      \`\`\`html
      ${currentHtml}
      \`\`\`
      
      User Instruction: "${instruction}"
      
      Requirements:
      1. Return ONLY the valid HTML code. 
      2. Do not wrap the output in markdown code blocks (e.g., no \`\`\`html).
      3. If the user asks for a new page, ignore the context and generate new HTML.
      4. Ensure the HTML is complete (includes <html>, <head>, <body> tags if it's a full page context, or just the component if the context was partial).
      5. Use modern styling (Tailwind CSS or inline styles) if asked to style.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    let text = response.text || '';
    
    // Cleanup markdown if the model accidentally includes it
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process HTML with AI.");
  }
};
