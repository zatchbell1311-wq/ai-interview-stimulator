"use client";

import { useEffect, useState } from 'react';

interface BehaviorStats {
    wpm: number;
    fillerCount: number;
    confidenceScore: number; // 0-100
    fillers: string[];
}

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'sort of', 'i mean', 'actually'];

export function useBehaviorAnalysis(transcript: string, isListening: boolean) {
    const [stats, setStats] = useState<BehaviorStats>({
        wpm: 0,
        fillerCount: 0,
        confidenceScore: 100,
        fillers: []
    });

    useEffect(() => {
        if (!transcript) return;

        const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        // 1. Detect Fillers
        const detectedFillers = words.filter(w => FILLER_WORDS.includes(w));
        const fillerCount = detectedFillers.length;

        // 2. Calculate WPM (Approximate for now, based on session duration would be better, but we need realtime)
        // We'll use a simple heuristic for "current burst" if we were precise, but here we can just count total words / total time ideally.
        // For now, let's just count total words as a proxy for engagement.

        // 3. Confidence Logic
        // Base 100
        // -5 per filler
        // Penalty for very short answers if stopped? (Not handled here)
        const fillerPenalty = fillerCount * 5;
        const score = Math.max(0, 100 - fillerPenalty);

        setStats({
            wpm: wordCount, // Just word count for now, WPM needs a timer
            fillerCount,
            confidenceScore: score,
            fillers: detectedFillers
        });

    }, [transcript]);

    return stats;
}
