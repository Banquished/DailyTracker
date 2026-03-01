import { useState } from 'react';
import { useTodos, useToggleOccurrence } from '../api/hooks';
import { groupOccurrencesByDate, formatDate, getDayRange } from '../domain/recurrence';
import { useTodoStore } from '../stores/todoStore';
import { TodoCard } from './TodoCard';
import { AddTodoDrawer } from './AddTodoDrawer';

export function TodosPageView(): React.ReactElement {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selectedDate = useTodoStore((s) => s.selectedDate);
  const setSelectedDate = useTodoStore((s) => s.setSelectedDate);

  const range = getDayRange(selectedDate, 3);
  const startDate = formatDate(range[0]!);
  const endDate = formatDate(range[range.length - 1]!);

  const { data: todos = [], isLoading, isError } = useTodos(startDate, endDate);
  const toggleOccurrence = useToggleOccurrence();

  const occurrencesByDate = groupOccurrencesByDate(todos);
  const selectedKey = formatDate(selectedDate);
  const dayOccurrences = occurrencesByDate.get(selectedKey) ?? [];

  function prevDay(): void {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  }

  function nextDay(): void {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  }

  function handleToggle(todoId: string, occurrenceId: string, completed: boolean): void {
    toggleOccurrence.mutate({ todoId, occurrenceId, completed });
  }

  const isToday = formatDate(selectedDate) === formatDate(new Date());
  const displayDate = isToday
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-h4 font-semibold">Todos</h1>
        <button
          className="btn btn-primary"
          onClick={() => setDrawerOpen(true)}
        >
          + Add Todo
        </button>
      </div>

      {/* Date navigator */}
      <div className="card card-padding flex items-center justify-between">
        <button
          className="btn btn-ghost"
          onClick={prevDay}
          aria-label="Previous day"
        >
          ← Prev
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-text">{displayDate}</p>
          <p className="text-xs text-text-muted">{selectedKey}</p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={nextDay}
          aria-label="Next day"
        >
          Next →
        </button>
      </div>

      {/* Todo list */}
      {isLoading && (
        <p className="text-sm text-text-muted">Loading…</p>
      )}
      {isError && (
        <p className="text-sm text-danger">Failed to load todos.</p>
      )}
      {!isLoading && !isError && (
        <div className="space-y-2">
          {dayOccurrences.length === 0 ? (
            <div className="card card-padding text-center text-sm text-text-muted">
              No todos for this day.{' '}
              <button
                className="text-accent-muted underline"
                onClick={() => setDrawerOpen(true)}
              >
                Add one?
              </button>
            </div>
          ) : (
            dayOccurrences.map(({ todo, occurrence }) => (
              <TodoCard
                key={occurrence.id}
                todo={todo}
                occurrence={occurrence}
                onToggle={(occurrenceId, completed) =>
                  handleToggle(todo.id, occurrenceId, completed)
                }
              />
            ))
          )}
        </div>
      )}

      <AddTodoDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
