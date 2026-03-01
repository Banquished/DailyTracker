import type { Todo, TodoOccurrence } from '../domain/types';
import { MissedBadge } from './MissedBadge';

type TodoCardProps = {
  todo: Todo;
  occurrence: TodoOccurrence;
  onToggle: (occurrenceId: string, completed: boolean) => void;
};

export function TodoCard({ todo, occurrence, onToggle }: TodoCardProps): React.ReactElement {
  const isCompleted = occurrence.completed_at !== null;

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>): void {
    onToggle(occurrence.id, e.target.checked);
  }

  return (
    <div className="card card-padding flex items-start gap-3">
      <input
        type="checkbox"
        id={`todo-${occurrence.id}`}
        checked={isCompleted}
        onChange={handleCheckboxChange}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border-subtle accent-accent"
        aria-label={`Mark "${todo.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={`todo-${occurrence.id}`}
          className={`block cursor-pointer text-sm font-medium leading-tight ${
            isCompleted ? 'text-text-muted line-through' : 'text-text'
          }`}
        >
          {todo.title}
        </label>
        {todo.description !== null && (
          <p className="mt-0.5 text-xs text-text-muted">{todo.description}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {todo.recurrence !== 'none' && (
            <span className="badge badge-info">{todo.recurrence}</span>
          )}
          <MissedBadge count={occurrence.missed ? 1 : 0} />
        </div>
      </div>
    </div>
  );
}
