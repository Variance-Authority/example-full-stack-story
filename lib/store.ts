import { stillListed } from './archive';

export interface Todo {
  readonly id: number;
  readonly title: string;
  readonly done: boolean;
  readonly doneAt?: number;
}

// Held on the global so a dev rebuild of this module keeps the list.
const held = globalThis as { __todos__?: Todo[] };
const todos = (held.__todos__ ??= [{ id: 1, title: 'Read the recording', done: false }]);

export function listTodos(): readonly Todo[] {
  const now = Date.now();
  return todos.filter((todo) => stillListed(todo, now));
}

export function addTodo(title: string): Todo {
  const todo = { id: todos.length + 1, title, done: false };
  todos.push(todo);
  return todo;
}

export function toggleTodo(id: number): Todo | undefined {
  const at = todos.findIndex((todo) => todo.id === id);
  if (at === -1) return undefined;
  const done = !todos[at]!.done;
  const todo = { ...todos[at]!, done, doneAt: done ? Date.now() : undefined };
  todos[at] = todo;
  return todo;
}
