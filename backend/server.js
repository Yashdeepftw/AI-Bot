require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./db/db');
// const { invokeGeminiAi } = require('./services/ai.service');
const { invokeOpenRouterAi } = require('./services/openrouter.service');

connectDB();
// invokeGeminiAi();
invokeOpenRouterAi();
app.listen(3000, () => {
    console.log("server is running on port number 3000");
})