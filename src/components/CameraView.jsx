import React, { useEffect, useRef, useState } from 'react';
import { useMedia } from 'react-use';

const CameraView = ({ onBrightnessChange }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Use generic constraint for rear camera
    const constraints = {
        video: {
            facingMode: 'environment', // Rear camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    useEffect(() => {
        let stream = null;
        let interval = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }

                // Start Analyzing brightness
                interval = setInterval(analyzeBrightness, 500); // 2Hz sampling
            } catch (err) {
                console.error("Camera access denied:", err);
            }
        };

        startCamera();

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (interval) clearInterval(interval);
        };
    }, []);

    const analyzeBrightness = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // Sample a small center area for spot metering simulation
        const sampleSize = 50;
        const sx = (video.videoWidth - sampleSize) / 2;
        const sy = (video.videoHeight - sampleSize) / 2;

        if (sx < 0 || sy < 0) return; // Video not ready

        // Draw frame to canvas
        ctx.drawImage(video, sx, sy, sampleSize, sampleSize, 0, 0, sampleSize, sampleSize);

        // Get pixel data
        const frame = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = frame.data;

        let totalBrightness = 0;

        // Calculate average luma
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Basic luma formula
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
            totalBrightness += brightness;
        }

        const avgBrightness = totalBrightness / (data.length / 4);
        onBrightnessChange(avgBrightness);
    };

    return (
        <div className="w-full h-full relative bg-pink-100 overflow-hidden">
            <video
                ref={videoRef}
                className="w-full h-full object-cover opacity-100"
                playsInline
                muted
            />

            {/* Hidden processing canvas */}
            <canvas
                ref={canvasRef}
                width={50}
                height={50}
                className="hidden"
            />

            {/* Viewfinder Overlay Markers */}
            <div className="absolute inset-4 border border-white/20 rounded-xl pointer-events-none opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/40 rounded-full pointer-events-none opacity-50" />
        </div>
    );
};

export default CameraView;
