import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants.js";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Schemas
const weeklyPlanSchema = {
    type: Type.OBJECT,
    properties: {
        weekTitle: { type: Type.STRING, description: "A catchy title for the week's menu" },
        theme: { type: Type.STRING, description: "The culinary theme or focus of the week" },
        dailyPlans: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING },
                    meals: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, description: "Breakfast, Lunch, or Dinner" },
                                name: { type: Type.STRING },
                                timeEstimate: { type: Type.STRING },
                                description: { type: Type.STRING },
                                techniqueFocus: { type: Type.STRING, description: "The specific culinary skill taught in this recipe" },
                                ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Complete list of ingredients with quantities" },
                                instructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step cooking instructions (keep concise)" }
                            },
                            required: ["type", "name", "timeEstimate", "description", "techniqueFocus", "ingredients", "instructions"]
                        }
                    }
                },
                required: ["day", "meals"]
            }
        },
        groceryList: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    item: { type: Type.STRING },
                    category: { type: Type.STRING, description: "Produce, Protein, Pantry, etc." },
                    note: { type: Type.STRING, description: "Specifics like 'family pack' or substitutions" }
                },
                required: ["item", "category"]
            }
        },
        sundayPrep: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    task: { type: Type.STRING },
                    time: { type: Type.STRING },
                    why: { type: Type.STRING }
                },
                required: ["task", "time", "why"]
            }
        },
        sustainabilityTip: { type: Type.STRING }
    },
    required: ["weekTitle", "theme", "dailyPlans", "groceryList", "sundayPrep", "sustainabilityTip"]
};

// Use loose schema for chat to allow conversation + recipe
const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipe: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                timing: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                chefTip: { type: Type.STRING },
                whyItWorks: { type: Type.STRING }
            },
            required: ["name", "timing", "ingredients", "instructions", "chefTip", "whyItWorks"]
        }
    }
};

export const generateWeeklyPlan = async (answers) => {
    const model = "gemini-3-flash-preview";

    const userProfileSummary = answers.map(a => `Q${a.questionId}: ${a.answer}`).join("\n");

    const prompt = `
    ACT AS A SENIOR EXECUTIVE CHEF.
    
    Task: Design a bespoke 7-day meal plan for the following client.
    
    Client Profile & Constraints:
    ${userProfileSummary}

    STRICT CHEF'S REQUIREMENTS (Must pass "Chef's Audit"):
    1. **Safety Check**: Verify every ingredient against the client's allergies and dislikes. Zero tolerance for errors.
    2. **Meal Selection**: Pay close attention to "Which meals do you need planned?". ONLY generate the requested meals (e.g. if they only selected Dinner, only generate Dinner). If they selected multiple, generate all of them for each day.
    3. **Skill Matching**: If the client is a beginner, use fail-proof techniques.
    4. **Efficiency**: The Sunday prep must genuinely cut 50% of weeknight cooking time.
    5. **Instructions**: You MUST provide concise but complete step-by-step instructions for every meal generated.
    6. **Nutrition Logic**: Prioritize whole foods.
    
    Output Format: JSON only, strictly adhering to the schema.
  `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: weeklyPlanSchema
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("No response content");
    } catch (error) {
        console.error("Error generating weekly plan:", error);
        throw error;
    }
};

// --- NEW ADVANCED FEATURES ---

/**
 * Chat with Chef using Thinking Mode (Gemini 3 Pro) or Search Grounding (Flash)
 */
export const chatWithChef = async (
    history,
    newMessage,
    image,
    mode,
    userProfile
) => {

    const context = userProfile ? userProfile.answers.map(a => `User Constraint Q${a.questionId}: ${a.answer}`).join("\n") : "";

    const chatHistory = history.map(h => ({
        role: h.role,
        parts: h.image ? [{ text: h.text }, { inlineData: { mimeType: 'image/jpeg', data: h.image } }] : [{ text: h.text }]
    }));

    const currentParts = [{ text: newMessage }];
    if (image) {
        currentParts.push({ inlineData: { mimeType: 'image/jpeg', data: image } });
    }

    // CONFIGURATION 1: Deep Thinking (Chef Brain)
    // Uses gemini-3-pro-preview with high thinking budget
    if (mode === 'chef_brain') {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [
                    ...chatHistory,
                    { role: 'user', parts: [{ text: `User Profile Context:\n${context}` }] },
                    { role: 'user', parts: currentParts }
                ],
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION + `
            You are in CHAT MODE. 
            1. ASK CLARIFYING QUESTIONS if the user's request is vague.
            2. IF the user is asking to SWAP a meal from their plan, suggests a good alternative that fits the theme and provides the recipe.
            3. ANALYZE IMAGES deepy if provided.
            4. IF you have gathered enough info and are ready to present a FINAL RECIPE, format your response to include a JSON block with the recipe details at the end, using the schema: { "recipe": { ... } }.
            5. If you are just chatting, do not output JSON.
          `,
                    thinkingConfig: { thinkingBudget: 32768 },
                }
            });

            const text = response.text || "";
            let recipe;

            // naive parsing for JSON block if model decides to output it
            const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/) || text.match(/(\{[\s\S]*"recipe"[\s\S]*\})/);

            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[1]);
                    if (parsed.recipe) {
                        recipe = { ...parsed.recipe, id: crypto.randomUUID(), source: 'ai' };
                    }
                } catch (e) {
                    console.log("Could not parse recipe JSON from chat");
                }
            }

            return { text: text.replace(/```json[\s\S]*```/, '').trim(), recipe };
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    // CONFIGURATION 2: Web Search (Gemini Flash)
    // Uses gemini-3-flash-preview with googleSearch
    if (mode === 'web_search') {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [
                    ...chatHistory,
                    { role: 'user', parts: [{ text: `User Profile Context:\n${context}` }] },
                    { role: 'user', parts: currentParts }
                ],
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION + " You are finding recipes from the WEB. Use Google Search to find authentic, top-rated recipes. If you find a recipe, summarize it clearly.",
                    tools: [{ googleSearch: {} }]
                }
            });

            const text = response.text || "";
            const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
                ?.map((c) => c.web?.uri)
                .filter((u) => !!u) || [];

            return { text, groundingUrls };
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    return { text: "Error: Invalid mode" };
};

/**
 * Generate Recipe Image using Gemini 3 Pro Image Preview (Nano Banana Pro)
 */
export const generateMealImage = async (recipeDescription, size) => {
    const model = "gemini-3-pro-image-preview";

    const prompt = `Professional food photography, michelin star plating, studio lighting, 8k resolution. Dish: ${recipeDescription}`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    imageSize: size,
                    aspectRatio: "4:3"
                }
            }
        });

        // Extract image
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image generated");
    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
};

/**
 * Explicit Recipe Generation (for converting chat to card)
 * Uses Thinking mode to structure the final output
 */
export const generateFinalRecipeCard = async (chatContext) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Based on this conversation, generate a final JSON recipe card:\n${chatContext}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
            thinkingConfig: { thinkingBudget: 2048 } // Smaller budget just for formatting
        }
    });

    if (response.text) {
        const parsed = JSON.parse(response.text);
        return { ...parsed.recipe, id: crypto.randomUUID(), source: 'ai' };
    }
    throw new Error("Failed to generate recipe card");
};
