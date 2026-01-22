"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useInterview } from '@/lib/interview-context';
import { GravityContainer } from '@/components/effects/GravityContainer';
import { Timer } from '@/components/ui/Timer';
import { useSpeechToText } from '@/lib/hooks/use-speech-to-text';
import { useBehaviorAnalysis } from '@/lib/hooks/use-behavior-analysis';
import { useVisualSignals } from '@/lib/hooks/use-visual-signals';
import { CameraPresence } from '@/components/ui/CameraPresence';
import { QUESTIONS } from '@/lib/questions';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, AlertCircle, Eye, Activity, ArrowRight, CheckCircle } from 'lucide-react';
import Webcam from 'react-webcam';

export default function InterviewPage() {
    const { state, dispatch } = useInterview();
    // Use queue from State or Fallback
    const queue = state.questionQueue?.length > 0 ? state.questionQueue : QUESTIONS;
    const currentQuestion = queue[state.currentQuestionIndex] || queue[0];

    const [mounted, setMounted] = useState(false);

    // Refs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const webcamRef = useRef<any>(null);

    // Audio Hooks
    const {
        isListening,
        transcript,
        interimTranscript,
        lastSpeechTime,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeechToText();

    // Visual Hooks
    const visualStats = useVisualSignals(webcamRef);

    // --- GAME LOOP / BRAIN ---
    // This effect runs periodically to assess behavior states that require time-tracking (Silence, Avoidance)
    useEffect(() => {
        if (!isListening) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const silenceDuration = now - lastSpeechTime;
            const isSilent = silenceDuration > 2000; // 2s threshold

            // 1. SILENCE DECAY (Bug #1 Fix)
            if (isSilent) {
                dispatch({ type: 'UPDATE_CONFIDENCE', payload: Math.max(0, state.confidenceScore - 1) });
            }

            // 2. CONTEXTUAL VISUAL ANALYSIS (Bug #2 & #3 Fix)
            // A. AVOIDANCE (Silence + Face Lost)
            if (isSilent && !visualStats.facePresent) {
                dispatch({ type: 'UPDATE_CONFIDENCE', payload: Math.max(0, state.confidenceScore - 3) });
            }

            // B. NERVOUS STALLING (Silence + Chaotic Motion)
            if (isSilent && visualStats.motionLevel === 'chaotic') {
                dispatch({ type: 'UPDATE_CONFIDENCE', payload: Math.max(0, state.confidenceScore - 2) });
            }

        }, 500); // Check every 500ms

        return () => clearInterval(interval);
    }, [isListening, lastSpeechTime, visualStats, state.confidenceScore, dispatch]);

    useEffect(() => {
        setMounted(true);
    }, [dispatch]);

    // Analysis Hooks (Still handles fillers)
    const { confidenceScore } = useBehaviorAnalysis(transcript + ' ' + interimTranscript, isListening);

    // Derived Physics & Stress
    const maxTime = 60;
    const timeProgress = (maxTime - state.timeLeft) / maxTime;
    const timeStress = Math.pow(timeProgress, 2);
    const confidenceStress = (100 - state.confidenceScore) / 100;

    let visualStress = 0;
    if (!visualStats.facePresent && visualStats.cameraActive) visualStress += 0.3;
    if (visualStats.motionLevel === 'chaotic') visualStress += 0.2;
    if (visualStats.focusState === 'drifting') visualStress += 0.1;

    const totalStress = Math.min(1, (timeStress * 0.4) + (confidenceStress * 0.3) + (visualStress * 0.3));

    // Handlers
    const handleSilence = () => {
        dispatch({ type: 'UPDATE_CONFIDENCE', payload: Math.max(0, state.confidenceScore - 5) });
    };

    const handleStart = () => {
        resetTranscript();
        startListening(handleSilence);
        dispatch({ type: 'START_INTERVIEW' });
        dispatch({ type: 'RESET_TIMER', payload: 60 });
    };

    const handleStop = () => {
        stopListening();
        // This stops interaction for this question (Answer Phase End)
        dispatch({ type: 'END_INTERVIEW' });
    };

    const handleNextQuestion = () => {
        stopListening();
        resetTranscript();
        if (state.currentQuestionIndex < queue.length - 1) {
            dispatch({ type: 'NEXT_QUESTION' });
            dispatch({ type: 'RESET_TIMER', payload: 60 });
        } else {
            // End of Interview
            alert("Interview Complete! (Dashboard logic pending)");
        }
    };

    if (!mounted) return null;

    return (
        <div className="relative w-full h-screen bg-neutral-950 text-white overflow-hidden flex flex-col items-center justify-center transition-colors duration-1000"
            style={{ backgroundColor: totalStress > 0.8 ? '#1a0505' : '#0a0a0a' }}>

            {/* Background Visual Layer */}
            <CameraPresence webcamRef={webcamRef} />

            <GravityContainer stressLevel={totalStress} className="flex flex-col h-full max-h-[90vh] justify-between text-center relative z-10 w-full max-w-5xl px-8">

                {/* HUD Header */}
                <header className="flex justify-between items-start">
                    <div className="text-left space-y-1">
                        <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Question {state.currentQuestionIndex + 1} / {queue.length}</div>
                        <div className="text-xs font-mono text-zinc-600 uppercase tracking-widest">{currentQuestion.type || 'Standard'}</div>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 font-bold tracking-widest">GRAVITY</span>
                            <span className="font-mono text-emerald-400">{(totalStress * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-px h-4 bg-zinc-800" />
                        <Timer />
                    </div>

                    <div className="text-right space-y-1">
                        <div className="flex items-center justify-end gap-2 text-xs font-mono text-zinc-500 uppercase">
                            Signal Status
                            {visualStats.motionLevel !== 'stable' && <Activity size={12} className="text-yellow-500" />}
                            {visualStats.focusState === 'drifting' && <Eye size={12} className="text-red-500" />}
                        </div>
                        <div className={`text-xl font-bold transition-colors ${state.confidenceScore > 80 ? 'text-emerald-500' : state.confidenceScore > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {state.confidenceScore}%
                        </div>
                    </div>
                </header>

                {/* Main Interaction Area */}
                <main className="flex-1 flex flex-col items-center justify-center space-y-12 w-full max-w-4xl mx-auto">

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl md:text-5xl font-light leading-snug text-zinc-100">
                                "{currentQuestion.text}"
                            </h2>
                        </motion.div>
                    </AnimatePresence>

                    {/* Live Transcript / Interaction */}
                    <div className="w-full space-y-8">
                        {/* Transcript Box */}
                        <div className="min-h-[120px] p-6 rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-sm text-left relative overflow-hidden group">
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Activity size={16} className={`text-zinc-500 ${isListening ? 'animate-pulse text-emerald-500' : ''}`} />
                            </div>

                            {transcript || interimTranscript ? (
                                <p className="text-lg md:text-xl font-light leading-relaxed">
                                    <span className="text-zinc-100">{transcript}</span>
                                    <span className="text-zinc-500">{interimTranscript}</span>
                                </p>
                            ) : (
                                <p className="text-zinc-600 italic text-lg">Waiting for answer...</p>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center gap-4">
                            {!isListening ? (
                                <button
                                    onClick={handleStart}
                                    className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:scale-105 hover:bg-zinc-200 transition-all rounded-full shadow-lg shadow-white/10"
                                >
                                    <Mic size={20} /> Start Answer
                                </button>
                            ) : (
                                <button
                                    onClick={handleStop}
                                    className="flex items-center gap-2 px-8 py-4 bg-red-500/10 border border-red-500 text-red-500 font-bold uppercase tracking-widest hover:bg-red-500 transition-all hover:text-white rounded-full"
                                >
                                    <MicOff size={20} /> End Answer
                                </button>
                            )}

                            {/* Next Question (Always visible if not listening, or secondary action?) */}
                            {!isListening && transcript && (
                                <button
                                    onClick={handleNextQuestion}
                                    className="flex items-center gap-2 px-8 py-4 bg-zinc-800 text-white font-bold uppercase tracking-widest hover:bg-zinc-700 transition-all rounded-full"
                                >
                                    Next Question <ArrowRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </main>

                {/* Feedback Toast Area */}
                <div className="min-h-[60px] flex justify-center items-end pb-8">
                    <AnimatePresence>
                        {state.confidenceScore < 60 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-red-950/50 border border-red-500/30 text-red-200 px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md"
                            >
                                <AlertCircle size={18} />
                                <span className="text-sm font-medium tracking-wide">Confidence Critical: Speak up and maintain eye contact.</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </GravityContainer>
        </div>
    );
}
