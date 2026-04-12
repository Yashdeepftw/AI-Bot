require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./db/db');
const { invokeGeminiAi, generateInterviewReport } = require('./services/ai.service')

connectDB();
invokeGeminiAi();

const testResume = `John Doe
Email: john.doe@email.com | Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 5 years of expertise in building scalable web applications using React, Node.js, and MongoDB. Proficient in REST APIs, microservices, and cloud deployment on AWS. Strong problem-solving skills with a track record of delivering projects on time.

TECHNICAL SKILLS
- Frontend: React, Vue.js, HTML5, CSS3, JavaScript (ES6+), Redux
- Backend: Node.js, Express.js, Python, Django
- Database: MongoDB, PostgreSQL, MySQL
- Tools & Platforms: Git, Docker, AWS, Firebase, Postman
- Others: REST API Design, Microservices, Agile/Scrum

WORK EXPERIENCE
Senior Developer | Tech Corp (2022-Present)
- Led a team of 3 developers to build microservices architecture
- Optimized database queries, reducing load time by 40%
- Implemented CI/CD pipelines using GitHub Actions

Full Stack Developer | StartUp Inc (2020-2022)
- Developed full-stack e-commerce application using MERN stack
- Collaborated with product team to deliver features on schedule
- Mentored 2 junior developers

EDUCATION
Bachelor's in Computer Science | University (2019)

CERTIFICATIONS
- AWS Certified Developer Associate (2023)
- MongoDB Associate Developer (2022)`;

const testSelfDescription = `I am a passionate full-stack developer with 5 years of professional experience. I excel at building user-friendly web applications with modern technologies. I am a quick learner, adaptable to new challenges, and enjoy collaborating with cross-functional teams. I have successfully led projects from concept to production and mentored junior developers. I'm particularly interested in cloud technologies and scalable system design. I love solving complex problems and continuously improving my skills.`;

const testJobDescription = `Senior Full Stack Developer - E-commerce Platform Company

ABOUT THE ROLE
We are seeking a Senior Full Stack Developer to join our growing engineering team. You will be responsible for architecting and building scalable web applications, working with modern technologies, and mentoring junior team members.

KEY RESPONSIBILITIES
- Design and develop full-stack web applications using React and Node.js
- Build and maintain RESTful APIs and microservices
- Optimize database performance and implement caching strategies
- Lead code reviews and mentor junior developers
- Collaborate with product managers and UI/UX designers
- Participate in architectural decisions for system design

REQUIRED QUALIFICATIONS
- 4+ years of professional web development experience
- Strong proficiency in JavaScript/TypeScript
- Experience with React and Node.js/Express
- Knowledge of relational and NoSQL databases
- Understanding of REST API design patterns
- Experience with version control (Git)

PREFERRED QUALIFICATIONS
- Experience with microservices and cloud platforms (AWS/Azure)
- Familiarity with Docker and containerization
- Experience with CI/CD pipelines
- AWS or other cloud certifications
- Experience mentoring or leading developers`;

generateInterviewReport({resume: testResume, selfDescription: testSelfDescription, jobDescription: testJobDescription}).then(report => {
    console.log("Interview Report Generated Successfully:");
    console.log(JSON.stringify(report, null, 2));
}).catch(err => {
    console.error("Error generating interview report:", err);
})

app.listen(3000, () => {
    console.log("server is running on port number 3000");
})