import React, { useState } from 'react';
import {
    X, Clock, Users, ChefHat, ShoppingCart, CheckCircle2,
    ChevronRight, Flame, Play, BookOpen, Plus, Check, Shuffle, Loader2
} from 'lucide-react';

// Placeholder food images
const PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop',
];

// Get consistent placeholder image based on meal name
const getPlaceholderImage = (mealName) => {
    const hash = mealName?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length];
};

const MealDetailModal = ({ meal, isOpen, onClose, onAddToGroceries, onRemoveFromGroceries, groceryList = [], onSwapMeal, isSwapping = false }) => {
    const [addedIngredients, setAddedIngredients] = useState(new Set());
    const [activeTab, setActiveTab] = useState('recipe'); // 'recipe' or 'groceries'

    if (!isOpen || !meal) return null;

    const ingredients = meal.ingredients || [];
    const instructions = meal.instructions || meal.steps || [];

    // Check if ingredient is already in grocery list
    const isInGroceryList = (ingredient) => {
        if (!ingredient) return false;
        const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient?.name;
        if (!ingredientName) return false;

        return groceryList.some(item => {
            if (!item) return false;
            const itemName = typeof item === 'string' ? item : item?.name;
            if (!itemName) return false;

            return itemName.toLowerCase().includes(ingredientName.toLowerCase()) ||
                ingredientName.toLowerCase().includes(itemName.toLowerCase());
        });
    };

    const handleToggleIngredient = (ingredient) => {
        if (!ingredient) return;
        const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient?.name;
        if (!ingredientName) return;

        if (addedIngredients.has(ingredientName)) {
            // Remove from added list
            setAddedIngredients(prev => {
                const newSet = new Set(prev);
                newSet.delete(ingredientName);
                return newSet;
            });
            onRemoveFromGroceries?.(ingredientName);
        } else {
            // Add to list
            setAddedIngredients(prev => new Set([...prev, ingredientName]));
            onAddToGroceries?.(ingredientName);
        }
    };

    const handleAddAllIngredients = () => {
        ingredients.forEach(ing => {
            if (!ing) return;
            const ingredientName = typeof ing === 'string' ? ing : ing?.name;
            if (!ingredientName) return;

            // Only add if not already in list and not already added
            if (!isInGroceryList(ing) && !addedIngredients.has(ingredientName)) {
                setAddedIngredients(prev => new Set([...prev, ingredientName]));
                onAddToGroceries?.(ingredientName);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] bg-zinc-900 rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col animate-slide-up border border-white/10">

                {/* Hero Image Section */}
                <div className="relative h-48 md:h-64 shrink-0">
                    <img
                        src={getPlaceholderImage(meal.name)}
                        alt={meal.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />

                    {/* Action buttons - Top Right */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        {/* Swap meal button */}
                        {onSwapMeal && (
                            <button
                                onClick={() => onSwapMeal(meal)}
                                disabled={isSwapping}
                                className="w-10 h-10 rounded-full bg-orange-500/80 backdrop-blur flex items-center justify-center text-white hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Swap this meal"
                            >
                                {isSwapping ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Shuffle size={18} />
                                )}
                            </button>
                        )}
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white bg-orange-500/80 backdrop-blur">
                            {meal.type}
                        </span>
                        {meal.techniqueFocus && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-orange-200 bg-black/50 backdrop-blur">
                                {meal.techniqueFocus}
                            </span>
                        )}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">{meal.name}</h2>
                        <div className="flex items-center gap-4 text-sm text-zinc-300">
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {meal.timeEstimate || '30 min'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Users size={14} />
                                {meal.servings || '2'} servings
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-white/10 shrink-0">
                    <button
                        onClick={() => setActiveTab('recipe')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'recipe' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <BookOpen size={16} />
                            Recipe
                        </span>
                        {activeTab === 'recipe' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('groceries')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'groceries' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <ShoppingCart size={16} />
                            Add to Groceries
                        </span>
                        {activeTab === 'groceries' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {activeTab === 'recipe' ? (
                        <div className="space-y-6">
                            {/* Description */}
                            {meal.description && (
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    {meal.description}
                                </p>
                            )}

                            {/* Ingredients */}
                            <div>
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                    <ChefHat size={18} className="text-orange-500" />
                                    Ingredients
                                </h3>
                                {ingredients.length > 0 ? (
                                    <ul className="space-y-2">
                                        {ingredients.map((ingredient, idx) => {
                                            const ingName = typeof ingredient === 'string' ? ingredient : ingredient.name;
                                            const ingAmount = typeof ingredient === 'object' ? ingredient.amount : '';
                                            return (
                                                <li key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                                    <div className="w-2 h-2 rounded-full bg-orange-500/50" />
                                                    <span className="text-sm text-zinc-200 flex-1">
                                                        {ingAmount && <span className="text-orange-400 font-medium">{ingAmount} </span>}
                                                        {ingName}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p className="text-zinc-500 text-sm italic">No ingredients listed for this recipe.</p>
                                )}
                            </div>

                            {/* Instructions */}
                            <div>
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                    <Play size={18} className="text-orange-500" />
                                    Instructions
                                </h3>
                                {instructions.length > 0 ? (
                                    <ol className="space-y-4">
                                        {instructions.map((step, idx) => {
                                            const stepText = typeof step === 'string' ? step : step.instruction || step.text;
                                            return (
                                                <li key={idx} className="flex gap-4">
                                                    <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-semibold shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <p className="text-sm text-zinc-300 leading-relaxed pt-1">{stepText}</p>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                ) : (
                                    <p className="text-zinc-500 text-sm italic">No instructions available for this recipe.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Add All Button */}
                            <button
                                onClick={handleAddAllIngredients}
                                className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={18} />
                                Add All Missing Ingredients
                            </button>

                            {/* Ingredient List with Checkboxes */}
                            {ingredients.length > 0 ? (
                                <ul className="space-y-2">
                                    {ingredients.map((ingredient, idx) => {
                                        const ingName = typeof ingredient === 'string' ? ingredient : ingredient?.name;
                                        const ingAmount = typeof ingredient === 'object' ? ingredient.amount : '';
                                        const isAdded = ingName ? addedIngredients.has(ingName) : false;
                                        const isInList = isInGroceryList(ingredient);

                                        return (
                                            <li
                                                key={idx}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isAdded || isInList
                                                    ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                    }`}
                                                onClick={() => handleToggleIngredient(ingredient)}
                                            >
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isAdded || isInList
                                                    ? 'bg-green-500 text-white'
                                                    : 'border-2 border-zinc-600'
                                                    }`}>
                                                    {(isAdded || isInList) && <Check size={14} />}
                                                </div>
                                                <span className={`text-sm flex-1 ${isAdded || isInList ? 'text-green-300' : 'text-zinc-200'}`}>
                                                    {ingAmount && <span className="font-medium">{ingAmount} </span>}
                                                    {ingName}
                                                </span>
                                                {isInList && !isAdded && (
                                                    <span className="text-[10px] text-green-400 bg-green-500/20 px-2 py-0.5 rounded">
                                                        In List
                                                    </span>
                                                )}
                                                {isAdded && (
                                                    <span className="text-[10px] text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">
                                                        Tap to remove
                                                    </span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="text-center py-8">
                                    <ShoppingCart size={40} className="mx-auto text-zinc-600 mb-3" />
                                    <p className="text-zinc-500 text-sm">No ingredients listed for this recipe.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Start Cooking Button */}
                {activeTab === 'recipe' && (
                    <div className="p-4 border-t border-white/10 shrink-0">
                        <button className="w-full py-3 px-4 rounded-xl bg-white text-black font-semibold text-sm transition-colors flex items-center justify-center gap-2 hover:bg-zinc-200">
                            <Play size={18} />
                            Start Cooking
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealDetailModal;

// Add this to your global CSS:
// @keyframes slide-up {
//     from { transform: translateY(100%); opacity: 0; }
//     to { transform: translateY(0); opacity: 1; }
// }
// .animate-slide-up { animation: slide-up 0.3s ease-out; }
