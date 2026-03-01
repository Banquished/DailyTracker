import React from 'react';
import type { DashboardTodoOccurrence } from '../domain/types';

export function TodayTodoList({ todos }: { todos: DashboardTodoOccurrence[] }): React.ReactElement {
  if (todos.length === 0) {
    return <p className="text-sm text-text-muted">No todos for today.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {todos.map((todo) => (
        <li key={todo.id} className="flex items-center gap-2 text-sm">
          <span className={todo.completed ? 'text-success' : 'text-text-muted'}>
            {todo.completed ? '✓' : '○'}
          </span>
          <span className={todo.completed ? 'line-through text-text-muted' : 'text-text'}>
            {todo.title}
          </span>
          {todo.missed && (
            <span className="badge badge-danger">missed</span>
          )}
        </li>
      ))}
    </ul>
  );
}
