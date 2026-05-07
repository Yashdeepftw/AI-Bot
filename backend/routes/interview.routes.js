const express = require('express');
const interviewRouter = express.Router();
const authMiddleware = require('../middlewares/auth.middleware')
const interviewController = require('../controllers/interviewOpenrouter.controller')
const upload = require('../middlewares/file.middleware')

/**
 * @route POST /api/auth/interview
 * @description generate new interview report on the basics of user self description , resume, jobdescription
 * @access private (but made optional for testing)
 * @body {resume: string, selfDescription: string, jobDescription: string} OR upload resume as PDF file
 */
interviewRouter.post('/interview', upload.single("resume"), authMiddleware.authUser, interviewController.generateInterviewReportOpenRouterController)


/**
 * @route GET /api/auth/interview/rep/:interviewId
 * @description get interview report by interview id
 * @access private
 */
interviewRouter.get('/interview/:interviewId', authMiddleware.authUser, interviewController.getInterviewReportByIdController)

/**
 * @route GET /api/auth/interview
 * @description get all interview reports of logged in user
 * @access private
 */

interviewRouter.get("/interview", authMiddleware.authUser, interviewController.getAllInterviewReport);
module.exports = interviewRouter;