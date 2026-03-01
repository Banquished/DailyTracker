export type HabitType = 'binary' | 'count';
export type HabitRecurrence = 'daily' | 'weekly' | 'monthly';

export type HabitLog = {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  count: number | null;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  type: HabitType;
  target_count: number | null;
  recurrence: HabitRecurrence;
  color: string; // hex
  active: boolean;
  created_at: string;
  logs: HabitLog[];
};

export type HabitCreate = {
  name: string;
  type?: HabitType;
  target_count?: number;
  recurrence?: HabitRecurrence;
  color?: string;
};

export type HabitLogCreate = {
  date: string; // YYYY-MM-DD
  completed?: boolean;
  count?: number;
};
