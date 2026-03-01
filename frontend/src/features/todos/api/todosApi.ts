import { apiClient } from '../../../api/client';
import type { Todo, TodoCreate, TodoOccurrence } from '../domain/types';

export async function fetchTodos(startDate: string, endDate: string): Promise<Todo[]> {
  const response = await apiClient.get<Todo[]>('/todos', {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
}

export async function createTodo(data: TodoCreate): Promise<Todo> {
  const response = await apiClient.post<Todo>('/todos', data);
  return response.data;
}

export async function updateTodo(
  id: string,
  data: Partial<TodoCreate> & { active?: boolean },
): Promise<Todo> {
  const response = await apiClient.patch<Todo>(`/todos/${id}`, data);
  return response.data;
}

export async function deleteTodo(id: string): Promise<void> {
  await apiClient.delete(`/todos/${id}`);
}

export async function toggleOccurrence(
  todoId: string,
  occurrenceId: string,
  completed: boolean,
): Promise<TodoOccurrence> {
  const response = await apiClient.patch<TodoOccurrence>(
    `/todos/${todoId}/occurrences/${occurrenceId}`,
    { completed },
  );
  return response.data;
}
