import React from 'react';
import { LayoutGrid, Calendar, Search, ShoppingBag, Bookmark, History, ChevronRight, ChefHat } from 'lucide-react';

const Sidebar = ({ currentView, onChangeView }) => {
    return (
        <aside className="w-64 border-r border-white/5 bg-zinc-950/50 flex-col justify-between hidden md:flex z-20 h-screen sticky top-0">
            <div className="p-6">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-lg">
                        <ChefHat size={16} className="text-white" />
                    </div>
                    <span className="font-semibold text-sm tracking-tight text-white">Culina<span className="serif italic text-zinc-500 font-normal">AI</span></span>
                </div>

                {/* Nav Links */}
                <nav className="space-y-1">
                    <button
                        onClick={() => onChangeView('dashboard')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'dashboard' ? 'bg-white/5 text-white border border-white/5 shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                    >
                        <LayoutGrid size={16} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => onChangeView('planner')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all text-sm font-medium"
                    >
                        <Calendar size={16} />
                        Meal Planner
                    </button>
                    <button
                        onClick={() => onChangeView('discover')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all text-sm font-medium"
                    >
                        <Search size={16} />
                        Discover
                    </button>
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all text-sm font-medium"
                    >
                        <ShoppingBag size={16} />
                        Groceries
                        <span className="ml-auto text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/10">3</span>
                    </button>
                </nav>

                <div className="mt-8">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold px-3 mb-2 block">Collections</span>
                    <nav className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all text-sm font-medium">
                            <Bookmark size={16} />
                            Favorites
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all text-sm font-medium">
                            <History size={16} />
                            Past Meals
                        </button>
                    </nav>
                </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-white/5">
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-left group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 p-[1px]">
                        <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">JK</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Josh K.</p>
                        <p className="text-xs text-zinc-500 truncate group-hover:text-zinc-400">Pro Plan</p>
                    </div>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400" />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
