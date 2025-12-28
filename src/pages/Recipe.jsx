import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Clock, Users, ChefHat, Flame, Check,
    ShoppingCart, Play, Pause, RotateCcw, ChevronRight,
    Shuffle, Loader2
} from 'lucide-react';
import { swapSingleMeal } from '../services/geminiService.js';

// Placeholder food images
const PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&auto=format&fit=crop',
];

const getPlaceholderImage = (mealName) => {
    const hash = mealName?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length];
};

const Recipe = ({ profile, onAddToGroceries, onSwapMeal }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const meal = location.state?.meal;
    const dayIndex = location.state?.dayIndex;

    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [addedIngredients, setAddedIngredients] = useState(new Set());
    const [isSwapping, setIsSwapping] = useState(false);
    const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'ingredients', 'instructions'

    const groceryList = profile?.weeklyPlan?.groceryList || [];

    // If no meal data, redirect back
    useEffect(() => {
        if (!meal) {
            navigate('/dashboard');
        }
    }, [meal, navigate]);

    if (!meal) return null;

    const ingredients = meal.ingredients || [];
    const instructions = meal.instructions || meal.steps || [];

    // Check if ingredient is in grocery list
    const isInGroceryList = (ingredient) => {
        const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient?.name;
        if (!ingredientName) return false;

        return groceryList.some(item => {
            if (typeof item === 'string') {
                return item.toLowerCase().includes(ingredientName.toLowerCase()) ||
                    ingredientName.toLowerCase().includes(item.toLowerCase());
            }
            return item?.item?.toLowerCase().includes(ingredientName.toLowerCase()) ||
                ingredientName.toLowerCase().includes(item?.item?.toLowerCase() || '');
        }) || addedIngredients.has(ingredientName);
    };

    // Toggle step completion
    const toggleStep = (index) => {
        setCompletedSteps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Add ingredient to grocery list
    const handleAddIngredient = (ingredient) => {
        const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient?.name;
        if (!ingredientName || isInGroceryList(ingredient)) return;

        setAddedIngredients(prev => new Set([...prev, ingredientName]));
        onAddToGroceries?.(ingredientName);
    };

    // Add all ingredients
    const handleAddAllIngredients = () => {
        ingredients.forEach(ing => {
            if (!isInGroceryList(ing)) {
                handleAddIngredient(ing);
            }
        });
    };

    // Handle swap meal
    const handleSwapMeal = async () => {
        if (isSwapping) return;

        setIsSwapping(true);
        try {
            const newMeal = await swapSingleMeal(meal, profile?.answers || []);
            if (newMeal && onSwapMeal && dayIndex !== undefined) {
                onSwapMeal(dayIndex, meal, newMeal);
                // Navigate to the new meal
                navigate('/recipe', { state: { meal: newMeal, dayIndex }, replace: true });
            }
        } catch (error) {
            console.error('Failed to swap meal:', error);
            alert('Failed to swap meal. Please try again.');
        } finally {
            setIsSwapping(false);
        }
    };

    // Progress calculation
    const progress = instructions.length > 0
        ? Math.round((completedSteps.size / instructions.length) * 100)
        : 0;

    return (
        <div className="flex-1 overflow-y-auto bg-zinc-950">
            {/* Hero Section */}
            <div className="relative h-64 md:h-80">
                <img
                    src={getPlaceholderImage(meal.name)}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <button
                        onClick={handleSwapMeal}
                        disabled={isSwapping}
                        className="w-10 h-10 rounded-full bg-orange-500/80 backdrop-blur flex items-center justify-center text-white hover:bg-orange-500 transition-colors disabled:opacity-50"
                        title="Swap this meal"
                    >
                        {isSwapping ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Shuffle size={18} />
                        )}
                    </button>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white bg-orange-500/80">
                                {meal.type}
                            </span>
                            {meal.techniqueFocus && (
                                <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-orange-200 bg-black/50">
                                    {meal.techniqueFocus}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{meal.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
                            <span className="flex items-center gap-1.5">
                                <Clock size={16} />
                                {meal.timeEstimate || '30 min'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Users size={16} />
                                {meal.servings || '2-4 servings'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <ChefHat size={16} />
                                {ingredients.length} ingredients
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 md:px-6 pb-24">

                {/* Description */}
                {meal.description && (
                    <div className="py-6 border-b border-white/5">
                        <p className="text-zinc-400 leading-relaxed">{meal.description}</p>
                    </div>
                )}

                {/* Section Tabs */}
                <div className="flex gap-1 py-4 border-b border-white/5 sticky top-0 bg-zinc-950 z-10">
                    {['overview', 'ingredients', 'instructions'].map((section) => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === section
                                    ? 'bg-white/10 text-white'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Section */}
                {activeSection === 'overview' && (
                    <div className="py-6 space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                                <Clock size={20} className="text-orange-400 mb-2" />
                                <p className="text-xs text-zinc-500">Prep Time</p>
                                <p className="text-white font-medium">{meal.timeEstimate || '30 min'}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                                <Users size={20} className="text-orange-400 mb-2" />
                                <p className="text-xs text-zinc-500">Servings</p>
                                <p className="text-white font-medium">{meal.servings || '2-4'}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                                <ChefHat size={20} className="text-orange-400 mb-2" />
                                <p className="text-xs text-zinc-500">Ingredients</p>
                                <p className="text-white font-medium">{ingredients.length} items</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                                <Flame size={20} className="text-orange-400 mb-2" />
                                <p className="text-xs text-zinc-500">Steps</p>
                                <p className="text-white font-medium">{instructions.length} steps</p>
                            </div>
                        </div>

                        {/* Technique Focus */}
                        {meal.techniqueFocus && (
                            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                                <h3 className="text-orange-400 font-medium mb-1">Technique Focus</h3>
                                <p className="text-zinc-300 text-sm">{meal.techniqueFocus}</p>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setActiveSection('instructions')}
                                className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Play size={18} />
                                Start Cooking
                            </button>
                            <button
                                onClick={handleAddAllIngredients}
                                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={18} />
                                Add All to Groceries
                            </button>
                        </div>
                    </div>
                )}

                {/* Ingredients Section */}
                {activeSection === 'ingredients' && (
                    <div className="py-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Ingredients</h2>
                            <button
                                onClick={handleAddAllIngredients}
                                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                            >
                                <ShoppingCart size={14} />
                                Add All
                            </button>
                        </div>

                        <div className="space-y-2">
                            {ingredients.map((ingredient, idx) => {
                                const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient?.name;
                                const ingredientAmount = typeof ingredient === 'object' ? ingredient?.amount : null;
                                const isAdded = isInGroceryList(ingredient);

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => !isAdded && handleAddIngredient(ingredient)}
                                        className={`p-4 rounded-xl border transition-all ${isAdded
                                                ? 'bg-green-500/10 border-green-500/20'
                                                : 'bg-zinc-900/50 border-white/5 hover:border-orange-500/30 cursor-pointer'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isAdded
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-zinc-600'
                                                }`}>
                                                {isAdded && <Check size={14} className="text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${isAdded ? 'text-green-300' : 'text-white'}`}>
                                                    {ingredientName}
                                                </p>
                                                {ingredientAmount && (
                                                    <p className="text-sm text-zinc-500">{ingredientAmount}</p>
                                                )}
                                            </div>
                                            {!isAdded && (
                                                <ShoppingCart size={16} className="text-zinc-500" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Instructions Section */}
                {activeSection === 'instructions' && (
                    <div className="py-6">
                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-semibold text-white">Instructions</h2>
                                <span className="text-sm text-zinc-400">{progress}% complete</span>
                            </div>
                            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Reset Button */}
                        {completedSteps.size > 0 && (
                            <button
                                onClick={() => setCompletedSteps(new Set())}
                                className="mb-4 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                            >
                                <RotateCcw size={12} />
                                Reset Progress
                            </button>
                        )}

                        {/* Steps */}
                        <div className="space-y-4">
                            {instructions.map((step, idx) => {
                                const isCompleted = completedSteps.has(idx);
                                const stepText = typeof step === 'string' ? step : step?.text || step?.instruction || JSON.stringify(step);

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => toggleStep(idx)}
                                        className={`p-5 rounded-2xl border transition-all cursor-pointer ${isCompleted
                                                ? 'bg-green-500/10 border-green-500/20'
                                                : 'bg-zinc-900/50 border-white/5 hover:border-orange-500/30'
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted
                                                    ? 'bg-green-500'
                                                    : 'bg-zinc-800 border border-white/10'
                                                }`}>
                                                {isCompleted ? (
                                                    <Check size={16} className="text-white" />
                                                ) : (
                                                    <span className="text-sm font-medium text-zinc-400">{idx + 1}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`leading-relaxed ${isCompleted ? 'text-green-300' : 'text-zinc-300'
                                                    }`}>
                                                    {stepText}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Completion Message */}
                        {progress === 100 && (
                            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center">
                                <div className="w-16 h-16 rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center">
                                    <Check size={32} className="text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Recipe Complete! 🎉</h3>
                                <p className="text-green-300">Great job! You've completed all the steps.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recipe;
