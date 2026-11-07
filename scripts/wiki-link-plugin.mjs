/**
 * wiki-link-plugin.mjs
 *
 * VitePress markdown plugin that transforms [[slug]] wiki-links on the
 * Projects page into a single <CardGrid> per paragraph at build time.
 *
 * Metadata comes from docs/projects/*.md frontmatter.
 *
 * Thumbnails are convention-first so Obsidian stays terse — see
 * `resolveThumbnail` below. Put the image at
 * `docs/public/projects/<slug>/thumbnail.png` and it appears on the card with
 * NO frontmatter at all. Override with `thumbnail: other.png` (same folder) or
 * `thumbnail: /absolute-or-remote.png`. If no file exists the card simply has
 * no media area (no empty box).
 *
 * <CardGrid> maps each item to a library <Card> and owns ONE shared
 * <ProjectModal>, so clicking a project card opens its detail modal without
 * per-card modal state. Cards are modal-only: we intentionally never emit a
 * card `url`, so a project card can never navigate away from /projects.
 * See @jdlanyon/lotus-library README (Cards & grids).
 *
 * This plugin only runs during the VitePress build - your Obsidian notes keep
 * clean [[wiki-link]] syntax untouched.
 *
 * Usage in docs/.vitepress/config.ts:
 *   import { wikiLinkPlugin } from '../../scripts/wiki-link-plugin.mjs'
 *   export default defineConfig({
 *     markdown: { config: md => md.use(wikiLinkPlugin) }
 *   })
 */

import fs from "fs";
import path from "path";

const __dirname = import.meta.dirname;
const PROJECTS_DIR = path.resolve(__dirname, "..", "docs", "projects");
const AUTO_DIR = path.resolve(__dirname, "..", "docs", ".vitepress", "cache", "auto-projects");
const PUBLIC_DIR = path.resolve(__dirname, "..", "docs", "public");

/** Default thumbnail filename inside a project's asset folder. */
const DEFAULT_THUMBNAIL = "thumbnail.png";

/** Parse a project's frontmatter into a plain object. */
function getProjectMeta(slug) {
  for (const dir of [PROJECTS_DIR, AUTO_DIR]) {
    const projectFile = path.join(dir, `${slug}.md`);
    if (fs.existsSync(projectFile)) {
      const raw = fs.readFileSync(projectFile, "utf-8");
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
      if (fmMatch) {
        const fm = {};
        for (const line of fmMatch[1].split("\n")) {
          const kv = line.match(/^(\w+):\s*(.+)/);
          if (!kv) continue;
          let val = kv[2].trim();
          if (val.startsWith("[")) {
            try {
              val = JSON.parse(val.replace(/'/g, '"'));
            } catch {
              val = val.slice(1, -1).split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
            }
          } else if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
          }
          fm[kv[1]] = val;
        }
        return fm;
      }
    }
  }
  return {};
}

/**
 * Resolve a card thumbnail URL, or `undefined` when there is nothing to show.
 *
 * Frontmatter may give:
 *   - `thumbnail: https://…` / `thumbnail: /absolute/path.png` → used verbatim
 *     (no disk check: it is the author's explicit choice, possibly remote).
 *   - `thumbnail: some-file.png` → resolved inside the project's own asset
 *     folder, `/projects/<slug>/some-file.png`.
 *   - nothing → convention: `/projects/<slug>/thumbnail.png`.
 *
 * Convention/explicit-filename candidates are only returned if the file
 * actually exists in `docs/public`, because a missing file still renders a
 * full-size empty media box (`.lotus-card-media` has a fixed aspect-ratio and
 * a background colour). Returning `undefined` keeps `Card.mediaSrc` empty so
 * the media area collapses entirely — the graceful "no thumbnail" case.
 */
function resolveThumbnail(slug, meta) {
  const thumb = typeof meta.thumbnail === "string" ? meta.thumbnail.trim() : "";

  // Absolute or remote URL: trust the author, no disk check.
  if (thumb && (/^(https?:)?\/\//.test(thumb) || thumb.startsWith("/"))) {
    return thumb;
  }

  const dir = path.posix.join("/projects", slug);
  const candidates = thumb ? [thumb] : [DEFAULT_THUMBNAIL];

  for (const file of candidates) {
    const url = path.posix.join(dir, file);
    if (fs.existsSync(path.join(PUBLIC_DIR, url))) return url;
  }
  return undefined;
}

/** Build a ProjectCardData item from a slug's frontmatter. */
function buildItem(slug) {
  const meta = getProjectMeta(slug);
  const item = {
    slug,
    title: meta.title || slug,
  };
  // Skip the placeholder description auto-generated for detail pages.
  if (meta.description && meta.description !== "Project detail page") {
    item.description = meta.description;
  }
  if (Array.isArray(meta.tags) && meta.tags.length > 0) item.tags = meta.tags;
  if (meta.repo) item.repo = meta.repo;
  // NOTE: deliberately omit `url`. In CardGrid, a card `url` makes the whole
  // card navigate externally *instead of* opening the detail modal. Project
  // cards should ONLY open their modal; external links live inside the modal
  // and on the project's full page. (See ProjectCardData docs.)
  // if (meta.url) item.url = meta.url;
  if (meta.date) item.date = meta.date;
  // Single `thumbnail` key. Omit the prop entirely when nothing resolves so
  // the Card collapses its media area instead of showing an empty box.
  const thumbnail = resolveThumbnail(slug, meta);
  if (thumbnail) item.thumbnail = thumbnail;
  return item;
}

/** Serialise an items array for the :items prop (single-quoted, HTML-safe). */
function serialiseItems(items) {
  return JSON.stringify(items).replace(/'/g, "&#39;");
}

export function wikiLinkPlugin(md) {
  md.core.ruler.push("wiki_links", function (state) {
    const tokens = state.tokens;
    const isProjectsPage = tokens.some(
      t => t.type === "heading_open" && t.tag === "h1"
        && tokens[tokens.indexOf(t) + 1]?.content === "Projects"
    );

    if (!isProjectsPage) return;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type !== "inline" || !token.children) continue;

      // Collect every [[slug]] in this paragraph, preserving order.
      const slugs = [];
      for (const child of token.children) {
        if (child.type !== "text" || !child.content) continue;
        for (const m of child.content.matchAll(/\[\[([\w-]+)\]\]/g)) {
          slugs.push(m[1]);
        }
      }
      if (slugs.length === 0) continue;

      // Replace the paragraph's children with a single <CardGrid> html_inline.
      const items = slugs.map(buildItem);
      const cardGrid = `<CardGrid :items='${serialiseItems(items)}' />`;

      const htmlToken = new state.Token("html_inline", "", 0);
      htmlToken.content = cardGrid;
      token.children = [htmlToken];
    }
  });
}
