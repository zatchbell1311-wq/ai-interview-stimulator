"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { InterviewLevel, InterviewerMood, InterviewState } from './types';

// Initial State
const initialState: InterviewState = {
    level: 1,
    mood: 'CALM',
    confidenceScore: 100,
    timeLeft: 60,
    isInterviewActive: false,
    questionCount: 0,
    questionQueue: [],
    currentQuestionIndex: 0
};

// Actions
type Action =
    | { type: 'START_INTERVIEW' }
    | { type: 'END_INTERVIEW' }
    | { type: 'SET_MOOD'; payload: InterviewerMood }
    | { type: 'SET_LEVEL'; payload: InterviewLevel }
    | { type: 'UPDATE_CONFIDENCE'; payload: number }
    | { type: 'TICK_TIMER' }
    | { type: 'RESET_TIMER'; payload: number }
    | { type: 'SET_QUEUE'; payload: any[] }
    | { type: 'NEXT_QUESTION' };

// Reducer
function interviewReducer(state: InterviewState, action: Action): InterviewState {
    switch (action.type) {
        case 'START_INTERVIEW':
            return { ...initialState, isInterviewActive: true, questionQueue: state.questionQueue }; // Preserve queue if set
        case 'END_INTERVIEW':
            return { ...state, isInterviewActive: false };
        case 'SET_MOOD':
            return { ...state, mood: action.payload };
        case 'SET_LEVEL':
            return { ...state, level: action.payload };
        case 'UPDATE_CONFIDENCE':
            return { ...state, confidenceScore: action.payload };
        case 'TICK_TIMER':
            return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };
        case 'RESET_TIMER':
            return { ...state, timeLeft: action.payload };
        case 'SET_QUEUE':
            return { ...state, questionQueue: action.payload, currentQuestionIndex: 0 };
        case 'NEXT_QUESTION':
            return {
                ...state,
                currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questionQueue.length - 1)
            };
        default:
            return state;
    }
}

// Context
const InterviewContext = createContext<{
    state: InterviewState;
    dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Provider
export function InterviewProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(interviewReducer, initialState);

    return (
        <InterviewContext.Provider value={{ state, dispatch }}>
            {children}
        </InterviewContext.Provider>
    );
}

// Hook
export function useInterview() {
    const context = useContext(InterviewContext);
    if (context === undefined) {
        throw new Error('useInterview must be used within an InterviewProvider');
    }
    return context;
}
