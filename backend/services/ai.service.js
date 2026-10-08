const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

  const callGemini = async (modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  };

  try {
    // 1. Primary Model
    const text = await callGemini('gemini-2.5-flash');
    return text;
  } catch (error) {
    console.warn('Primary model failed, trying fallback...', error.message);
    
    try {
      // 2. Fallback Model
      const fallbackText = await callGemini('gemini-2.0-flash');
      return fallbackText;
    } catch (fallbackError) {
      console.error('Error generating review:', fallbackError);
      throw fallbackError;
    }
  }
}

module.exports = generateReview;