const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

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

  // Helper function to call API with model fallback
  const callGemini = async (modelName) => {
    return await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
  };

  try {
    // 1. Try with stable gemini-2.5-flash model
    const response = await callGemini('gemini-2.5-flash');
    return response.text;
  } catch (error) {
    console.warn('Primary model failed/busy, trying fallback model...', error.message);
    
    try {
      // 2. Fallback to gemini-1.5-pro if flash model is busy (503)
      const fallbackResponse = await callGemini('gemini-1.5-pro');
      return fallbackResponse.text;
    } catch (fallbackError) {
      console.error('Error generating review:', fallbackError);
      throw fallbackError;
    }
  }
}

module.exports = generateReview;