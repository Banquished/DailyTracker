import type { Todo, TodoOccurrence } from './types';

/**
 * Given a list of todos (with occurrences), group the occurrences by due_date.
 * Returns a Map<string, Array<{ todo: Todo; occurrence: TodoOccurrence }>>
 * where key is "YYYY-MM-DD".
 */
export function groupOccurrencesByDate(
  todos: Todo[],
): Map<string, Array<{ todo: Todo; occurrence: TodoOccurrence }>> {
  const map = new Map<string, Array<{ todo: Todo; occurrence: TodoOccurrence }>>();

  for (const todo of todos) {
    for (const occurrence of todo.occurrences) {
      const key = occurrence.due_date;
      const existing = map.get(key);
      if (existing !== undefined) {
        existing.push({ todo, occurrence });
      } else {
        map.set(key, [{ todo, occurrence }]);
      }
    }
  }

  return map;
}

/**
 * Format a Date as YYYY-MM-DD (local time).
 */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Given a date, return an array of dates centered on that date.
 * getDayRange(today, 3) = [today-3, today-2, today-1, today, today+1, today+2, today+3]
 * (2 * halfWindow + 1 total entries)
 */
export function getDayRange(center: Date, halfWindow: number): Date[] {
  const result: Date[] = [];
  for (let offset = -halfWindow; offset <= halfWindow; offset++) {
    const d = new Date(center);
    d.setDate(d.getDate() + offset);
    result.push(d);
  }
  return result;
}
