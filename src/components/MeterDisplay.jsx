import React, { useState, useEffect, useRef } from 'react';
import { calculateSettings, formatShutter, ISO_STOPS, APERTURE_STOPS, SHUTTER_STOPS } from '../utils/exposureMath';
import { Lock, Unlock } from 'lucide-react';

// Reusable Scroll Wheel Component
const ScrollWheel = ({ label, options, value, locked, onChange, onLockToggle, formatVal = (v) => v }) => {
    const scrollRef = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const itemHeight = 40; // Height of each item in px

    // Auto-scroll to value when it changes (if not currently user-scrolling)
    useEffect(() => {
        if (isScrolling) return;
        if (scrollRef.current) {
            const index = options.indexOf(value);
            if (index !== -1) {
                scrollRef.current.scrollTo({
                    top: index * itemHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [value, options, isScrolling]);

    // Handle user scroll
    const handleScroll = (e) => {
        setIsScrolling(true);
        clearTimeout(scrollRef.current.scrollTimeout);
        scrollRef.current.scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
            // Snap to nearest
            const scrollTop = e.target.scrollTop;
            const index = Math.round(scrollTop / itemHeight);
            if (options[index] !== undefined && options[index] !== value) {
                onChange(options[index]);
            }
        }, 100); // Faster debounce
    };

    return (
        <div className="flex flex-col items-center h-full relative group">
            <div className="flex items-center gap-2 mb-2 z-10 transition-all">
                <span className={`text-[10px] uppercase font-bold tracking-widest transition-colors ${locked ? 'text-cosmic-accent' : 'text-cosmic-soft opacity-70'}`}>
                    {label}
                </span>
                <button
                    onClick={onLockToggle}
                    className={`transition-all ${locked ? 'text-cosmic-accent opacity-100 scale-110' : 'text-white/30 opacity-50 hover:opacity-100'}`}
                >
                    {locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
            </div>

            {/* Wheel Container */}
            <div className="relative w-full flex-1 overflow-hidden min-h-[160px] mask-gradient">
                {/* Selection Highlight / Lens */}
                <div className={`absolute top-1/2 left-0 right-0 h-[40px] -translate-y-1/2 border-y pointer-events-none z-0 transition-all ${locked ? 'bg-cosmic-accent/10 border-cosmic-accent/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'bg-white/5 border-white/10'}`}></div>

                {/* Scroll List */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="w-full h-full overflow-y-auto no-scrollbar snap-y-mandatory py-[calc(50%-20px)]"
                >
                    {options.map((opt, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                onChange(opt);
                                // Force scroll to center immediately
                                if (scrollRef.current) {
                                    scrollRef.current.scrollTo({
                                        top: i * itemHeight,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                            className={`
                              h-[40px] flex items-center justify-center snap-center cursor-pointer transition-all duration-300
                              ${opt === value
                                    ? `text-lg font-bold scale-110 drop-shadow-sm ${locked ? 'text-cosmic-accent shadow-[0_0_10px_rgba(0,243,255,0.4)]' : 'text-white'}`
                                    : 'text-sm text-white/30 hover:text-white/60'}
                            `}
                        >
                            {formatVal(opt)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MeterDisplay = ({ ev }) => {
    const [locks, setLocks] = useState({ iso: false, aperture: false, shutter: false });
    const [values, setValues] = useState({ iso: 400, aperture: 5.6, shutter: 1 / 60 });

    useEffect(() => {
        const safeEv = Math.max(ev, -2);
        // Only recalc if we aren't mid-interaction? 
        // Logic: calculateSettings considers locks. If locked, it won't change.
        const newSettings = calculateSettings(safeEv, values, locks);
        setValues(newSettings);
        // eslint-disable-next-line
    }, [ev, locks]);

    const handleValueChange = (type, newVal) => {
        setValues(prev => ({ ...prev, [type]: newVal }));
        setLocks(prev => ({ ...prev, [type]: true })); // Auto-lock
    };

    const toggleLock = (type) => {
        setLocks(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const resetAuto = () => {
        setLocks({ iso: false, aperture: false, shutter: false });
    };

    const isManual = locks.iso || locks.aperture || locks.shutter;

    return (
        <div className="w-full h-full px-2 flex flex-col">
            {/* Auto Reset Button */}
            <div className="flex justify-center mb-4 h-8 shrink-0">
                <button
                    onClick={resetAuto}
                    className={`
                        px-4 py-1 rounded-full text-xs font-bold tracking-widest border transition-all
                        ${isManual
                            ? 'bg-cosmic-accent/20 border-cosmic-accent text-cosmic-accent shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:bg-cosmic-accent/30'
                            : 'bg-white/5 border-white/10 text-white/30 cursor-default'}
                    `}
                    disabled={!isManual}
                >
                    {isManual ? 'RESET TO AUTO' : 'AUTO MODE'}
                </button>
            </div>

            {/* Layout: 3 Columns for Wheels */}
            <div className="flex-1 grid grid-cols-3 gap-2 pb-8 min-h-0">
                <ScrollWheel
                    label="ISO"
                    options={ISO_STOPS}
                    value={values.iso}
                    locked={locks.iso}
                    onChange={(v) => handleValueChange('iso', v)}
                    onLockToggle={() => toggleLock('iso')}
                />
                <ScrollWheel
                    label="Aperture"
                    options={APERTURE_STOPS}
                    value={values.aperture}
                    locked={locks.aperture}
                    onChange={(v) => handleValueChange('aperture', v)}
                    onLockToggle={() => toggleLock('aperture')}
                    formatVal={(v) => `f/${v}`}
                />
                <ScrollWheel
                    label="Shutter"
                    options={SHUTTER_STOPS}
                    value={values.shutter}
                    locked={locks.shutter}
                    onChange={(v) => handleValueChange('shutter', v)}
                    onLockToggle={() => toggleLock('shutter')}
                    formatVal={formatShutter}
                />
            </div>

            {/* EV Display at bottom */}
            <div className="h-12 flex items-center justify-center border-t border-white/10 shrink-0">
                <div className="text-xs font-bold text-cosmic-soft tracking-widest flex items-center gap-2">
                    EV {ev.toFixed(1)}
                </div>
            </div>
        </div>
    );
};

export default MeterDisplay;
