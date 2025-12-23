import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, Recipe } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import QuickMeal from './components/QuickMeal';
import RecipeBook from './components/RecipeBook';
import ProfileSelector from './components/ProfileSelector';
import { LayoutDashboard, Bot, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);
  
  // State for pre-filling chat input when swapping meals
  const [initialChatInput, setInitialChatInput] = useState<string>("");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chefai_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProfiles(parsed);
          setCurrentProfileId(parsed[0].id);
          setCurrentView(AppView.DASHBOARD);
        }
      } catch (e) {
        console.error("Failed to load profiles", e);
      }
    }
  }, []);

  // Save to localStorage whenever profiles change
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('chefai_profiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  const handleProfileComplete = (newProfile: UserProfile) => {
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    setCurrentProfileId(newProfile.id);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleCreateNewProfile = () => {
    setCurrentView(AppView.ONBOARDING);
    setCurrentProfileId(null);
  };

  const handleSwitchProfile = (id: string) => {
    setCurrentProfileId(id);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    if (!currentProfileId) return;
    
    setProfiles(prev => prev.map(p => {
        if (p.id === currentProfileId) {
            const currentSaved = p.savedRecipes || [];
            // Prevent duplicates
            if (currentSaved.some(r => r.name === recipe.name)) return p;
            return { ...p, savedRecipes: [recipe, ...currentSaved] };
        }
        return p;
    }));
  };

  const handleDeleteRecipe = (recipeId: string) => {
    if (!currentProfileId) return;

    setProfiles(prev => prev.map(p => {
        if (p.id === currentProfileId) {
            return { ...p, savedRecipes: (p.savedRecipes || []).filter(r => r.id !== recipeId) };
        }
        return p;
    }));
  };

  const handleSwapMeal = (text: string) => {
    setInitialChatInput(text);
    setCurrentView(AppView.QUICK_MEAL);
  };

  const currentProfile = profiles.find(p => p.id === currentProfileId);

  return (
    <div className="min-h-screen bg-paper text-stone-900 font-sans selection:bg-chef-200">
      {/* Top Bar for Profile Mgmt */}
      {(currentView !== AppView.ONBOARDING || profiles.length > 0) && (
        <ProfileSelector 
          profiles={profiles}
          currentProfileId={currentProfileId}
          onSelect={handleSwitchProfile}
          onCreateNew={handleCreateNewProfile}
        />
      )}

      <main className="container mx-auto px-2 md:px-4 py-6 md:py-8 pb-32">
        {currentView === AppView.ONBOARDING && (
          <div className="max-w-3xl mx-auto pt-4 md:pt-8">
            <div className="text-center mb-8 md:mb-12 animate-fade-in px-4">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-chef-950 mb-4 md:mb-6 tracking-tight leading-tight">Let's Design Your Menu</h1>
              <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                I'm your culinary mentor. I'll ask a few questions to build a weekly plan that fits your life, taste, and goals.
              </p>
            </div>
            <Onboarding onComplete={handleProfileComplete} />
          </div>
        )}

        {currentView === AppView.DASHBOARD && currentProfile && (
          <Dashboard 
            profile={currentProfile} 
            onSwapMeal={handleSwapMeal} 
            onSaveRecipe={handleSaveRecipe}
          />
        )}

        {currentView === AppView.QUICK_MEAL && (
          <div className="pt-2 md:pt-4 animate-fade-in">
            <QuickMeal 
                profile={currentProfile} 
                onSaveRecipe={handleSaveRecipe} 
                initialInput={initialChatInput}
                onClearInitialInput={() => setInitialChatInput("")}
            />
          </div>
        )}

        {currentView === AppView.RECIPE_BOOK && currentProfile && (
          <RecipeBook 
            recipes={currentProfile.savedRecipes || []} 
            onDelete={handleDeleteRecipe} 
          />
        )}
      </main>

      {/* Bottom Navigation for Mobile/General switching */}
      {currentProfileId && currentView !== AppView.ONBOARDING && (
        <div className="fixed bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-full shadow-card border border-stone-100 p-1.5 flex gap-1 z-50">
           <button
             onClick={() => setCurrentView(AppView.DASHBOARD)}
             className={`flex items-center gap-2 px-4 py-3 md:px-5 rounded-full font-medium transition-all duration-300 ${currentView === AppView.DASHBOARD ? 'bg-chef-900 text-white shadow-lg transform scale-105' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'}`}
           >
             <LayoutDashboard size={20} />
             <span className="hidden sm:inline">Week</span>
           </button>
           <button
             onClick={() => setCurrentView(AppView.QUICK_MEAL)}
             className={`flex items-center gap-2 px-4 py-3 md:px-5 rounded-full font-medium transition-all duration-300 ${currentView === AppView.QUICK_MEAL ? 'bg-chef-900 text-white shadow-lg transform scale-105' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'}`}
           >
             <Bot size={20} />
             <span className="hidden sm:inline">Chef Bot</span>
           </button>
           <button
             onClick={() => setCurrentView(AppView.RECIPE_BOOK)}
             className={`flex items-center gap-2 px-4 py-3 md:px-5 rounded-full font-medium transition-all duration-300 ${currentView === AppView.RECIPE_BOOK ? 'bg-chef-900 text-white shadow-lg transform scale-105' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'}`}
           >
             <BookOpen size={20} />
             <span className="hidden sm:inline">Cookbook</span>
           </button>
        </div>
      )}
    </div>
  );
};

export default App;