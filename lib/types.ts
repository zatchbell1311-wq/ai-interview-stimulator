export type InterviewLevel = 1 | 2 | 3 | 4;

export type InterviewerMood = 'CALM' | 'NEUTRAL' | 'IMPATIENT' | 'AGGRESSIVE';

export interface InterviewState {
    level: InterviewLevel;
    mood: InterviewerMood;
    confidenceScore: number; // 0-100
    timeLeft: number; // seconds for current question
    isInterviewActive: boolean;
    questionCount: number;
    questionQueue: any[];
    currentQuestionIndex: number;
}

export interface Question {
    id: string;
    text: string;
    difficulty: InterviewLevel;
    requiredKeywords?: string[];
}

export interface AnalysisResult {
    transcript: string;
    wpm: number;
    fillerCount: number;
    pauseCount: number;
    confidence: number;
}
