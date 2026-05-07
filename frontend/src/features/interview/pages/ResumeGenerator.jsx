import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../services/interview.api';
import './resumeGenerator.scss';

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

const BackIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const ResumeGenerator = () => {
  const [selfDescription, setSelfDescription] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const resumeInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or DOCX file');
        setResumeFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setResumeFile(null);
        return;
      }
      setError('');
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!selfDescription.trim() || !jobDescription.trim() || !resumeFile) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('selfDescription', selfDescription);
      formData.append('jobDescription', jobDescription);
      formData.append('aiProvider', 'openrouter');

      const response = await api.post(
        '/api/generate-resume',
        formData,
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `generated_resume_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Resume generated successfully!');
      setSelfDescription('');
      setJobDescription('');
      setResumeFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = '';

    } catch (err) {
      console.error('Error generating resume:', err);
      const message = err.response?.data?.error || 'Failed to generate resume. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="resume-generator">
      <div className="top-actions">
        <button className="back-btn" onClick={() => navigate(-1)}>
            <BackIcon /> Back
        </button>
      </div>

      <div className="header">
        <h1>Generate ATS Resume<span className="dot">.</span></h1>
        <p className="subtitle">ResumE Max</p>
      </div>

      <form onSubmit={handleSubmit} className="resume-generator-form">
        <div className="alerts">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>

        <div className="content-grid">
            <div className="column left-column">
                <div className="input-group full-height">
                    <label>JOB DESCRIPTION</label>
                    <textarea 
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the target job requirements here..."
                    ></textarea>
                </div>
            </div>

            <div className="column right-column">
                <div className="input-group drag-drop-group">
                    <label>
                        RESUME SUBMISSION 
                        {resumeFile && <span className="file-name">{resumeFile.name}</span>}
                    </label>
                    <div className={`drag-drop-area ${resumeFile ? 'has-file' : ''}`}>
                        <UploadIcon />
                        <h3>Drag and Drop</h3>
                        <p>PDF OR DOCX (MAX 5MB)</p>
                        <input 
                            ref={resumeInputRef} 
                            type="file" 
                            accept=".pdf,.docx" 
                            className="file-input" 
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <div className="input-group self-desc-group">
                    <label>SELF DESCRIPTION</label>
                    <textarea 
                        value={selfDescription}
                        onChange={(e) => setSelfDescription(e.target.value)}
                        placeholder="Summarize your professional achievements..."
                    ></textarea>
                </div>
            </div>
        </div>

        <div className="actions">
            <button 
                type="submit" 
                className="generate-btn" 
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="spinner"></span>
                        GENERATING...
                    </>
                ) : (
                    <>
                        GENERATE RESUME
                        <ArrowRightIcon />
                    </>
                )}
            </button>
        </div>
      </form>
    </main>
  );
};

export default ResumeGenerator;