"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInterview } from '@/lib/interview-context';

export function Timer() {
    const { state, dispatch } = useInterview();
    const { timeLeft, isInterviewActive } = state;

    useEffect(() => {
        if (!isInterviewActive || timeLeft <= 0) return;

        const timer = setInterval(() => {
            dispatch({ type: 'TICK_TIMER' });
        }, 1000);

        return () => clearInterval(timer);
    }, [isInterviewActive, timeLeft, dispatch]);

    const progress = timeLeft / 60; // Assuming 60s max for now
    const isCritical = timeLeft < 10;

    return (
        <div className="flex flex-col items-center">
            <motion.div
                className={`text-6xl font-black tabular-nums tracking-tight ${isCritical ? 'text-red-500' : 'text-zinc-600'}`}
                animate={isCritical ? { x: [-2, 2, -2], transition: { repeat: Infinity, duration: 0.2 } } : {}}
            >
                00:{timeLeft.toString().padStart(2, '0')}
            </motion.div>

            {/* Gravity Bar */}
            <div className="w-full h-2 bg-zinc-900 mt-2 overflow-hidden rounded-full">
                <motion.div
                    className="h-full bg-white"
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ ease: "linear" }}
                />
            </div>
        </div>
    );
}
