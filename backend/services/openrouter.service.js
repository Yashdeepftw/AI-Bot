const axios = require('axios');
const { z } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openrouter/elephant-alpha';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY2;

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
}).passthrough();

async function callOpenRouter(prompt) {
    if (!OPENROUTER_API_KEY) {
        throw new Error('Missing OpenRouter API key. Set OPENROUTER_API_KEY in your environment.');
    }

    const response = await axios.post(
        OPENROUTER_API_URL,
        {
            model: OPENROUTER_MODEL,
            messages: [{ role: 'user', content: prompt }]
        },
        {
            headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('Empty response content from OpenRouter.');
    }

    return content;
}

function extractFirstJsonObject(text) {
    const start = text.indexOf('{');
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < text.length; i++) {
        const ch = text[i];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (ch === '\\') {
                escaped = true;
            } else if (ch === '"') {
                inString = false;
            }
            continue;
        }

        if (ch === '"') {
            inString = true;
            continue;
        }

        if (ch === '{') depth++;
        if (ch === '}') {
            depth--;
            if (depth === 0) {
                return text.slice(start, i + 1);
            }
        }
    }

    return null;
}

function parseInterviewReportJson(reportText) {
    const candidates = [];
    const fencedMatch = reportText.match(/```json\s*([\s\S]*?)\s*```/i);

    if (fencedMatch?.[1]) candidates.push(fencedMatch[1].trim());
    candidates.push(reportText.trim());

    const extracted = extractFirstJsonObject(reportText);
    if (extracted) candidates.push(extracted);

    for (const candidate of candidates) {
        try {
            return JSON.parse(candidate);
        } catch (err) {
            // Try next candidate
        }
    }

    throw new Error('AI response is not valid JSON. Please retry.');
}

async function invokeOpenRouterAi() {
    const content = await callOpenRouter('hey');
    console.log(content);
}

async function generateInterviewReportOpenRouter({ resume, selfDescription, jobDescription }) {
    const prompt = `You are an expert career coach. You have been given a candidate's resume, self-description and a job description. Based on these inputs, you need to generate an interview report for the candidate. The interview report should include the following sections:
        1. Match Score: A score between 0 and 100 indicating how well the candidate's resume and self-description match the job description.
        2. Technical Questions: A list of technical questions that can be asked in the interview along with their intention and how to answer them.
        3. Behavioral Questions: A list of behavioral questions that can be asked in the interview along with their intention and how to answer them.
        4. Skill Gaps: A list of skill gaps that the candidate needs to work on before the interview along with their severity (low, medium, high).
        5. Preparation Plan: A day-wise preparation plan for the candidate to prepare for the interview.
        
        The response should be in JSON format and should follow the schema defined below:
        
        ${JSON.stringify(zodToJsonSchema(interviewReportSchema))}
        
        IMPORTANT:
        - Return ONLY valid JSON.
        - Do not wrap JSON in markdown or code fences.
        - Do not add any explanation text before or after JSON.
        
        Here are the inputs:
        Resume: ${resume}
        Self-description: ${selfDescription}
        Job Description: ${jobDescription}
        `;

    const reportText = await callOpenRouter(prompt);
    let report = parseInterviewReportJson(reportText);

    // Extract nested report object if it exists (try multiple possible names)
    if (report.interview_report) {
        report = report.interview_report;
    } else if (report.interviewReport) {
        report = report.interviewReport;
    }

    const validation = interviewReportSchema.safeParse(report);
    if (!validation.success) {
        const errors = validation.error.flatten();
        console.error('Validation errors:', JSON.stringify(errors, null, 2));
        console.error('Received report keys:', Object.keys(report));
        throw new Error(`Schema validation failed: ${JSON.stringify(errors.fieldErrors)}`);
    }

    return validation.data;
}

module.exports = { invokeOpenRouterAi, generateInterviewReportOpenRouter };
