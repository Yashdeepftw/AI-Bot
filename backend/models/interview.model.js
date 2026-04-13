const mongoose = require("mongoose");

/**
 * job description schema: String
 * resume text: String
 * self description: String
 * 
 * - matchScore: Number
 * ai - technical questions : [{
 *      question: "",
 *      intention: "",
 *      answer: ""
 *  }]
 * -- behavioral questions : [{
 *      question: "",
 *      intention: "",
 *      answer: ""
 *  }]
 * -- skill gaps : [{
 *      skill: "",
 *      severity: "",
 *      type: String,
 *      enum: ["low", "medium", "high"]
 *  }]
 * -- prepration plan : [{
 *      day: Number,
 *      focus: String,
 *      tasks: [String]    
 *  }]
 */



const technicalQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical Question is required"]
    },
    intention: {
        type: String, 
        required: [ true, "intention is required"]
    },
    answer: {
        type: String,
        require: [ true, "Answer is requires"]
    }
}, {
    _id: false
})

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical Question is required"]
    },
    intention: {
        type: String,
        required: [true, "intention is required"]
    },
    answer: {
        type: String,
        require: [true, "Answer is requires"]
    }
}, {
    _id: false
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [ true, "Skill is required"]
    }, 
    severity: {
        type: String,
        enum: [ "low", "medium", "high"],
        required: [ true, "Severity is required"]
    }
}, {
    _id: false
})

const preprationPlanSchema = new mongoose.Schema({
    day: {
        type: Number, 
        required: [ true, "Day is required"]
    },
    focus: {
        type: String,
        required: [ true, "Focus is Required"]
    },
    tasks: [{
        type: String
    }]
})

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [ true, "Job description is required"]
    }, 
    resume: {
        type: String,
    },
    selfDescription: {
        type: String
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    technicalQuestions: [ technicalQuestionsSchema ],
    behavioralQuestions: [ behavioralQuestionSchema ],
    skillGaps: [ skillGapSchema ],
    preprationPlan: [ preprationPlanSchema ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, {
    timestamps: true
})
const interviewReportModel = new mongoose.model("InterviewReport", interviewReportSchema);

module.exports = interviewReportModel;