export type DashboardTodoOccurrence = {
  id: string;
  todo_id: string;
  title: string;
  completed: boolean;
  missed: boolean;
};

export type DashboardHabit = {
  id: string;
  name: string;
  color: string;
  logged_today: boolean;
  streak: number;
};

export type DashboardWeight = {
  latest_kg: number | null;
  previous_kg: number | null;
  delta_kg: number | null;
};

export type DashboardMacros = {
  goal_calories: number;
  goal_protein_g: number;
  goal_carbs_g: number;
  goal_fat_g: number;
  actual_calories: number;
  actual_protein_g: number;
  actual_carbs_g: number;
  actual_fat_g: number;
};

export type DashboardData = {
  date: string;
  todos: DashboardTodoOccurrence[];
  habits: DashboardHabit[];
  weight: DashboardWeight;
  macros: DashboardMacros;
  todo_count: number;
  todo_completed_count: number;
  habit_count: number;
  habit_logged_count: number;
};
