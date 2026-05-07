const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateResume } = require('../services/resume-generator.service');
const { authUser } = require('../middlewares/auth.middleware');
const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
    }
  }
});

/**
 * @route POST /generate-resume
 * @desc Generate ATS-friendly resume PDF from JD and self-description
 * @access Protected route (requires authentication)
 */
router.post('/generate-resume', authUser, upload.single('resume'), async (req, res) => {
  let filePath = null;

  try {
    // Destructure form data
    const { jobDescription, selfDescription, aiProvider } = req.body;
    const file = req.file; // Uploaded resume file (PDF/DOCX)

    if (!jobDescription || !selfDescription || !file) {
      return res.status(400).json({
        error: 'Job description, self-description, and resume file are required'
      });
    }

    filePath = file.path;

    // Extract text from uploaded resume (PDF/DOCX)
    let extractedResumeContent = '';
    try {
      // Use pdf-parse to extract text from PDF files
      if (file.mimetype === 'application/pdf') {
        const pdfParse = require('pdf-parse');
        const dataBuffer = await fs.promises.readFile(filePath);
        const pdfResult = await pdfParse(dataBuffer);
        extractedResumeContent = pdfResult.text || '';
      }
      // For DOCX files - simplified placeholder
      else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractedResumeContent = `Resume content from ${file.originalname}`;
        // In production, use a library like 'mammoth' or 'docx-parser' to extract text from DOCX
      }
    } catch (parseError) {
      console.error('Error parsing resume file:', parseError);
      return res.status(500).json({ error: 'Failed to process resume file' });
    } finally {
      // Clean up uploaded file
      if (filePath && fs.existsSync(filePath)) {
        try {
          await fs.promises.unlink(filePath);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
    }

    if (!extractedResumeContent) {
      extractedResumeContent = 'No resume content could be extracted.';
    }

    // Generate resume PDF using AI services
    const { pdfDocGenerator } = await generateResume({
      extractedResumeContent,
      selfDescription,
      jobDescription,
      originalFilename: file.originalname,
      aiProvider: aiProvider || 'openrouter'
    });

    // Create PDF buffer from pdfmake document (pdfkit stream)
    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      pdfDocGenerator.on('data', (chunk) => chunks.push(chunk));
      pdfDocGenerator.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDocGenerator.on('error', reject);
      pdfDocGenerator.end();
    });

    // Remove authUser from Content-Disposition header (it shouldn't be there)
    res.setHeader('Content-Disposition', `attachment; filename="generated_resume_${Date.now()}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('Error in resume generation:', error);
    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error deleting file on error:', unlinkError);
      }
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;