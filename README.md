<div align="center">
  <a href="https://jdlanyon.dev">
    <img src="docs/public/lotus.png" alt="Logo" width="75px">
  </a>
  <h3>Programming Portfolio</h3>
  <p>Thanks for checking out my portfolio website built with <a href="https://vitepress.dev/">VitePress</a>!</p>
  <p>Here is where I statically generate from markdown files to showcase my past work.</p>
  <p>
    <a href="https://jdlanyon.dev">View Site</a>
    <div>
      <a href="https://sausytime.com">Design Portfolio</a>
      <a href="https://jdlanyon.dev/resume">Resume</a>
      <a href="https://jdlanyon.dev/projects">Projects</a>
      <a href="https://jdlanyon.dev/blog">Blog</a>
    </div>
  </p>
</div>

---

## Contents

- [Quick Start](#quick-start)
- [Highlights](#highlights)
- [Custom Components](#custom-components)
- [Structure](#structure)
- [Theme](#theme)
- [CI/CD](#cicd)
- [Tooling](#tooling)
- [Also See](#also-see)
- [License](#license)


### Build yourself

```sh
git clone https://github.com/JDLanyon/JDLanyon.github.io.git jdlanyon.dev
cd jdlanyon.dev
npm i
npm run dev        # start local development server
npm run build      # production build (fetches READMEs first)
npm run preview    # preview the production build
```

> If you fork this, credit would be greatly appreciated
> work that bears little resemblance to this project is more than fine :)


### Main Features

- **Custom glitch components:** three-tier glitch system (`GlitchText`, `GlitchImage`, `GlitchLink`) with chromatic aberration (RGB + CMY), seeded PRNG for SSR safety, and CSS-only variants. All markdown `[text](url)` links are auto-converted to `<GlitchLink>` at build time via a markdown-it plugin.
- **Project README fetching** - project detail modals and full pages pull content directly from GitHub repository READMEs at build time.
- **CI/CD pipeline** - GitHub Actions builds the site and deploys to Cloudflare Pages in ~2 minutes fully automatically.
- **Monochromatic theme** - Light and Dark modes via CSS custom properties. Minimal, intentional, high contrast.
- **Wiki-style links** - `[[slug]]` syntax (like Obsidian Notes) creates internal links using `<GlitchLink>` at build time via `scripts/glitch-link-plugin.mjs`.
- **Colour tokens** - a backticked hex code (`#e8cb91`) renders inline as that colour, legible in light and dark themes. Clicking copies the hex to the clipboard, confirmed with a "Copied!" tooltip. Emitted at build time via `scripts/colour-plugin.mjs`, rendered by `<ColourSwatch>`.


### Structure

```
├── docs/
│   ├── index.md                 # home (hero + about)
│   ├── about.md                 # about page
│   ├── projects.md              # project catalogue
│   ├── projects/                # generated project detail pages
│   ├── resume.md                # resume
│   ├── blog/                    # blog landing + posts
│   │   ├── index.md
│   │   └── posts/
│   ├── script.md                # internal glitch component reference
│   ├── public/                  # favicon, lotus logo, social icons
│   └── .vitepress/
│       ├── config.ts            # nav, meta, social links
│       └── theme/
│           ├── index.ts         # registers all components globally
│           ├── Layout.vue       # custom layout wrapper (BackToTop, blog nav)
│           ├── custom.css       # light/dark, layout, glitch fx, scrollbar
│           ├── resume-print.css # print styles
│           ├── shims-vue.d.ts   # TS module declarations for .vue
│           └── components/      # Vue components
│               ├── BackToTop.vue
│               ├── Blog.vue
│               ├── BlogCard.vue
│               ├── Button.vue
│               ├── Card.vue
│               ├── ColourSwatch.vue
│               ├── GlitchText.vue
│               ├── GlitchImage.vue
│               ├── GlitchLink.vue
│               ├── ProjectCard.vue
│               ├── ProjectDetailModal.vue
│               ├── ProjectFullPage.vue
│               ├── TypeWriter.vue
│               └── YouTubeEmbeds.vue
├── scripts/
│   ├── fetch-readmes.mjs     # fetches GitHub READMEs for project pages
│   ├── cleanup-auto.mjs      # cleans auto-discovered project pages after build
│   ├── glitch-link-plugin.mjs # markdown-it plugin: [text](url) → <GlitchLink>
│   ├── colour-plugin.mjs     # markdown-it plugin: `#hex` → <ColourSwatch>
│   └── wiki-link-plugin.mjs  # markdown-it plugin: [[slug]] → wiki links
├── .github/workflows/
│       └── deploy.yml    # build site, deploy to Cloudflare's edge network
├── package.json
├── tsconfig.json
├── LICENSE.md
└── README.md
```


### Custom Components

| component | function |
|-----------|-----------|
| `<GlitchText>` | RGB split (chromatic aberration), shake, motion blur, occasional flicker. `requestAnimationFrame` with ease-in/active/ease-out phases. |
| `<GlitchImage>` | Auto-looping glitch displacement with seeded PRNG (SSR-safe). Randomised intervals, `clip-path` scanline tears. |
| `<GlitchLink>` | CSS keyframe glitch on hover - RGB + CMY layers with screen/difference blend modes. No JS animation overhead. |
| `<TypeWriter>` | Rotating typewriter headings - character-by-character typing, word-by-word deletion, ghost text preview, blinking cursor. |
| `<Button>` | Reusable blocky button with `href`, `primary`, `arrow`, `disabled` props. |
| `<Card>` | Shared card shell used by BlogCard and ProjectCard - title, date, description, tags, slot. |
| `<BlogCard>` | Clickable blog post card - wraps Card with router navigation. |
| `<ProjectCard>` | Clickable card that opens a detail modal to display fetched README content. |
| `<ProjectDetailModal>` | Teleported modal that fetches project HTML and extracts content. Falls back from clean URLs to `.html` for static deploy compatibility. |
| `<ProjectFullPage>` | Standalone full-page layout for direct URL visits to `/projects/:slug`. |
| `<Blog>` | Auto-discovers Markdown posts via `import.meta.glob`, extracts frontmatter, sorts by date descending. |
| `<BackToTop>` | IntersectionObserver-based scroll-to-top button. Only shows when page is scrollable and footer is in view. Hides during open modals. |
| `<ColourSwatch>` | Inline colour token emitted by `scripts/colour-plugin.mjs`. Click copies the hex (Clipboard API with a legacy fallback) and shows a click-only "Copied!" tooltip. |
| `<YouTubeEmbeds>` | Renders responsive YouTube iframes from frontmatter `video` field. |

All registered globally and usable in any `.md` file with regular HTML.

#### Colour tokens in markdown

Any inline code that is *only* a hex code becomes a colour token, so colours
read as part of the prose (and work in headings, tables and lists too):

````md
The brand orange is `#e8cb91`, the ink is `#0f172a`.
````

The hex is shown in its own colour over a faint wash of it, adjusted per theme
so it stays legible. Hover lifts the token; clicking copies the hex. Fragments
like `https://example.com/#foo` stay plain code, and hexes inside links are left
alone (a clickable token nested in an anchor would be invalid HTML).


### Theme

The design is intentionally monochromatic, colour is reserved for the glitch effects.

```css
/* light */
--primary: #111;
--secondary: #333;
--background: #eee;

/* dark */
--primary: #eee;
--secondary: #ccc;
--background: #111;
```

[view full source](https://github.com/JDLanyon/JDLanyon.github.io/blob/main/docs/.vitepress/theme/custom.css)


### CI/CD

Pushing to `main` triggers a fully automated pipeline (~2 minutes):

```
npm ci → fetch project READMEs → vitepress build → deploy to Cloudflare Pages
```

No manual steps, no hosting configuration. The site is served statically from `Cloudflare's edge network` with zero runtime dependencies.


### Also check out

- [sausytime.com](https://sausytime.com) - my designer portfolio ([Next.js](https://nextjs.org) · [Self-Hosted](https://sausytime.com))

---

### License

MIT Licence. Feel free to use in any way you like. If your work is recognisably derived from this repository a credit or link back is greatly appreciated but there's no legal obligation.

### Tooling

> Built with assistance from DeepSeek (LLM-based code generation).
> All output reviewed and modified before inclusion.

> *© 2026 Jackson Lanyon*