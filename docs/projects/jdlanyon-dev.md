---
title: jdlanyon.dev - Programmer Portfolio
date: "2026"
description: Project detail page
tags: ["VitePress", "Vue", "TypeScript", "GitHub Actions", "Markdown"]
repo: https://github.com/JDLanyon/jdlanyon.dev
url: "https://jdlanyon.dev"
---

<ProjectFullPage>

# jdlanyon.dev - Programmer Portfolio

**jdlanyon.dev** is my personal programming portfolio - a statically-generated site built from the ground up to showcase my software development projects, technical blog posts, and professional experience. Unlike the earlier Next.js iteration (moved to sausytime.com), this version uses VitePress for fast, SEO-friendly static pages with custom Vue components.

## Key Features

- **Live project detail pages** - Automatically generated from GitHub README content with embedded YouTube demos and project-specific links
- **Technical blog** - Markdown posts authored in Obsidian and synced via CI/CD pipeline, sorted by date with tag-based navigation
- **Resume page** - Clean, printable layout detailing education, work history, and technical skills
- **Responsive design** - Custom dark/light theming using CSS variables and VitePress theming API
- **GitHub Actions CI/CD** - Automated fetch, build, and deploy pipeline triggered on push

## Built With

| Technology | Purpose |
|---|---|
| [VitePress](https://vitepress.dev/) | Vue-powered static site generator from Markdown |
| [Vue 3](https://vuejs.org/) | Component framework for custom interactive elements |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe code throughout components and build scripts |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline for automated builds and deployment |
| [GitHub Pages](https://pages.github.com/) | Hosting with custom domain and HTTPS |
| [Obsidian](https://obsidian.md/) | Knowledge management and blog authoring |
| [gh-pages](https://github.com/tschaub/gh-pages) | npm publishing utility for static site deployment |

## Architecture Highlights

The site uses a custom build pipeline (`scripts/fetch-readmes.mjs`) that fetches live GitHub README content for each project, resolves relative image paths to raw GitHub URLs, and generates VitePress-compatible Markdown with frontmatter. Custom Vue components like `<ProjectFullPage>`, `<ProjectDetailModal>`, `<YouTubeEmbeds>`, and `<BackToTop>` enhance the user experience beyond what plain Markdown provides.

[View source on GitHub →](https://github.com/JDLanyon/jdlanyon.dev)

</ProjectFullPage>
