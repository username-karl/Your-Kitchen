import React from 'react';
import { Clock, BookOpen, Trash2, Globe, ChefHat, Sparkles } from 'lucide-react';

const RecipeBook = ({ recipes, onDelete }) => {
    if (recipes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-zinc-900/50 p-6 rounded-full mb-4 ring-1 ring-white/10 shadow-[0_0_30px_-10px_rgba(255,255,255,0.05)]">
                    <BookOpen size={48} className="text-zinc-600" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-zinc-200 mb-2">Your Cookbook is Empty</h2>
                <p className="text-zinc-400">Save recipes from the Quick Meal chat to build your collection.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-24 px-6 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">My Recipes</h1>
                <p className="text-zinc-400">A collection of your AI-crafted favorites.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                    <div key={recipe.id} className="group bg-zinc-900/40 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden hover:border-orange-500/20 hover:bg-zinc-900/60 transition-all duration-300 flex flex-col hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)]">
                        {recipe.imageUrl ? (
                            <div className="h-48 w-full overflow-hidden relative">
                                <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2 py-1 rounded-full text-xs font-bold text-orange-400 border border-orange-500/20 shadow-lg flex items-center gap-1">
                                    <Sparkles size={10} />
                                    AI Generated
                                </div>
                            </div>
                        ) : (
                            <div className="h-48 w-full bg-zinc-800/50 flex items-center justify-center relative overflow-hidden group-hover:bg-zinc-800 transition-colors">
                                <ChefHat size={64} className="text-zinc-700 group-hover:text-zinc-600 transition-colors" />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                            </div>
                        )}

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-2">
                                    {recipe.source === 'web' && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><Globe size={10} /> Web</span>}
                                    {recipe.source === 'ai' && <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><ChefHat size={10} /> AI</span>}
                                </div>
                                <button onClick={() => onDelete(recipe.id)} className="text-zinc-500 hover:text-red-400 transition-colors p-1 hover:bg-red-500/10 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <h3 className="text-xl font-serif font-bold text-zinc-100 mb-2 leading-tight group-hover:text-orange-100 transition-colors">{recipe.name}</h3>

                            <div className="flex items-center text-sm text-zinc-400 mb-4 font-medium">
                                <Clock size={14} className="mr-1 text-orange-500/70" /> {recipe.timing}
                            </div>

                            <p className="text-sm text-zinc-400 italic mb-4 line-clamp-2 pl-3 border-l-2 border-zinc-700/50">"{recipe.whyItWorks}"</p>

                            <div className="mt-auto pt-4 border-t border-white/5">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Ingredients</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(recipe.ingredients || []).slice(0, 3).map((ing, i) => (
                                        <span key={i} className="text-xs bg-white/5 text-zinc-300 px-2 py-1 rounded-md border border-white/5 truncate max-w-[100px]">{ing}</span>
                                    ))}
                                    {(recipe.ingredients || []).length > 3 && <span className="text-xs text-zinc-500 px-1 pt-1">+{recipe.ingredients.length - 3}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecipeBook;
