import React from 'react';
import { Recipe } from '../types';
import { Clock, BookOpen, Trash2, Globe, ChefHat } from 'lucide-react';

interface RecipeBookProps {
  recipes: Recipe[];
  onDelete: (id: string) => void;
}

const RecipeBook: React.FC<RecipeBookProps> = ({ recipes, onDelete }) => {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-stone-500 animate-fade-in">
        <div className="bg-stone-100 p-6 rounded-full mb-4">
          <BookOpen size={48} className="text-stone-300" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-700 mb-2">Your Cookbook is Empty</h2>
        <p>Save recipes from the Quick Meal chat to build your collection.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-chef-950 mb-4">My Recipes</h1>
        <p className="text-stone-600">A collection of your AI-crafted and web-discovered favorites.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-3xl shadow-soft border border-stone-100 overflow-hidden hover:shadow-card transition-all group flex flex-col">
            {recipe.imageUrl ? (
              <div className="h-48 w-full overflow-hidden relative">
                <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-chef-900 shadow-sm">
                  AI Generated
                </div>
              </div>
            ) : (
              <div className="h-48 w-full bg-chef-50 flex items-center justify-center relative overflow-hidden">
                <ChefHat size={64} className="text-chef-200" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex gap-2">
                    {recipe.source === 'web' && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"><Globe size={10} /> Web</span>}
                    {recipe.source === 'ai' && <span className="bg-chef-100 text-chef-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"><ChefHat size={10} /> ChefAI</span>}
                 </div>
                 <button onClick={() => onDelete(recipe.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                 </button>
              </div>

              <h3 className="text-xl font-serif font-bold text-chef-950 mb-2 leading-tight">{recipe.name}</h3>
              
              <div className="flex items-center text-sm text-stone-500 mb-4 font-medium">
                <Clock size={14} className="mr-1" /> {recipe.timing}
              </div>

              <p className="text-sm text-stone-600 italic mb-4 line-clamp-2">"{recipe.whyItWorks}"</p>

              <div className="mt-auto pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-2">Ingredients Preview</h4>
                <div className="flex flex-wrap gap-1">
                    {(recipe.ingredients || []).slice(0, 3).map((ing, i) => (
                        <span key={i} className="text-xs bg-stone-50 text-stone-600 px-2 py-1 rounded-md border border-stone-100 truncate max-w-[100px]">{ing}</span>
                    ))}
                    {(recipe.ingredients || []).length > 3 && <span className="text-xs text-stone-400 px-1">+{recipe.ingredients.length - 3} more</span>}
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