import React, { useState } from 'react';
import CameraView from './components/CameraView';
import MeterDisplay from './components/MeterDisplay';
import AuthGate from './components/AuthGate';
import { calculateEV } from './utils/exposureMath';

function App() {
  const [ev, setEv] = useState(10); // Default daytime EV

  const handleBrightnessChange = (brightness) => {
    // Smoothe the EV changes slightly to avoid jitter
    // Brightness is 0-255
    const newEv = calculateEV(brightness);

    // Simple moving average or direct update
    // For V1, direct update but rounded to 0.1 in child
    setEv(prev => {
      // Basic low-pass filter (0.2 factor)
      const smoothed = prev + (newEv - prev) * 0.1;
      return smoothed;
    });
  };

  return (
    <AuthGate>
      <div className="relative w-full h-[100dvh] overflow-hidden bg-black text-white selection:bg-red-500/30">

        {/* Layer 1: Camera Feed */}
        <CameraView onBrightnessChange={handleBrightnessChange} />

        {/* Layer 2: Main Interface */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between">

          {/* Header */}
          <header className="p-6 pt-12 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <h1 className="text-xl font-[var(--font-hero)] font-bold tracking-tight">
              Camera<span className="text-[var(--color-primary)]">Lensa</span>
            </h1>
            <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
              FILM // 35mm
            </div>
          </header>

          {/* Meter Controls */}
          <MeterDisplay ev={ev} />

        </div>
      </div>
    </AuthGate>
  );
}

export default App;
