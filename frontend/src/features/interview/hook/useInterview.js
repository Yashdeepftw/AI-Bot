import {getAllInterviewReports, generateInterviewReport, getInterviewReportById} from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {
    const context = useContext(InterviewContext);
    const { interviewId } = useParams();

    if(!context) {
        throw new Error("useInterview must be used within an InterviewProvide")
    }

    const { loading, setLoading, report, setReport, reports, setReports} = context;

    const generateReport = async ({jobDescription, selfDescription, resumeFile}) => {
        setLoading(true);
        try{
            const response = await generateInterviewReport({jobDescription, selfDescription, resumeFile});
            setReport(response.interviewReport);
            return response.interviewReport;
        }catch(error){
            console.error("useInterview generateReport error:", error);
            throw error; // Re-throw so components can handle UI error states
        }finally{
            setLoading(false);
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true);
        try{
            const response = await getInterviewReportById(interviewId);
            const reportData = response.interviewReport || response;
            setReport(reportData);
            return reportData;
        }catch(error){
            console.error("useInterview getReportById error:", error);
            throw error; // Re-throw so components can handle UI error states
        }finally{
            setLoading(false);
        }
    }

    const getAllReports = async () => {
        setLoading(true);
        try{
            const response = await getAllInterviewReports();
            setReports(response);
            return response;
        }catch(error){
            console.log(error);
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId);
        } else {
            getAllReports();
        }
    }, [interviewId]);

    return {
        loading,
        report,
        generateReport,
        getReportById,
        getAllReports
    }
}