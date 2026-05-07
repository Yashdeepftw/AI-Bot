const { GoogleGenerativeAI } = require('@google/generative-ai');
const { z } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema');

const genAI = new GoogleGenerativeAI(process.env.KEY1);

async function invokeGeminiAi() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Higher limits
    const result = await model.generateContent("Explain how AI works in a few words");
    console.log(result.response.text());
}

const questionSchema = z.object({
    question: z.string().min(1),
    intention: z.string().min(1),
    answer: z.string().min(1)
});

const skillGapSchema = z.object({
    skill: z.string().min(1),
    severity: z.enum(['low', 'medium', 'high'])
});

const preparationPlanItemSchema = z.object({
    day: z.number().int().positive(),
    focus: z.string().min(1),
    tasks: z.array(z.string().min(1)).min(1)
});

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100),
    technicalQuestions: z.array(questionSchema).min(3),
    behavioralQuestions: z.array(questionSchema).min(3),
    skillGaps: z.array(skillGapSchema).min(1),
    preparationPlan: z.array(preparationPlanItemSchema).min(3)
});

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
            // Try next parse candidate
        }
    }

    throw new Error('AI response is not valid JSON. Please retry.');
}

function normalizeInterviewReport(report) {
    const source = report?.interview_report || report?.interviewReport || report || {};
    const scoreRaw = source.matchScore ?? source.match_score ?? source.score;
    const parsedScore = typeof scoreRaw === 'number'
        ? scoreRaw
        : Number(String(scoreRaw ?? '').match(/\d+(\.\d+)?/)?.[0]);

    const toArray = (value) => {
        if (Array.isArray(value)) return value;
        if (value && typeof value === 'object') return Object.values(value);
        return [];
    };

    const pickString = (obj, keys) => {
        for (const key of keys) {
            const value = obj?.[key];
            if (typeof value === 'string' && value.trim()) return value.trim();
        }
        return '';
    };

    const normalizeQuestions = (input) => toArray(input)
        .map((item) => {
            if (typeof item === 'string') {
                const q = item.trim();
                if (!q) return null;
                return {
                    question: q,
                    intention: 'Assess practical understanding of this topic.',
                    answer: 'Explain concepts clearly, then support with a relevant example.'
                };
            }

            if (!item || typeof item !== 'object') return null;

            const question = pickString(item, ['question', 'prompt', 'q', 'title']);
            const intention = pickString(item, ['intention', 'intent', 'whyAsked', 'purpose', 'objective']);
            const answer = pickString(item, ['answer', 'sampleAnswer', 'howToAnswer', 'approach', 'guidance']);

            if (!question || !intention || !answer) return null;
            return { question, intention, answer };
        })
        .filter(Boolean);

    const normalizeSkillGaps = (input) => toArray(input)
        .map((item) => {
            if (!item || typeof item !== 'object') return null;

            const skill = pickString(item, ['skill', 'name', 'gap', 'topic']);
            const rawSeverity = pickString(item, ['severity', 'priority', 'level']);
            const severity = ['low', 'medium', 'high'].includes(rawSeverity.toLowerCase())
                ? rawSeverity.toLowerCase()
                : 'medium';

            if (!skill) return null;
            return { skill, severity };
        })
        .filter(Boolean);

    const parseDay = (value, fallbackIndex) => {
        if (typeof value === 'number' && value > 0) return Math.floor(value);
        const fromText = Number(String(value ?? '').match(/\d+/)?.[0]);
        if (fromText > 0) return fromText;
        return fallbackIndex + 1;
    };

    const normalizeTasks = (value) => {
        if (Array.isArray(value)) {
            return value.map((task) => String(task).trim()).filter(Boolean);
        }
        if (typeof value === 'string') {
            return value
                .split(/\n|;|\./)
                .map((task) => task.trim())
                .filter(Boolean);
        }
        return [];
    };

    const normalizePreparationPlan = (input) => toArray(input)
        .map((item, index) => {
            if (typeof item === 'string') {
                const focus = item.trim();
                if (!focus) return null;
                return {
                    day: index + 1,
                    focus,
                    tasks: ['Revise key concepts', 'Practice interview-ready explanation']
                };
            }

            if (!item || typeof item !== 'object') return null;

            const day = parseDay(item.day ?? item.dayNumber ?? item.day_no ?? item.title, index);
            const focus = pickString(item, ['focus', 'topic', 'goal', 'title']);
            const tasks = normalizeTasks(item.tasks ?? item.steps ?? item.items ?? item.plan);

            if (!focus || tasks.length === 0) return null;
            return { day, focus, tasks };
        })
        .filter(Boolean);

    const ensureMinimumPreparationPlan = (planItems) => {
        const normalized = [...planItems];
        while (normalized.length < 3) {
            const day = normalized.length + 1;
            normalized.push({
                day,
                focus: `Interview preparation day ${day}`,
                tasks: [
                    'Review job description and required skills',
                    'Practice concise answers for likely interview questions'
                ]
            });
        }
        return normalized;
    };

    const preparationPlan = ensureMinimumPreparationPlan(
        normalizePreparationPlan(source.preparationPlan ?? source.preparation_plan ?? source.preprationPlan)
    );

    return {
        matchScore: Number.isFinite(parsedScore) ? parsedScore : undefined,
        technicalQuestions: normalizeQuestions(source.technicalQuestions ?? source.technical_questions),
        behavioralQuestions: normalizeQuestions(source.behavioralQuestions ?? source.behavioral_questions),
        skillGaps: normalizeSkillGaps(source.skillGaps ?? source.skill_gaps),
        preparationPlan
    };
}

async function generateInterviewReport ({ resume, selfDescription, jobDescription }) {
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
        - Do not wrap JSON in markdown/code fences.
        - matchScore must be a number between 0 and 100.
        - technicalQuestions must contain at least 3 objects.
        - behavioralQuestions must contain at least 3 objects.
        - skillGaps must contain at least 1 object.
        - preparationPlan must contain at least 3 day-wise objects.
        - No field can be null or an empty array.
        
        Here are the inputs:
        Resume: ${resume}
        Self-description: ${selfDescription}
        Job Description: ${jobDescription}
        `;

    const response = await genAI.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent(prompt);
    const reportText = response.response.text();
    const parsed = parseInterviewReportJson(reportText);
    const normalized = normalizeInterviewReport(parsed);
    const validation = interviewReportSchema.safeParse(normalized);

    if (!validation.success) {
        const errors = validation.error.flatten();
        throw new Error(`Schema validation failed: ${JSON.stringify(errors.fieldErrors)}`);
    }

    return validation.data;
}

module.exports = { invokeGeminiAi, generateInterviewReport };