/**
 * Gemini AI Quiz & Question Generator Service
 * Integrates with Google Gemini API to autonomously generate curriculum-aligned MCQs.
 */

const GEMINI_API_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
  (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) || 
  '';

// Optimized model hierarchy: prioritizing fast, high-availability lite models first to avoid 503 demand spikes
const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.6-flash'
];

/**
 * Generate MCQs using Gemini
 * @param {Object} params
 * @param {string} params.topic - Subject topic or chapter name
 * @param {number} params.numQuestions - Number of questions (1-20)
 * @param {string} params.difficulty - 'Easy' | 'Medium' | 'Hard' | 'Competitive'
 * @param {string} [params.subject] - Academic subject (e.g. Mathematics, Science)
 * @param {string} [params.className] - Class level (e.g. 10-A)
 * @param {string} [params.notes] - Custom teacher notes/text (exclusive source when provided)
 * @param {string} [params.questionStyle] - 'balanced' | 'conceptual' | 'numerical' | 'assertion_reason' | 'case_study'
 * @param {string} [params.language] - 'English' | 'Hindi' | 'Bilingual'
 * @param {string} [params.markingScheme] - '+5 / -0' | '+4 / -1' | '+1 / -0'
 * @param {string} [params.bloomLevel] - 'balanced' | 'recall' | 'analytical'
 * @returns {Promise<Array>} Array of generated question objects
 */
