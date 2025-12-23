import React, { useState } from 'react';
import { WeeklyPlan, UserProfile, PlannedMeal } from '../types';
import { Calendar, ShoppingBag, Clock, BookOpen, Leaf, Layers, X, ChefHat, RefreshCw, LayoutGrid, Zap, AlignLeft } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  onSwapMeal: (text: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, onSwapMeal }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'prep' | 'grocery'>('menu');
  const [selectedMeal, setSelectedMeal] = useState<{ day: string; meal: PlannedMeal } | null>(null);

  const plan = profile.weeklyPlan;

  if (!plan) return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
          <ChefHat size={48} className="text-chef-200 mb-4" />
          <h2 className="text-xl font-bold text-stone-600">No Plan Found</h2>
          <p className="text-stone-400">Try creating a new profile or regenerating your plan.</p>
      </div>
  );

  const handleSwapRequest = (day: string, mealName: string) => {
    onSwapMeal(`I want to swap the ${day} meal "${mealName}". I'm looking for something different.`);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-24">
      {/* Header */}
      <header className="mb-8 md:mb-10 text-center md:text-left">
        <div className="inline-block bg-chef-100 text-chef-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            Weekly Menu
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-chef-950 mb-4 leading-tight">{plan.weekTitle}</h1>
        
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-center md:justify-start text-stone-600 text-sm md:text-base">
           <p className="flex items-center gap-2 font-medium">
             <Layers size={18} className="text-spice-500" /> 
             <span>Theme: <span className="text-stone-900">{plan.theme}</span></span>
           </p>
           <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-stone-300"></span>
           <p className="flex items-center gap-2 font-medium">
             <Leaf size={18} className="text-chef-600" />
             <span>Tip: <span className="text-stone-900 italic">{plan.sustainabilityTip}</span></span>
           </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-20 z-30 bg-paper/95 backdrop-blur py-2 mb-4 -mx-2 px-2 md:mx-0 md:px-0">
          <div className="flex gap-1 bg-stone-100/80 p-1 rounded-2xl md:inline-flex border border-stone-200/50 w-full md:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap ${activeTab === 'menu' ? 'bg-white text-chef-900 shadow-sm ring-1 ring-stone-200' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'}`}
            >
              <Calendar size={14} className="md:w-4 md:h-4" /> The Menu
            </button>
            <button
              onClick={() => setActiveTab('prep')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap ${activeTab === 'prep' ? 'bg-white text-chef-900 shadow-sm ring-1 ring-stone-200' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'}`}
            >
              <Clock size={14} className="md:w-4 md:h-4" /> Sunday Prep
            </button>
            <button
              onClick={() => setActiveTab('grocery')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap ${activeTab === 'grocery' ? 'bg-white text-chef-900 shadow-sm ring-1 ring-stone-200' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'}`}
            >
              <ShoppingBag size={14} className="md:w-4 md:h-4" /> Grocery List
            </button>
          </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'menu' && (
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plan.dailyPlans.map((day, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-soft border border-stone-100 flex flex-col h-full overflow-hidden">
                <div className="bg-stone-100/50 p-4 border-b border-stone-100 flex justify-between items-center">
                    <span className="text-stone-700 font-bold uppercase tracking-wider text-sm">{day.day}</span>
                    <span className="text-stone-400 text-xs font-medium bg-white px-2 py-1 rounded-md shadow-sm border border-stone-100">{(day.meals || []).length} Meals</span>
                </div>
                
                <div className="p-2 space-y-1 flex-grow">
                    {(day.meals || []).map((meal, mIdx) => (
                        <div key={mIdx} className="group relative p-4 rounded-2xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-chef-600 uppercase tracking-wider bg-chef-50 px-2 py-0.5 rounded-full">{meal.type}</span>
                                <span className="text-stone-400 text-xs flex items-center gap-1"><Clock size={10} /> {meal.timeEstimate}</span>
                            </div>
                            
                            <h3 className="text-lg font-serif font-bold text-chef-950 leading-tight mb-2 group-hover:text-chef-800 transition-colors">{meal.name}</h3>
                            <p className="text-stone-600 text-sm line-clamp-2 mb-3">{meal.description}</p>
                            
                            <div className="flex items-center gap-1 text-xs text-stone-400 font-medium group-hover:opacity-0 transition-opacity duration-200">
                                <BookOpen size={12} /> View Recipe
                            </div>

                            {/* Floating Action Pill (Visible on Hover/Focus) */}
                            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 md:translate-y-2 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 w-auto">
                                <div className="bg-chef-950 text-white rounded-full p-1.5 shadow-xl flex items-center gap-1 border border-chef-800/50 backdrop-blur-sm scale-90 md:scale-100">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedMeal({ day: day.day, meal }); }}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors tooltip"
                                        title="View Details"
                                    >
                                        <LayoutGrid size={16} />
                                    </button>
                                    <div className="w-px h-4 bg-white/20"></div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleSwapRequest(day.day, meal.name); }}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-spice-300"
                                        title="Swap with Chef"
                                    >
                                        <Zap size={16} />
                                    </button>
                                    <div className="w-px h-4 bg-white/20"></div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedMeal({ day: day.day, meal }); }}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                        title="Instructions"
                                    >
                                        <AlignLeft size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Click Area */}
                            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedMeal({ day: day.day, meal })}></div>
                            
                            {/* Divider */}
                            {mIdx < (day.meals || []).length - 1 && <div className="absolute bottom-0 left-4 right-4 h-px bg-stone-100/50"></div>}
                        </div>
                    ))}
                    {(!day.meals || day.meals.length === 0) && (
                        <div className="text-center p-6 text-stone-400 italic text-sm">
                           No meals scheduled.
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'prep' && (
          <div className="bg-white rounded-3xl shadow-soft border border-stone-100 p-6 md:p-12">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="bg-spice-100 p-3 rounded-2xl text-spice-600 shrink-0">
                    <Clock size={24} className="md:w-8 md:h-8" />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-chef-950">Sunday Prep System</h2>
                    <p className="text-sm md:text-base text-stone-500">Invest a little time now, save hours later.</p>
                </div>
            </div>

            <div className="space-y-6 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-stone-100">
              {plan.sundayPrep.map((task, idx) => (
                <div key={idx} className="relative pl-12">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-chef-900 text-white flex items-center justify-center font-bold text-sm ring-4 ring-white z-10">
                    {idx + 1}
                  </div>
                  <div className="bg-stone-50 rounded-2xl p-5 md:p-6 border border-stone-100 hover:border-chef-200 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <h3 className="font-bold text-stone-900 text-lg">{task.task}</h3>
                        <span className="text-xs bg-white border border-stone-200 px-3 py-1 rounded-full text-stone-600 font-bold whitespace-nowrap self-start md:self-auto">{task.time}</span>
                    </div>
                    <p className="text-stone-600 text-sm md:text-base"><span className="font-bold text-chef-700">Why:</span> {task.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'grocery' && (
          <div className="bg-white rounded-3xl shadow-soft border border-stone-100 p-6 md:p-12">
             <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="bg-chef-100 p-3 rounded-2xl text-chef-700 shrink-0">
                    <ShoppingBag size={24} className="md:w-8 md:h-8" />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-chef-950">Market List</h2>
                    <p className="text-sm md:text-base text-stone-500">Everything you need for the week.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-10">
              {Array.from(new Set(plan.groceryList.map(i => i.category))).map(category => (
                <div key={category}>
                  <h3 className="font-bold text-stone-900 border-b-2 border-spice-500/20 pb-3 mb-4 md:mb-5 text-lg flex items-center justify-between">
                    {category}
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded-md font-normal">{plan.groceryList.filter(i => i.category === category).length} items</span>
                  </h3>
                  <ul className="space-y-3 md:space-y-4">
                    {plan.groceryList.filter(i => i.category === category).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 group">
                        <div className="mt-1 w-5 h-5 rounded-md border-2 border-stone-300 flex-shrink-0 group-hover:border-chef-500 transition-colors"></div>
                        <div>
                          <span className="text-stone-800 font-medium group-hover:text-chef-900 transition-colors">{item.item}</span>
                          {item.note && <p className="text-sm text-stone-500 italic mt-0.5">{item.note}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-stone-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedMeal(null)}>
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-stone-100 flex justify-between items-start bg-stone-50/80 backdrop-blur">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-chef-600 uppercase tracking-wide bg-chef-100 px-2 py-1 rounded-md">{selectedMeal.meal.type}</span>
                            <span className="text-stone-400 text-xs font-bold uppercase">{selectedMeal.day}</span>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-chef-950">{selectedMeal.meal.name}</h2>
                        <div className="flex gap-4 mt-2 text-sm text-stone-500">
                             <span className="flex items-center gap-1"><Clock size={14} /> {selectedMeal.meal.timeEstimate}</span>
                        </div>
                    </div>
                    <button onClick={() => setSelectedMeal(null)} className="text-stone-400 hover:text-stone-800 p-2 rounded-full hover:bg-stone-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6 space-y-8">
                    <div>
                        <p className="text-stone-700 italic border-l-4 border-chef-200 pl-4 py-2 text-lg bg-stone-50 rounded-r-xl">{selectedMeal.meal.description}</p>
                    </div>

                    <div className="bg-gradient-to-br from-chef-50 to-white border border-chef-100 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs text-chef-700 font-bold flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                            <BookOpen size={14} /> Chef's Technique Focus
                        </p>
                        <p className="text-base text-chef-950 font-medium leading-relaxed">"{selectedMeal.meal.techniqueFocus}"</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                <ShoppingBag size={14} /> Ingredients
                            </h3>
                            <ul className="space-y-3 text-sm text-stone-700">
                                {selectedMeal.meal.ingredients.map((ing, i) => (
                                    <li key={i} className="flex items-start gap-3 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-chef-400 mt-1.5 shrink-0 group-hover:scale-125 transition-transform"></div>
                                        <span className="group-hover:text-chef-900 transition-colors">{ing}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                <AlignLeft size={14} /> Instructions
                            </h3>
                             <ol className="space-y-4 text-sm text-stone-700">
                                {selectedMeal.meal.instructions.map((step, i) => (
                                    <li key={i} className="flex gap-4">
                                        <span className="font-bold text-chef-300 font-mono text-lg leading-none">{i + 1}</span>
                                        <span className="leading-relaxed">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-stone-100 bg-stone-50/80 backdrop-blur flex justify-between items-center md:justify-end gap-2">
                    <button 
                        onClick={() => {
                            handleSwapRequest(selectedMeal.day, selectedMeal.meal.name);
                            setSelectedMeal(null);
                        }}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-100 hover:text-chef-900 transition-colors font-bold text-sm shadow-sm"
                    >
                        <RefreshCw size={16} className="text-spice-500" />
                        <span>Swap Meal</span>
                    </button>
                    <button 
                        onClick={() => setSelectedMeal(null)}
                        className="px-8 py-3 bg-chef-900 text-white rounded-xl hover:bg-chef-800 transition-colors font-bold text-sm shadow-lg shadow-chef-900/20"
                    >
                        Got it, Chef
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;