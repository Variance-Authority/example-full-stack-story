'use server';

import { revalidatePath } from 'next/cache';
import { addTodo, toggleTodo } from '../lib/store';

export async function add(form: FormData): Promise<void> {
  const title = String(form.get('title') ?? '').trim();
  if (title.length === 0) {
    return;
  }
  addTodo(title);
  revalidatePath('/');
}

export async function toggle(id: number): Promise<void> {
  if (toggleTodo(id) === undefined) {
    throw new Error(`no todo ${id}`);
  }
  revalidatePath('/');
}
