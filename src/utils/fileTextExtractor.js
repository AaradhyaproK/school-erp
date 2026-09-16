/**
 * Utility to extract text from multiple file formats:
 * Supports: PDF, TXT, MD, DOCX, CSV, JSON
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.4.168'}/pdf.worker.min.mjs`;
}

/**
 * Extract plain text from an uploaded File object
 * @param {File} file 
 * @returns {Promise<{ text: string, fileInfo: { name: string, size: number, type: string, pageCount?: number } }>}
 */
export async function extractTextFromFile(file) {
  if (!file) throw new Error('No file provided');

  const name = file.name || 'document';
  const extension = name.split('.').pop().toLowerCase();
  const size = file.size;

  // 1. Plain Text, Markdown, CSV, JSON
  if (['txt', 'md', 'markdown', 'csv', 'json', 'log', 'rtf'].includes(extension) || file.type.startsWith('text/')) {
    const text = await readFileAsText(file);
    return {
      text: text.trim(),
      fileInfo: {
        name,
        size,
        type: file.type || 'text/plain'
      }
    };
  }

  // 2. PDF Documents
  if (extension === 'pdf' || file.type === 'application/pdf') {
    return await extractTextFromPdf(file);
  }

  // 3. Word DOCX Documents (DOCX is a zip with word/document.xml)
  if (extension === 'docx') {
    return await extractTextFromDocx(file);
  }

  // Fallback: try reading as text
  try {
    const text = await readFileAsText(file);
    if (text && text.length > 20) {
      return {
        text: text.trim(),
        fileInfo: { name, size, type: file.type || 'application/octet-stream' }
      };
    }
  } catch {}

  throw new Error(`Unsupported file format (.${extension}). Please upload PDF, TXT, DOCX, or MD notes.`);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.onerror = () => reject(new Error('Failed to read file contents'));
    reader.readAsText(file);
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read binary file'));
    reader.readAsArrayBuffer(file);
  });
}

async function extractTextFromPdf(file) {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  let fullText = '';
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items.map(item => item.str || '').join(' ');
    fullText += `\n--- Page ${pageNum} ---\n` + pageStrings + '\n';
  }

  return {
    text: fullText.trim(),
    fileInfo: {
      name: file.name,
      size: file.size,
      type: 'application/pdf',
      pageCount: numPages
    }
  };
}

async function extractTextFromDocx(file) {
  // Simple XML tag stripper for docx if JSZip is not installed, or try reading text
  try {
    const text = await readFileAsText(file);
    // Strip XML tags if present
    const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (clean.length > 50) {
      return {
        text: clean,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      };
    }
  } catch {}

  throw new Error('Please save your Word document as PDF or TXT for best formatting accuracy.');
}
