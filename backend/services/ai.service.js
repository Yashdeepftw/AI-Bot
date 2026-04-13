const { GoogleGenerativeAI } = require('@google/generative-ai');
const { z } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema');

const genAI = new GoogleGenerativeAI(process.env.KEY1);

async function invokeGeminiAi() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Higher limits
    const result = await model.generateContent("Explain how AI works in a few words");
    console.log(result.response.text());
}

const interviewReportSchema = z.object({
    // Accept both camelCase and snake_case for flexibility
    matchScore: z.number().optional(),
    match_score: z.number().optional(),
    technicalQuestions: z.array(z.any()).optional(),
    technical_questions: z.array(z.any()).optional(),
    behavioralQuestions: z.array(z.any()).optional(),
    behavioral_questions: z.array(z.any()).optional(),
    skillGaps: z.array(z.any()).optional(),
    skill_gaps: z.array(z.any()).optional(),
    preparationPlan: z.any().optional(),
    preparation_plan: z.any().optional(),
    $schema: z.string().optional(),
    reportTitle: z.string().optional(),
    candidateName: z.string().optional(),
    jobTitle: z.string().optional()
}).passthrough()

async function generateInterviewReport ({ resume, selfDescription, jobDescription }) {
    const response = await genAI.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent(`You are an expert career coach. You have been given a candidate's resume, self-description and a job description. Based on these inputs, you need to generate an interview report for the candidate. The interview report should include the following sections:
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
    let report = JSON.parse(jsonString);
    
    // Extract nested report object if it exists (try multiple possible names)
    if (report.interview_report) {
        report = report.interview_report;
    } else if (report.interviewReport) {
        report = report.interviewReport;
    }
    
    const validation = interviewReportSchema.safeParse(report);
    if (!validation.success) {
        const errors = validation.error.flatten();
        console.error("Validation errors:", JSON.stringify(errors, null, 2));
        console.error("Received report keys:", Object.keys(report));
        throw new Error(`Schema validation failed: ${JSON.stringify(errors.fieldErrors)}`);
    }
    return validation.data;
}

module.exports = { invokeGeminiAi, generateInterviewReport };