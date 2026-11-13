// The server's half: Next behind one line of `enter`, so each request runs as the
// execution the page named for it.
import { createServer } from 'node:http';
import next from 'next';
import { collectJourneys } from '@variance-authority/sense/journey';

const port = Number(process.env.PORT ?? 3000);
const journeys = collectJourneys({ head: 'server' });
const app = next({ dev: true, dir: import.meta.dirname });
const handle = app.getRequestHandler();
await app.prepare();
createServer((request, response) => {
  // Next's own assets run none of the product: served outside, they list nothing.
  if (request.url?.startsWith('/_next/')) return handle(request, response);
  journeys.enter(request.headers.cookie, () => handle(request, response));
}).listen(port, () => console.log(`app at http://localhost:${port}`));
