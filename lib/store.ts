export interface Todo {
  readonly id: number;
  readonly title: string;
  readonly done: boolean;
}

// Held on the global so a dev rebuild of this module keeps the list.
const held = globalThis as { __todos__?: Todo[] };
const todos = (held.__todos__ ??= [{ id: 1, title: 'Read the recording', done: false }]);

export function listTodos(): readonly Todo[] {
  return todos;
}

export function addTodo(title: string): Todo {
  const todo = { id: todos.length + 1, title, done: false };
  todos.push(todo);
  return todo;
}

export function toggleTodo(id: number): Todo | undefined {
  const at = todos.findIndex((todo) => todo.id === id);
  if (at === -1) return undefined;
  const todo = { ...todos[at]!, done: !todos[at]!.done };
  todos[at] = todo;
  return todo;
}
