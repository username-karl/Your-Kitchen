import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock, Flame, ChefHat, Play, Wallet, ShoppingBag,
    ChevronRight, ChevronDown, Plus, Timer, UtensilsCrossed,
    Shuffle, ArrowRight, RefreshCw, Loader2
} from 'lucide-react';
import MealDetailModal from '../components/MealDetailModal.jsx';
import { swapSingleMeal, regenerateWeeklyPlan } from '../services/geminiService.js';

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

const Dashboard = ({ profile, onSwapMeal, onSaveRecipe, onAddToGroceries, onRemoveFromGroceries }) => {
    const navigate = useNavigate();
    const weeklyPlan = profile?.weeklyPlan;
    const dailyPlans = weeklyPlan?.dailyPlans || [];
    const groceryList = weeklyPlan?.groceryList || [];

    // Day selection state - default to first day or find today
    const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
        if (!dailyPlans.length) return 0;
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todayIndex = dailyPlans.findIndex(d => d.day.toLowerCase() === today.toLowerCase());
        return todayIndex >= 0 ? todayIndex : 0;
    });

    // Selected meal for detail modal
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [isSwapping, setIsSwapping] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const selectedDay = dailyPlans[selectedDayIndex];
    const meals = selectedDay?.meals || [];

    // Find specific meal types
    const dinnerMeal = meals.find(m => m.type?.toLowerCase() === 'dinner');
    const lunchMeal = meals.find(m => m.type?.toLowerCase() === 'lunch');
    const breakfastMeal = meals.find(m => m.type?.toLowerCase() === 'breakfast');
    const featuredMeal = dinnerMeal || meals[0];

    // Calculate total prep time for the day
    const totalPrepTime = useMemo(() => {
        if (!meals.length) return '0m';
        let totalMinutes = 0;
        meals.forEach(meal => {
            const match = meal.timeEstimate?.match(/(\d+)/);
            if (match) totalMinutes += parseInt(match[1], 10);
        });
        if (totalMinutes >= 60) {
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${totalMinutes}m`;
    }, [meals]);

    // Generate day numbers (using current week)
    const getDayNumber = (dayName, index) => {
        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0 = Sunday
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDayIndex = dayNames.findIndex(d => d.toLowerCase() === dayName.toLowerCase());
        if (targetDayIndex === -1) return index + 1;

        const diff = targetDayIndex - currentDayOfWeek;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);
        return targetDate.getDate();
    };

    // Handle meal click - navigates to full recipe page
    const handleMealClick = (meal) => {
        navigate('/recipe', { state: { meal, dayIndex: selectedDayIndex } });
    };

    // Handle closing the modal (kept for backwards compatibility)
    const handleCloseModal = () => {
        setSelectedMeal(null);
    };

    // Handle adding ingredient to grocery list
    const handleAddToGroceries = (ingredient) => {
        onAddToGroceries?.(ingredient);
    };

    // Handle removing ingredient from grocery list
    const handleRemoveFromGroceries = (ingredient) => {
        onRemoveFromGroceries?.(ingredient);
    };

    // Handle swapping a meal for a new AI-generated alternative
    const handleSwapMeal = async (meal) => {
        if (!meal || isSwapping) return;

        setIsSwapping(true);
        try {
            const newMeal = await swapSingleMeal(meal, profile?.answers || []);

            // Update the meal in the plan
            if (newMeal && onSwapMeal) {
                onSwapMeal(selectedDayIndex, meal, newMeal);
                setSelectedMeal(newMeal); // Show the new meal
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

        if (!confirm('Are you sure you want to regenerate your entire meal plan? This will replace all current meals.')) {
            return;
        }

        setIsRegenerating(true);
        try {
            const newPlan = await regenerateWeeklyPlan(profile?.answers || []);
            // This will be handled by the parent component
            if (onSwapMeal && newPlan) {
                window.location.reload(); // Simplest way to refresh with new plan
            }
        } catch (error) {
            console.error('Failed to regenerate plan:', error);
            alert('Failed to regenerate meal plan. Please try again.');
        } finally {
            setIsRegenerating(false);
        }
    };

    // No meal plan yet - show empty state
    if (!weeklyPlan || !dailyPlans.length) {
        return (
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 pt-4 scroll-smooth no-scrollbar">
                <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <UtensilsCrossed className="text-zinc-500" size={28} />
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
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 pt-4 scroll-smooth no-scrollbar">
                <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">

                    {/* Calendar Strip */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-sm font-medium text-zinc-400">This Week</h3>
                            <button
                                onClick={() => navigate('/planner')}
                                className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1"
                            >
                                Full Planner <ArrowRight size={12} />
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                            {dailyPlans.map((day, index) => {
                                const isSelected = index === selectedDayIndex;
                                const dayAbbrev = day.day.substring(0, 3);
                                const dayNumber = getDayNumber(day.day, index);
                                const hasMeals = day.meals && day.meals.length > 0;

                                return (
                                    <button
                                        key={day.day}
                                        onClick={() => setSelectedDayIndex(index)}
                                        className={`flex flex-col items-center gap-1 md:gap-2 p-2 md:p-3 rounded-xl md:rounded-2xl transition-all cursor-pointer ${isSelected
                                            ? 'border border-orange-500/20 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                                            : 'border border-white/5 bg-zinc-900/30 hover:bg-zinc-800/50'
                                            }`}
                                    >
                                        <span className={`text-[9px] md:text-[10px] font-medium ${isSelected ? 'text-orange-300' : 'text-zinc-500'
                                            }`}>
                                            {dayAbbrev}
                                        </span>
                                        <span className={`text-xs md:text-sm font-semibold ${isSelected ? 'text-white' : 'text-zinc-400'
                                            }`}>
                                            {dayNumber}
                                        </span>
                                        {hasMeals && (
                                            <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-orange-500' : 'bg-zinc-600'
                                                }`}></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Greeting Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 border-t border-white/5">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight leading-tight">
                                Good {getTimeOfDay()}, {profile?.name || 'Chef'}. <br className="hidden md:block" />
                                <span className="text-zinc-500 font-normal">Ready to cook <span className="serif italic text-orange-400">something special?</span></span>
                            </h2>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={handleRegeneratePlan}
                                disabled={isRegenerating}
                                className="px-3 md:px-4 py-2 rounded-full border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRegenerating ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <RefreshCw size={14} />
                                )}
                                <span className="hidden sm:inline">{isRegenerating ? 'Regenerating...' : 'Reset Plan'}</span>
                            </button>
                            <button className="px-3 md:px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center gap-2">
                                <Plus size={14} />
                                Log Meal
                            </button>
                        </div>
                    </div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                        {/* Main Feature: Dinner Card (Span 8 on desktop) */}
                        {featuredMeal && (
                            <div
                                className="md:col-span-8 group relative aspect-video md:aspect-[2/1] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 cursor-pointer"
                                onClick={() => handleMealClick(featuredMeal)}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <img
                                        src={getPlaceholderImage(featuredMeal.name)}
                                        alt={featuredMeal.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
                                </div>

                                {/* Tags */}
                                <div className="absolute top-4 md:top-6 left-4 md:left-6 flex gap-2 flex-wrap">
                                    <span className="glass px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md border border-white/10">
                                        {featuredMeal.type} Tonight
                                    </span>
                                    {featuredMeal.techniqueFocus && (
                                        <span className="glass px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-orange-300 backdrop-blur-md border border-orange-500/20 bg-orange-500/10">
                                            {featuredMeal.techniqueFocus}
                                        </span>
                                    )}
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                                    <div className="flex justify-between items-end">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <h3 className="text-xl md:text-2xl lg:text-3xl font-medium text-white mb-1 md:mb-2 tracking-tight group-hover:text-orange-100 transition-colors truncate">
                                                {featuredMeal.name}
                                            </h3>
                                            <p className="text-xs md:text-sm text-zinc-300 mb-3 md:mb-4 max-w-md line-clamp-2">
                                                {featuredMeal.description}
                                            </p>

                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-zinc-200">
                                                    <Clock size={12} className="md:w-[14px] md:h-[14px]" />
                                                    {featuredMeal.timeEstimate}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMealClick(featuredMeal);
                                            }}
                                        >
                                            <Play size={16} className="md:w-5 md:h-5 ml-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Side Stats & Budget (Span 4 on desktop) */}
                        <div className="md:col-span-4 flex flex-col gap-4">
                            {/* Stats Card */}
                            <div className="flex-1 glass p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col justify-between group hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-zinc-500">Today's Prep</span>
                                        <h4 className="text-xl md:text-2xl font-medium text-white mt-1">{totalPrepTime} <span className="text-sm text-zinc-600 font-normal">total</span></h4>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400">
                                        <Clock size={16} />
                                    </div>
                                </div>
                                <div className="flex items-end gap-2 h-12 md:h-16 opacity-50">
                                    <div className="w-full bg-zinc-800 rounded-t-sm h-[40%]"></div>
                                    <div className="w-full bg-orange-500 rounded-t-sm h-[80%] shadow-[0_0_10px_rgba(249,115,22,0.3)]"></div>
                                    <div className="w-full bg-zinc-800 rounded-t-sm h-[20%]"></div>
                                    <div className="w-full bg-zinc-800 rounded-t-sm h-[30%]"></div>
                                </div>
                            </div>

                            {/* Grocery Teaser Card */}
                            <div className="flex-1 glass p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col justify-center group hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3 md:gap-4 mb-1">
                                    <div className="relative w-8 h-8 md:w-10 md:h-10">
                                        <div className="absolute inset-0 bg-orange-500 rounded-full opacity-20 animate-pulse"></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-orange-500">
                                            <ShoppingBag size={16} className="md:w-[18px] md:h-[18px]" />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-white block">Grocery List</span>
                                        <span className="text-xs text-zinc-500">{groceryList.length} items needed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Meals Section */}
                    {(lunchMeal || breakfastMeal) && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-400">Other Meals Today</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {[lunchMeal, breakfastMeal].filter(Boolean).map((meal, idx) => (
                                    <div
                                        key={meal.type + idx}
                                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer group"
                                        onClick={() => handleMealClick(meal)}
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden border border-white/5 shrink-0">
                                            <img
                                                src={getPlaceholderImage(meal.name)}
                                                alt={meal.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider block mb-0.5">{meal.type}</span>
                                            <h4 className="text-sm font-medium text-white truncate">{meal.name}</h4>
                                            <p className="text-xs text-zinc-500 line-clamp-1 hidden sm:block">{meal.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] text-zinc-500 hidden sm:inline">{meal.timeEstimate}</span>
                                            <ChevronRight className="text-zinc-600 group-hover:text-zinc-400 transition-colors" size={16} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Other meals not categorized as breakfast/lunch/dinner */}
                    {meals.filter(m => !['breakfast', 'lunch', 'dinner'].includes(m.type?.toLowerCase())).length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-400">Additional Meals</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {meals
                                    .filter(m => !['breakfast', 'lunch', 'dinner'].includes(m.type?.toLowerCase()))
                                    .map((meal, idx) => (
                                        <div
                                            key={meal.type + idx}
                                            className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer group"
                                            onClick={() => handleMealClick(meal)}
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden border border-white/5 shrink-0">
                                                <img
                                                    src={getPlaceholderImage(meal.name)}
                                                    alt={meal.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-0.5">{meal.type}</span>
                                                <h4 className="text-sm font-medium text-white truncate">{meal.name}</h4>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[10px] text-zinc-500">{meal.timeEstimate}</span>
                                                <ChevronRight className="text-zinc-600 group-hover:text-zinc-400 transition-colors" size={16} />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Meal Detail Modal */}
            <MealDetailModal
                meal={selectedMeal}
                isOpen={!!selectedMeal}
                onClose={handleCloseModal}
                onAddToGroceries={handleAddToGroceries}
                onRemoveFromGroceries={handleRemoveFromGroceries}
                groceryList={groceryList}
                onSwapMeal={handleSwapMeal}
                isSwapping={isSwapping}
            />
        </>
    );
};

// Helper function to get time of day greeting
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

export default Dashboard;
