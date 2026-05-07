const axios = require('axios');
const { z } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openai/gpt-oss-120b:free';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY2;

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
    title: z.string().min(1),
    matchScore: z.number().min(0).max(100),
    technicalQuestions: z.array(questionSchema).min(3),
    behavioralQuestions: z.array(questionSchema).min(3),
    skillGaps: z.array(skillGapSchema).min(1),
    preparationPlan: z.array(preparationPlanItemSchema).min(3)
});

async function callOpenRouter(prompt) {
    if (!OPENROUTER_API_KEY) {
        throw new Error('Missing OpenRouter API key. Set OPENROUTER_API_KEY in your environment.');
    }

    const response = await axios.post(
        OPENROUTER_API_URL,
        {
            model: OPENROUTER_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 8192
        },
        {
            headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const rawContent = response?.data?.choices?.[0]?.message?.content
        ?? response?.data?.choices?.[0]?.text;
    const content = normalizeOpenRouterContent(rawContent);
    if (!content) {
        throw new Error('Empty response content from OpenRouter.');
    }

    return content;
}

async function generateInterviewReportWithRetry(prompts, maxAttempts = 2) {
    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const prompt = prompts[Math.min(attempt, prompts.length - 1)];
        try {
            const reportText = await callOpenRouter(prompt);
            return parseInterviewReportJson(reportText);
        } catch (err) {
            lastError = err;
        }
    }

    throw lastError ?? new Error('Failed to parse interview report JSON.');
}

function normalizeOpenRouterContent(content) {
    if (typeof content === 'string') return content;

    if (Array.isArray(content)) {
        return content
            .map((part) => {
                if (typeof part === 'string') return part;
                if (!part || typeof part !== 'object') return '';
                if (typeof part.text === 'string') return part.text;
                if (typeof part.content === 'string') return part.content;
                return '';
            })
            .join('\n')
            .trim();
    }

    if (content && typeof content === 'object') {
        if (typeof content.text === 'string') return content.text;
        if (typeof content.content === 'string') return content.content;
    }

    return '';
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

function sanitizeJsonCandidate(text) {
    if (typeof text !== 'string') return '';

    return text
        .replace(/^\uFEFF/, '')
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .trim();
}

function stripTrailingCommas(jsonLike) {
    return jsonLike.replace(/,\s*([}\]])/g, '$1');
}

function quoteUnquotedKeys(jsonLike) {
    return jsonLike.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3');
}

function normalizeSingleQuotedStrings(jsonLike) {
    return jsonLike.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (match, group) => {
        const escaped = group.replace(/"/g, '\\"');
        return `"${escaped}"`;
    });
}

function closeOpenJsonStructures(jsonLike) {
    const stack = [];
    let inString = false;
    let escaped = false;

    for (let i = 0; i < jsonLike.length; i++) {
        const ch = jsonLike[i];

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

        if (ch === '{' || ch === '[') {
            stack.push(ch);
            continue;
        }

        if (ch === '}' || ch === ']') {
            const top = stack[stack.length - 1];
            const matches = (top === '{' && ch === '}') || (top === '[' && ch === ']');
            if (matches) stack.pop();
        }
    }

    if (inString) jsonLike += '"';
    while (stack.length) {
        const open = stack.pop();
        jsonLike += open === '{' ? '}' : ']';
    }

    return jsonLike;
}

function tryParseJsonVariants(candidate) {
    const sanitized = sanitizeJsonCandidate(candidate);
    if (!sanitized) return null;

    const variants = [
        sanitized,
        stripTrailingCommas(sanitized),
        quoteUnquotedKeys(stripTrailingCommas(sanitized)),
        normalizeSingleQuotedStrings(quoteUnquotedKeys(stripTrailingCommas(sanitized))),
        closeOpenJsonStructures(sanitized),
        closeOpenJsonStructures(normalizeSingleQuotedStrings(quoteUnquotedKeys(stripTrailingCommas(sanitized))))
    ];

    for (const variant of variants) {
        try {
            const parsed = JSON.parse(variant);
            if (parsed && typeof parsed === 'object') return parsed;
        } catch (err) {
            // Try next variant
        }
    }

    return null;
}

