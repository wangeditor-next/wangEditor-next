base on [slate-yjs](https://github.com/BitPhinix/slate-yjs?tab=readme-ov-file)
This package contains the Core slate-yjs binding. Feel free to poke around to learn more!

Docs: https://docs.slate-yjs.dev/api/slate-yjs-core

The shared `Y.XmlText` must contain a valid editor root before clients connect. Initialize new
documents once on the collaboration server. See `apps/demo-yjs-server/server.js` for the demo
server implementation; initializing the same document independently in every client duplicates
the initial content when users join concurrently.
