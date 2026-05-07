const pdf = require('pdf-parse');
const { generateInterviewReportOpenRouter } = require('../services/openrouter.service');
const interviewReportModel = require('../models/interview.model');

/**
 * @name generateInterviewReportOpenRouterController
 * @description generate interview report using openrouter
 * @access private
 * @body {resume: string, selfDescription: string, jobDescription: string} OR upload resume as PDF file
 */
const generateInterviewReportOpenRouterController = async (req, res) => {
    try {
        let resumeContent = '';

        // Check if resume is uploaded as file or sent as text
        if (req.file && req.file.buffer) {
            // Parse PDF file
            try {
                const data = await pdf(req.file.buffer);
                resumeContent = data.text;
            } catch (pdfError) {
                return res.status(400).json({
                    msg: 'Failed to parse PDF file. Please ensure it is a valid PDF.',
                    error: pdfError.message
                });
            }
        } else if (req.body.resume) {
            // Use resume text from request body
            resumeContent = req.body.resume;
        } else {
            return res.status(400).json({
                msg: 'Resume is required. Please upload a PDF file or provide resume text in the request body.'
            });
        }

        const { selfDescription, jobDescription } = req.body;

        if (!selfDescription || !jobDescription) {
            return res.status(400).json({
                msg: 'selfDescription and jobDescription are required in the request body.'
            });
        }

        const interviewReportByAi = await generateInterviewReportOpenRouter({
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
            msg: "Interview report generated successfully",
            interviewReport
        });
    } catch (error) {
        console.error('Error generating interview report:', error);
        res.status(500).json({
            msg: 'Failed to generate interview report',
            error: error.message
        });
    }
};

/**
 * @description controller to get interview report by interviewId 
 */
const getInterviewReportByIdController = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id});

        if(!interviewReport) {
            return res.status(404).json({
                msg: "Interview report not found"
            })
        }

        res.status(200).json({
            msg: "Interview report fetched successfully",
            interviewReport
        })
    } catch (err) {
        console.log(err);
    }
}

/**
 * @description controller to get all interview report of the loged in user
 */
const getAllInterviewReport = async (req, res) => {
    const interviewReport = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1}).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preprationPlan");

    res.status(200).json({
        msg: "Interview reports fetched successfully",
        interviewReport
    })

}


module.exports = { generateInterviewReportOpenRouterController, getInterviewReportByIdController, getAllInterviewReport };
