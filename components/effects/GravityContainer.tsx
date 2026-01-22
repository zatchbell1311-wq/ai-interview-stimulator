"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useGravity } from '@/lib/hooks/use-gravity';

interface GravityContainerProps {
    stressLevel: number; // 0 to 1
    children: React.ReactNode;
    className?: string;
}

export function GravityContainer({ stressLevel, children, className = "" }: GravityContainerProps) {
    // Get physics values
    const { rotateX, rotateZ, scale, opacity, blur, y } = useGravity(stressLevel);

    return (
        <motion.div
            style={{
                rotateX,
                rotateZ,
                scale,
                opacity,
                filter: blur, // Need to verify if filter works directly with motion value strings
                y,
                perspective: 1000, // Essential for 3D rotates
            }}
            className={`w-full max-w-4xl mx-auto p-8 transition-colors duration-500 ease-out ${className}`}
        >
            {/* 
        We wrap children in another div to preserve 3d context 
        without messing up layout too much 
      */}
            <div className="relative">
                {children}
            </div>

            {/* Visual Noise / Film Grain Overlay that increases with stress? (Optional polish) */}
        </motion.div>
    );
}
