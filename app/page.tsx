import { listTodos } from '../lib/store';
import { add } from './actions';
import { TodoRow } from './todo-row';

export const dynamic = 'force-dynamic';

export default function Page() {
  const todos = listTodos();
  const open = todos.filter((todo) => !todo.done).length;
  return (
    <main>
      <h1>Todos</h1>
      {open === 0 ? <p>All done.</p> : <p>{open} open</p>}
      <form action={add}>
        <input name="title" aria-label="title" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <TodoRow key={todo.id} todo={todo} />
        ))}
      </ul>
    </main>
  );
}
