import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import QuickMeal from './components/QuickMeal.jsx';
import RecipeBook from './components/RecipeBook.jsx';
import Sidebar from './components/Sidebar.jsx';
import MobileNav from './components/MobileNav.jsx';
import { getProfile, updateProfile, saveRecipe, deleteRecipe } from './services/databaseService.js';
import { onAuthStateChange, signOut } from './services/authService.js';
import { Menu, Flame, Bell, LogOut } from 'lucide-react';

const App = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [initialChatInput, setInitialChatInput] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    // Listen for auth state changes
    useEffect(() => {
        const { data: { subscription } } = onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);

            if (session?.user) {
                setUser(session.user);
                // Load user's profile
                try {
                    const userProfile = await getProfile(session.user.id);
                    setProfile(userProfile);
                } catch (e) {
                    console.error("Failed to load profile", e);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setIsLoading(false);
        });

        return () => subscription?.unsubscribe();
    }, []);

    const handleProfileComplete = async (newProfileData) => {
        if (!user) return;

        try {
            // Update the profile with the onboarding data
            const savedProfile = await updateProfile(user.id, {
                answers: newProfileData.answers,
                weeklyPlan: newProfileData.weeklyPlan,
                savedRecipes: []
            });
            setProfile(savedProfile);
            navigate('/dashboard');
        } catch (e) {
            console.error("Failed to save profile", e);
            // Fallback - still navigate
            setProfile(newProfileData);
            navigate('/dashboard');
        }
    };

    const handleSaveRecipe = async (recipe) => {
        if (!user) return;
        try {
            const updatedProfile = await saveRecipe(user.id, recipe);
            if (updatedProfile) {
                setProfile(updatedProfile);
            }
        } catch (e) {
            console.error("Failed to save recipe", e);
        }
    };

    const handleDeleteRecipe = async (recipeId) => {
        if (!user) return;
        try {
            const updatedProfile = await deleteRecipe(user.id, recipeId);
            if (updatedProfile) {
                setProfile(updatedProfile);
            }
        } catch (e) {
            console.error("Failed to delete recipe", e);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (e) {
            console.error("Failed to sign out", e);
        }
    };

    // Derived view state for Sidebar/MobileNav highlighting
    const getCurrentView = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('discover')) return 'discover';
        if (path.includes('cookbook')) return 'cookbook';
        return 'dashboard';
    };

    const handleNavigate = (viewId) => {
        if (viewId === 'dashboard') navigate('/dashboard');
        if (viewId === 'discover') navigate('/discover');
        if (viewId === 'cookbook') navigate('/cookbook');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-zinc-400">Loading...</span>
                </div>
            </div>
        );
    }

    // Protected route wrapper
    const ProtectedRoute = ({ children }) => {
        if (!user) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    // Check if user needs onboarding (no weekly plan yet)
    const needsOnboarding = user && profile && !profile.weeklyPlan;

    return (
        <div className="text-zinc-200 h-screen overflow-hidden flex selection:bg-orange-500/30 selection:text-orange-200 bg-zinc-950">
            {/* Sidebar only shown for authenticated users on main pages */}
            {user && !['/onboarding', '/', '/login'].includes(location.pathname) && (
                <Sidebar currentView={getCurrentView()} onChangeView={handleNavigate} />
            )}

            <main className="flex-1 flex flex-col h-full bg-zinc-950 relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                {/* Header - hide on onboarding, landing, and login */}
                {user && !['/onboarding', '/', '/login'].includes(location.pathname) && (
                    <header className="h-16 glass-strong z-30 flex items-center justify-between px-8 sticky top-0 shrink-0">
                        <div className="flex items-center gap-4">
                            <button className="md:hidden text-zinc-400">
                                <Menu size={20} />
                            </button>
                            <div className="flex flex-col">
                                <h1 className="text-sm font-semibold text-white">
                                    {location.pathname.includes('dashboard') ? 'Dashboard' : 'Your-Kitchen'}
                                </h1>
                                <span className="text-xs text-zinc-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 bg-zinc-900/50 border border-white/5 rounded-full px-3 py-1.5">
                                <Flame size={14} className="text-orange-500" />
                                <span className="text-xs font-medium text-zinc-300">Welcome, {profile?.name || 'Chef'}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-white/5"
                                title="Sign out"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </header>
                )}

                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

                    <Route path="/onboarding" element={
                        <ProtectedRoute>
                            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
                                <Onboarding onComplete={handleProfileComplete} />
                            </div>
                        </ProtectedRoute>
                    } />

                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            {needsOnboarding ? (
                                <Navigate to="/onboarding" replace />
                            ) : (
                                <Dashboard
                                    profile={profile}
                                    onSwapMeal={(txt) => { setInitialChatInput(txt); navigate('/discover'); }}
                                    onSaveRecipe={handleSaveRecipe}
                                />
                            )}
                        </ProtectedRoute>
                    } />

                    <Route path="/discover" element={
                        <ProtectedRoute>
                            <div className="flex-1 overflow-y-auto px-4 py-6">
                                <QuickMeal
                                    profile={profile}
                                    onSaveRecipe={handleSaveRecipe}
                                    initialInput={initialChatInput}
                                    onClearInitialInput={() => setInitialChatInput("")}
                                />
                            </div>
                        </ProtectedRoute>
                    } />

                    <Route path="/cookbook" element={
                        <ProtectedRoute>
                            <div className="flex-1 overflow-y-auto">
                                <RecipeBook
                                    recipes={profile?.savedRecipes || []}
                                    onDelete={handleDeleteRecipe}
                                />
                            </div>
                        </ProtectedRoute>
                    } />

                    {/* Default Redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Mobile Nav - hide on onboarding, landing, and login */}
                {user && !['/onboarding', '/', '/login'].includes(location.pathname) && (
                    <MobileNav
                        currentView={getCurrentView()}
                        onChangeView={handleNavigate}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
