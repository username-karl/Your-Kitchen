import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Plus, ChefHat, Clock, Flame, ChevronLeft, ChevronRight,
    Sparkles, GripVertical, Shuffle, Loader2, RefreshCw
} from 'lucide-react';
import MealDetailModal from '../components/MealDetailModal.jsx';
import { swapSingleMeal, regenerateWeeklyPlan } from '../services/geminiService.js';

// Placeholder food images
const PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop',
];

const getPlaceholderImage = (mealName) => {
    const hash = mealName?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length];
};

const MealPlanner = ({ profile, onAddToGroceries, onRemoveFromGroceries, onSwapMeal }) => {
    const navigate = useNavigate();
    const weeklyPlan = profile?.weeklyPlan;
    const dailyPlans = weeklyPlan?.dailyPlans || [];
    const groceryList = weeklyPlan?.groceryList || [];

    const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [isSwapping, setIsSwapping] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Get current week's dates
    const weekDates = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek + (weekOffset * 7));

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });
    }, [weekOffset]);

    // Get month and year for header
    const headerDate = useMemo(() => {
        const middleDate = weekDates[3];
        return middleDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, [weekDates]);

    // Check if a date is today
    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Get meals for a specific day
    const getMealsForDay = (dayName) => {
        const dayPlan = dailyPlans.find(d =>
            d.day.toLowerCase() === dayName.toLowerCase()
        );
        return dayPlan?.meals || [];
    };

    // Format day name from date
    const getDayName = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    // Format short day name
    const getShortDayName = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const handleMealClick = (meal, dayName) => {
        // Find the day index in the dailyPlans array
        const dayIndex = dailyPlans.findIndex(d =>
            d.day.toLowerCase() === dayName.toLowerCase()
        );
        navigate('/recipe', { state: { meal, dayIndex } });
    };

    const handleCloseModal = () => {
        setSelectedMeal(null);
    };

    // Get meal type color
    const getMealTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'breakfast': return 'text-yellow-400';
            case 'lunch': return 'text-green-400';
            case 'dinner': return 'text-orange-400';
            default: return 'text-zinc-400';
        }
    };

    // Handle swapping a meal
    const handleSwapMeal = async (meal) => {
        if (!meal || isSwapping) return;

        setIsSwapping(true);
        try {
            const newMeal = await swapSingleMeal(meal, profile?.answers || []);
            if (newMeal && onSwapMeal) {
                // Find which day this meal belongs to and swap it
                const dayIndex = dailyPlans.findIndex(d =>
                    d.meals?.some(m => m.name === meal.name && m.type === meal.type)
                );
                if (dayIndex >= 0) {
                    onSwapMeal(dayIndex, meal, newMeal);
                }
                setSelectedMeal(newMeal);
            }
        } catch (error) {
            console.error('Failed to swap meal:', error);
            alert('Failed to swap meal. Please try again.');
        } finally {
            setIsSwapping(false);
        }
    };

    // Handle regenerating the entire meal plan
    const handleRegeneratePlan = async () => {
        if (isRegenerating) return;

        if (!confirm('Are you sure you want to regenerate your entire meal plan?')) {
            return;
        }

        setIsRegenerating(true);
        try {
            await regenerateWeeklyPlan(profile?.answers || []);
            window.location.reload();
        } catch (error) {
            console.error('Failed to regenerate plan:', error);
            alert('Failed to regenerate meal plan. Please try again.');
        } finally {
            setIsRegenerating(false);
        }
    };

    // No meal plan yet
    if (!weeklyPlan || !dailyPlans.length) {
        return (
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 pt-4">
                <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <Calendar className="text-zinc-500" size={28} />
                    </div>
                    <h2 className="text-xl font-medium text-white mb-2">No Meal Plan Yet</h2>
                    <p className="text-zinc-500 text-sm">
                        Complete the onboarding to get your personalized weekly meal plan.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 pt-4">
                <div className="max-w-5xl mx-auto h-full flex flex-col">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-medium text-white">Meal Planner</h2>
                            <p className="text-sm text-zinc-500 mt-1">{weeklyPlan.theme || 'Your personalized weekly menu'}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Week Navigation */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setWeekOffset(prev => prev - 1)}
                                    className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-sm text-zinc-300 min-w-[140px] text-center">{headerDate}</span>
                                <button
                                    onClick={() => setWeekOffset(prev => prev + 1)}
                                    className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* View Toggle */}
                            <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-1 gap-1">
                                <button
                                    onClick={() => setViewMode('week')}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'week'
                                        ? 'bg-white/10 text-white'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'month'
                                        ? 'bg-white/10 text-white'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    Month
                                </button>
                            </div>

                            {/* Reset Plan Button */}
                            <button
                                onClick={handleRegeneratePlan}
                                disabled={isRegenerating}
                                className="px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRegenerating ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <RefreshCw size={14} />
                                )}
                                <span className="hidden sm:inline">{isRegenerating ? 'Regenerating...' : 'Reset Plan'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Weekly Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-3 md:gap-4 flex-1">
                        {weekDates.map((date, index) => {
                            const dayName = getDayName(date);
                            const shortDay = getShortDayName(date);
                            const dayNum = date.getDate();
                            const meals = getMealsForDay(dayName);
                            const today = isToday(date);

                            return (
                                <div key={index} className="flex flex-col gap-3 min-h-[400px] md:min-h-[500px]">
                                    {/* Day Header */}
                                    <div className={`text-center pb-2 border-b ${today ? 'border-orange-500/30' : 'border-white/5'}`}>
                                        <span className={`text-xs font-medium ${today ? 'text-orange-400' : 'text-zinc-400'}`}>
                                            {shortDay} {dayNum}
                                        </span>
                                        {today && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mx-auto mt-1"></div>
                                        )}
                                    </div>

                                    {/* Meals for the day */}
                                    <div className="flex-1 flex flex-col gap-2">
                                        {meals.length > 0 ? (
                                            meals.map((meal, mealIdx) => (
                                                <div
                                                    key={mealIdx}
                                                    onClick={() => handleMealClick(meal, dayName)}
                                                    className={`group p-3 rounded-xl border transition-all cursor-pointer ${today && mealIdx === 0
                                                        ? 'bg-zinc-800/80 border-white/10 shadow-lg hover:border-orange-500/30'
                                                        : 'bg-zinc-900/50 border-white/5 hover:border-orange-500/30'
                                                        }`}
                                                >
                                                    {/* Meal thumbnail */}
                                                    <div className="w-full aspect-video rounded-lg overflow-hidden mb-2 bg-zinc-800">
                                                        <img
                                                            src={getPlaceholderImage(meal.name)}
                                                            alt={meal.name}
                                                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    </div>

                                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${getMealTypeColor(meal.type)}`}>
                                                        {meal.type}
                                                    </span>
                                                    <p className="text-xs text-white mt-1 font-medium line-clamp-2">{meal.name}</p>

                                                    {/* Quick info */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {meal.timeEstimate && (
                                                            <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                                                                <Clock size={10} />
                                                                {meal.timeEstimate}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Technique indicator */}
                                                    {meal.techniqueFocus && (
                                                        <div className="flex gap-1 mt-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex-1 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center text-zinc-600 hover:text-zinc-400">
                                                <Plus size={16} />
                                            </div>
                                        )}

                                        {/* Add meal button if day has meals */}
                                        {meals.length > 0 && meals.length < 3 && (
                                            <button className="p-3 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-white/5 transition-colors flex items-center justify-center text-zinc-600 hover:text-zinc-400">
                                                <Plus size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Sunday Prep Section */}
                    {weeklyPlan.sundayPrep && weeklyPlan.sundayPrep.length > 0 && (
                        <div className="mt-8 p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Sunday Prep</h3>
                                    <p className="text-xs text-zinc-500">Get ahead for the week</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {weeklyPlan.sundayPrep.map((task, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={12} className="text-orange-400" />
                                            <span className="text-[10px] text-orange-400 font-medium">{task.time}</span>
                                        </div>
                                        <p className="text-sm text-white">{task.task}</p>
                                        {task.why && (
                                            <p className="text-xs text-zinc-500 mt-1">{task.why}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sustainability Tip */}
                    {weeklyPlan.sustainabilityTip && (
                        <div className="mt-4 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                            <p className="text-sm text-green-300">
                                <span className="font-medium">💡 Sustainability Tip:</span> {weeklyPlan.sustainabilityTip}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Meal Detail Modal */}
            <MealDetailModal
                meal={selectedMeal}
                isOpen={!!selectedMeal}
                onClose={handleCloseModal}
                onAddToGroceries={onAddToGroceries}
                onRemoveFromGroceries={onRemoveFromGroceries}
                groceryList={groceryList}
                onSwapMeal={handleSwapMeal}
                isSwapping={isSwapping}
            />
        </>
    );
};

export default MealPlanner;