function parseInterviewReportJson(reportText) {
    const candidates = new Set();
    const rawText = sanitizeJsonCandidate(reportText);
    const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    if (fencedMatch?.[1]) {
        const fenced = sanitizeJsonCandidate(fencedMatch[1]);
        if (fenced) candidates.add(fenced);
    }

    if (rawText) candidates.add(rawText);

    const extracted = extractFirstJsonObject(rawText);
    if (extracted) candidates.add(extracted);

    for (const candidate of candidates) {
        const parsed = tryParseJsonVariants(candidate);
        if (parsed) {
            if (parsed.interview_report && typeof parsed.interview_report === 'object') {
                return parsed.interview_report;
            }
            if (parsed.interviewReport && typeof parsed.interviewReport === 'object') {
                return parsed.interviewReport;
            }
            return parsed;
        }
    }

    const jsonArrayLike = rawText.match(/\[[\s\S]*\]/);
    if (jsonArrayLike?.[0]) {
        const parsedArray = tryParseJsonVariants(jsonArrayLike[0]);
        if (parsedArray) return parsedArray;
    }

    const lines = rawText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('{') || line.startsWith('}') || line.includes(':') || line.endsWith(','));
    if (lines.length) {
        const parsedFromLines = tryParseJsonVariants(lines.join('\n'));
        if (parsedFromLines) return parsedFromLines;
    }

    const inlineObject = rawText.match(/\{[^\n]*\}/);
    if (inlineObject?.[0]) {
        const parsedInline = tryParseJsonVariants(inlineObject[0]);
        if (parsedInline) return parsedInline;
    }

    const preview = rawText.slice(0, 300).replace(/\s+/g, ' ').trim();
    if (preview) {
        throw new Error(`AI response is not valid JSON. Please retry. Preview: ${preview}`);
    }

    throw new Error('AI response is not valid JSON. Please retry.');
}

function toNonEmptyString(value) {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed || undefined;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return undefined;
}

function toFiniteNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value.trim());
        if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function toArray(value) {
    return Array.isArray(value) ? value : [];
}

function normalizeQuestionItem(item) {
    if (typeof item === 'string') {
        const question = toNonEmptyString(item);
        if (!question) return null;
        return {
            question,
            intention: 'Assess candidate competency',
            answer: 'Provide a structured, example-backed response.'
        };
    }

    if (!item || typeof item !== 'object') return null;

    const question = toNonEmptyString(
        item.question ?? item.prompt ?? item.q ?? item.text ?? item.name
    );
    if (!question) return null;

    return {
        question,
        intention: toNonEmptyString(item.intention ?? item.intent ?? item.purpose) ?? 'Assess candidate competency',
        answer: toNonEmptyString(item.answer ?? item.sampleAnswer ?? item.howToAnswer ?? item.guidance) ?? 'Provide a structured, example-backed response.'
    };
}

function normalizeSkillGapItem(item) {
    if (typeof item === 'string') {
        const skill = toNonEmptyString(item);
        if (!skill) return null;
        return { skill, severity: 'medium' };
    }

    if (!item || typeof item !== 'object') return null;
    const skill = toNonEmptyString(item.skill ?? item.area ?? item.topic ?? item.gap);
    if (!skill) return null;

    const severityRaw = toNonEmptyString(item.severity ?? item.level ?? item.priority)?.toLowerCase();
    const severity = ['low', 'medium', 'high'].includes(severityRaw) ? severityRaw : 'medium';
    return { skill, severity };
}

function normalizePreparationPlanItem(item, index) {
    if (typeof item === 'string') {
        const focus = toNonEmptyString(item);
        if (!focus) return null;
        return {
            day: index + 1,
            focus,
            tasks: ['Review key concepts and practice interview answers.']
        };
    }

    if (!item || typeof item !== 'object') return null;
    const day = toFiniteNumber(item.day ?? item.dayNumber ?? item.step) ?? index + 1;
    const focus = toNonEmptyString(item.focus ?? item.topic ?? item.goal ?? item.title);
    if (!focus) return null;

    const taskCandidates = toArray(item.tasks ?? item.activities ?? item.actionItems).map((task) => toNonEmptyString(task)).filter(Boolean);
    const singleTask = toNonEmptyString(item.task);
    const tasks = taskCandidates.length ? taskCandidates : (singleTask ? [singleTask] : ['Practice and revise this focus area.']);

    return {
        day: Math.max(1, Math.floor(day)),
        focus,
        tasks
    };
}

function normalizeInterviewReportShape(parsed) {
    if (!parsed || typeof parsed !== 'object') return parsed;

    const title = toNonEmptyString(parsed.title ?? parsed.jobTitle ?? parsed.roleTitle ?? parsed.position);
    const score = toFiniteNumber(parsed.matchScore ?? parsed.score ?? parsed.match_percentage ?? parsed.matchPercent);
    const matchScore = score === undefined ? undefined : clamp(score, 0, 100);

    const technicalQuestions = toArray(
        parsed.technicalQuestions
        ?? parsed.technical_questions
        ?? parsed.technicalInterviewQuestions
        ?? parsed.techQuestions
    ).map(normalizeQuestionItem).filter(Boolean);

    const behavioralQuestions = toArray(
        parsed.behavioralQuestions
        ?? parsed.behaviouralQuestions
        ?? parsed.behavioral_questions
        ?? parsed.softSkillQuestions
    ).map(normalizeQuestionItem).filter(Boolean);

    const skillGaps = toArray(
        parsed.skillGaps
        ?? parsed.skill_gaps
        ?? parsed.gaps
    ).map(normalizeSkillGapItem).filter(Boolean);

    const preparationPlan = toArray(
        parsed.preparationPlan
        ?? parsed.preprationPlan
        ?? parsed.preparation_plan
        ?? parsed.plan
        ?? parsed.studyPlan
    ).map((item, index) => normalizePreparationPlanItem(item, index)).filter(Boolean);

    return {
        ...parsed,
        ...(title ? { title } : {}),
        ...(matchScore === undefined ? {} : { matchScore }),
        technicalQuestions,
        behavioralQuestions,
        skillGaps,
        preparationPlan
    };
}

