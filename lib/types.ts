export type InterviewLevel = 1 | 2 | 3 | 4;
requiredKeywords ?: string[];
}

export interface AnalysisResult {
    transcript: string;
    wpm: number;
    fillerCount: number;
    pauseCount: number;
    confidence: number;
}
