# web24-boostcamp (frontend)!

Monorepo scaffold for a frontend stack:

- React + TypeScript + Vite (+ React Compiler)
- Zustand
- TailwindCSS
- Vitest
- Playwright (e2e)

## Quick start

```bash
pnpm install
pnpm dev
```

## Commands

```bash
pnpm dev        # Vite dev server (apps/frontend)
pnpm test       # Unit tests (Vitest)
pnpm test:e2e   # E2E tests (Playwright)
pnpm build      # Production build
```

## Notes

- Vite 7 requires Node `>=20.19` (upgrade if you see a warning).
- If pnpm shows “Ignored build scripts: esbuild”, run `pnpm approve-builds` and select `esbuild`.
- Playwright needs a browser install once: `pnpm -C apps/frontend exec playwright install chromium`.
