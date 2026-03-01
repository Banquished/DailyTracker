export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export type Food = {
  id: string;
  user_id: string;
  name: string;
  calories_per_100g: number;
  protein_g: number; // per 100g
  carbs_g: number; // per 100g
  fat_g: number; // per 100g
};

export type MealPlanEntry = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  meal_slot: MealSlot;
  food_id: string;
  grams: number;
  notes: string | null;
  food: Food;
};

export type FoodCreate = {
  name: string;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type MealPlanEntryCreate = {
  food_id: string;
  grams: number;
  notes?: string;
};

export type EntryMacros = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};
