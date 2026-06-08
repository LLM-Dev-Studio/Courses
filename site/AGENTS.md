<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Intentional divergences from defaults

**Webpack dev bundler** (`package.json` `dev` script uses `--webpack`): Turbopack (the Next.js 16 default) spawned 200+ Node.js worker processes on this machine, making the system unresponsive. Webpack runs in a single process and is stable here. Do not revert to Turbopack without testing on this hardware first.

**System fonts only** (`layout.tsx`, `globals.css`): Google Fonts (`next/font/google`) was removed. The corporate network blocks Google APIs, causing a 27-second compile-time timeout on every dev start. Fonts are resolved to `"Segoe UI", Arial, Helvetica, sans-serif` for body/UI and `Georgia, "Times New Roman", Times, serif` for headings — no network calls required.
