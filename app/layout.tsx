import type { ReactNode } from 'react';
import { Report } from './report';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Report watcher={process.env.VARIANCE_AUTHORITY_VANTAGE} />
      </body>
    </html>
  );
}