export async function generateQuizQuestionsWithAI({
  topic,
  numQuestions = 5,
  difficulty = 'Medium',
  subject = 'General Studies',
  className = 'Class 10',
  notes = '',
  questionStyle = 'balanced',
  language = 'English',
  markingScheme = '+5 / -0',
  bloomLevel = 'balanced'
}) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  if (!topic && !notes) {
    throw new Error('Please provide either a Topic, Chapter Name, or Upload Notes for the AI to formulate questions.');
  }

  const hasNotes = Boolean(notes && notes.trim().length > 10);

  // Parse marks from scheme
  let marksPerQuestion = 5;
  if (markingScheme.includes('+4')) marksPerQuestion = 4;
  else if (markingScheme.includes('+1')) marksPerQuestion = 1;

  // Formulate the prompt
  let systemInstructions = `You are a Senior CBSE Board Academic Examiner and NCERT Curriculum Specialist.
Your task is to generate exactly ${numQuestions} high-quality Multiple Choice Questions (MCQs) for students of ${className} studying ${subject}.
Academic Difficulty: ${difficulty}.
Topic / Unit: "${topic || 'Provided Lesson Notes'}".
Preferred Language / Medium: ${language}.
Marks per Question: ${marksPerQuestion} (${markingScheme}).`;

  if (questionStyle === 'assertion_reason') {
    systemInstructions += `\nQUESTION FORMAT: Generate "Assertion & Reason" questions following the official CBSE format. Each question should present an Assertion (A) and a Reason (R), with standard options:
A) Both (A) and (R) are true and (R) is the correct explanation of (A).
B) Both (A) and (R) are true but (R) is not the correct explanation of (A).
C) (A) is true but (R) is false.
D) (A) is false but (R) is true.`;
  } else if (questionStyle === 'numerical') {
    systemInstructions += `\nQUESTION FORMAT: Focus heavily on numerical problem solving, formula application, and mathematical computation with authentic, calculated distractors.`;
  } else if (questionStyle === 'case_study') {
    systemInstructions += `\nQUESTION FORMAT: Include real-world scenario/case-study based questions that test practical application of concepts.`;
  } else if (questionStyle === 'conceptual') {
    systemInstructions += `\nQUESTION FORMAT: Focus on deep conceptual understanding, fundamental principles, and disambiguation of common misconceptions.`;
  }

  if (bloomLevel === 'analytical') {
    systemInstructions += `\nCOGNITIVE LEVEL: Target Higher Order Thinking Skills (HOTS) - analysis, evaluation, and synthesis. Avoid trivial rote recall.`;
  } else if (bloomLevel === 'recall') {
    systemInstructions += `\nCOGNITIVE LEVEL: Focus on key definitions, terminology, historical facts, and core formulas for rapid recall assessment.`;
  }

  if (hasNotes) {
    systemInstructions += `\n\nCRITICAL MANDATE - EXCLUSIVE SOURCE RESTRICTION:
The educator has uploaded their own specific lesson notes / textbook material below.
You MUST formulate every single question and its options EXCLUSIVELY based on the facts, concepts, definitions, and formulas contained in these notes. Do NOT introduce external concepts, figures, or facts not mentioned in these notes.

--- TEACHER LESSON NOTES START ---
${notes.trim()}
--- TEACHER LESSON NOTES END ---`;
  } else {
    systemInstructions += `\nEnsure questions strictly adhere to modern standard NCERT / CBSE curriculum guidelines, test understanding rather than rote recall, and contain realistic distractors.`;
  }

  systemInstructions += `\n\nOUTPUT FORMAT SPECIFICATION:
You MUST respond with a valid, parseable JSON array of objects. Do not include introductory conversational text.
Each question object MUST strictly contain:
- "prompt": string (The clear question text)
- "options": array of 4 distinct strings (Options A, B, C, D)
- "correctIndex": integer (0 for A, 1 for B, 2 for C, 3 for D)
- "explanation": string (Clear step-by-step reasoning explaining why the correct option is right)
- "marks": number (e.g. ${marksPerQuestion})

Example JSON structure:
[
  {
    "prompt": "Which organelle is known as the powerhouse of the cell?",
    "options": ["Ribosome", "Mitochondria", "Nucleus", "Endoplasmic Reticulum"],
    "correctIndex": 1,
    "explanation": "Mitochondria produce cellular energy through ATP synthesis, hence termed the powerhouse.",
    "marks": ${marksPerQuestion}
  }
]`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: systemInstructions
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      topP: 0.95,
      responseMimeType: 'application/json'
    }
  };

  // Helper to call a specific model with timeout
  const callModel = async (modelName, timeoutMs = 16000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
        throw new Error(`[${modelName}] ${errMsg}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new Error(`[${modelName}] Request timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  };

  let data;
  const failureLog = [];

  // Try candidate models in order of priority & responsiveness
  for (const modelName of CANDIDATE_MODELS) {
    try {
      data = await callModel(modelName, 16000);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) {
        break; // Successfully generated content
      }
    } catch (err) {
      console.warn(`[Gemini AI] Model ${modelName} failed, trying next candidate:`, err.message);
      failureLog.push(`${modelName}: ${err.message}`);
    }
  }

  if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error(
      `All AI models are currently unavailable. Details:\n${failureLog.join('\n')}`
    );
  }

  // Extract generated text
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API did not return any content parts in its response.');
  }

  // Parse JSON from text (handling markdown ```json blocks)
  let cleanJsonText = rawText.trim();
  if (cleanJsonText.startsWith('```')) {
    cleanJsonText = cleanJsonText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }

  let parsedQuestions = [];
  try {
    parsedQuestions = JSON.parse(cleanJsonText);
  } catch (jsonErr) {
    // Fallback regex attempt if minor framing text exists
    const match = cleanJsonText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      parsedQuestions = JSON.parse(match[0]);
    } else {
      throw new Error('Could not parse structured question JSON from AI response: ' + jsonErr.message);
    }
  }

  if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
    throw new Error('AI response was empty or did not yield a valid question list.');
  }

  // Sanitize and validate fields
  return parsedQuestions.map((q, idx) => ({
    prompt: q.prompt || `Question ${idx + 1}`,
    options: Array.isArray(q.options) && q.options.length >= 4 
      ? q.options.slice(0, 4).map(o => String(o)) 
      : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3 
      ? q.correctIndex 
      : 0,
    explanation: q.explanation || 'Verified answer according to academic curriculum.',
    marks: Number(q.marks) || 5
  }));
}
