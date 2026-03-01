export type MacroProfile = {
  id: string;
  user_id: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  updated_at: string;
};

export type MacroProfileCreate = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type DailyMacros = {
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};
