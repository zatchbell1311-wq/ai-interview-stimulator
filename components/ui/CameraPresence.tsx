"use client";

import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import type { VisualSignals } from '@/lib/hooks/use-visual-signals';

interface CameraPresenceProps {
    onStatsUpdate: (stats: VisualSignals) => void;
    webcamRef: React.RefObject<Webcam>;
}

export function CameraPresence({ webcamRef }: { webcamRef: React.RefObject<Webcam> }) {

    return (
        <div className="fixed bottom-4 right-4 w-48 h-36 overflow-hidden rounded-lg pointer-events-none z-50 mix-blend-screen opacity-40">
            <div className="relative w-full h-full">
                {/* Minimalist container */}
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored={true}
                    className="w-full h-full object-cover filter blur-[1px] grayscale-[30%] contrast-125"
                    videoConstraints={{
                        width: 320,
                        height: 240,
                        facingMode: "user"
                    }}
                />
                {/* No overlays, just raw signal presence */}
            </div>
        </div>
    );
}
