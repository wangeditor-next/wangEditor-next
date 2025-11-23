# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by `pnpm` and `turbo`. Packages live in `packages/` (core editor, framework wrappers, modules, plugins, yjs sync), with shared Rollup helpers in `shared/rollup-config/`.
- Unit specs sit beside code in `packages/*/__tests__/`; end-to-end flows live in `cypress/`; integration fixtures and legacy tests are under `tests/`.
- Docs and marketing assets live in `docs/`; scripts for builds and examples are under `scripts/`. Imported styles and theme tokens are defined in `packages/vars.less`.

## Build, Test, and Development Commands
- Install deps with `pnpm install` (Node 22+). Use `pnpm dev` for turbo-driven watch builds across packages; `pnpm example` runs demo builds used by E2E.
- Ship builds with `pnpm build` (runs package builds via Turbo). Run `pnpm lint` or `pnpm lint:fix` for ESLint; `pnpm format` applies Prettier to TS/TSX in packages.
- Unit tests: `pnpm test` (Vitest, pass-with-no-tests enabled), `pnpm test:watch` for TDD, `pnpm test-c` for coverage.
- E2E: `pnpm cypress:run` headless or `pnpm cypress:open` for UI; `pnpm e2e` spawns the demo and Cypress together.

## Coding Style & Naming Conventions
- TypeScript-first codebase; keep imports ordered and paths relative. Prefer named exports; default exports are rare.
- Follow ESLint (Airbnb base + Prettier) and Prettier formatting: 2-space indent, single quotes, trailing commas where valid, semicolons omitted per existing code.
- File naming: kebab-case for files and directories; PascalCase for React/Vue components; camelCase for variables/functions; enums and types use PascalCase.
- Styles live in Less; keep shared tokens in `vars.less` and colocate component styles in the owning package.

## Testing Guidelines
- Write fast unit specs with Vitest; extend DOM expectations via `@testing-library/jest-dom`. Place specs in `__tests__` near the module under test and name them `*.test.ts` or `*.spec.ts`.
- Cover core editor behaviors (selection, commands, schema guards) with focused scenarios; prefer shallow fixtures over large snapshots.
- Use `pnpm test-c` before PRs to watch coverage regressions; add E2E cases in `cypress/e2e/` for integration-heavy fixes.

## Commit & Pull Request Guidelines
- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.) enforced by commitlint; run `pnpm cz` if you want the guided prompt.
- PRs should link issues, describe behavior changes, and include screenshots/GIFs for UI-visible updates. Note any breaking changes explicitly and list test commands executed.
- For versioned releases, create a changeset with `pnpm changeset`; publishing is automated via `pnpm publish` after merges.
