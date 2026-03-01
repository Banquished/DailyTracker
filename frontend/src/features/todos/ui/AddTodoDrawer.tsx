import { useState } from 'react';
import type { RecurrenceType, TodoCreate } from '../domain/types';
import { useCreateTodo } from '../api/hooks';

type AddTodoDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function AddTodoDrawer({ open, onClose }: AddTodoDrawerProps): React.ReactElement {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [rollover, setRollover] = useState(false);

  const createTodo = useCreateTodo();

  function resetForm(): void {
    setTitle('');
    setDescription('');
    setRecurrence('none');
    setRollover(false);
  }

  function handleClose(): void {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    const data: TodoCreate = {
      title: title.trim(),
      ...(description.trim() !== '' && { description: description.trim() }),
      recurrence,
      rollover,
    };

    await createTodo.mutateAsync(data);
    resetForm();
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add todo"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-surface shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h2 className="text-base font-semibold text-text">Add Todo</h2>
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-ghost p-1"
            aria-label="Close drawer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* Title */}
          <div className="input-root">
            <label htmlFor="todo-title" className="input-label">
              Title <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id="todo-title"
              type="text"
              className="input-field"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="input-root">
            <label htmlFor="todo-description" className="input-label">
              Description
            </label>
            <textarea
              id="todo-description"
              className="input-field resize-none"
              placeholder="Optional details..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Recurrence */}
          <div className="input-root">
            <label htmlFor="todo-recurrence" className="input-label">
              Recurrence
            </label>
            <select
              id="todo-recurrence"
              className="input-field"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
            >
              {RECURRENCE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Rollover */}
          <div className="flex items-center gap-2">
            <input
              id="todo-rollover"
              type="checkbox"
              className="h-4 w-4 cursor-pointer rounded border-border-subtle accent-accent"
              checked={rollover}
              onChange={(e) => setRollover(e.target.checked)}
            />
            <label htmlFor="todo-rollover" className="cursor-pointer text-sm text-text">
              Roll over missed todos
            </label>
          </div>

          {/* Error */}
          {createTodo.isError && (
            <p className="text-sm text-danger" role="alert">
              Failed to create todo. Please try again.
            </p>
          )}

          {/* Footer buttons */}
          <div className="mt-auto flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost flex-1"
              disabled={createTodo.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={createTodo.isPending || title.trim() === ''}
            >
              {createTodo.isPending ? 'Saving...' : 'Add Todo'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
