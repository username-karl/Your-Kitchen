import React, { useState } from 'react';
import { ONBOARDING_QUESTIONS } from '../constants';
import { UserAnswer, UserProfile } from '../types';
import { ChevronRight, ChevronLeft, Check, ChefHat, Sparkles } from 'lucide-react';
import { generateWeeklyPlan } from '../services/geminiService';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [otherValue, setOtherValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const currentQuestion = ONBOARDING_QUESTIONS[currentStep];
  const isLastQuestion = currentStep === ONBOARDING_QUESTIONS.length - 1;

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers.filter(a => a.questionId !== currentQuestion.id), { questionId: currentQuestion.id, answer }];
    setAnswers(newAnswers);
    setInputValue("");
    setMultiSelections([]);
    setOtherValue("");
    
    if (isLastQuestion) {
      finishOnboarding(newAnswers);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const toggleSelection = (option: string) => {
    setMultiSelections(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      }
      return [...prev, option];
    });
  };

  const handleMultiSubmit = () => {
    let finalAnswer = multiSelections.join(", ");
    
    if (otherValue.trim()) {
      if (finalAnswer.length > 0) {
        finalAnswer += `, ${otherValue.trim()}`;
      } else {
        finalAnswer = otherValue.trim();
      }
    }
    
    if (!finalAnswer) return;
    handleAnswer(finalAnswer);
  };

  const finishOnboarding = async (finalAnswers: UserAnswer[]) => {
    setIsGenerating(true);
    try {
      const plan = await generateWeeklyPlan(finalAnswers);
      const newProfile: UserProfile = {
        id: crypto.randomUUID(),
        name: "My Kitchen",
        createdAt: Date.now(),
        answers: finalAnswers,
        weeklyPlan: plan
      };
      onComplete(newProfile);
    } catch (error) {
      alert("Failed to generate plan. Please try again.");
      console.error(error);
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      const prevQuestion = ONBOARDING_QUESTIONS[prevIndex];
      const prevAnswer = answers.find(a => a.questionId === prevQuestion.id);
      
      if (prevAnswer) {
        if (prevQuestion.options && prevQuestion.allowMultiple) {
             const parts = prevAnswer.answer.split(', ');
             const knownOptions = prevQuestion.options || [];
             
             // Restore selected predefined options
             setMultiSelections(parts.filter(p => knownOptions.includes(p)));
             
             // Restore "Other" value
             if (prevQuestion.allowOther) {
                const customParts = parts.filter(p => !knownOptions.includes(p));
                setOtherValue(customParts.join(', '));
             } else {
                setOtherValue("");
             }
        } else if (!prevQuestion.options) {
             setInputValue(prevAnswer.answer);
        }
      }
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 space-y-8 animate-fade-in">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 md:h-24 md:w-24 border-b-2 border-chef-700"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ChefHat className="text-chef-700" size={32} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-chef-950 mb-3">Crafting Your Menu</h2>
          <p className="text-stone-500 text-base md:text-lg max-w-md mx-auto">
            I'm analyzing your goals, checking my technique database, and organizing your grocery list.
          </p>
        </div>
      </div>
    );
  }

  const isMulti = currentQuestion.allowMultiple;

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-6 md:mb-10 flex items-center gap-4 px-2">
        <span className="text-sm font-bold text-chef-700 font-mono">0{currentStep + 1}</span>
        <div className="h-1.5 flex-1 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-chef-700 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentStep + 1) / ONBOARDING_QUESTIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-stone-400 font-mono">{ONBOARDING_QUESTIONS.length}</span>
      </div>

      <div className="bg-white rounded-3xl shadow-soft p-6 md:p-10 border border-stone-100 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 p-6 opacity-5">
           <ChefHat size={80} className="md:w-[120px] md:h-[120px]" />
        </div>

        <h2 className="text-2xl md:text-3xl font-serif font-bold text-chef-950 mb-3 relative z-10 leading-tight">{currentQuestion.text}</h2>
        {currentQuestion.helperText && (
          <p className="text-stone-500 mb-6 md:mb-8 text-base md:text-lg relative z-10">{currentQuestion.helperText}</p>
        )}

        <div className="space-y-3 md:space-y-4 mt-6 md:mt-8 relative z-10">
          {currentQuestion.options ? (
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = isMulti ? multiSelections.includes(option) : false;
                  return (
                    <button
                      key={option}
                      onClick={() => isMulti ? toggleSelection(option) : handleAnswer(option)}
                      className={`w-full text-left p-4 md:p-6 rounded-2xl border-2 transition-all flex items-center justify-between group duration-200 ${
                        isSelected 
                          ? 'border-chef-600 bg-chef-50' 
                          : 'border-stone-100 hover:border-chef-600 hover:bg-chef-50'
                      }`}
                    >
                      <span className={`font-medium text-base md:text-lg ${isSelected ? 'text-chef-900' : 'text-stone-700 group-hover:text-chef-900'}`}>{option}</span>
                      
                      {isMulti ? (
                        <div className={`h-6 w-6 md:h-8 md:w-8 rounded-lg border flex items-center justify-center transition-colors shrink-0 ml-2 ${
                          isSelected 
                            ? 'bg-chef-600 border-chef-600' 
                            : 'bg-white border-stone-200 group-hover:border-chef-500'
                        }`}>
                          {isSelected && <Check className="text-white" size={16} />}
                        </div>
                      ) : (
                        <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-white border border-stone-200 flex items-center justify-center group-hover:border-chef-500 group-hover:bg-chef-500 transition-colors shrink-0 ml-2">
                           <ChevronRight className="text-stone-300 group-hover:text-white" size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {currentQuestion.allowOther && (
                <input
                  type="text"
                  value={otherValue}
                  onChange={(e) => setOtherValue(e.target.value)}
                  placeholder="Other (type here...)"
                  className="w-full p-4 md:p-6 text-base md:text-lg border-2 border-stone-200 rounded-2xl focus:border-chef-700 focus:ring-4 focus:ring-chef-50 focus:outline-none transition-all placeholder:text-stone-300 mt-2"
                />
              )}
              
              {isMulti && (
                <button
                  onClick={handleMultiSubmit}
                  disabled={multiSelections.length === 0 && !otherValue.trim()}
                  className="self-end mt-4 bg-chef-900 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl hover:bg-chef-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>Continue</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && inputValue && handleAnswer(inputValue)}
                placeholder={currentQuestion.placeholder}
                className="w-full p-4 md:p-6 text-base md:text-lg border-2 border-stone-200 rounded-2xl focus:border-chef-700 focus:ring-4 focus:ring-chef-50 focus:outline-none transition-all placeholder:text-stone-300"
                autoFocus
              />
              <button
                onClick={() => handleAnswer(inputValue)}
                disabled={!inputValue}
                className="self-end bg-chef-900 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl hover:bg-chef-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 md:mt-12 flex justify-start">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center text-stone-400 hover:text-stone-600 disabled:opacity-0 transition-opacity text-sm font-medium uppercase tracking-wide"
          >
            <ChevronLeft size={16} />
            <span className="ml-1">Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;