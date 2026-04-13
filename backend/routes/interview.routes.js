const express = require('express');
const interviewRouter = express.Router();
const authMiddleware = require('../middlewares/auth.middleware')
const interviewController = require('../controllers/interviewOpenrouter.controller')
const upload = require('../middlewares/file.middleware')

/**
 * @route POST /api/interview
 * @description generate new interview report on the basics of user self description , resume, jobdescription
 * @access private (but made optional for testing)
 * @body {resume: string, selfDescription: string, jobDescription: string} OR upload resume as PDF file
 */
interviewRouter.post('/interview', upload.single("resume"), authMiddleware.authUser, interviewController.generateInterviewReportOpenRouterController)

module.exports = interviewRouter;