const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

// Fix: exact variable name 'GEMINI_API_KEY' pass karein
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateReview(code) {
  const prompt = `
  You are an expert code reviewer. Analyze the following code snippet and provide feedback in the following structured format:

  1. **Bugs & Issues**: Identify any syntax errors, logical bugs, or edge cases.
  2. **Performance & Security**: Mention inefficiencies or vulnerability risks.
  3. **Code Quality**: Readability and best practice improvements.
  4. **Improved Code**: Provide clean, corrected, and optimized code inside a code block.

  Code to Review:
  \`\`\`
  ${code}
  \`\`\`
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });

  return response.text;
}

module.exports = generateReview;