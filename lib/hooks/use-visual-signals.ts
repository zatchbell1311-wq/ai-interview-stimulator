"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
// Import types only
import type { FaceDetection, Results } from '@mediapipe/face_detection';
import type { Camera } from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';

export type MotionLevel = 'stable' | 'restless' | 'chaotic';
export type FocusState = 'focused' | 'drifting';

export interface VisualSignals {
    cameraActive: boolean;
    facePresent: boolean;
    motionLevel: MotionLevel;
    focusState: FocusState;
    rawDelta: number;
}

export function useVisualSignals(webcamRef: React.RefObject<Webcam>) {
    const [stats, setStats] = useState<VisualSignals>({
        cameraActive: false,
        facePresent: false,
        motionLevel: 'stable',
        focusState: 'focused',
        rawDelta: 0
    });

    const lastPosition = useRef<{ x: number, y: number } | null>(null);
    const motionHistory = useRef<number[]>([]);
    const faceLossCount = useRef(0);
    const detectorRef = useRef<FaceDetection | null>(null);
    const cameraRef = useRef<Camera | null>(null);

    const onResults = useCallback((results: Results) => {
        const detections = results.detections;
        const isPresent = detections && detections.length > 0;

        // 1. Presence Logic
        if (!isPresent) {
            faceLossCount.current += 1;
            setStats(prev => ({
                ...prev,
                facePresent: false,
                focusState: faceLossCount.current > 30 ? 'drifting' : prev.focusState
            }));
            return;
        }

        faceLossCount.current = 0;

        // Get primary face
        const box = detections[0].boundingBox;
        const centerX = box.xCenter;
        const centerY = box.yCenter;

        // 2. Motion Logic
        let delta = 0;
        if (lastPosition.current) {
            const dx = centerX - lastPosition.current.x;
            const dy = centerY - lastPosition.current.y;
            delta = Math.sqrt(dx * dx + dy * dy);
        }

        lastPosition.current = { x: centerX, y: centerY };

        // Rolling average
        motionHistory.current.push(delta);
        if (motionHistory.current.length > 30) motionHistory.current.shift();

        const avgMotion = motionHistory.current.reduce((a, b) => a + b, 0) / motionHistory.current.length;

        let level: MotionLevel = 'stable';
        if (avgMotion > 0.08) level = 'chaotic';
        else if (avgMotion > 0.02) level = 'restless';

        // 3. Focus Logic
        const isCentered = centerX > 0.35 && centerX < 0.65 && centerY > 0.35 && centerY < 0.75;
        const focus = isCentered ? 'focused' : 'drifting';

        setStats({
            cameraActive: true,
            facePresent: true,
            motionLevel: level,
            focusState: focus,
            rawDelta: avgMotion
        });

    }, []);

    useEffect(() => {
        let isCancelled = false;

        const init = async () => {
            // Dynamic imports to avoid SSR issues
            const FaceDetectionMod = await import('@mediapipe/face_detection');
            const CameraUtilsMod = await import('@mediapipe/camera_utils');

            const { FaceDetection } = FaceDetectionMod;
            const { Camera } = CameraUtilsMod;

            const faceDetection = new FaceDetection({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
                }
            });

            faceDetection.setOptions({
                model: 'short',
                minDetectionConfidence: 0.5
            });

            faceDetection.onResults(onResults);

            if (isCancelled) {
                faceDetection.close();
                return;
            }

            detectorRef.current = faceDetection;

            // Start Camera
            if (webcamRef.current && webcamRef.current.video) {
                const camera = new Camera(webcamRef.current.video, {
                    onFrame: async () => {
                        if (webcamRef.current?.video && detectorRef.current) {
                            try {
                                await detectorRef.current.send({ image: webcamRef.current.video });
                            } catch (e) {
                                // ignore
                            }
                        }
                    },
                    width: 640,
                    height: 480
                });
                camera.start();
                if (!isCancelled) {
                    cameraRef.current = camera;
                    setStats(s => ({ ...s, cameraActive: true }));
                }
            }
        };

        if (typeof window !== 'undefined') {
            init();
        }

        return () => {
            isCancelled = true;
            if (cameraRef.current) cameraRef.current.stop();
            if (detectorRef.current) detectorRef.current.close();
        };
    }, [webcamRef, onResults]);

    return stats;
}
