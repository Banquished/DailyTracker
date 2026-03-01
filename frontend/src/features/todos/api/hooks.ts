import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { fetchTodos, createTodo, toggleOccurrence, deleteTodo } from './todosApi';
import type { Todo, TodoCreate, TodoOccurrence } from '../domain/types';

const TODOS_KEY = ['todos'] as const;

export function useTodos(startDate: string, endDate: string): UseQueryResult<Todo[]> {
  return useQuery({
    queryKey: [...TODOS_KEY, startDate, endDate],
    queryFn: () => fetchTodos(startDate, endDate),
  });
}

export function useCreateTodo(): UseMutationResult<Todo, Error, TodoCreate> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TodoCreate) => createTodo(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TODOS_KEY });
    },
  });
}

export function useToggleOccurrence(): UseMutationResult<
  TodoOccurrence,
  Error,
  { todoId: string; occurrenceId: string; completed: boolean }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      todoId,
      occurrenceId,
      completed,
    }: {
      todoId: string;
      occurrenceId: string;
      completed: boolean;
    }) => toggleOccurrence(todoId, occurrenceId, completed),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TODOS_KEY });
    },
  });
}

export function useDeleteTodo(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TODOS_KEY });
    },
  });
}
