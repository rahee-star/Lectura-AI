export interface TranscriptSegment {
  id: string;
  timestamp: string; // e.g. "04:15"
  timeSeconds: number;
  speaker: string;
  text: string;
  isUnnecessary: boolean; // Flagged by AI as lecturer tangent / chit-chat / admin notice
  tangentCategory?: 'chitchat' | 'administrative' | 'mic-check' | 'digression' | 'tech-issues' | 'repetition';
  tangentReason?: string;
}

export interface DeepResearchContext {
  historicalBackground?: string;
  realWorldApplication?: string;
  keyCasesOrTheorems?: Array<{
    name: string;
    citation?: string;
    principle: string;
    relevance: string;
  }>;
  criticalAnalysis?: string;
  simplifiedAnalogy?: string;
}

export interface KeyTopic {
  id: string;
  title: string;
  description: string;
  corePoints: string[];
  analogies?: string[];
  deepResearchContext?: DeepResearchContext;
  examTips?: string[];
}

export interface KeyTerm {
  term: string;
  definition: string;
  simplifiedExplanation: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  parentId?: string;
  category?: string;
  details?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  masteryStatus?: 'new' | 'learning' | 'mastered';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicTag: string;
}

export interface EssayQuestion {
  id: string;
  prompt: string;
  contextHint: string;
  keyPointsExpected: string[];
  sampleOutline: string;
  modelAnswer: string;
}

export interface RubricCategory {
  score: number;
  max: number;
  feedback: string;
}

export interface EssaySubmission {
  id: string;
  questionId: string;
  studentAnswer: string;
  submittedAt: string;
  score: number; // 0 - 100
  rubricFeedback: {
    conceptualUnderstanding: RubricCategory;
    useOfEvidenceAndCases: RubricCategory;
    criticalAnalysis: RubricCategory;
    structureAndClarity: RubricCategory;
  };
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LectureNote {
  id: string;
  title: string;
  subject: string;
  lecturer: string;
  date: string;
  durationSeconds: number;
  audioBlobUrl?: string;
  audioBase64?: string;
  status: 'recording' | 'processing' | 'ready' | 'error';
  errorMessage?: string;
  
  // Transcripts
  transcript: TranscriptSegment[];
  
  // Synthesized AI Notes
  notes: {
    executiveSummary: string;
    keyTopics: KeyTopic[];
    unnecessaryTangentsSummary: {
      totalTimeSavedMinutes: number;
      flaggedItemsCount: number;
      tangentHighlights: string[];
    };
    keyTermsGlossary: KeyTerm[];
    mindMapNodes: MindMapNode[];
  };
  
  // Interactive Learning Tools
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
  essayQuestions: EssayQuestion[];
  essaySubmissions: EssaySubmission[];
  chatHistory: ChatMessage[];
}

export interface ProcessingProgress {
  stage: 'idle' | 'transcribing' | 'filtering_tangents' | 'formulating_notes' | 'generating_study_suite' | 'completed' | 'error';
  message: string;
  percent: number;
}

export interface UserFeedback {
  id: string;
  rating: number; // 1 to 5
  category: 'audio_transcription' | 'tangent_filtering' | 'notes_quality' | 'bug_issue' | 'feature_request' | 'general';
  complaint: string;
  userContact?: string;
  timestamp: string;
  status: 'received' | 'under_review' | 'resolved';
}

export interface UserProfile {
  name: string;
  email: string;
  university: string;
  faculty: string;
  studyLevel?: string;
  isAuthenticated: boolean;
  avatarColor?: string;
  joinedDate?: string;
}

export interface DailyStudyLog {
  date: string; // YYYY-MM-DD
  minutes: number;
  sessionsCount?: number;
  activityBreakdown?: Record<string, number>; // e.g. { 'Flashcards': 15, 'Audio Player': 30 }
}

export interface WeeklyGoalProgress {
  targetMinutes: number;
  studiedMinutesThisWeek: number;
  targetDaysPerWeek: number;
  activeDaysThisWeek: number;
  percentComplete: number;
  isGoalMet: boolean;
  remainingMinutes: number;
  dailyBreakdown: Array<{
    date: string;
    dayName: string;
    shortDate: string;
    minutes: number;
    isToday: boolean;
    isActive: boolean;
  }>;
}

export interface StreakData {
  count: number;
  activeDates: string[]; // YYYY-MM-DD
  lastActiveDate: string;
  weeklyGoalMinutes: number; // e.g. 300 minutes (5 hours)
  targetDaysPerWeek: number; // e.g. 5 days per week
  dailyLogs: Record<string, number>; // date 'YYYY-MM-DD' -> total minutes studied
  studyHistory?: DailyStudyLog[];
}
