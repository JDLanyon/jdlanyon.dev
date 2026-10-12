#!/usr/bin/env node

/**
 * build-docs.mjs
 *
 * Runs the VitePress production build programmatically and then forces the
 * process to exit.
 *
 * Why: `vitepress build docs` completes successfully but leaves keep-alive
 * HTTP sockets open after "build complete", so the Node event loop never
 * drains and the process hangs until killed. In CI (Cloudflare Pages) this
 * stalls the pipeline and the subsequent `&&` step never runs.
 *
 * Calling VitePress's `build()` directly and exiting explicitly sidesteps the
 * leaked handles. The build itself is unchanged.
 */

import { build } from "vitepress";

try {
  await build("docs");
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
