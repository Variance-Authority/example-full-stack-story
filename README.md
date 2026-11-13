# A full-stack story from an app you use by hand

Run the app, click through it, then ask which code answered. Each load and each
click is listed as one **execution**: the functions and branches the page ran,
and beside them the server code that click caused. No test is involved.

The app is a small Next.js todo list with a server component, a client component
and two server actions.

Needs `@variance-authority/cli` and `@variance-authority/sense` 0.32.0 or newer.

## 1. Start a watcher

```bash
npm install
npm run watch
```

```
variance-authority is watching. Start the suite with this in its environment:

  VARIANCE_AUTHORITY_VANTAGE=http://127.0.0.1:61801
```

The watcher holds what it is told in memory and writes nothing down. It listens
on this machine only, and the port is new each time.

## 2. Start the app with that address

In another terminal, with the address the watcher printed:

```bash
export VARIANCE_AUTHORITY_VANTAGE=http://127.0.0.1:61801
npm start
```

Open <http://localhost:3000>. Type a todo, press **Add**, then tick its checkbox.

## 3. Ask what ran

In a third terminal, in this folder, with the same address exported:

```bash
npm run ran -- --name toggleTodo
```

```
1 of 8 execution(s) at http://127.0.0.1:61801.

  1ee8b98dbbe77846a09353ddc0cad999
  head server
      app/actions.ts:15 toggle entry
      app/actions.ts:18 toggle if#0/else
      app/actions.ts:19 toggle if#0/after
      app/page.tsx:7 Page entry
      app/page.tsx:9 Page/filter.arg0 entry
      app/page.tsx:19 Page/map.arg0 entry
      lib/store.ts:11 listTodos entry
      lib/store.ts:21 toggleTodo entry
      lib/store.ts:22 toggleTodo/findIndex.arg0 entry
      lib/store.ts:23 toggleTodo if#0/else
      lib/store.ts:24 toggleTodo if#0/after
      …
  head page
      app/todo-row.tsx:7 TodoRow entry
      app/todo-row.tsx:9 TodoRow/onToggle entry
      app/todo-row.tsx:10 TodoRow/onToggle/start.arg0 entry
      app/todo-row.tsx:11 TodoRow/onToggle/start.arg0 await#0
      …
```

That is one click of the checkbox. Under `head page`, the handler that ran in the
browser. Under `head server`, the action it called, the store function behind it,
which side of each `if` was taken, and the page rendering again. The listing here
is shortened; yours also names each module that loaded.

`npm run ran` with no `--name` lists every execution: the first load, the Add,
the tick. Some read `ran no code the build placed a probe in`: requests the
browser made by itself, such as the favicon.

## Try this

In [app/actions.ts](app/actions.ts), `toggle` throws when the todo does not
exist. Nothing in the app can reach that line, and no listing will ever show
`toggle if#0/then`. Add a todo, tick it, ask again: you see what your session
covered, and what it did not.

## The three lines that make it work

| file | what it does |
|---|---|
| [next.config.mjs](next.config.mjs) | the build change: places a probe in every module under `app/` and `lib/`, for the server and the page alike |
| [server.mjs](server.mjs) | the server's half: runs each request inside `collectJourneys().enter`, so it reports under the execution the page named |
| [app/report.tsx](app/report.tsx) | the page's half: one call to `reportPage` with the watcher's address |

Without `VARIANCE_AUTHORITY_VANTAGE` the page installs nothing and the server
reports nothing; the probes stay in the build and are counted nowhere.

## If the listing is empty

- The app was started without the address, or with an old one. The watcher's
  port changes each time it starts; restart the app with the new address.
- You edited a file after the page loaded. A changed file is listed with a count
  and no names until the app has rebuilt it; reload the page.
- A browser tab that was killed can leave two cookies behind
  (`variance-authority-journey`, `variance-authority-return`) that point at a
  watcher that is gone. Clear them for `localhost`.

## What this is, and is not

Replay describes the same wish from the other side in
[Full-stack debugging](https://replay.io/blog/full-stack-debugging): record a
real session and see the frontend and the backend of each interaction together.
Replay records the whole runtime so you can replay it. This records only which
code ran, from probes placed at build time, and replays nothing: no values, no
network bodies, no timeline. What you get is small enough to ask about from a
terminal or from an agent, through `variance ask ran` or the MCP tool
`variance_ran`.

The page's execution is named at a click, so a request sent long after a click
is listed under the latest one, and two tabs of one app can interleave. The
full list of limits is in
[Watch an application you use by hand](https://github.com/Variance-Authority/variance-authority/blob/main/docs/vantage.md#watch-an-application-you-use-by-hand).
