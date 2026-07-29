# Yjs Demo Server

`apps/demo-yjs-server` is the WebSocket server used by the React and Vue Yjs demos.

## Origin Policy

WebSocket upgrades without an `Origin` header are rejected.

- When `ALLOWED_ORIGINS` is unset, only HTTP(S) loopback origins using `localhost`,
  `127.0.0.1`, or `[::1]` are allowed. This keeps the local Vite demos working without
  accepting connections from arbitrary websites.
- When `ALLOWED_ORIGINS` is set, it must be a comma-separated list of HTTP(S) origins.
  Only those normalized origins are allowed. An empty or invalid value prevents startup.

For a non-local demo or deployment, set the browser application's origin explicitly, for
example `ALLOWED_ORIGINS=https://editor.example,https://staging.editor.example`.

`HOST` defaults to `localhost` and `PORT` defaults to `1234`.
