# A full-stack story for your agent

A small Next.js todo list with a bug in it. You reproduce the bug by hand, then
tell your agent what you saw. The agent asks which code ran for that click, in
the browser and on the server, and goes straight to the line at fault.

The app has a server component, a client component and two server actions.
Ticking a todo should cross it out. It makes the todo disappear instead.

Needs `@variance-authority/cli`, `@variance-authority/mcp` and
`@variance-authority/sense` 0.32.0 or newer.

## 1. Open your agent in this folder

```bash
npm install
```

Then start your agent here. [.mcp.json](.mcp.json) gives Claude Code a
`variance-live` server, and that server is the watcher: it listens on this
machine only, keeps what it is told in memory, and writes nothing down. Any
client that speaks MCP can take the same entry.

## 2. Start the app with the watcher's address

Ask your agent:

> Ask variance_self for the watcher's address.

It answers with one line:

```
VARIANCE_AUTHORITY_VANTAGE=http://127.0.0.1:63623
```

The port is new each time the watcher starts. In a terminal, start the app with
that line:

```bash
VARIANCE_AUTHORITY_VANTAGE=http://127.0.0.1:63623 npm start
```

You can also ask the agent to start it.

## 3. Reproduce the bug

Open <http://localhost:3000> and tick **Read the recording**. The todo is gone,
and the page says "All done."

## 4. Tell your agent what you saw

> I ticked the only todo. Instead of being crossed out, it disappeared and the
> page says "All done". Find the cause.

The agent calls `variance_ran`. Each load and each click is one execution, and
the tick reads:

```
  9b2b7da9c7347c63a20a2ba770c5fef6
  head server
      app/actions.ts:15 toggle entry
      app/actions.ts:18 toggle if#0/else
      app/actions.ts:19 toggle if#0/after
      app/page.tsx:7 Page entry
      lib/archive.ts:6 stillListed entry
      lib/archive.ts:9 stillListed if#0/else
      lib/archive.ts:10 stillListed if#0/after
      lib/archive.ts:10 stillListed if#1/then
      lib/store.ts:14 listTodos entry
      lib/store.ts:16 listTodos/filter.arg0 entry
      lib/store.ts:25 toggleTodo entry
      lib/store.ts:27 toggleTodo if#0/else
      lib/store.ts:28 toggleTodo if#0/after
  head page
      app/todo-row.tsx:9 TodoRow/onToggle entry
      app/todo-row.tsx:10 TodoRow/onToggle/start.arg0 entry
      app/todo-row.tsx:11 TodoRow/onToggle/start.arg0 await#0
      …
```

Under `head page`, the click handler that ran in the browser. Under
`head server`, what that click caused: the action, the store, and the page
rendering again. The listing here is shortened; the agent's also names each
module that loaded.

The tick itself went through: `toggle` and `toggleTodo` both took their normal
branch. Something else ran on the same click. Read the listing again before you
open the spoiler.

<details><summary>Where the bug is</summary>

`lib/archive.ts:10 stillListed if#1/then`. The re-render filters the list
through `stillListed`, which should keep a done todo for a day and hides it for
a day instead: `now - todo.doneAt < DAY` should be `>`.

Followed from the click handler downward, the code never reaches
`lib/archive.ts`: the action does not call it, the page's read of the list
does. The listing names it because it ran for that click.

When we gave an agent nothing but the report above, this listing and the
folder, it named that line after three tool calls.

</details>

## The three lines that make it work

| file | what it does |
|---|---|
| [next.config.mjs](next.config.mjs) | the build change: places a probe in every module under `app/` and `lib/`, for the server and the page alike |
| [server.mjs](server.mjs) | the server's half: runs each request inside `collectJourneys().enter`, so it reports under the execution the page named |
| [app/report.tsx](app/report.tsx) | the page's half: one call to `reportPage` with the watcher's address |

Without `VARIANCE_AUTHORITY_VANTAGE` the page installs nothing and the server
reports nothing; the probes stay in the build and are counted nowhere.

## Without an agent

The same questions answer from a shell. Start the watcher with `npm run watch`
in place of step 1, and after the click:

```bash
VARIANCE_AUTHORITY_VANTAGE=http://127.0.0.1:63623 npm run ran -- --name stillListed
```

`--name` keeps the executions that ran a region of that name.

## If the listing is empty

- The app was started without the address, or with an old one. The watcher's
  port changes each time it starts, and it starts with your agent; restart the
  app with the new address.
- You edited a file after the page loaded. A changed file is listed with a count
  and no names until the app has rebuilt it; reload the page.
- A browser tab that was killed can leave two cookies behind
  (`variance-authority-journey`, `variance-authority-return`) that point at a
  watcher that is gone. Clear them for `localhost`.

Some executions read `ran no code the build placed a probe in`: requests the
browser made by itself, such as the favicon.

## What this is, and is not

Replay describes the same wish from the other side in
[Full-stack debugging](https://replay.io/blog/full-stack-debugging): record a
real session and see the frontend and the backend of each interaction together.
Replay records the whole runtime so you can replay it. This records only which
code ran, from probes placed at build time, and replays nothing: no values, no
network bodies, no timeline. What you get is small enough for an agent to read
in one tool call.

The page's execution is named at a click, so a request sent long after a click
is listed under the latest one, and two tabs of one app can interleave. The
full list of limits is in
[Watch an application you use by hand](https://github.com/Variance-Authority/variance-authority/blob/main/docs/vantage.md#watch-an-application-you-use-by-hand).
