import { jsPDF } from 'jspdf';
import { LectureNote } from '../types';

/**
 * Cleanly format and export synthesized lecture notes as a Markdown (.md) file
 */
export function exportLectureToMarkdown(lecture: LectureNote): void {
  const sanitize = (str?: string) => (str || '').trim();

  let md = `# ${sanitize(lecture.title)}\n\n`;
  md += `**Subject:** ${sanitize(lecture.subject || 'General Studies')}  \n`;
  md += `**Lecturer / Professor:** ${sanitize(lecture.lecturer || 'Faculty')}  \n`;
  md += `**Date:** ${sanitize(lecture.date)}  \n`;
  if (lecture.durationSeconds) {
    const mins = Math.round(lecture.durationSeconds / 60);
    md += `**Duration:** ${mins > 0 ? `${mins} minutes` : `${lecture.durationSeconds}s`}  \n`;
  }
  md += `**Synthesized by:** LECTURA AI Academic Study Suite  \n\n`;
  md += `---\n\n`;

  // Tangents Filter Summary
  if (lecture.notes.unnecessaryTangentsSummary) {
    const ts = lecture.notes.unnecessaryTangentsSummary;
    md += `## 🛡️ AI Distraction & Tangent Filter Summary\n\n`;
    md += `- **Examinable Study Time Saved:** ${ts.totalTimeSavedMinutes} minutes\n`;
    md += `- **Filtered Irrelevant Items:** ${ts.flaggedItemsCount} classroom distractions / conversational tangents\n`;
    if (ts.tangentHighlights && ts.tangentHighlights.length > 0) {
      md += `- **Filtered Tangents:**\n`;
      ts.tangentHighlights.forEach((t) => {
        md += `  - 🚫 *${t}*\n`;
      });
    }
    md += `\n---\n\n`;
  }

  // Executive Summary
  md += `## 📌 Executive Summary & Thesis\n\n`;
  md += `${sanitize(lecture.notes.executiveSummary)}\n\n`;
  md += `---\n\n`;

  // Key Topics
  md += `## 📚 Core Study Modules & Synthesized Concepts\n\n`;
  lecture.notes.keyTopics.forEach((topic, idx) => {
    md += `### ${idx + 1}. ${sanitize(topic.title)}\n\n`;
    md += `${sanitize(topic.description)}\n\n`;

    if (topic.corePoints && topic.corePoints.length > 0) {
      md += `#### Core Principles & Key Points:\n`;
      topic.corePoints.forEach((pt) => {
        md += `- ${pt}\n`;
      });
      md += `\n`;
    }

    if (topic.analogies && topic.analogies.length > 0) {
      md += `#### 💡 Intuitive Analogy / Plain Concept:\n`;
      topic.analogies.forEach((a) => {
        md += `> ${a}\n`;
      });
      md += `\n`;
    }

    if (topic.deepResearchContext?.keyCasesOrTheorems && topic.deepResearchContext.keyCasesOrTheorems.length > 0) {
      md += `#### ⚖️ Key Legal Authorities, Cases & Theorems:\n`;
      topic.deepResearchContext.keyCasesOrTheorems.forEach((c) => {
        md += `- **${c.name}** ${c.citation ? `*(${c.citation})*` : ''}: ${c.principle}\n`;
      });
      md += `\n`;
    }

    if (topic.examTips && topic.examTips.length > 0) {
      md += `#### ⚠️ Exam Tips & Common Pitfalls:\n`;
      topic.examTips.forEach((tip) => {
        md += `- **Tip:** ${tip}\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
  });

  // Key Terms Glossary
  if (lecture.notes.keyTermsGlossary && lecture.notes.keyTermsGlossary.length > 0) {
    md += `## 📖 Academic Glossary of Terms\n\n`;
    lecture.notes.keyTermsGlossary.forEach((term) => {
      md += `### ${term.term}\n`;
      md += `- **Academic Definition:** ${term.definition}\n`;
      if (term.simplifiedExplanation) {
        md += `- **Plain English Meaning:** *${term.simplifiedExplanation}*\n`;
      }
      md += `\n`;
    });
    md += `---\n\n`;
  }

  // Flashcards appendix if available
  if (lecture.flashcards && lecture.flashcards.length > 0) {
    md += `## 📇 Practice Flashcards Summary\n\n`;
    lecture.flashcards.forEach((fc, i) => {
      md += `**Card ${i + 1}: ${fc.question}**  \n`;
      md += `*Answer:* ${fc.answer}  \n`;
      if (fc.category) md += `*Topic:* \`${fc.category}\`  \n`;
      md += `\n`;
    });
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const cleanName = lecture.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  anchor.href = url;
  anchor.download = `${cleanName}_Lectura_Notes.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download a formatted, multi-page PDF document for the lecture notes
 */
export function exportLectureToPDF(lecture: LectureNote): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      cursorY = margin;
      // Small header on subsequent pages
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 165);
      doc.text(`LECTURA AI — ${lecture.title.substring(0, 45)}...`, margin, cursorY);
      doc.setDrawColor(220, 225, 235);
      doc.line(margin, cursorY + 2, pageWidth - margin, cursorY + 2);
      cursorY += 8;
    }
  };

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.roundedRect(margin, cursorY, contentWidth, 26, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(lecture.title, contentWidth - 10);
  doc.text(titleLines, margin + 5, cursorY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(190, 205, 230);
  const metaText = `${lecture.subject || 'Academic Lecture'}  |  Lecturer: ${lecture.lecturer || 'Faculty'}  |  Date: ${lecture.date}`;
  doc.text(metaText, margin + 5, cursorY + 18);

  cursorY += 32;

  // Tangents Filter Box if present
  if (lecture.notes.unnecessaryTangentsSummary) {
    const ts = lecture.notes.unnecessaryTangentsSummary;
    checkPageBreak(22);
    doc.setFillColor(236, 253, 245); // Emerald light
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin, cursorY, contentWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(6, 95, 70);
    doc.text(`AI Distraction Filter Active (${ts.totalTimeSavedMinutes} mins saved)`, margin + 4, cursorY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(4, 120, 87);
    const filterMsg = `Stripped ${ts.flaggedItemsCount} non-examinable distractions and conversational tangents so you focus strictly on testable materials.`;
    doc.text(doc.splitTextToSize(filterMsg, contentWidth - 8), margin + 4, cursorY + 12);

    cursorY += 24;
  }

  // Executive Summary Section
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text('EXECUTIVE SUMMARY & THESIS', margin, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59); // Slate 800
  const summaryLines = doc.splitTextToSize(lecture.notes.executiveSummary, contentWidth);
  doc.text(summaryLines, margin, cursorY);
  cursorY += summaryLines.length * 4.8 + 8;

  // Section Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, cursorY - 3, pageWidth - margin, cursorY - 3);

  // Key Topics
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text('CORE TOPICS & SYNTHESIZED MODULES', margin, cursorY);
  cursorY += 7;

  lecture.notes.keyTopics.forEach((topic, idx) => {
    checkPageBreak(25);

    // Topic Title Pill
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.roundedRect(margin, cursorY, contentWidth, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}. ${topic.title}`, margin + 3, cursorY + 5);
    cursorY += 10;

    // Topic Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(topic.description, contentWidth);
    checkPageBreak(descLines.length * 4.5);
    doc.text(descLines, margin, cursorY);
    cursorY += descLines.length * 4.5 + 4;

    // Core Points
    if (topic.corePoints && topic.corePoints.length > 0) {
      checkPageBreak(topic.corePoints.length * 6 + 6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Key Principles:', margin + 2, cursorY);
      cursorY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      topic.corePoints.forEach((pt) => {
        const ptLines = doc.splitTextToSize(`• ${pt}`, contentWidth - 6);
        checkPageBreak(ptLines.length * 4.2);
        doc.text(ptLines, margin + 4, cursorY);
        cursorY += ptLines.length * 4.2 + 1;
      });
      cursorY += 3;
    }

    // Key Authorities or Cases
    if (topic.deepResearchContext?.keyCasesOrTheorems && topic.deepResearchContext.keyCasesOrTheorems.length > 0) {
      checkPageBreak(topic.deepResearchContext.keyCasesOrTheorems.length * 7 + 6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(124, 58, 237); // Purple 600
      doc.text('Authorities, Case Law & Theorems:', margin + 2, cursorY);
      cursorY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      topic.deepResearchContext.keyCasesOrTheorems.forEach((c) => {
        const caseText = `⚖ ${c.name} ${c.citation ? `(${c.citation})` : ''}: ${c.principle}`;
        const cLines = doc.splitTextToSize(caseText, contentWidth - 6);
        checkPageBreak(cLines.length * 4.2);
        doc.text(cLines, margin + 4, cursorY);
        cursorY += cLines.length * 4.2 + 1;
      });
      cursorY += 3;
    }

    // Exam Tips
    if (topic.examTips && topic.examTips.length > 0) {
      checkPageBreak(topic.examTips.length * 6 + 6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9); // Amber 700
      doc.text('Exam Tips & Pitfalls:', margin + 2, cursorY);
      cursorY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      topic.examTips.forEach((tip) => {
        const tLines = doc.splitTextToSize(`⚠️ ${tip}`, contentWidth - 6);
        checkPageBreak(tLines.length * 4.2);
        doc.text(tLines, margin + 4, cursorY);
        cursorY += tLines.length * 4.2 + 1;
      });
      cursorY += 3;
    }

    cursorY += 4;
  });

  // Glossary Section
  if (lecture.notes.keyTermsGlossary && lecture.notes.keyTermsGlossary.length > 0) {
    checkPageBreak(25);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text('ACADEMIC GLOSSARY OF TERMS', margin, cursorY);
    cursorY += 6;

    lecture.notes.keyTermsGlossary.forEach((item) => {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${item.term}`, margin + 2, cursorY);
      cursorY += 4.2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const defLines = doc.splitTextToSize(`Definition: ${item.definition}`, contentWidth - 6);
      doc.text(defLines, margin + 5, cursorY);
      cursorY += defLines.length * 4 + 1;

      if (item.simplifiedExplanation) {
        doc.setFont('helvetica', 'italic');
        const simpLines = doc.splitTextToSize(`Plain English: ${item.simplifiedExplanation}`, contentWidth - 6);
        doc.text(simpLines, margin + 5, cursorY);
        cursorY += simpLines.length * 4 + 3;
      }
    });
  }

  // Add Page Numbers to all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    doc.text('Synthesized via LECTURA AI', pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const cleanName = lecture.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  doc.save(`${cleanName}_Lectura_Notes.pdf`);
}
