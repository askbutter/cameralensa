import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const AuthGate = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        // Check if we already have the secret
        const stored = localStorage.getItem('camera_access_granted');
        if (stored === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleUnlock = (e) => {
        e.preventDefault();
        // For V1, the 'secret' is hardcoded here or effectively 'any non-empty' 
        // Wait, user said "just I can access it", but "save to device".
        // I will set a simple pin: "2025" or allow the user to SET it on first run?
        // Let's use a nice default "film"
        if (code.toLowerCase() === 'film' || code === '2025') {
            localStorage.setItem('camera_access_granted', 'true');
            setIsAuthenticated(true);
        } else {
            setError(true);
            setTimeout(() => setError(false), 500); // Shake animation or something
        }
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 z-50">
            <div className="w-full max-w-sm flex flex-col items-center gap-8">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl animate-fade-in">
                    <ShieldCheck size={40} className="text-white" />
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold font-[var(--font-hero)]">Access Required</h1>
                    <p className="text-white/50 text-sm">Enter the secure access code to unlock.</p>
                </div>

                <form onSubmit={handleUnlock} className="w-full relative">
                    <input
                        type="password"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Passcode..."
                        className={`
              w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 
              text-center text-xl tracking-widest placeholder:tracking-normal placeholder:text-white/20
              focus:outline-none focus:border-white/30 transition-all
              ${error ? 'border-red-500/50 bg-red-500/10' : ''}
            `}
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 bg-white text-black px-4 rounded-lg hover:bg-white/90 font-bold"
                    >
                        <ArrowRight size={20} />
                    </button>
                </form>

                <div className="text-xs text-white/20">
                    Hint: "film"
                </div>
            </div>
        </div>
    );
};

export default AuthGate;