function deriveFallbackTitle(jobDescription) {
    const jd = toNonEmptyString(jobDescription);
    if (!jd) return 'Interview Readiness Report';

    const firstLine = jd.split('\n').map((line) => line.trim()).find(Boolean);
    if (!firstLine) return 'Interview Readiness Report';

    const roleMatch = firstLine.match(/(?:for|as|position[:\s]|role[:\s])\s*([A-Za-z0-9 \-_/]+)/i);
    const role = toNonEmptyString(roleMatch?.[1]);
    if (role) return `${role} Interview Report`;

    const truncated = firstLine.slice(0, 48).trim();
    return truncated ? `${truncated} - Interview Report` : 'Interview Readiness Report';
}

function ensureMinimumPreparationPlan(plan, minItems = 3) {
    const normalizedPlan = Array.isArray(plan) ? [...plan] : [];
    while (normalizedPlan.length < minItems) {
        const day = normalizedPlan.length + 1;
        normalizedPlan.push({
            day,
            focus: `Day ${day} interview preparation`,
            tasks: [
                'Review core concepts for the target role.',
                'Practice technical and behavioral interview answers.'
            ]
        });
    }
    return normalizedPlan;
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
        6. A Title Of the Job for which user is applying
        
        The response should be in JSON format and should follow the schema defined below:
        
        ${JSON.stringify(zodToJsonSchema(interviewReportSchema))}
        
        IMPORTANT:
        - Return ONLY valid JSON.
        - Do not wrap JSON in markdown or code fences.
        - Do not add any explanation text before or after JSON.
        - Keep the response concise to avoid truncation.
        - Use EXACTLY 3 technicalQuestions, EXACTLY 3 behavioralQuestions, and EXACTLY 3 preparationPlan items.
        - Each question item must include: question, intention, answer.
        - Each preparation plan item must include: day, focus, tasks.
        - Calculate matchScore ONLY from: resume content, selfDescription, and jobDescription.
        - Do NOT use market trends, salary level, company size, location, assumptions, or any external factor.
        - If candidate skills do not match required job skills, keep matchScore low.
        - If candidate strongly matches required skills and responsibilities, keep matchScore high.
        - matchScore must be a numeric value between 0 and 100.
        
        Here are the inputs:
        Resume: ${resume}
        Self-description: ${selfDescription}
        Job Description: ${jobDescription}
        all the data should be available and should not be null`;

    const compactRetryPrompt = `Return ONLY valid minified JSON for this schema:
${JSON.stringify(zodToJsonSchema(interviewReportSchema))}
Rules:
- No markdown/code fences.
- No explanation text.
- EXACTLY 3 technicalQuestions, 3 behavioralQuestions, and 3 preparationPlan items.
- Keep each string short (max ~140 chars).
- Use key "answer" (not expectedAnswer).
Inputs:
Resume: ${resume}
Self-description: ${selfDescription}
Job Description: ${jobDescription}`;

    const parsed = await generateInterviewReportWithRetry([prompt, compactRetryPrompt], 2);
    const normalized = normalizeInterviewReportShape(parsed);
    normalized.title = toNonEmptyString(normalized.title) ?? deriveFallbackTitle(jobDescription);
    normalized.preparationPlan = ensureMinimumPreparationPlan(normalized.preparationPlan, 3);
    // Ensure required fields have sensible defaults before schema validation
    if (typeof normalized.matchScore !== 'number') {
        normalized.matchScore = 0;
    }
    if (!Array.isArray(normalized.skillGaps) || normalized.skillGaps.length === 0) {
        normalized.skillGaps = [{ skill: 'General', severity: 'low' }];
    }
    const validation = interviewReportSchema.safeParse(normalized);
    if (!validation.success) {
        const errors = validation.error.flatten();
        throw new Error(`Schema validation failed: ${JSON.stringify(errors.fieldErrors)}`);
    }

    return validation.data;
}

module.exports = { invokeOpenRouterAi, generateInterviewReportOpenRouter };
