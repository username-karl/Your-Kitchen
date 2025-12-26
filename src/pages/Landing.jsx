import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-orange-500/30 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none opacity-60"></div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 text-center max-w-md mx-auto w-full">

                {/* Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-300 font-medium">AI-Powered Meal Planning</span>
                </div>

                {/* Logo Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center mb-8 shadow-2xl animate-in zoom-in duration-700 delay-100">
                    <ChefHat className="text-white w-8 h-8" strokeWidth={1.5} />
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-6xl font-medium text-white tracking-tight mb-4 leading-[0.9] animate-in slide-in-from-bottom-8 duration-700 delay-200">
                    Your-Kitchen<br />
                    <span className="font-serif italic text-zinc-400">made simple.</span>
                </h1>

                {/* Subheadline */}
                <p className="text-base text-zinc-500 font-light max-w-xs mx-auto leading-relaxed mb-12 animate-in slide-in-from-bottom-8 duration-700 delay-300">
                    Hyper-personalized meal planning based on your skills, budget, and cravings.
                </p>

                {/* Actions */}
                <div className="w-full space-y-3 animate-in slide-in-from-bottom-8 duration-700 delay-400">
                    <button
                        onClick={() => navigate('/login?mode=signup')}
                        className="w-full bg-white text-black h-14 rounded-full font-semibold text-sm tracking-wide uppercase transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-zinc-200"
                    >
                        Get Started
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-transparent border border-white/10 text-white h-14 rounded-full font-medium text-sm tracking-wide transition-colors hover:bg-white/5"
                    >
                        Log In
                    </button>
                </div>

                {/* Social Proof */}
                <div className="mt-12 flex items-center gap-3 opacity-60 animate-in fade-in duration-1000 delay-500">
                    <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-700"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-600"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-500"></div>
                    </div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Join 10k+ Home Cooks</span>
                </div>
            </div>
        </div>
    );
};

export default Landing;
