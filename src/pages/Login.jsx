import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signIn, signUp, resendOtp } from '../services/authService';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, Check, X, RefreshCw } from 'lucide-react';

// Password strength calculation
const calculatePasswordStrength = (password) => {
    let score = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    Object.values(checks).forEach(passed => { if (passed) score++; });

    return { score, checks };
};

const getStrengthLabel = (score) => {
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' };
    if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-400' };
    if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
    if (score <= 4) return { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-400' };
    return { label: 'Excellent', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
};

const TOTAL_STEPS = 15; // 1 registration + 1 verification + 13 onboarding questions

const Login = () => {
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
    const [step, setStep] = useState('register'); // 'register', 'verify', or 'login'

    // Registration fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Resend cooldown timer
    const [resendCooldown, setResendCooldown] = useState(0);

    // UI state
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);
    const strengthInfo = useMemo(() => getStrengthLabel(passwordStrength.score), [passwordStrength.score]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResendEmail = async () => {
        if (resendCooldown > 0) return;
        setError('');

        try {
            await resendOtp(email);
            setResendCooldown(60);
        } catch (err) {
            setError(err.message || 'Failed to resend confirmation email');
        }
    };

    // Email validation helper
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate name
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }

        // Validate email
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address (e.g., name@example.com)');
            return;
        }

        // Validate password
        if (!password) {
            setError('Please create a password');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        if (passwordStrength.score < 3) {
            setError('Please use a stronger password - include uppercase, lowercase, numbers, and special characters');
            return;
        }

        // Validate confirm password
        if (!confirmPassword) {
            setError('Please confirm your password');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match - please try again');
            return;
        }

        setIsLoading(true);

        try {
            await signUp(email, password, name || 'Chef');
            // Move to verification step
            setStep('verify');
            setResendCooldown(60);
        } catch (err) {
            // User-friendly error messages for common Supabase errors
            const errorMessage = err.message?.toLowerCase() || '';
            if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
                setError('This email is already registered. Please sign in instead.');
            } else if (errorMessage.includes('invalid email')) {
                setError('Please enter a valid email address');
            } else if (errorMessage.includes('weak password')) {
                setError('Please use a stronger password');
            } else if (errorMessage.includes('rate limit')) {
                setError('Too many attempts. Please wait a moment and try again.');
            } else {
                setError(err.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setError('');

        const code = otpCode.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setIsLoading(true);

        try {
            await verifyOtp(email, code);
            // Verification successful, navigate to onboarding
            navigate('/onboarding');
        } catch (err) {
            setError(err.message || 'Invalid verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate email
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate password
        if (!password) {
            setError('Please enter your password');
            return;
        }

        setIsLoading(true);

        try {
            await signIn(email, password);
            navigate('/dashboard');
        } catch (err) {
            const errorMessage = err.message?.toLowerCase() || '';
            if (errorMessage.includes('invalid login') || errorMessage.includes('invalid credentials')) {
                setError('Invalid email or password. Please try again.');
            } else if (errorMessage.includes('email not confirmed')) {
                setError('Please verify your email before signing in.');
            } else if (errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
                setError('Too many attempts. Please wait a moment and try again.');
            } else if (errorMessage.includes('user not found')) {
                setError('No account found with this email. Please sign up first.');
            } else {
                setError(err.message || 'Unable to sign in. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getStepInfo = () => {
        if (isLogin) {
            return { number: '', label: 'Welcome Back', progress: 100 };
        }
        if (step === 'register') {
            return { number: '01', label: 'Create Account', progress: (1 / TOTAL_STEPS) * 100 };
        }
        if (step === 'verify') {
            return { number: '02', label: 'Verify Email', progress: (2 / TOTAL_STEPS) * 100 };
        }
        return { number: '', label: '', progress: 0 };
    };

    const stepInfo = getStepInfo();

    // Render login form
    if (isLogin) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-orange-500/30 overflow-hidden relative">
                <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none opacity-60"></div>

                <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 max-w-md mx-auto w-full">
                    <div className="w-full h-8 mb-4"></div>

                    <div className="w-full flex justify-between items-center mb-8">
                        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 hover:bg-white/10">
                            <ArrowLeft size={20} />
                        </button>
                        <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">Welcome Back</span>
                        <div className="w-10"></div>
                    </div>

                    <div className="w-full mb-8">
                        <span className="text-orange-500 text-xs font-medium uppercase tracking-wider mb-2 block">Sign In</span>
                        <h2 className="text-3xl text-white font-medium tracking-tight leading-tight">Welcome back to Your-Kitchen</h2>
                        <p className="text-zinc-500 text-sm mt-2">Sign in to continue your culinary journey</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="w-full flex-1 space-y-4 pb-24">
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50" />
                            </div>
                        </div>

                        {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>}

                        <div className="text-center pt-2">
                            <button type="button" onClick={() => { setIsLogin(false); setStep('register'); setError(''); }} className="text-zinc-400 text-sm hover:text-white transition-colors">
                                Don't have an account? Sign up
                            </button>
                        </div>
                    </form>

                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
                        <div className="max-w-md mx-auto w-full">
                            <button onClick={handleLoginSubmit} disabled={isLoading} className="w-full bg-white text-black py-4 rounded-full font-semibold text-sm tracking-wide hover:bg-zinc-200 flex items-center justify-center gap-2 group disabled:opacity-50">
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render verification step (magic link confirmation)
    if (step === 'verify') {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-orange-500/30 overflow-hidden relative">
                <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none opacity-60"></div>

                <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 max-w-md mx-auto w-full">
                    <div className="w-full h-8 mb-4"></div>

                    <div className="w-full flex justify-between items-center mb-8">
                        <button onClick={() => setStep('register')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 hover:bg-white/10">
                            <ArrowLeft size={20} />
                        </button>
                        <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">Step 2 of {TOTAL_STEPS}</span>
                        <div className="w-10"></div>
                    </div>

                    <div className="w-full h-1 bg-zinc-800 rounded-full mb-8 overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${stepInfo.progress}%` }}></div>
                    </div>

                    {/* Email Icon */}
                    <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                        <Mail size={32} className="text-orange-400" />
                    </div>

                    <div className="w-full mb-8 text-center">
                        <span className="text-orange-500 text-xs font-medium uppercase tracking-wider mb-2 block">02. Verify Your Email</span>
                        <h2 className="text-3xl text-white font-medium tracking-tight leading-tight">Check your inbox</h2>
                        <p className="text-zinc-500 text-sm mt-3">
                            We've sent a confirmation link to
                        </p>
                        <p className="text-white font-medium mt-1">{email}</p>
                    </div>

                    <div className="w-full space-y-6 pb-24">
                        {/* Instructions */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-orange-400 text-xs font-bold">1</span>
                                </div>
                                <p className="text-zinc-300 text-sm">Open the email from Your-Kitchen</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-orange-400 text-xs font-bold">2</span>
                                </div>
                                <p className="text-zinc-300 text-sm">Click the <span className="text-white font-medium">"Confirm your email"</span> link</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-orange-400 text-xs font-bold">3</span>
                                </div>
                                <p className="text-zinc-300 text-sm">You'll be automatically signed in and redirected</p>
                            </div>
                        </div>

                        {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>}

                        {/* Resend Email */}
                        <div className="text-center space-y-3">
                            <p className="text-zinc-500 text-sm">Didn't receive the email?</p>
                            <button
                                type="button"
                                onClick={handleResendEmail}
                                disabled={resendCooldown > 0}
                                className="text-orange-400 text-sm font-medium hover:text-orange-300 transition-colors disabled:text-zinc-600 flex items-center gap-2 mx-auto"
                            >
                                <RefreshCw size={14} className={resendCooldown > 0 ? '' : 'group-hover:rotate-180 transition-transform'} />
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
                            </button>
                        </div>

                        {/* Alternative: Go to login */}
                        <div className="text-center pt-4 border-t border-white/5">
                            <p className="text-zinc-500 text-sm mb-2">Already confirmed your email?</p>
                            <button
                                type="button"
                                onClick={() => { setIsLogin(true); setError(''); }}
                                className="text-white text-sm font-medium hover:text-orange-400 transition-colors"
                            >
                                Sign in to continue →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render registration form (step === 'register')
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-orange-500/30 overflow-hidden relative">
            <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none opacity-60"></div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 max-w-md mx-auto w-full">
                <div className="w-full h-8 mb-4"></div>

                <div className="w-full flex justify-between items-center mb-8">
                    <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 hover:bg-white/10">
                        <ArrowLeft size={20} />
                    </button>
                    <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">Step 1 of {TOTAL_STEPS}</span>
                    <div className="w-10"></div>
                </div>

                <div className="w-full h-1 bg-zinc-800 rounded-full mb-8 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${stepInfo.progress}%` }}></div>
                </div>

                <div className="w-full mb-8">
                    <span className="text-orange-500 text-xs font-medium uppercase tracking-wider mb-2 block">01. Let's Get Started</span>
                    <h2 className="text-3xl text-white font-medium tracking-tight leading-tight">Create your account</h2>
                    <p className="text-zinc-500 text-sm mt-2">Set up your profile to get personalized meal plans</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="w-full flex-1 space-y-4 pb-24 overflow-y-auto no-scrollbar">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-400 uppercase tracking-wider">Your Name</label>
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" required className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50" />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-400 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50" />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-400 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a secure password" required minLength={6} className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50" />
                        </div>

                        {password && (
                            <div className="space-y-3 mt-3 p-4 bg-zinc-900/30 border border-white/5 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${i <= passwordStrength.score ? strengthInfo.color : 'bg-zinc-700'}`} />
                                        ))}
                                    </div>
                                    <span className={`text-xs font-medium ${strengthInfo.textColor}`}>{strengthInfo.label}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'length', label: '8+ characters' },
                                        { key: 'uppercase', label: 'Uppercase' },
                                        { key: 'lowercase', label: 'Lowercase' },
                                        { key: 'number', label: 'Number' },
                                        { key: 'special', label: 'Special char' }
                                    ].map(({ key, label }) => (
                                        <div key={key} className="flex items-center gap-2">
                                            {passwordStrength.checks[key] ? <Check size={12} className="text-green-400" /> : <X size={12} className="text-zinc-600" />}
                                            <span className={`text-xs ${passwordStrength.checks[key] ? 'text-zinc-300' : 'text-zinc-600'}`}>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-400 uppercase tracking-wider">Confirm Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required className={`w-full bg-zinc-900/50 border rounded-2xl px-12 py-4 text-white placeholder-zinc-600 focus:outline-none transition-colors ${confirmPassword && confirmPassword !== password ? 'border-red-500/50' : confirmPassword && confirmPassword === password ? 'border-green-500/50' : 'border-white/10 focus:border-orange-500/50'}`} />
                            {confirmPassword && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {confirmPassword === password ? <Check size={18} className="text-green-400" /> : <X size={18} className="text-red-400" />}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>}

                    <div className="text-center pt-2">
                        <button type="button" onClick={() => { setIsLogin(true); setError(''); }} className="text-zinc-400 text-sm hover:text-white transition-colors">
                            Already have an account? Sign in
                        </button>
                    </div>
                </form>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
                    <div className="max-w-md mx-auto w-full">
                        <button onClick={handleRegisterSubmit} disabled={isLoading || passwordStrength.score < 3} className="w-full bg-white text-black py-4 rounded-full font-semibold text-sm tracking-wide hover:bg-zinc-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><span>Continue</span><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
