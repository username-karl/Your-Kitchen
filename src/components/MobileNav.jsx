import React from 'react';
import { LayoutGrid, Sparkles, BookOpen, User } from 'lucide-react';

const MobileNav = ({ currentView, onChangeView }) => {
    const navItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Home' },
        { id: 'discover', icon: Sparkles, label: 'Discover' },
        { id: 'cookbook', icon: BookOpen, label: 'Saved' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
            {/* Gradient fade at the bottom of content */}
            <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />

            {/* Navigation bar */}
            <div className="mx-4 mb-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-1.5 flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChangeView(item.id)}
                            className={`
                                flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden
                                ${isActive ? 'text-orange-400' : 'text-zinc-500 active:text-zinc-300'}
                            `}
                        >
                            {/* Active background glow */}
                            {isActive && (
                                <div className="absolute inset-0 bg-orange-500/10 rounded-xl" />
                            )}

                            <Icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`mb-0.5 transition-transform duration-300 relative z-10 ${isActive ? 'scale-110' : ''}`}
                            />
                            <span className={`text-[10px] font-medium tracking-wide relative z-10 ${isActive ? 'text-orange-400' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileNav;
