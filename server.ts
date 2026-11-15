import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function handleGeminiError(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const lower = rawMessage.toLowerCase();

  if (lower.includes('403') || lower.includes('permission_denied') || lower.includes('api_key_invalid') || lower.includes('api key')) {
    return {
      status: 403,
      message: 'Gemini API key is missing or invalid. Please check your key in the Settings > Secrets panel.',
    };
  }
  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return {
      status: 429,
      message: 'Gemini request limit reached. Please wait a moment and try again.',
    };
  }
  if (lower.includes('404') || lower.includes('not_found')) {
    return {
      status: 404,
      message: `Requested Gemini model (${MODEL_NAME}) was not found or is currently unavailable.`,
    };
  }
  return {
    status: 500,
    message: rawMessage || 'An unexpected error occurred while contacting Gemini.',
  };
}

interface SubjectFilePayload {
  name: string;
  courseCode?: string;
  topic?: string;
  mimeType: string;
  size?: number;
  textContent?: string;
  base64Data?: string;
  geminiFileUri?: string;
}

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { fileData: { fileUri: string; mimeType: string } };

const ALLOWED_INLINE_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

function buildSubjectFileParts(subjectFiles?: SubjectFilePayload[]): GeminiPart[] {
  if (!Array.isArray(subjectFiles) || subjectFiles.length === 0) return [];
  const parts: GeminiPart[] = [];
  const limited = subjectFiles.slice(0, 12);

  for (const file of limited) {
    if (!file || typeof file.name !== 'string') continue;
    const courseLabel = file.courseCode || 'GENERAL';
    const topicSuffix = file.topic ? ` | Topic: ${file.topic}` : '';

    if (typeof file.textContent === 'string' && file.textContent.trim().length > 0) {
      parts.push({
        text: `[Subject Material — Course: ${courseLabel}${topicSuffix} | File: ${file.name}]\n${file.textContent.slice(0, 50000)}`,
      });
    } else if (
      typeof file.geminiFileUri === 'string' &&
      file.geminiFileUri.length > 0 &&
      ALLOWED_INLINE_MIME_TYPES.has(file.mimeType)
    ) {
      parts.push({
        text: `[Attached Subject File — Course: ${courseLabel}${topicSuffix} | File: ${file.name} (${file.mimeType})]`,
      });
      parts.push({
        fileData: {
          fileUri: file.geminiFileUri,
          mimeType: file.mimeType,
        },
      });
    } else if (
      typeof file.base64Data === 'string' &&
      file.base64Data.length > 0 &&
      ALLOWED_INLINE_MIME_TYPES.has(file.mimeType)
    ) {
      parts.push({
        text: `[Attached Subject File — Course: ${courseLabel}${topicSuffix} | File: ${file.name} (${file.mimeType})]`,
      });
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.base64Data,
        },
      });
    } else {
      parts.push({
        text: `[Stored Large Subject File — Course: ${courseLabel}${topicSuffix} | File: ${file.name} (${file.mimeType})]`,
      });
    }
  }

  return parts;
}

