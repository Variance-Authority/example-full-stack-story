import type { Todo } from './store';

const DAY = 24 * 60 * 60 * 1000;

// A done todo stays on the list for a day, so a slip of the mouse can be undone.
export function stillListed(todo: Todo, now: number): boolean {
  if (todo.doneAt === undefined) {
    return true;
  }
  if (now - todo.doneAt < DAY) {
    return false;
  }
  return true;
}
