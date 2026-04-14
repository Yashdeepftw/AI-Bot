import React from "react";
import '../style/home.scss'

const Home = () => {
    return (
        <main className="home">
            <div className="interview-input-group">
                <div className="left">
                    <textarea name="job-description" id="jobdescription" placeholder="Enter Job-description here..."></textarea>
                </div>
                <div className="right">
                    <p>Resume <small className="highlight"> (use resume and self Description together for better result)</small></p>
                    <label className="file-label" htmlFor="resume">Upload Resume</label>
                    <input hidden type="file" name="resume" id="resume" accept=".pdf" />
                    <div className="input-group">
                        <label htmlFor="selfDescription">Self Description</label>
                        <textarea htmlFor="selfDescription" id="selfDescription" placeholder="Describe Yourself in a few sentences...."></textarea>
                    </div>
                    <button className="button primary-button">Generate Interview Report</button>
                </div>
            </div>
        </main>
    );
};

export default Home;