async function startServer() {
  const app = express();

  app.post(
    '/api/files/upload',
    express.raw({ type: '*/*', limit: '55mb' }),
    async (req: Request, res: Response) => {
      const ai = getAiClient();
      if (!ai) {
        res.status(503).json({ error: 'Gemini API key is not configured.' });
        return;
      }

      const rawBuffer = req.body;
      if (!Buffer.isBuffer(rawBuffer) || rawBuffer.length === 0) {
        res.status(400).json({ error: 'File body is required.' });
        return;
      }

      const mimeType = String(req.headers['content-type'] || 'application/pdf').split(';')[0].trim();
      if (!ALLOWED_INLINE_MIME_TYPES.has(mimeType)) {
        res.status(400).json({ error: 'Unsupported binary MIME type.' });
        return;
      }

      const rawHeaderName = req.headers['x-file-name'];
      const displayName =
        typeof rawHeaderName === 'string' ? decodeURIComponent(rawHeaderName).slice(0, 200) : 'document.pdf';

      try {
        const blob = new Blob([new Uint8Array(rawBuffer)], { type: mimeType });
        const uploaded = await ai.files.upload({
          file: blob,
          config: { mimeType, displayName },
        });
        res.json({ fileUri: uploaded.uri, name: uploaded.name });
      } catch (err) {
        const formatted = handleGeminiError(err);
        res.status(formatted.status).json({ error: formatted.message });
      }
    }
  );

  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, model: MODEL_NAME, configured: Boolean(getAiClient()) });
  });

  app.post('/api/advisor/recommendations', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please verify GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const { academicSummary, studentName, major, language, subjectFiles } = req.body as {
      academicSummary?: string;
      studentName?: string;
      major?: string;
      language?: string;
      subjectFiles?: SubjectFilePayload[];
    };

    if (!academicSummary || typeof academicSummary !== 'string') {
      res.status(400).json({ error: 'Academic summary is required.' });
      return;
    }

    const targetLanguage = language || 'English';
    const fileParts = buildSubjectFileParts(subjectFiles);
    const promptText = `Analyze this student's academic record${
      fileParts.length > 0 ? ' and the attached subject materials (syllabi, notes, slides, or worksheets)' : ''
    } and generate 4 to 5 highly specific, personalized study recommendations prioritized by GPA impact and target grade gaps.\nRespond in ${targetLanguage}.\n\nStudent: ${studentName || 'Student'} (${major || 'Undergraduate'})\n\n${academicSummary}`;

    const contents =
      fileParts.length > 0
        ? { parts: [...fileParts, { text: promptText }] }
        : promptText;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction:
            `You are an expert university academic advisor and cognitive learning strategist. Provide concrete, evidence-based study recommendations tailored strictly to the student's actual courses (whether STEM, humanities, social sciences, or Indonesian national curriculum subjects such as Pendidikan Pancasila, Pendidikan Kewarganegaraan, Pendidikan Agama, Bahasa Indonesia, or any custom college major subject), assignment scores, topics, passing grade requirements, and credit weights. Reference real assignment titles, topics, and specific chapters, readings, formulas, or rubrics from any attached subject files when available. Write all human-readable fields (diagnosis, focusArea, actionPlan, studyTechnique, impactNote) entirely in ${targetLanguage}, while keeping the priority field strictly one of the exact English enum tokens: "High", "Medium", or "Maintain".`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosis: {
                type: Type.STRING,
                description:
                  'A crisp 2-sentence overview identifying the student\'s current standing and highest-leverage courses for GPA improvement.',
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    courseCode: { type: Type.STRING, description: 'Exact course code (e.g. CHEM 212).' },
                    courseName: { type: Type.STRING, description: 'Full course name.' },
                    priority: {
                      type: Type.STRING,
                      description: 'Exactly one of: High, Medium, Maintain',
                    },
                    focusArea: {
                      type: Type.STRING,
                      description: 'Specific weak topic or skill to target (under 8 words).',
                    },
                    actionPlan: {
                      type: Type.STRING,
                      description: 'Concrete 1-2 sentence study action referencing specific assignments or topics.',
                    },
                    studyTechnique: {
                      type: Type.STRING,
                      description: 'Evidence-based method (e.g. Retrieval Practice, Error Log, Worked Examples).',
                    },
                    estimatedMinutes: {
                      type: Type.INTEGER,
                      description: 'Recommended focused session length in minutes (between 20 and 90).',
                    },
                    impactNote: {
                      type: Type.STRING,
                      description: 'Short explanation of how this helps close the target grade or GPA gap.',
                    },
                  },
                  required: [
                    'courseCode',
                    'courseName',
                    'priority',
                    'focusArea',
                    'actionPlan',
                    'studyTechnique',
                    'estimatedMinutes',
                    'impactNote',
                  ],
                },
              },
            },
            required: ['diagnosis', 'recommendations'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json({
        diagnosis: parsed.diagnosis || 'Personalized plan generated from your current academic record.',
        generatedAt: new Date().toISOString(),
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      });
    } catch (err) {
      const formatted = handleGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/advisor/study-guide', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please verify GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const { courseCode, courseName, assignmentTitle, topic, scorePercentage, language, subjectFiles } = req.body as {
      courseCode?: string;
      courseName?: string;
      assignmentTitle?: string;
      topic?: string;
      scorePercentage?: number;
      language?: string;
      subjectFiles?: SubjectFilePayload[];
    };

    if (!courseCode || !assignmentTitle) {
      res.status(400).json({ error: 'Course code and assignment title are required.' });
      return;
    }

    const targetLanguage = language || 'English';
    const fileParts = buildSubjectFileParts(subjectFiles);
    const guidePrompt = `Create a focused micro-study guide in ${targetLanguage} for a student reviewing "${assignmentTitle}" in ${courseCode} (${courseName || ''}).\nTopic: ${topic || assignmentTitle}\nScore achieved: ${scorePercentage ?? 'N/A'}%${
      fileParts.length > 0 ? '\nGround the refresher and practice questions in the attached subject materials.' : ''
    }`;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: fileParts.length > 0 ? { parts: [...fileParts, { text: guidePrompt }] } : guidePrompt,
        config: {
          systemInstruction:
            `You are an encouraging, rigorous university tutor. Deliver concise, crystal-clear explanations and realistic practice questions to help the student master the underlying concept, drawing directly from any attached subject files when relevant. Write all explanations, tips, questions, hints, and answers entirely in ${targetLanguage}.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conceptRecap: {
                type: Type.STRING,
                description: 'Clear 2-3 sentence refresher on the core concept.',
              },
              commonMistake: {
                type: Type.STRING,
                description: 'The single most frequent pitfall students make on this topic.',
              },
              actionableTip: {
                type: Type.STRING,
                description: 'A practical check or heuristic to use on the next exam.',
              },
              practiceQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    hint: { type: Type.STRING },
                    answer: { type: Type.STRING },
                  },
                  required: ['question', 'hint', 'answer'],
                },
              },
            },
            required: ['conceptRecap', 'commonMistake', 'actionableTip', 'practiceQuestions'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      res.json({
        courseCode,
        assignmentTitle,
        topic: topic || assignmentTitle,
        conceptRecap: parsed.conceptRecap || '',
        commonMistake: parsed.commonMistake || '',
        actionableTip: parsed.actionableTip || '',
        practiceQuestions: Array.isArray(parsed.practiceQuestions) ? parsed.practiceQuestions : [],
      });
    } catch (err) {
      const formatted = handleGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/advisor/chat', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please verify GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const { messages, academicSummary, studentName, language, subjectFiles } = req.body as {
      messages?: Array<{ role: 'user' | 'model'; content: string }>;
      academicSummary?: string;
      studentName?: string;
      language?: string;
      subjectFiles?: SubjectFilePayload[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'At least one message is required.' });
      return;
    }

    const targetLanguage = language || 'English';
    const fileParts = buildSubjectFileParts(subjectFiles);

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    try {
      const contents = messages.map((m, idx) => {
        const textPart: GeminiPart = { text: m.content };
        if (idx === 0 && m.role !== 'model' && fileParts.length > 0) {
          return {
            role: 'user' as const,
            parts: [...fileParts, textPart],
          };
        }
        return {
          role: m.role === 'model' ? ('model' as const) : ('user' as const),
          parts: [textPart],
        };
      });

      const stream = await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction: `You are Students Choice Advisor, a thoughtful, minimalist university academic advisor coaching ${
            studentName || 'the student'
          }. You have full visibility into their live academic record below:\n\n${
            academicSummary || 'No courses entered yet.'
          }\n\n${
            fileParts.length > 0
              ? 'The student has also attached subject files (syllabi, lecture notes, PDFs, or slides) in the conversation context. Prioritize citing concepts, chapters, formulas, and definitions directly from these subject files whenever relevant.\n\n'
              : ''
          }Guidelines:\n- Respond entirely in ${targetLanguage}.\n- Be direct, calm, and structured. Use short paragraphs and crisp bullet points.\n- Always ground advice in their real grades, credit weights, passing grades, attached subject materials, and remaining weight calculations.\n- If they ask for practice problems or study plans, tailor them to their exact weak topics and uploaded materials.\n- Do not use emojis or filler praise.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err) {
      const formatted = handleGeminiError(err);
      res.write(`data: ${JSON.stringify({ error: formatted.message })}\n\n`);
      res.end();
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Meridian server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
