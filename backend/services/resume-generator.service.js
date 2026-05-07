const PdfPrinter = require('pdfmake/src/printer');

const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

const printer = new PdfPrinter(fonts);

function extractJobTitle(jobDescription) {
  const text = String(jobDescription || '').trim();
  if (!text) return 'Target Role';
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] || '';
  const match = firstLine.match(/(?:for|as|role|position|opening)[:\s-]+(.+)/i);
  const title = match ? match[1].trim() : firstLine;
  return title || 'Target Role';
}

function summarizeText(text, maxLength = 520) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength).trim()}...`;
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function extractBulletLines(text, maxLines = 4) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const rawLines = normalized
    .split(/(?:\r?\n|[.!?])+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return rawLines.slice(0, maxLines).map((line) => {
    const cleaned = line.replace(/^[\-•\s]+/, '').trim();
    return cleaned ? (/[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`) : '';
  }).filter(Boolean);
}

function buildSuggestedResumePoints(targetRole, selfDescription, jobDescription) {
  const points = [];
  const selfLines = extractBulletLines(selfDescription, 3);
  const jobLines = extractBulletLines(jobDescription, 3);

  if (targetRole) {
    points.push(`Target role: ${targetRole}. Emphasize relevant experience and achievements for this position.`);
  }

  if (selfLines.length) {
    points.push(...selfLines.map((line) => `Profile: ${line}`));
  }

  if (jobLines.length) {
    points.push(...jobLines.map((line) => `Match job requirement: ${line}`));
  }

  if (!points.length) {
    points.push('Use the job description and self description to write a concise, achievement-oriented resume summary that matches the target role.');
  }

  return points.slice(0, 6);
}

/**
 * Generate ATS-friendly resume PDF from inputs
 */
async function generateResume({
  extractedResumeContent,
  selfDescription,
  jobDescription,
  originalFilename
}) {
  try {
    const jobTitle = extractJobTitle(jobDescription);
    const jobSummary = summarizeText(jobDescription, 620);
    const docDefinition = buildResumeDocument(
      { jobTitle, jobSummary, originalFilename },
      extractedResumeContent,
      selfDescription,
      jobDescription
    );

    // Generate PDF using pdfmake Printer for Node
    const pdfDocGenerator = printer.createPdfKitDocument(docDefinition);
    // No need to call .end() here; the route will handle buffering.

    return {
      pdfDocGenerator
    };
  } catch (error) {
    console.error('Error generating resume:', error);
    throw new Error(`Failed to generate resume: ${error.message}`);
  }
}

/**
 * Build PDF document definition for ATS-friendly resume
 */
function buildResumeDocument(meta, resumeContent, selfDescription, jobDescription) {
  const sections = [];
  const targetRole = meta.jobTitle || 'Target Role';
  const jobOverview = meta.jobSummary || 'No job description provided.';
  const resumeText = String(resumeContent || 'No resume content extracted.').replace(/\s+/g, ' ').trim();
  const resumeExcerpt = resumeText.length > 1400 ? `${resumeText.slice(0, 1400).trim()}...` : resumeText;
  const jobLines = String(jobDescription || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);
  const suggestedPoints = buildSuggestedResumePoints(targetRole, selfDescription, jobDescription);

  sections.push(
    { text: 'RESUME GUIDANCE', style: 'header', alignment: 'center' },
    { text: `Target Job: ${targetRole}`, style: 'subheader', alignment: 'center' },
    { text: '\n' }
  );

  sections.push(
    { text: 'PROFESSIONAL SUMMARY', style: 'sectionHeader' },
    { text: '--------------------------------------------------------------------------------', style: 'divider' },
    { text: selfDescription || 'No self-description provided.', style: 'contentParagraph', margin: [0, 0, 0, 10] },
    { text: '\n' }
  );

  if (suggestedPoints.length > 0) {
    sections.push(
      { text: 'SUGGESTED RESUME POINTS', style: 'sectionHeader' },
      { text: '--------------------------------------------------------------------------------', style: 'divider' },
      { ul: suggestedPoints, style: 'contentParagraph', margin: [0, 0, 0, 10] },
      { text: '\n' }
    );
  }

  sections.push(
    { text: 'JOB DESCRIPTION SUMMARY', style: 'sectionHeader' },
    { text: '--------------------------------------------------------------------------------', style: 'divider' },
    { text: jobOverview, style: 'contentParagraph', margin: [0, 0, 0, 10] },
    { text: '\n' }
  );

  if (jobLines.length > 0) {
    sections.push(
      { text: 'KEY JOB RESPONSIBILITIES', style: 'sectionHeader' },
      { text: '--------------------------------------------------------------------------------', style: 'divider' },
      { ul: jobLines.map((line) => line), style: 'contentParagraph', margin: [0, 0, 0, 10] },
      { text: '\n' }
    );
  }

  sections.push(
    { text: 'ORIGINAL RESUME REFERENCE', style: 'sectionHeader' },
    { text: '--------------------------------------------------------------------------------', style: 'divider' },
    { text: resumeExcerpt, style: 'rawContent', margin: [0, 0, 0, 10] },
    { text: '\n' }
  );

  return {
    content: sections,
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 5],
        color: '#1a56db'
      },
      subheader: {
        fontSize: 10,
        italics: true,
        margin: [0, 0, 0, 15],
        color: '#64748b'
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5],
        color: '#1e293b'
      },
      divider: {
        color: '#e2e8f0',
        margin: [0, 5, 0, 10]
      },
      contentParagraph: {
        fontSize: 10,
        margin: [0, 0, 0, 5],
        lineHeight: 1.4
      },
      rawContent: {
        fontSize: 9,
        color: '#64748b',
        italics: true,
        margin: [0, 5, 0, 10]
      }
    },
    defaultStyle: {
      font: 'Roboto'
    },
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60]
  };
}

module.exports = { generateResume };