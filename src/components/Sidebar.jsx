import React from 'react';
import { LayoutGrid, Calendar, Search, ShoppingBag, Bookmark, History, ChevronRight, ChefHat, X, BookOpen, Sparkles, FolderPlus, Folder } from 'lucide-react';

const Sidebar = ({ currentView, onChangeView, profile, isOpen, onClose }) => {
    const userName = profile?.name || 'Chef';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-0 left-0 h-screen z-50
                w-64 border-r border-white/5 bg-zinc-950/95 md:bg-zinc-950/50
                flex flex-col justify-between
                transform transition-transform duration-300 ease-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                md:flex
            `}>
                <div className="p-6 flex flex-col h-full">
                    {/* Header with close button for mobile */}
                    <div className="flex items-center justify-between mb-8 flex-shrink-0">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-lg">
                                <ChefHat size={16} className="text-white" />
                            </div>
                            <span className="font-semibold text-sm tracking-tight text-white">Culina<span className="serif italic text-zinc-500 font-normal">AI</span></span>
                        </div>
                        {/* Close button - mobile only */}
                        <button
                            onClick={onClose}
                            className="md:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1 flex-shrink-0">
                        <button
                            onClick={() => { onChangeView('dashboard'); onClose?.(); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${currentView === 'dashboard'
                                ? 'bg-white/5 text-white border border-white/5 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <LayoutGrid size={16} />
                            Dashboard
                        </button>
                        <button
                            onClick={() => { onChangeView('planner'); onClose?.(); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${currentView === 'planner'
                                ? 'bg-white/5 text-white border border-white/5 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <Calendar size={16} />
                            Meal Planner
                        </button>
                        <button
                            onClick={() => { onChangeView('discover'); onClose?.(); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${currentView === 'discover'
                                ? 'bg-white/5 text-white border border-white/5 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <Sparkles size={16} />
                            Discover
                        </button>
                        <button
                            onClick={() => { onChangeView('groceries'); onClose?.(); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${currentView === 'groceries'
                                ? 'bg-white/5 text-white border border-white/5 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <ShoppingBag size={16} />
                            Groceries
                            {profile?.weeklyPlan?.groceryList?.length > 0 && (
                                <span className="ml-auto text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/10">
                                    {profile.weeklyPlan.groceryList.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { onChangeView('cookbook'); onClose?.(); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${currentView === 'cookbook'
                                ? 'bg-white/5 text-white border border-white/5 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <BookOpen size={16} />
                            My Recipes
                        </button>
                        <button
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all text-sm font-medium border border-transparent"
                        >
                            <ShoppingBag size={16} />
                            Groceries
                            <span className="ml-auto text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/10">3</span>
                        </button>
                    </nav>

                    {/* Collections Section */}
                    <div className="mt-8 flex-1 overflow-y-auto no-scrollbar">
                        <div className="flex items-center justify-between px-3 mb-2">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">Collections</span>
                            <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                                <FolderPlus size={12} />
                            </button>
                        </div>
                        <nav className="space-y-1">
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all text-sm font-medium border border-transparent">
                                <Bookmark size={16} />
                                Favorites
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all text-sm font-medium border border-transparent">
                                <History size={16} />
                                Past Meals
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all text-sm font-medium border border-transparent">
                                <Folder size={16} />
                                Weekend BBQ
                            </button>
                        </nav>
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-white/5 mt-auto">
                    <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-left group">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 p-[1px]">
                            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white">{userInitials}</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{userName}</p>
                            <p className="text-xs text-zinc-500 truncate group-hover:text-zinc-400">Free Plan</p>
                        </div>
                        <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400" />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
