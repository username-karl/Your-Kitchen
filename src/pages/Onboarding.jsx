import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, XCircle } from 'lucide-react';
import { ONBOARDING_QUESTIONS } from '../constants';
import { generateWeeklyPlan } from '../services/geminiService';

const Onboarding = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const question = ONBOARDING_QUESTIONS[currentStep];
    const isLastStep = currentStep === ONBOARDING_QUESTIONS.length - 1;

    // Total steps = 2 (registration + verification) + onboarding questions
    const TOTAL_STEPS = 2 + ONBOARDING_QUESTIONS.length;
    const currentTotalStep = currentStep + 3; // +3 because step 1=register, 2=verify
    const progress = (currentTotalStep / TOTAL_STEPS) * 100;

    const handleOptionSelect = (option) => {
        if (question.allowMultiple) {
            const current = answers[question.id] || [];
            const updated = current.includes(option)
                ? current.filter(item => item !== option)
                : [...current, option];
            setAnswers({ ...answers, [question.id]: updated });
        } else {
            setAnswers({ ...answers, [question.id]: option });
        }
        setError('');
    };

    const handleInput = (value) => {
        setAnswers({ ...answers, [question.id]: value });
        setError('');
    };

    const handleNext = async () => {
        // Validate that user has answered the current question
        const currentAnswer = answers[question.id];

        if (question.options) {
            // For option-based questions
            if (question.allowMultiple) {
                if (!currentAnswer || currentAnswer.length === 0) {
                    setError('Please select at least one option to continue');
                    return;
                }
            } else {
                if (!currentAnswer) {
                    setError('Please select an option to continue');
                    return;
                }
            }
        } else {
            // For text input questions
            if (!currentAnswer || !currentAnswer.trim()) {
                setError('Please enter your answer to continue');
                return;
            }
        }

        setError('');

        if (isLastStep) {
            setIsGenerating(true);
            try {
                const formattedAnswers = Object.entries(answers).map(([id, answer]) => ({
                    questionId: id,
                    answer: Array.isArray(answer) ? answer.join(', ') : answer
                }));

                // Generate the weekly plan
                const plan = await generateWeeklyPlan(formattedAnswers);

                // Create the profile object with all required fields
                const newProfile = {
                    id: crypto.randomUUID(),
                    name: 'Chef',
                    createdAt: Date.now(),
                    answers: formattedAnswers,
                    weeklyPlan: plan,
                    savedRecipes: []
                };

                // Pass the profile to the parent - App.jsx will handle saving
                onComplete(newProfile);
            } catch (err) {
                console.error(err);
                const errorMessage = err.message?.toLowerCase() || '';
                if (errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
                    setError('Unable to generate meal plan. Please try again later.');
                } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                    setError('Network error. Please check your internet connection and try again.');
                } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
                    setError('Service is busy. Please wait a moment and try again.');
                } else {
                    setError('Something went wrong generating your plan. Please try again.');
                }
            } finally {
                setIsGenerating(false);
            }
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 h-full w-full max-w-md mx-auto relative">
            {/* Dynamic Status Bar/Top Spacer for phone feel */}
            <div className="w-full h-8 mb-4"></div>

            {/* Navigation Header */}
            <div className="w-full flex justify-between items-center mb-8">
                <button
                    onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
                    className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 transition-opacity ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <ArrowLeft size={20} />
                </button>
                <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                    Step {currentTotalStep} of {TOTAL_STEPS}
                </span>
                <div className="w-10"></div>{/* Spacer for centering */}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-zinc-800 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Question Content */}
            <div className="w-full mb-8">
                <span className="text-orange-500 text-xs font-medium uppercase tracking-wider mb-2 block">
                    {currentTotalStep < 10 ? `0${currentTotalStep}` : currentTotalStep}. Your Preferences
                </span>
                <h2 className="text-3xl text-white font-medium tracking-tight leading-tight">
                    {question.text}
                </h2>
                {question.helperText && <p className="text-zinc-500 text-sm mt-2">{question.helperText}</p>}
            </div>

            {/* Selection Grid / Input Area */}
            <div className="w-full flex-1 overflow-y-auto no-scrollbar pb-20">
                {question.options ? (
                    <div className="flex flex-wrap gap-3 mb-10">
                        {question.options.map((option) => {
                            const isSelected = question.allowMultiple
                                ? (answers[question.id] || []).includes(option)
                                : answers[question.id] === option;

                            return (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect(option)}
                                    className={`
                                        px-5 py-3 rounded-full border text-sm font-medium flex items-center gap-2 transition-all
                                        ${isSelected
                                            ? 'border-orange-500/50 bg-orange-500/10 text-orange-200 shadow-[0_0_15px_-5px_rgba(249,115,22,0.3)]'
                                            : 'border-white/10 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}
                                    `}
                                >
                                    {option}
                                    {isSelected && <Check size={14} />}
                                </button>
                            );
                        })}
                        {question.allowOther && (
                            <button className="px-5 py-3 rounded-full border border-dashed border-zinc-700 text-zinc-500 text-sm font-medium hover:border-zinc-500 transition-colors">
                                + Custom
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="mb-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={answers[question.id] || ''}
                                onChange={(e) => handleInput(e.target.value)}
                                placeholder={question.placeholder || "Type here..."}
                                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 text-sm"
                            />
                            {answers[question.id] && (
                                <XCircle
                                    size={18}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 cursor-pointer hover:text-white"
                                    onClick={() => handleInput('')}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="fixed bottom-24 left-0 right-0 px-6 z-40">
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-300">
                            {error}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
                <div className="max-w-md mx-auto w-full">
                    <button
                        onClick={handleNext}
                        disabled={isGenerating}
                        className="w-full bg-white text-black py-4 rounded-full font-semibold text-sm tracking-wide hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {isGenerating ? 'Building Plan...' : isLastStep ? 'Create My Plan' : 'Next Step'}
                        {!isGenerating && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
