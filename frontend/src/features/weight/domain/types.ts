export type WeightEntry = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  weight_kg: number;
};

export type WeightEntryCreate = {
  date: string;
  weight_kg: number;
};
