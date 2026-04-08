const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function invokeGeminiAi() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Explain how AI works in a few words");
    console.log(result.response.text());
}

module.exports = invokeGeminiAi;