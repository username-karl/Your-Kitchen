import { Question } from './types';

export const SYSTEM_INSTRUCTION = `
You are ChefAI, a world-class Executive Chef and Culinary Mentor with a specialization in functional nutrition and home-cooking logistics.

YOUR CORE MANDATE:
1. **The Chef's Audit**: Before finalizing ANY menu, you must perform a rigorous internal check:
   - **Safety First**: strict adherence to allergies and dislikes.
   - **Feasibility**: Does the timing match the user's "Weeknight reality"?
   - **Budget Logic**: Do ingredients cross-utilize to minimize waste and cost?
2. **Teach, Don't just Tell**: Every recipe is a lesson. Explain the "Why" behind the "What" (e.g., "Salting water creates an osmotic balance," not just "add salt").
3. **Gut-Healing & Performance**: Prioritize whole, unprocessed foods that fuel the body, unless specifically requested otherwise.
4. **Tone**: Encouraging, authoritative, and precise. Like a favorite mentor standing next to them in the kitchen.

Structure:
- Every tip includes a skill-booster or shortcut.
- Focus on the user's constraints (time, budget, equipment).
`;

export const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Rate your cooking confidence",
    options: [
      "Beginner finding my way",
      "Comfortable with basics",
      "Ready for pro moves"
    ]
  },
  {
    id: 2,
    text: "How many people are you cooking for?",
    helperText: "Include any kids under 12.",
    placeholder: "e.g., 2 adults, 1 toddler"
  },
  {
    id: 3,
    text: "What are your main goals right now?",
    helperText: "Select all that apply.",
    allowMultiple: true,
    options: [
      "Heal my gut",
      "Build muscle",
      "Manage weight",
      "Boost daily energy",
      "Just survive the week"
    ]
  },
  {
    id: 4,
    text: "Which meals do you need planned?",
    helperText: "Select all that apply. I'll focus the weekly plan on these.",
    allowMultiple: true,
    options: [
      "Breakfast",
      "Lunch",
      "Dinner"
    ]
  },
  {
    id: 5,
    text: "Any allergies, restrictions, or foods you just can't stand?",
    placeholder: "e.g., No cilantro, dairy-free, allergic to shellfish..."
  },
  {
    id: 6,
    text: "What cuisines do you want to focus on?",
    helperText: "Select all that apply or add your own.",
    allowMultiple: true,
    allowOther: true,
    options: [
      "Filipino",
      "Mediterranean",
      "Italian",
      "Japanese",
      "Mexican",
      "Korean",
      "American",
      "Indian",
      "No preference"
    ]
  },
  {
    id: 7,
    text: "Where will you shop?",
    options: [
      "Local supermarket",
      "Palengke / Farmers Market",
      "Mix of both"
    ],
    helperText: "This changes my ingredient picks completely."
  },
  {
    id: 8,
    text: "Your weekly food budget",
    options: [
      "50 (Survival)",
      "100 (Solid)",
      "200+ (Premium)"
    ]
  },
  {
    id: 9,
    text: "How much time do you have for Sunday prep?",
    options: [
      "1–2h quick session",
      "2–4h deep prep",
      "4h+ marathon"
    ]
  },
  {
    id: 10,
    text: "What's your weeknight cooking reality?",
    options: [
      "15-minute scrambles",
      "30-minute meals",
      "45+ to unwind"
    ]
  },
  {
    id: 11,
    text: "Describe your kitchen setup",
    options: [
      "Basic tools only",
      "Well-stocked home kitchen",
      "Pro equipment"
    ]
  },
  {
    id: 12,
    text: "How is your fridge/storage space?",
    options: [
      "Cramped",
      "Decent",
      "Spacious"
    ]
  },
  {
    id: 13,
    text: "What are your top priorities?",
    helperText: "Select all that apply.",
    allowMultiple: true,
    options: [
      "Fastest meals",
      "Most flavor",
      "Least waste",
      "Learning new skills"
    ]
  },
  {
    id: 14,
    text: "What are your main kitchen frustrations?",
    helperText: "Select all that apply or add your own.",
    allowMultiple: true,
    allowOther: true,
    options: [
      "Chopping & Prep work",
      "Timing everything",
      "Cleaning up",
      "Lack of inspiration",
      "Recipes fail often",
      "Ingredient spoilage"
    ]
  }
];