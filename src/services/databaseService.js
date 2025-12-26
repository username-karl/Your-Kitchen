import { supabase, isSupabaseConfigured } from './supabaseClient.js';

// Fallback to localStorage if Supabase is not configured
const STORAGE_KEY = 'chefai_profiles';

// --- Profile Operations ---

export const getProfile = async (userId) => {
    if (!isSupabaseConfigured() || !userId) {
        const saved = localStorage.getItem(STORAGE_KEY);
        const profiles = saved ? JSON.parse(saved) : [];
        return profiles.find(p => p.id === userId) || null;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        createdAt: new Date(data.created_at).getTime(),
        answers: data.answers || [],
        weeklyPlan: data.weekly_plan,
        savedRecipes: data.saved_recipes || []
    };
};

export const updateProfile = async (userId, updates) => {
    if (!isSupabaseConfigured() || !userId) {
        const saved = localStorage.getItem(STORAGE_KEY);
        const profiles = saved ? JSON.parse(saved) : [];
        const updated = profiles.map(p =>
            p.id === userId ? { ...p, ...updates } : p
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated.find(p => p.id === userId);
    }

    // Convert camelCase to snake_case for Supabase
    const supabaseUpdates = {};
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.answers !== undefined) supabaseUpdates.answers = updates.answers;
    if (updates.weeklyPlan !== undefined) supabaseUpdates.weekly_plan = updates.weeklyPlan;
    if (updates.savedRecipes !== undefined) supabaseUpdates.saved_recipes = updates.savedRecipes;

    const { data, error } = await supabase
        .from('profiles')
        .update(supabaseUpdates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }

    return {
        id: data.id,
        name: data.name,
        createdAt: new Date(data.created_at).getTime(),
        answers: data.answers,
        weeklyPlan: data.weekly_plan,
        savedRecipes: data.saved_recipes || []
    };
};

// --- Recipe Operations ---

export const saveRecipe = async (userId, recipe) => {
    const profile = await getProfile(userId);
    if (!profile) {
        console.error('Profile not found:', userId);
        return null;
    }

    const currentRecipes = profile.savedRecipes || [];

    // Prevent duplicates
    if (currentRecipes.some(r => r.name === recipe.name)) {
        return profile;
    }

    const updatedRecipes = [recipe, ...currentRecipes];
    return updateProfile(userId, { savedRecipes: updatedRecipes });
};

export const deleteRecipe = async (userId, recipeId) => {
    const profile = await getProfile(userId);
    if (!profile) {
        console.error('Profile not found:', userId);
        return null;
    }

    const updatedRecipes = (profile.savedRecipes || []).filter(r => r.id !== recipeId);
    return updateProfile(userId, { savedRecipes: updatedRecipes });
};
