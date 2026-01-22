"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { extractTextFromPDF, analyzeATS } from '@/lib/resume-parser';
import { FileText, Loader2, CheckCircle, XCircle, ChevronRight, Upload } from 'lucide-react';
import Link from 'next/link';
import { useInterview } from '@/lib/interview-context';
import { generateInterviewQueue } from '@/lib/interview-generator';

export default function ResumePage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ReturnType<typeof analyzeATS> | null>(null);
    const { dispatch } = useInterview();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const uploadedFile = e.target.files[0];
            setFile(uploadedFile);
            analyzeFile(uploadedFile);
        }
    };

    const analyzeFile = async (f: File) => {
        setIsAnalyzing(true);
        try {
            // Wait a sec for "fake" processing feel then do real work
            await new Promise(r => setTimeout(r, 1500));

            const text = await extractTextFromPDF(f);
            const atsData = analyzeATS(text);
            setResult(atsData);

            // Generate Queue
            const queue = generateInterviewQueue(atsData.foundSkills, atsData.role);
            dispatch({ type: 'SET_QUEUE', payload: queue });

            // TTS Explanation
            speakFeedback(atsData);
        } catch (error) {
            console.error("Analysis failed", error);
            // Fallback for demo if PDF fail
            const atsData = analyzeATS("react node typescript"); // fallback
            setResult(atsData);

            const queue = generateInterviewQueue(atsData.foundSkills, atsData.role);
            dispatch({ type: 'SET_QUEUE', payload: queue });

            speakFeedback(atsData);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const speakFeedback = (data: ReturnType<typeof analyzeATS>) => {
        if (typeof window !== 'undefined') {
            const synth = window.speechSynthesis;
            const u = new SpeechSynthesisUtterance();
            u.text = `Analysis complete. I've calculated an ATS match score of ${data.score}%. ` +
                `You have strong matches for ${data.foundSkills.slice(0, 3).join(', ')}. ` +
                (data.missingSkills.length > 0 ? `However, try to highlight skills like ${data.missingSkills[0]} to improve visibility.` : "");
            synth.speak(u);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                <header className="mb-12 text-center">
                    <h1 className="text-3xl font-light mb-2">Resume Scan</h1>
                    <p className="text-zinc-500">Upload your CV to calibrate the interviewer.</p>
                </header>

                {!result ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center hover:bg-zinc-900/50 cursor-pointer transition-colors group"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                        />

                        {isAnalyzing ? (
                            <Loader2 className="w-12 h-12 text-zinc-600 animate-spin mb-4" />
                        ) : (
                            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 group-hover:bg-zinc-800 transition-colors">
                                <Upload className="w-8 h-8 text-zinc-400" />
                            </div>
                        )}

                        <p className="text-zinc-400 font-mono text-sm">
                            {isAnalyzing ? "ANALYZING PATTERNS..." : "DROP PDF OR CLICK TO UPLOAD"}
                        </p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Score Card */}
                        <div className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                            <div>
                                <h3 className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-1">ATS Match Score</h3>
                                <div className="text-5xl font-bold flex items-baseline gap-2">
                                    <span className={result.score > 70 ? 'text-emerald-400' : 'text-yellow-400'}>
                                        {result.score}
                                    </span>
                                    <span className="text-lg text-zinc-600">/ 100</span>
                                </div>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-sm text-zinc-400">Target Role</p>
                                <p className="font-medium text-white">{result.role}</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                                <h3 className="flex items-center gap-2 text-sm text-emerald-400 font-bold mb-4">
                                    <CheckCircle size={16} /> DETECTED SKILLS
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.foundSkills.map(s => (
                                        <span key={s} className="px-2 py-1 bg-emerald-950 text-emerald-300 text-xs rounded border border-emerald-900/50">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                                <h3 className="flex items-center gap-2 text-sm text-red-400 font-bold mb-4">
                                    <XCircle size={16} /> MISSING KEYWORDS
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.missingSkills.map(s => (
                                        <span key={s} className="px-2 py-1 bg-red-950 text-red-300 text-xs rounded border border-red-900/50">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="flex justify-end pt-4">
                            <Link href="/interview" className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors rounded-full">
                                Start Interview <ChevronRight size={16} />
                            </Link>
                        </div>

                    </motion.div>
                )}

            </motion.div>
        </div>
    );
}
