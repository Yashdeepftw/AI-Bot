import React, { useState } from "react";
import "../style/interview.scss";

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

const mockData = {
  "_id": {
    "$oid": "69de9d7d5b5d41066b0e64f8"
  },
  "matchScore": 60,
  "technicalQuestions": [
    {
      "question": "Explain your approach to the job-relevant technical stack in a real project scenario.",
      "intention": "Assess clarity of thought, practical understanding, and communication quality.",
      "answer": "Use a structured answer: context, action, trade-offs, and measurable result."
    },
    {
      "question": "Explain your approach to the job-relevant technical stack in a real project scenario.",
      "intention": "Assess clarity of thought, practical understanding, and communication quality.",
      "answer": "Use a structured answer: context, action, trade-offs, and measurable result."
    },
    {
      "question": "Explain your approach to the job-relevant technical stack in a real project scenario.",
      "intention": "Assess clarity of thought, practical understanding, and communication quality.",
      "answer": "Use a structured answer: context, action, trade-offs, and measurable result."
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Explain your approach to team collaboration and problem solving in a real project scenario.",
      "intention": "Assess clarity of thought, practical understanding, and communication quality.",
      "answer": "Use a structured answer: context, action, trade-offs, and measurable result."
    },
    {
      "question": "Explain your approach to team collaboration and problem solving in a real project scenario.",
      "intention": "Assess clarity of thought, practical understanding, and communication quality.",
      "answer": "Use a structured answer: context, action, trade-offs, and measurable result."
    },
    {
      "question": "Explain your approach to team collaboration and problem solving in a real project scenario.",
      "intention": "Assess clarity of thought, practical understanding, and communication quality.",
      "answer": "Use a structured answer: context, action, trade-offs, and measurable result."
    }
  ],
  "skillGaps": [
    {
      "skill": "System design and communication",
      "severity": "medium"
    }
  ],
  "preprationPlan": [
    {
      "day": 1,
      "focus": "Interview preparation day 1",
      "tasks": [
        "Review job description and required skills",
        "Practice concise answers for likely interview questions"
      ],
      "_id": {
        "$oid": "69de9d7d5b5d41066b0e64f9"
      }
    },
    {
      "day": 2,
      "focus": "Interview preparation day 2",
      "tasks": [
        "Review job description and required skills",
        "Practice concise answers for likely interview questions"
      ],
      "_id": {
        "$oid": "69de9d7d5b5d41066b0e64fa"
      }
    },
    {
      "day": 3,
      "focus": "Interview preparation day 3",
      "tasks": [
        "Review job description and required skills",
        "Practice concise answers for likely interview questions"
      ],
      "_id": {
        "$oid": "69de9d7d5b5d41066b0e64fb"
      }
    }
  ],
  "user": {
    "$oid": "69d3dabecf599c946eaed967"
  },
  "createdAt": {
    "$date": "2026-04-14T20:03:09.163Z"
  },
  "updatedAt": {
    "$date": "2026-04-14T20:03:09.163Z"
  },
  "__v": 0
};

const Interview = () => {
    const reportData = mockData;
    const [activeTab, setActiveTab] = useState('behavioral'); // Defaulting to the screenshot view
    const [expandedQId, setExpandedQId] = useState(null);

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

    const { color: scoreColor, text: scoreText, shadow: scoreShadow } = getScoreDetails(reportData.matchScore);

    return (
        <main className="interview-dashboard">
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
                            <span className="badge">{reportData.behavioralQuestions.length} questions</span>
                        </div>
                        <div className="header-divider"></div>
                        
                        <div className="accordion-list">
                            {reportData.behavioralQuestions.map((q, i) => (
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
                            <span className="badge">{reportData.technicalQuestions.length} questions</span>
                        </div>
                        <div className="header-divider"></div>
                        
                        <div className="accordion-list">
                            {reportData.technicalQuestions.map((q, i) => (
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
                            <span className="badge">{reportData.preprationPlan.length} days</span>
                        </div>
                        <div className="header-divider"></div>

                        <div className="roadmap-list">
                            {reportData.preprationPlan.map((plan, i) => (
                                <div className="roadmap-node" key={i}>
                                    <div className="node-marker">D{plan.day}</div>
                                    <div className="node-content">
                                        <h3>{plan.focus}</h3>
                                        <ul>
                                            {plan.tasks.map((task, tIdx) => (
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
                             <div className="inner-score">{reportData.matchScore}<span className="perc">%</span></div>
                        </div>
                        <div className="score-subtext" style={{ color: scoreColor }}>{scoreText}</div>
                    </div>
                </div>

                <div className="panel-section mt-extra">
                    <div className="panel-title">SKILL GAPS</div>
                    <div className="gaps-list-vert">
                        {reportData.skillGaps.map((gap, i) => (
                            <div className={`gap-card severity-${gap.severity}`} key={i}>
                                {gap.skill}
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </main>
    );
};

export default Interview;