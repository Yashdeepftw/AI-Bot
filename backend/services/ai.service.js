const { GoogleGenerativeAI } = require('@google/generative-ai');
const { z } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema');

const genAI = new GoogleGenerativeAI(process.env.KEY2);

async function invokeGeminiAi() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); // Higher limits
    const result = await model.generateContent("Explain how AI works in a few words");
    console.log(result.response.text());
}

const interviewReportSchema = z.object({
    match_score: z.number().describe("Match score between 0-100"),
    technical_questions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        how_to_answer: z.string()
    })),
    behavioral_questions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        how_to_answer: z.string()
    })),
    skill_gaps: z.array(z.object({
        skill: z.string(),
        severity: z.string(),
        reason: z.string().optional()
    })),
    preparation_plan: z.array(z.object({
        day: z.string(),
        focus: z.string().optional(),
        activities: z.array(z.string()).optional(),
        tasks: z.array(z.string()).optional()
    }))
})

async function generateInterviewReport ({ resume, selfDescription, jobDescription }) {
    const response = await genAI.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent(`You are an expert career coach. You have been given a candidate's resume, self-description and a job description. Based on these inputs, you need to generate an interview report for the candidate. The interview report should include the following sections:
        1. Match Score: A score between 0 and 100 indicating how well the candidate's resume and self-description match the job description.
        2. Technical Questions: A list of technical questions that can be asked in the interview along with their intention and how to answer them.
        3. Behavioral Questions: A list of behavioral questions that can be asked in the interview along with their intention and how to answer them.
        4. Skill Gaps: A list of skill gaps that the candidate needs to work on before the interview along with their severity (low, medium, high).
        5. Preparation Plan: A day-wise preparation plan for the candidate to prepare for the interview.
        
        The response should be in JSON format and should follow the schema defined below:
        
        ${JSON.stringify(zodToJsonSchema(interviewReportSchema))}
        
        Here are the inputs:
        Resume: ${resume}
        Self-description: ${selfDescription}
        Job Description: ${jobDescription}
        `);

    const reportText = response.response.text();
    const jsonMatch = reportText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : reportText;
    const report = JSON.parse(jsonString);
    const validation = interviewReportSchema.safeParse(report);
    if (!validation.success) {
        console.error("Validation errors:", validation.error.errors);
        console.error("Received report:", JSON.stringify(report, null, 2));
        throw new Error("Generated report does not match the expected schema");
    }
    return validation.data;
}

module.exports = { invokeGeminiAi, generateInterviewReport };