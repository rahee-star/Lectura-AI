import { EssaySubmission, LectureNote, TranscriptSegment } from '../types';

export async function transcribeAudioOnly(payload: {
  audioBase64: string;
  audioMime?: string;
  lectureTopic?: string;
  lectureSubject?: string;
  lecturerName?: string;
  language?: string;
}): Promise<{
  fullText: string;
  cleanText: string;
  transcript: TranscriptSegment[];
  wordCount: number;
  durationSeconds: number;
}> {
  const response = await fetch('/api/ai/transcribe-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  const result = await response.json();
  if (!result.success || !result.data) {
    throw new Error('Invalid transcription response from server.');
  }

  return result.data;
}

export async function processLectureWithAI(payload: {
  audioBase64?: string;
  audioMime?: string;
  lectureTopic: string;
  lectureSubject: string;
  lecturerName?: string;
  rawTranscriptText?: string;
}): Promise<Partial<LectureNote>> {
  const response = await fetch('/api/ai/transcribe-and-synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  const result = await response.json();
  if (!result.success || !result.data) {
    throw new Error('Invalid format returned by AI service.');
  }

  return result.data;
}

export async function researchDeepDive(payload: {
  topic: string;
  context?: string;
  subject?: string;
  studentQuery?: string;
}): Promise<string> {
  const response = await fetch('/api/ai/research-deepdive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to research concept.');
  }

  const result = await response.json();
  return result.content || 'No detailed research generated.';
}

export async function gradeStudentEssay(payload: {
  prompt: string;
  studentAnswer: string;
  keyPointsExpected: string[];
  modelAnswer: string;
}): Promise<Omit<EssaySubmission, 'id' | 'questionId' | 'studentAnswer' | 'submittedAt'>> {
  const response = await fetch('/api/ai/grade-essay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to grade essay.');
  }

  const result = await response.json();
  return result.evaluation;
}

export async function sendLectureChatMessage(payload: {
  lectureTitle: string;
  lectureSubject: string;
  notesSummary: any;
  history: Array<{ role: string; content: string }>;
  message: string;
}): Promise<string> {
  const response = await fetch('/api/ai/lecture-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get tutor reply.');
  }

  const result = await response.json();
  return result.reply || 'Sorry, I could not generate a response.';
}

export async function generateExtraStudyItems(payload: {
  lectureTitle: string;
  type: 'quizzes' | 'flashcards';
  count?: number;
  focusArea?: string;
}): Promise<any[]> {
  const response = await fetch('/api/ai/generate-extra-study', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate extra materials.');
  }

  const result = await response.json();
  return result.items || [];
}
