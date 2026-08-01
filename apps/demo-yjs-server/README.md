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

## Public Demo Deployment

The browser demos are built from this monorepo and can be published to the organization demo
site. The static site and this WebSocket server are deployed separately.

Before enabling the browser deployment:

1. Deploy this server on a host that accepts WebSocket connections. For a container or direct
   network deployment, set `HOST=0.0.0.0`; retain the default only when a co-located reverse
   proxy is its sole client. Configure the public `wss://` URL in `YJS_DEMO_WEBSOCKET_URL`.
2. Set `ALLOWED_ORIGINS=https://wangeditor-next.github.io` on this server. Origin values do not
   include the `/demo/` path.
3. Configure the `YJS_DEMO_WEBSOCKET_URL` repository variable in `wangEditor-next/wangEditor-next`.

The deployment workflow builds the React and Vue apps with that URL and publishes them under
`/demo/yjs/react/` and `/demo/yjs/vue3/`. It skips publishing when the repository variable is not
configured. Public builds generate an isolated room when the URL has no `room` query parameter;
users collaborate by sharing the same `?room=<room-name>` URL.
