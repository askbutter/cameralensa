import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Settings } from 'lucide-react';
import { calculateSettings, formatShutter, ISO_STOPS, APERTURE_STOPS, SHUTTER_STOPS } from '../utils/exposureMath';

const MeterDisplay = ({ ev }) => {
    // State for locks: { iso: boolean, aperture: boolean, shutter: boolean }
    const [locks, setLocks] = useState({ iso: false, aperture: false, shutter: false });

    // State for current values
    const [values, setValues] = useState({ iso: 400, aperture: 5.6, shutter: 1 / 60 });

    // Update effect
    useEffect(() => {
        // Basic clamping for very low light to avoid crazy numbers
        const safeEv = Math.max(ev, -2);
        const newSettings = calculateSettings(safeEv, values, locks);
        setValues(newSettings);
    }, [ev, locks]);

    const toggleLock = (key) => {
        setLocks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const updateValue = (key, delta) => {
        // Only allow manual change if locked (or sticky)
        // Actually, manual change should probably Auto-Lock that value?
        // Let's keep it simple: Click to Lock/Unlock.
        // If locked, long press or secondary control could change it?
        // For V1: Just toggle lock.
        toggleLock(key);
    };

    const ValueCard = ({ label, value, displayValue, locked, type }) => {
        return (
            <button
                onClick={() => toggleLock(type)}
                className={`
          flex flex-col items-center justify-center p-6 
          rounded-2xl backdrop-blur-md border border-white/10
          transition-all duration-300 active:scale-95
          ${locked
                        ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_20px_rgba(255,59,48,0.3)]'
                        : 'bg-black/40 hover:bg-black/60'}
        `}
            >
                <div className="flex items-center gap-2 mb-2 opacity-60 text-xs tracking-widest uppercase">
                    {locked ? <Lock size={12} className="text-[var(--color-primary)]" /> : <Unlock size={12} />}
                    <span>{label}</span>
                </div>
                <div className="text-4xl font-bold font-[var(--font-hero)] tabular-nums tracking-tighter">
                    {displayValue}
                </div>
            </button>
        );
    };

    return (
        <div className="absolute inset-x-0 bottom-0 p-6 pb-12 flex flex-col gap-4">

            {/* EV Indicator (Debug/Pro feature) */}
            <div className="flex justify-between items-center px-4">
                <div className="text-xs font-mono opacity-50">
                    EV {ev.toFixed(1)}
                </div>
                <div className="text-xs font-mono opacity-50 text-right">
                    {locks.iso && locks.aperture && locks.shutter ? 'LOCKED' : 'METERING'}
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-3 gap-3">

                {/* ISO */}
                <ValueCard
                    label="ISO"
                    type="iso"
                    value={values.iso}
                    displayValue={values.iso}
                    locked={locks.iso}
                />

                {/* Aperture */}
                <ValueCard
                    label="Aperture"
                    type="aperture"
                    value={values.aperture}
                    displayValue={`f/${values.aperture}`}
                    locked={locks.aperture}
                />

                {/* Shutter */}
                <ValueCard
                    label="Shutter"
                    type="shutter"
                    value={values.shutter}
                    displayValue={formatShutter(values.shutter)}
                    locked={locks.shutter}
                />

            </div>

            <div className="text-center text-xs opacity-30 mt-4 max-w-[200px] mx-auto leading-relaxed">
                Tap a value to LOCK it. <br /> Other settings will autocalculate.
            </div>
        </div>
    );
};

export default MeterDisplay;
