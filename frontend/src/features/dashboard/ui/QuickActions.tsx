import React from 'react';
import { Link } from 'react-router';

const actions = [
  { to: '/todos', label: '+ Add Todo' },
  { to: '/habits', label: '+ Log Habit' },
  { to: '/weight', label: '+ Log Weight' },
  { to: '/meals', label: '+ Plan Meals' },
];

export function QuickActions(): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className="btn btn-ghost border border-border-subtle text-center text-xs"
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
