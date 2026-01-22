"use client";

import { useMemo } from 'react';
import { useMotionValue, useTransform, useSpring } from 'framer-motion';

/**
 * useGravity Hook
 * @param stressLevel - 0 to 1 (0 = calm, 1 = panic)
 * @returns Motion values for UI distortion
 */
export function useGravity(stressLevel: number) {
    // Spring config for reactive but smooth movement
    const springConfig = { damping: 15, stiffness: 150 };

    // Base motion value for stress
    const stress = useMotionValue(0);

    // Update stress value when input changes
    useMemo(() => {
        stress.set(stressLevel);
    }, [stressLevel, stress]);

    // Smooth out the stress signal
    const smoothStress = useSpring(stress, springConfig);

    // Derived transforms
    // 1. Rotation/Skew: Bends more as stress increases
    const rotateX = useTransform(smoothStress, [0, 1], [0, 15]);
    const rotateZ = useTransform(smoothStress, [0, 1], [0, -2]);

    // 2. Scale: Compresses the room
    const scale = useTransform(smoothStress, [0, 1], [1, 0.95]);

    // 3. Gray/Blur: Vision gets tunnel-like
    const opacity = useTransform(smoothStress, [0, 1], [1, 0.8]);
    const blur = useTransform(smoothStress, [0, 1], ["0px", "2px"]);

    // 4. Vertical Pull: Gravity gets heavier (elements seek downward/center)
    const y = useTransform(smoothStress, [0, 1], [0, 40]);

    return {
        rotateX,
        rotateZ,
        scale,
        opacity,
        blur,
        y,
    };
}
