/**
 * colour-plugin.mjs
 *
 * VitePress markdown-it plugin that turns hex colour references into clickable,
 * copy-to-clipboard colour tokens.
 *
 * Authoring is inline only, so colours read as part of the prose:
 *
 *     The brand orange is `#e8cb91`, the ink is `#0f172a`.
 *
 * Each token renders as <ColourSwatch>, the hex code shown in the colour itself
 * over a tint/shade of it, so it stays legible in both light and dark mode.
 * Clicking copies the hex and confirms with a "Copied!" tooltip; nothing is
 * revealed on hover beyond a slight popout transform.
 *
 * Only a token that is *entirely* a 3/6/8-digit hex is converted, so fragments
 * like `https://example.com/#foo` stay plain code. Hexes inside links are left
 * alone too: a clickable token nested in an anchor would be invalid HTML.
 *
 * Usage in docs/.vitepress/config.ts:
 *   import { colourPlugin } from '../../scripts/colour-plugin.mjs'
 *   export default defineConfig({
 *     markdown: { config: md => md.use(colourPlugin) }
 *   })
 */

/**
 * Matches a hex code sitting in a single inline-code token. The token must be
 * *only* the hex code (surrounding whitespace allowed).
 */
const HEX_TOKEN_RE = /^\s*(#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8}))\s*$/i;

/** Split `#aabbcc` / `#aabbccdd` into { rgb: [r,g,b], alpha: 0-1 }. */
function parseHex(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { rgb: [r, g, b], alpha };
}

/** Relative luminance (W3C) for a hex colour, 0 (black) to 1 (white). */
function luminance(hex) {
  const [r, g, b] = parseHex(hex).rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Escape a value for a double-quoted HTML attribute / style value. */
function attr(value) {
  return String(value).replace(/"/g, '&quot;');
}

/**
 * Build the <ColourSwatch> markup. The colour is passed inline so the token
 * reads as that colour in prose; the light/dark tag lets custom.css pick the
 * surrounding tint/shade per theme.
 */
function renderColour(hex) {
  const tone = luminance(hex) > 0.45 ? 'light' : 'dark';
  const variant = `vp-colour--inline vp-colour--${tone}`;
  return (
    `<ColourSwatch hex="${attr(hex)}" class="${variant}" style="--colour:${attr(hex)}">` +
    `${attr(hex)}</ColourSwatch>`
  );
}

export function colourPlugin(md) {
  // A core ruler (rather than a `code_inline` renderer) so the token stream
  // itself is rewritten, which keeps nesting/link checks trivial.
  md.core.ruler.push('colour_inline', (state) => {
    for (const token of state.tokens) {
      if (token.type !== 'inline' || !token.children) continue;
      token.children = replaceInlineHex(state, token.children);
    }
  });
}

/**
 * Walk one paragraph's inline children, replacing inline-code tokens that are
 * exactly a hex code with an html_inline token. Code/HTML/link children are
 * left untouched.
 */
function replaceInlineHex(state, children) {
  const next = [];
  const linkLevels = new Set(); // depths at which a link is currently open

  for (const child of children) {
    // Links are tracked by level rather than tag: the glitch-link plugin swaps
    // <a> for <GlitchLink>, and a clickable token inside a link would be
    // invalid HTML (interactive content inside an anchor).
    if (child.type === 'link_open') linkLevels.add(child.level);
    if (child.type === 'link_close') linkLevels.delete(child.level);

    const isCodeSpan =
      (child.type === 'code_inline' || child.type === 'code') && child.content;
    const match = isCodeSpan ? child.content.match(HEX_TOKEN_RE) : null;

    if (!match || linkLevels.size > 0) {
      next.push(child);
      continue;
    }

    const htmlToken = new state.Token('html_inline', '', 0);
    htmlToken.content = renderColour(match[1]);
    next.push(htmlToken);
  }

  return next;
}

export default colourPlugin;

