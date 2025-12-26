import React from 'react';
import { LayoutGrid, Sparkles, BookOpen, User } from 'lucide-react';

const MobileNav = ({ currentView, onChangeView }) => {
    const navItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Home' },
        { id: 'discover', icon: Sparkles, label: 'Discover' },
        { id: 'cookbook', icon: BookOpen, label: 'Saved' },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-2 flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChangeView(item.id)}
                            className={`
                                flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300 relative overflow-hidden
                                ${isActive ? 'text-orange-400' : 'text-zinc-500 hover:text-zinc-200'}
                            `}
                        >
                            {/* Active background glow */}
                            {isActive && (
                                <div className="absolute inset-0 bg-orange-500/10 rounded-xl" />
                            )}

                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
                            />
                            <span className="text-[10px] font-medium tracking-wide">
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
