'use client';

import { useTransition } from 'react';
import type { Todo } from '../lib/store';
import { toggle } from './actions';

export function TodoRow({ todo }: { todo: Todo }) {
  const [pending, start] = useTransition();
  const onToggle = () => {
    start(async () => {
      await toggle(todo.id);
    });
  };
  return (
    <li>
      <label style={todo.done ? { textDecoration: 'line-through' } : undefined}>
        <input type="checkbox" checked={todo.done} disabled={pending} onChange={onToggle} />
        {todo.title}
      </label>
    </li>
  );
}
