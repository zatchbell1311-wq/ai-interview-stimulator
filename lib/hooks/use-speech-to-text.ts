"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

// Browser-agnostic SpeechRecognition type
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export function useSpeechToText() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [lastSpeechTime, setLastSpeechTime] = useState<number>(Date.now());

    // Refs for logic
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const onSilenceRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            console.error("Speech Recognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let final = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                setTranscript(prev => prev + ' ' + final);
            }
            setInterimTranscript(interim);
            setLastSpeechTime(Date.now());

            // Reset silence timer on any speech
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
                if (interim === '' && onSilenceRef.current) {
                    onSilenceRef.current();
                }
            }, 1500); // 1.5s silence trigger
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
        };

        recognitionRef.current = recognition;

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        }
    }, []);

    const startListening = useCallback((onSilence?: () => void) => {
        if (recognitionRef.current) {
            onSilenceRef.current = onSilence || null;
            try {
                recognitionRef.current.start();
                setIsListening(true);
                setLastSpeechTime(Date.now());
            } catch (e) {
                console.warn("Speech recognition already started");
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        lastSpeechTime,
        startListening,
        stopListening,
        resetTranscript
    };
}
