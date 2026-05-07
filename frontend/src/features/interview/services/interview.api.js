import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})

/**
 * @description Serivce to generate interview report based on user self Desctiption, resume, jobdescription
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile}) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    if (resumeFile) {
        formData.append("resume", resumeFile)
    }

    const response = await api.post("/api/auth/interview", formData)

    return response.data
}

/**
 * @description Service to get interview report by interviewId
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/auth/interview/${interviewId}`);

    return response.data;
}

/** 
 * @description Service to get all interview reports of logged in users
*/
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/auth/interview");

    return response.data;
}