const pdfParse = require('pdf-parse');
// const { generateInterviewReport } = require('../services/ai.service')
const { generateInterviewReportOpenRouter } = require('../services/openrouter.service'); 
const interviewReportModel = require('../models/interview.model');

const generateInterviewReportOpenRouterController = async (req, res) => {
    try {
        let resumeContent = '';

        // Check if resume is uploaded as file or sent as text
        if (req.file) {
            // Parse PDF file
            const pdfData = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
            if (typeof pdfData === 'string') {
                resumeContent = pdfData;
            } else if (pdfData && typeof pdfData.text === 'string') {
                resumeContent = pdfData.text;
            } else {
                throw new Error('Unable to extract resume text from uploaded PDF.');
            }
        } else if (req.body.resume) {
            // Use resume text from request body
            resumeContent = req.body.resume;
        } else {
            return res.status(400).json({
                msg: "Resume is required. Please upload a PDF file or provide resume text in the request body."
            });
        }

        const { selfDescription, jobDescription } = req.body;

        if (!selfDescription || !jobDescription) {
            return res.status(400).json({
                msg: "selfDescription and jobDescription are required in the request body."
            });
        }

        const interviewReportByAi = await generateInterviewReportOpenRouter ({
            resume: resumeContent,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user?.id || null, // Make user optional for testing
            resume: resumeContent,
            jobDescription,
            selfDescription,
            ...interviewReportByAi,
            preprationPlan: interviewReportByAi.preparationPlan
        });

        res.status(201).json({
            msg: "Interview report generated Successfully",
            interviewReport
        });
    } catch (error) {
        console.error("Error generating interview report:", error);
        res.status(500).json({
            msg: "Failed to generate interview report",
            error: error.message
        });
    }
}

module.exports = { generateInterviewReportOpenRouterController }