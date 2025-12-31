import React, { useState, useEffect } from 'react';
import CameraView from './components/CameraView';
import MeterDisplay from './components/MeterDisplay';
import AuthGate from './components/AuthGate';
import { calculateEV } from './utils/exposureMath';
import { Settings, X, Sparkles } from 'lucide-react';

function App() {
  const [ev, setEv] = useState(10); // Raw EV from camera
  const [calibration, setCalibration] = useState(0); // User offset
  const [showSettings, setShowSettings] = useState(false);

  // Load calibration from storage
  useEffect(() => {
    const saved = localStorage.getItem('camera_calibration');
    if (saved) setCalibration(parseFloat(saved));
  }, []);

  // Save calibration
  const updateCalibration = (val) => {
    setCalibration(val);
    localStorage.setItem('camera_calibration', val.toString());
  };

  const handleBrightnessChange = (brightness) => {
    const newEv = calculateEV(brightness);
    setEv(prev => prev + (newEv - prev) * 0.1);
  };

  const effectiveEv = ev + calibration;

  return (
    <AuthGate>
      <div className="w-full h-screen flex flex-col font-soft relative overflow-hidden text-cosmic-text">

        {/* Header */}
        <header className="px-6 py-4 pt-10 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-400 animate-pulse" />
            <h1 className="text-lg font-bold tracking-wide text-white/90">
              Light Meter
            </h1>
          </div>

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border-transparent hover:bg-white/10 transition-all"
          >
            <Settings size={18} className="text-cosmic-soft" />
          </button>
        </header>

        {/* Camera Card */}
        <div className="px-4 mb-4 mt-2 relative z-0 shrink-0">
          <div className="h-[200px] w-full relative rounded-3xl overflow-hidden border border-white/10 shadow-star bg-black/40 backdrop-blur-sm">
            <CameraView onBrightnessChange={handleBrightnessChange} />

            {/* Soft Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-70">
              <div className="w-12 h-12 border border-white/50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Meter Controls - Takes remaining height */}
        <div className="flex-1 min-h-0 w-full relative">
          <MeterDisplay ev={effectiveEv} />
        </div>

        {/* Cosmic Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-xl">
            <div className="w-full max-w-sm p-8 rounded-[32px] bg-cosmic-bg/90 border border-white/10 relative shadow-2xl">
              <button
                onClick={() => setShowSettings(false)}
                className="absolute right-6 top-6 text-white/50 hover:text-white transition-all"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl font-bold text-white mb-1">Calibration</h2>
              <p className="text-sm text-cosmic-soft mb-8">Adjust to match reference.</p>

              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between text-sm font-bold text-white/80">
                    <span>Offset</span>
                    <span className="text-cosmic-accent">{calibration > 0 ? '+' : ''}{calibration.toFixed(1)} EV</span>
                  </div>

                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={calibration}
                    onChange={(e) => updateCalibration(parseFloat(e.target.value))}
                    className="w-full accent-cosmic-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 text-xs text-white/60 leading-relaxed">
                  "The stars act as your guide, yet the instrument requires your alignment."
                </div>

                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-4 text-sm font-bold rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGate>
  );
}

export default App;
