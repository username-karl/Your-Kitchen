import { supabase } from './supabaseClient';

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email, password, name = 'Chef') => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name }
        }
    });

    if (error) throw error;
    return data;
};

/**
 * Sign in an existing user
 */
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/**
 * Get the current logged-in user
 */
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

/**
 * Get current session
 */
export const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
};

/**
 * Listen for auth state changes
 */
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
};

/**
 * Verify email with OTP code
 */
export const verifyOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
    });

    if (error) throw error;
    return data;
};

/**
 * Resend OTP verification email
 */
export const resendOtp = async (email) => {
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email
    });

    if (error) throw error;
};
