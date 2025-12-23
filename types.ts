
export interface Question {
  id: number;
  text: string;
  placeholder?: string;
  options?: string[];
  helperText?: string;
  allowMultiple?: boolean;
  allowOther?: boolean;
}

export interface UserAnswer {
  questionId: number;
  answer: string;
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: number;
  answers: UserAnswer[];
  weeklyPlan?: WeeklyPlan;
  savedRecipes?: Recipe[];
}

export interface PlannedMeal {
  type: string; // e.g., 'Breakfast', 'Lunch', 'Dinner'
  name: string;
  timeEstimate: string;
  description: string;
  techniqueFocus: string;
  ingredients: string[];
  instructions: string[];
}

// AI Response Structures
export interface DailyPlan {
  day: string;
  meals: PlannedMeal[];
}

export interface GroceryItem {
  item: string;
  category: string;
  note?: string;
}

export interface PrepTask {
  task: string;
  time: string;
  why: string;
}

export interface WeeklyPlan {
  weekTitle: string;
  theme: string;
  dailyPlans: DailyPlan[];
  groceryList: GroceryItem[];
  sundayPrep: PrepTask[];
  sustainabilityTip: string;
}

export interface Recipe {
  id: string;
  name: string;
  timing: string;
  ingredients: string[];
  instructions: string[];
  chefTip: string;
  whyItWorks: string;
  source: 'ai' | 'web';
  imageUrl?: string;
  webUrl?: string; // For grounding
}

// Deprecate plain QuickMealResponse in favor of Recipe, but keep for compatibility if needed
export interface QuickMealResponse extends Omit<Recipe, 'id' | 'source'> {}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 for user uploads
  isThinking?: boolean;
  recipe?: Recipe; // If the model generated a recipe in this turn
  groundingUrls?: string[]; // If search was used
}

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  QUICK_MEAL = 'QUICK_MEAL',
  RECIPE_BOOK = 'RECIPE_BOOK',
  PROFILE_SELECT = 'PROFILE_SELECT'
}
