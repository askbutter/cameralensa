import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, Star } from 'lucide-react';

const AuthGate = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('camera_access_granted');
        if (stored === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleUnlock = (e) => {
        e.preventDefault();
        if (code.toLowerCase() === 'film' || code === '2025') {
            localStorage.setItem('camera_access_granted', 'true');
            setIsAuthenticated(true);
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
            setCode('');
        }
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-6 z-50 text-white font-soft">
            {/* Note: Body background handles the stars, this overlay is transparent */}
            <div className="absolute inset-0 bg-cosmic-bg/80 backdrop-blur-sm -z-10"></div>

            <div className="w-full max-w-sm flex flex-col gap-10 p-10 relative z-10 transition-all text-center">

                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Lock size={40} className="text-white/80" strokeWidth={1.5} />
                        <Star size={16} className="absolute -top-2 -right-4 text-cosmic-accent animate-pulse" fill="#FFD700" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-wide text-white">Galaxy Gate</h1>
                        <p className="text-sm text-cosmic-soft opacity-70">Enter access code to proceed</p>
                    </div>
                </div>

                <form onSubmit={handleUnlock} className="w-full flex flex-col gap-6">
                    <div className="relative group">
                        <input
                            type="password"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="••••"
                            className={`
                              w-full bg-white/5 border rounded-2xl px-6 py-4 
                              text-center text-xl tracking-[0.3em] text-white placeholder:text-white/10
                              focus:outline-none focus:border-cosmic-accent/50 focus:bg-white/10 transition-all
                              ${error ? 'border-red-400 text-red-200' : 'border-white/10'}
                            `}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 rounded-2xl font-bold bg-white/10 hover:bg-white/20 border border-white/5 transition-all text-sm tracking-widest"
                    >
                        UNLOCK
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthGate;
