import React, { useState, useRef, useEffect } from 'react';
import { chatWithChef, generateMealImage } from '../services/geminiService.js';
import { Search, Clock, ChefHat, Sparkles, ArrowRight, Flame, Send, Image as ImageIcon, Globe, BrainCircuit, Download, Save, Loader2, Camera } from 'lucide-react';

const QuickMeal = ({ profile, onSaveRecipe, initialInput, onClearInitialInput }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState(initialInput || "");
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('chef_brain');
    const [attachedImage, setAttachedImage] = useState(null);

    // Image Generation State
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageSize, setImageSize] = useState('1K');

    // Final Recipe State
    const [currentRecipe, setCurrentRecipe] = useState(null);

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (initialInput) {
            setInput(initialInput);
            if (onClearInitialInput) onClearInitialInput();
        }
    }, [initialInput, onClearInitialInput]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, currentRecipe]);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !attachedImage) || isLoading) return;

        const userMsg = {
            id: crypto.randomUUID(),
            role: 'user',
            text: input,
            image: attachedImage || undefined
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setAttachedImage(null);
        setIsLoading(true);

        try {
            const response = await chatWithChef(messages, userMsg.text, userMsg.image || null, mode, profile);

            const botMsg = {
                id: crypto.randomUUID(),
                role: 'model',
                text: response.text,
                recipe: response.recipe,
                groundingUrls: response.groundingUrls,
                isThinking: mode === 'chef_brain' // Just visual indicator that deep thought happened
            };

            setMessages(prev => [...prev, botMsg]);

            if (response.recipe) {
                setCurrentRecipe(response.recipe);
            }
        } catch (error) {
            console.error(error);
            const errorMsg = {
                id: crypto.randomUUID(),
                role: 'model',
                text: "I encountered a problem in the kitchen. Could you repeat that?"
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!currentRecipe) return;
        setIsGeneratingImage(true);
        try {
            const ingredients = (currentRecipe.ingredients || []).join(", ");
            const imgData = await generateMealImage(currentRecipe.name + " " + ingredients, imageSize);
            setCurrentRecipe(prev => prev ? ({ ...prev, imageUrl: imgData }) : null);
        } catch (e) {
            alert("Failed to capture photo of the dish.");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleSave = () => {
        if (currentRecipe) {
            onSaveRecipe(currentRecipe);
            alert("Recipe saved to your cookbook!");
        }
    };

    const handleForceRecipeGeneration = async () => {
        // Identify context from chat
        const context = messages.map(m => `${m.role}: ${m.text}`).join("\n");
        setIsLoading(true);
        try {
            const recipe = await generateFinalRecipeCard(context);
            setCurrentRecipe(recipe);
            // Add a system message
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'model',
                text: "I've organized our conversation into a final recipe card for you.",
                recipe: recipe
            }]);
        } catch (e) {
            alert("Couldn't organize a recipe just yet. Let's chat more details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col pb-2">

            {/* Header / Mode Switcher */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 px-2">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-chef-950 flex items-center gap-2">
                        Chef Bot
                        {mode === 'chef_brain' && <BrainCircuit size={18} className="text-purple-500" />}
                        {mode === 'web_search' && <Globe size={18} className="text-blue-500" />}
                    </h1>
                    <p className="text-xs text-stone-500">
                        {mode === 'chef_brain' ? 'Thinking Mode (Gemini 3 Pro)' : 'Web Mode (Search Grounding)'}
                    </p>
                </div>

                <div className="bg-white p-1 rounded-full border border-stone-200 shadow-sm flex">
                    <button
                        onClick={() => setMode('chef_brain')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === 'chef_brain' ? 'bg-chef-900 text-white shadow' : 'text-stone-500 hover:bg-stone-100'}`}
                    >
                        <BrainCircuit size={16} /> Chef's Brain
                    </button>
                    <button
                        onClick={() => setMode('web_search')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === 'web_search' ? 'bg-blue-600 text-white shadow' : 'text-stone-500 hover:bg-stone-100'}`}
                    >
                        <Globe size={16} /> Web Search
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-white/50 rounded-3xl border border-stone-100 p-4 md:p-6 mb-4 shadow-inner space-y-6 scroll-smooth">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                            <ChefHat size={48} className="text-chef-300" />
                        </div>
                        <p className="text-lg font-serif text-stone-600">What are we cooking today?</p>
                        <p className="text-sm text-stone-400 max-w-xs mt-2">Upload a photo of your fridge, ask for a specific technique, or let me design a meal.</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] md:max-w-[75%] rounded-2xl p-4 md:p-5 shadow-sm ${msg.role === 'user' ? 'bg-chef-900 text-white rounded-br-sm' : 'bg-white border border-stone-100 text-stone-800 rounded-bl-sm'}`}>
                            {msg.image && (
                                <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                                    <img src={msg.image} alt="User upload" className="max-h-60 w-full object-cover" />
                                </div>
                            )}

                            {msg.isThinking && (
                                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 mb-2 uppercase tracking-wider">
                                    <BrainCircuit size={12} /> Thought deeply
                                </div>
                            )}

                            <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                            {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-stone-100">
                                    <p className="text-xs font-bold text-stone-400 mb-1">Sources:</p>
                                    <ul className="text-xs text-blue-600 truncate">
                                        {msg.groundingUrls.slice(0, 3).map((url, i) => (
                                            <li key={i}><a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1"><Globe size={10} /> {new URL(url).hostname}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-3">
                            <Loader2 size={18} className="animate-spin text-chef-500" />
                            <span className="text-stone-500 text-sm font-medium">
                                {mode === 'chef_brain' ? 'Thinking through flavors...' : 'Searching the culinary world...'}
                            </span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Recipe Card Overlay/Area (If recipe generated) */}
            {currentRecipe && (
                <div className="bg-white rounded-3xl border border-stone-200 shadow-card p-4 md:p-6 mb-4 animate-fade-in relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-chef-950">{currentRecipe.name}</h2>
                            <p className="text-sm text-stone-500 flex items-center gap-1 mt-1"><Clock size={14} /> {currentRecipe.timing}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="p-2 hover:bg-chef-50 rounded-full text-chef-700 transition-colors" title="Save to Cookbook">
                                <Save size={20} />
                            </button>
                            <button onClick={() => setCurrentRecipe(null)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
                                x
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {currentRecipe.imageUrl ? (
                                <div className="rounded-xl overflow-hidden shadow-sm relative group">
                                    <img src={currentRecipe.imageUrl} alt={currentRecipe.name} className="w-full h-48 object-cover" />
                                    <a href={currentRecipe.imageUrl} download={`chefai-${currentRecipe.name}.png`} className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Download size={16} />
                                    </a>
                                </div>
                            ) : (
                                <div className="bg-stone-50 rounded-xl p-4 flex flex-col items-center justify-center h-48 border border-stone-100 border-dashed">
                                    {isGeneratingImage ? (
                                        <div className="text-center">
                                            <Loader2 className="animate-spin text-chef-600 mb-2 mx-auto" />
                                            <p className="text-xs font-bold text-chef-700">Developing photo...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Camera className="text-stone-300 mb-2" size={32} />
                                            <div className="flex items-center gap-2 mb-2">
                                                <select
                                                    value={imageSize}
                                                    onChange={(e) => setImageSize(e.target.value)}
                                                    className="text-xs border border-stone-200 rounded-lg p-1 bg-white"
                                                >
                                                    <option value="1K">1K</option>
                                                    <option value="2K">2K</option>
                                                    <option value="4K">4K</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={handleGenerateImage}
                                                className="text-xs bg-chef-100 text-chef-800 px-3 py-2 rounded-lg font-bold hover:bg-chef-200 transition-colors"
                                            >
                                                Generate Photo
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="bg-spice-50 p-4 rounded-xl border border-spice-100">
                                <h4 className="font-bold text-spice-800 text-sm mb-1">Why it works</h4>
                                <p className="text-spice-900 text-sm italic">{currentRecipe.whyItWorks}</p>
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            <h4 className="font-bold text-stone-900 mb-2 text-sm uppercase tracking-wide">Instructions</h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-stone-700">
                                {(currentRecipe.instructions || []).map((step, i) => (
                                    <li key={i} className="leading-relaxed pl-1">{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-white p-2 rounded-3xl border border-stone-200 shadow-lg flex items-end gap-2 relative z-20">
                <div className="flex-1 bg-stone-50 rounded-2xl flex flex-col transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-chef-100">
                    {attachedImage && (
                        <div className="p-2 pb-0">
                            <div className="relative inline-block">
                                <img src={attachedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-stone-200" />
                                <button onClick={() => setAttachedImage(null)} className="absolute -top-1 -right-1 bg-stone-800 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">x</button>
                            </div>
                        </div>
                    )}
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={messages.length > 0 ? "Ask a follow up..." : "Describe a meal, upload a fridge photo, or ask for a technique..."}
                        className="w-full bg-transparent border-none focus:ring-0 p-3 md:p-4 text-base resize-none max-h-32 min-h-[50px]"
                        rows={1}
                    />
                </div>

                <div className="flex flex-col gap-2 pb-1">
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-stone-400 hover:bg-stone-100 rounded-xl transition-colors"
                        title="Upload Image"
                    >
                        <ImageIcon size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-2 pb-1 pr-1">
                    <button
                        onClick={handleSend}
                        disabled={isLoading || (!input && !attachedImage)}
                        className="bg-chef-900 text-white p-3 rounded-xl hover:bg-chef-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            {/* Force Generate Button (if model chats too much) */}
            {!currentRecipe && messages.length > 2 && (
                <div className="text-center mt-2">
                    <button onClick={handleForceRecipeGeneration} className="text-xs font-bold text-stone-400 hover:text-chef-600 underline">
                        Convert conversation to Recipe Card
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuickMeal;
