import React, { useRef, useState } from 'react';
import '../style/home.scss';
import { useInterview } from '../hook/useInterview';
import { useNavigate } from 'react-router';

const UploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <polyline points="9 15 12 12 15 15"></polyline>
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

const Home = () => {
    const { loading, generateReport } = useInterview();

    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const resumeInputRef = useRef()
    const navigate = useNavigate();

    const handelGenerateReport = async () => {
        const resumeFile = resumeInputRef.current.files[0];
        const data = await generateReport({ jobDescription, selfDescription, resumeFile });
        navigate(`/interview/${data._id}`);
    }

    if (loading) {
        return (
            <main className="home">
                <div className="top-bar">
                    <button className="nav-btn resume-gen-btn" onClick={() => navigate('/generate-resume')}>
                        <UploadIcon /> Generate Resume
                    </button>
                    <button className="nav-btn logout-btn" onClick={() => navigate('/logout')}>
                        <LogoutIcon /> Logout
                    </button>
                </div>
                <div className="header">
                    <h1>Generating Resume Report<span className="dot">.</span></h1>
                    <p className="subtitle">ResumE Max</p>
                </div>
            </main>
        )
    }

    return (
        <main className="home">
            <div className="top-bar">
                <button className="nav-btn resume-gen-btn" onClick={() => navigate('/generate-resume')}>
                    <UploadIcon /> Generate Resume
                </button>
                <button className="nav-btn logout-btn" onClick={() => navigate('/logout')}>
                    <LogoutIcon /> Logout
                </button>
            </div>
            <div className="header">
                <h1>Generate Interview Report<span className="dot">.</span></h1>
                <p className="subtitle">ResumE Max</p>
            </div>

            <div className="content-grid">
                <div className="column left-column">
                    <div className="input-group full-height">
                        <label>JOB DESCRIPTION</label>
                        <textarea onChange={(e) => { setJobDescription(e.target.value) }}
                            placeholder="Paste the target job requirements here..."
                        ></textarea>
                    </div>
                </div>

                <div className="column right-column">
                    <div className="input-group drag-drop-group">
                        <label>RESUME SUBMISSION</label>
                        <div className="drag-drop-area">
                            <UploadIcon />
                            <h3>Drag and Drop</h3>
                            <p>PDF OR DOCX</p>
                            <input ref={resumeInputRef} type="file" accept=".pdf,.docx" className="file-input" />
                        </div>
                    </div>

                    <div className="input-group self-desc-group">
                        <label>SELF DESCRIPTION</label>
                        <textarea onChange={(e) => { setSelfDescription(e.target.value) }}
                            placeholder="Summarize your professional achievements..."
                        ></textarea>
                    </div>
                </div>
            </div>

            <div className="actions">
                <button className="generate-btn" onClick={handelGenerateReport}>
                    GENERATE REPORT
                    <ArrowRightIcon />
                </button>
            </div>
        </main>
    );
};

export default Home;