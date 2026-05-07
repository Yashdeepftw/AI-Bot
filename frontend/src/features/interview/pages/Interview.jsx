import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import "../style/interview.scss";
import { useInterview } from "../hook/useInterview";
import { getInterviewReportById } from "../services/interview.api";

const CodeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
);

const MessageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const RoadmapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12L2 12M5 9L2 12L5 15M19 9L22 12L19 15"></path>
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const ChevronUpIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
);

const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const Interview = () => {

    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { report, loading, getReportById } = useInterview();

    const [activeTab, setActiveTab] = useState('behavioral');
    const [expandedQId, setExpandedQId] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    // Resolve report: use context report if it matches current interviewId
    const reportData = report?._id === interviewId ? report : null;



    if (loading && !reportData) {
        return (
            <div className="interview-loading">
                <div className="top-actions">
                    <button className="action-btn primary" onClick={() => navigate('/')}>
                        <PlusIcon /> Generate More Reports
                    </button>
                    <button className="action-btn" onClick={() => navigate('/logout')}>
                        <LogoutIcon /> Logout
                    </button>
                </div>
                <div className="loading-spinner"></div>
                <p>Loading your report...</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="interview-error" style={{color: '#f87171', padding: '2rem'}}>
                <div className="top-actions">
                    <button className="action-btn primary" onClick={() => navigate('/')}>
                        <PlusIcon /> Generate More Reports
                    </button>
                    <button className="action-btn" onClick={() => navigate('/logout')}>
                        <LogoutIcon /> Logout
                    </button>
                </div>
                Error: {fetchError}
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="interview-loading">
                <div className="top-actions">
                    <button className="action-btn primary" onClick={() => navigate('/')}>
                        <PlusIcon /> Generate More Reports
                    </button>
                    <button className="action-btn" onClick={() => navigate('/logout')}>
                        <LogoutIcon /> Logout
                    </button>
                </div>
                <div className="loading-spinner"></div>
                <p>Preparing report...</p>
            </div>
        );
    }

    const getScoreDetails = (score) => {
        if (score >= 80) return { color: '#22c55e', text: 'Strong match for this role', shadow: 'rgba(34, 197, 94, 0.25)' };
        if (score >= 50) return { color: '#f59e0b', text: 'Good potential, with gaps', shadow: 'rgba(245, 158, 11, 0.25)' };
        return { color: '#ef4444', text: 'Does not fully meet requirements', shadow: 'rgba(239, 68, 68, 0.25)' };
    };

    const toggleAccordion = (index) => {
        setExpandedQId(expandedQId === index ? null : index);
    };

    const toggleTab = (tab) => {
        setActiveTab(tab);
        setExpandedQId(null);
    }

    const rawScore = reportData?.matchScore ?? reportData?.MatchScore ?? reportData?.score;
    const parsedScore = typeof rawScore === "number"
        ? rawScore
        : Number(String(rawScore ?? "").match(/\d+(\.\d+)?/)?.[0]);
    const displayScore = Number.isFinite(parsedScore) ? Math.max(0, Math.min(100, parsedScore)) : 67;

    const { color: scoreColor, text: scoreText, shadow: scoreShadow } = getScoreDetails(displayScore);

    return (
        <main className="interview-dashboard">
            <div className="top-actions">
                <button className="action-btn primary" onClick={() => navigate('/')}>
                    <PlusIcon /> Generate More Reports
                </button>
                <button className="action-btn" onClick={() => navigate('/logout')}>
                    <LogoutIcon /> Logout
                </button>
            </div>
            {/* Sidebar Left */}
            <aside className="left-sidebar">
                <div className="sidebar-section-title">SECTIONS</div>
                <nav className="nav-menu">
                    <button className={`nav-item ${activeTab === 'technical' ? 'active' : ''}`} onClick={() => toggleTab('technical')}>
                        <CodeIcon /> Technical Questions
                    </button>
                    <button className={`nav-item ${activeTab === 'behavioral' ? 'active' : ''}`} onClick={() => toggleTab('behavioral')}>
                        <MessageIcon /> Behavioral Questions
                    </button>
                    <button className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => toggleTab('roadmap')}>
                        <RoadmapIcon /> Road Map
                    </button>
                </nav>
            </aside>

            {/* Main Content Middle */}
            <section className="main-content">
                {activeTab === 'behavioral' && (
                    <div className="content-wrapper">
                        <div className="content-header">
                            <h2>Behavioral Questions</h2>
                            <span className="badge">{reportData.behavioralQuestions?.length || 0} questions</span>
                        </div>
                        <div className="header-divider"></div>

                        <div className="accordion-list">
                            {(reportData.behavioralQuestions || []).map((q, i) => (
                                <div className={`accordion-item ${expandedQId === i ? 'expanded' : ''}`} key={i}>
                                    <div className="accordion-header" onClick={() => toggleAccordion(i)}>
                                        <div className="q-badge">Q{i + 1}</div>
                                        <div className="q-text">{q.question}</div>
                                        <div className="chevron">
                                            {expandedQId === i ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                        </div>
                                    </div>
                                    {expandedQId === i && (
                                        <div className="accordion-body">
                                            <p className="intention"><strong>Intention:</strong> {q.intention}</p>
                                            <p className="answer"><strong>Suggested Answer:</strong> {q.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'technical' && (
                    <div className="content-wrapper">
                        <div className="content-header">
                            <h2>Technical Questions</h2>
                            <span className="badge">{reportData.technicalQuestions?.length || 0} questions</span>
                        </div>
                        <div className="header-divider"></div>

                        <div className="accordion-list">
                            {(reportData.technicalQuestions || []).map((q, i) => (
                                <div className={`accordion-item ${expandedQId === i ? 'expanded' : ''}`} key={i}>
                                    <div className="accordion-header" onClick={() => toggleAccordion(i)}>
                                        <div className="q-badge">Q{i + 1}</div>
                                        <div className="q-text">{q.question}</div>
                                        <div className="chevron">
                                            {expandedQId === i ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                        </div>
                                    </div>
                                    {expandedQId === i && (
                                        <div className="accordion-body">
                                            <p className="intention"><strong>Intention:</strong> {q.intention}</p>
                                            <p className="answer"><strong>Suggested Answer:</strong> {q.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'roadmap' && (
                    <div className="content-wrapper">
                        <div className="content-header">
                            <h2>Road Map</h2>
                            <span className="badge">{reportData.preprationPlan?.length || 0} days</span>
                        </div>
                        <div className="header-divider"></div>

                        <div className="roadmap-list">
                            {(reportData.preprationPlan || []).map((plan, i) => (
                                <div className="roadmap-node" key={i}>
                                    <div className="node-marker">D{plan.day}</div>
                                    <div className="node-content">
                                        <h3>{plan.focus}</h3>
                                        <ul>
                                            {(plan.tasks || []).map((task, tIdx) => (
                                                <li key={tIdx}>{task}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Right Panel */}
            <aside className="right-panel">
                <div className="panel-section">
                    <div className="panel-title">MATCH SCORE</div>
                    <div className="score-wrapper">
                        <div
                            className="score-ring-wrap"
                            style={{
                                borderColor: scoreColor,
                                boxShadow: `0 0 30px ${scoreShadow}`
                            }}
                        >
                            <div className="inner-score">
                                {displayScore}
                            </div>
                        </div>
                        <div className="score-subtext" style={{ color: scoreColor }}>{scoreText}</div>
                    </div>
                </div>

                <div className="panel-section mt-extra">
                    <div className="panel-title">SKILL GAPS</div>
                    <div className="gaps-list-vert">
                        {(reportData.skillGaps || []).map((gap, i) => (
                            <div className={`gap-card severity-${gap?.severity || 'low'}`} key={i}>
                                {gap?.skill}
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </main>
    );
};

export default Interview;