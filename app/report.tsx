'use client';

import { useEffect } from 'react';
import { reportPage } from '@variance-authority/sense/page';

// The page's half: one call, given the watcher's address.
export function Report({ watcher }: { watcher: string | undefined }) {
  useEffect(() => {
    reportPage(watcher);
  }, [watcher]);
  return null;
}
