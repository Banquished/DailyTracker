export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export type TodoOccurrence = {
  id: string;
  todo_id: string;
  due_date: string; // YYYY-MM-DD
  completed_at: string | null;
  missed: boolean;
};

export type Todo = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  recurrence: RecurrenceType;
  rollover: boolean;
  active: boolean;
  created_at: string;
  occurrences: TodoOccurrence[];
};

export type TodoCreate = {
  title: string;
  description?: string;
  recurrence?: RecurrenceType;
  rollover?: boolean;
};
