import React, { useState, useMemo } from 'react';
import {
    Clock, Flame, ChefHat, Play, Wallet, ShoppingBag,
    ChevronRight, ChevronDown, Plus, Timer, UtensilsCrossed
} from 'lucide-react';

const Dashboard = ({ profile, onSwapMeal, onSaveRecipe }) => {
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

    const selectedDay = dailyPlans[selectedDayIndex];
    const meals = selectedDay?.meals || [];

    // Find specific meal types
    const dinnerMeal = meals.find(m => m.type?.toLowerCase() === 'dinner');
    const lunchMeal = meals.find(m => m.type?.toLowerCase() === 'lunch');
    const breakfastMeal = meals.find(m => m.type?.toLowerCase() === 'breakfast');

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

    // No meal plan yet - show empty state
    if (!weeklyPlan || !dailyPlans.length) {
        return (
            <div className="flex-1 overflow-y-auto px-6 pb-24 pt-4 scroll-smooth no-scrollbar">
                <div className="max-w-md mx-auto h-full flex flex-col items-center justify-center text-center">
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
        <div className="flex-1 overflow-y-auto px-6 pb-24 pt-4 scroll-smooth no-scrollbar">
            <div className="max-w-md mx-auto h-full flex flex-col">

                {/* App Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Current Plan</h4>
                        <div className="flex items-center gap-1">
                            <span className="text-xl font-medium text-white tracking-tight">{weeklyPlan.weekTitle || 'This Week'}</span>
                            <ChevronDown className="text-zinc-500" size={16} />
                        </div>
                        {weeklyPlan.theme && (
                            <span className="text-xs text-orange-500/80">{weeklyPlan.theme}</span>
                        )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 p-[1px]">
                        <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{profile?.name?.[0] || 'C'}</span>
                        </div>
                    </div>
                </div>

                {/* Day Tabs */}
                <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar mb-2">
                    {dailyPlans.map((day, index) => {
                        const isSelected = index === selectedDayIndex;
                        const dayAbbrev = day.day.substring(0, 3);
                        const dayNumber = getDayNumber(day.day, index);

                        return (
                            <button
                                key={day.day}
                                onClick={() => setSelectedDayIndex(index)}
                                className={`flex flex-col items-center gap-1 min-w-[50px] transition-opacity ${!isSelected ? 'opacity-50' : ''}`}
                            >
                                <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-orange-500' : 'text-zinc-500'}`}>
                                    {dayAbbrev}
                                </span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${isSelected
                                        ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                                        : 'bg-transparent border border-white/10 text-white'
                                    }`}>
                                    {dayNumber}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="glass p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="text-zinc-500" size={14} />
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Total Prep</span>
                        </div>
                        <span className="text-xl font-medium text-white">{totalPrepTime}</span>
                    </div>
                    <div className="glass p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                            <ShoppingBag className="text-zinc-500" size={14} />
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Groceries</span>
                        </div>
                        <span className="text-xl font-medium text-white">{groceryList.length} items</span>
                    </div>
                </div>

                {/* Main Card (Dinner or first available meal) */}
                {(dinnerMeal || meals[0]) && (
                    <div className="mb-6 cursor-pointer" onClick={() => onSwapMeal?.(`Suggest something different for ${(dinnerMeal || meals[0]).type}!`)}>
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-sm font-medium text-white">{(dinnerMeal || meals[0]).type} Today</span>
                            {(dinnerMeal || meals[0]).techniqueFocus && (
                                <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-1 rounded-md">
                                    {(dinnerMeal || meals[0]).techniqueFocus}
                                </span>
                            )}
                        </div>

                        <div className="group relative aspect-[4/3] rounded-3xl overflow-hidden mb-3 border border-white/10">
                            {/* Placeholder Image Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-zinc-900 to-black"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ChefHat className="text-zinc-700" size={64} />
                            </div>

                            {/* Overlay Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent">
                                <h3 className="text-xl font-medium text-white mb-1">{(dinnerMeal || meals[0]).name}</h3>
                                <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{(dinnerMeal || meals[0]).description}</p>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1 text-[10px] text-white font-medium bg-white/20 backdrop-blur px-2 py-1 rounded-md">
                                        <Timer size={10} /> {(dinnerMeal || meals[0]).timeEstimate}
                                    </span>
                                </div>
                            </div>

                            {/* FAB-like action */}
                            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                                <Play size={16} className="ml-0.5 fill-black" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Secondary Meals */}
                {[lunchMeal, breakfastMeal].filter(Boolean).map((meal, idx) => (
                    <div key={meal.type + idx} className="mb-4">
                        <span className="text-sm font-medium text-zinc-400 mb-3 block">{meal.type}</span>
                        <div
                            className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer"
                            onClick={() => onSwapMeal?.(`Suggest something different for ${meal.type}!`)}
                        >
                            <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 shrink-0">
                                <ChefHat className="text-zinc-500" size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white mb-1 truncate">{meal.name}</h4>
                                <p className="text-xs text-zinc-500 line-clamp-1">{meal.description}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-zinc-500">{meal.timeEstimate}</span>
                                <ChevronRight className="text-zinc-600" size={16} />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Other meals not categorized as breakfast/lunch/dinner */}
                {meals
                    .filter(m => !['breakfast', 'lunch', 'dinner'].includes(m.type?.toLowerCase()))
                    .map((meal, idx) => (
                        <div key={meal.type + idx} className="mb-4">
                            <span className="text-sm font-medium text-zinc-400 mb-3 block">{meal.type}</span>
                            <div
                                className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer"
                                onClick={() => onSwapMeal?.(`Suggest something different for ${meal.type}!`)}
                            >
                                <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 shrink-0">
                                    <ChefHat className="text-zinc-500" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-white mb-1 truncate">{meal.name}</h4>
                                    <p className="text-xs text-zinc-500 line-clamp-1">{meal.description}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] text-zinc-500">{meal.timeEstimate}</span>
                                    <ChevronRight className="text-zinc-600" size={16} />
                                </div>
                            </div>
                        </div>
                    ))}

                {/* Shopping List Teaser */}
                {groceryList.length > 0 && (
                    <div className="p-4 rounded-2xl border border-dashed border-zinc-700 bg-transparent flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer mt-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                <ShoppingBag className="text-zinc-400" size={14} />
                            </div>
                            <span className="text-xs font-medium text-zinc-300">Grocery List ({groceryList.length} items)</span>
                        </div>
                        <button className="text-xs text-orange-500 hover:text-orange-400 transition-colors">View</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
