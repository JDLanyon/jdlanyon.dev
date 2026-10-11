#!/usr/bin/env node

/**
 * fetch-readmes.mjs
 *
 * Fetches GitHub README.md files for projects and writes them as
 * VitePress-routable pages.
 *
 * Two sources:
 *   1. CURATED - projects listed under known section headings in docs/projects.md
 *      → existing files at docs/projects/{slug}.md are never overwritten
 *   2. AUTO-DISCOVERED - public repos on GitHub not otherwise covered
 *      → written to cache dir, then promoted to docs/projects/ for routing
 *      → caller (package.json script) should run cleanup-auto.mjs after build
 *
 * Priority: local markdown in docs/projects/ > fetched README > fallback
 *
 * Modules:
 *   lib/github.js          - fetchUserRepos, fetchLatestCommitDate, readmeBaseUrl
 *   lib/projects-md.js     - parseCuratedFromProjectsMd, generateProjectsPage
 *   lib/frontmatter.js     - buildFrontmatter, stripExistingFrontmatter, resolveRelativePaths
 *   lib/project-writer.js  - writeProject, promoteAutoFiles, slugFromRepoName, titleFromRepoName
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { fetchUserRepos, fetchLatestCommitDate } from "./lib/github.js";
import { parseCuratedFromProjectsMd, generateProjectsPage } from "./lib/projects-md.js";
import { slugFromRepoName, titleFromRepoName, writeProject, promoteAutoFiles } from "./lib/project-writer.js";

const __dirname = import.meta.dirname;
const PROJECTS_DIR = path.resolve(__dirname, "..", "docs", "projects");
const AUTO_CACHE_DIR = path.resolve(__dirname, "..", "docs", ".vitepress", "cache", "auto-projects");
const PROJECTS_MD = path.resolve(__dirname, "..", "docs", "projects.md");

config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_USER = "JDLanyon";

// Repositories to always skip during auto-discovery, even if no curated page exists.
const IGNORED_REPOSITORIES = new Set([
  "FunctionalStorage",
  "JDLanyon",
  "IGB200",
  "Mates-Rates-Rent-a-Car",
  "playtime-tracker",
  "SadDiscordBot" // GitHub repo name (github.com/JDLanyon/SadDiscordBot)
]);

// Phase 0: Read existing state

const { curated, autoSlugs: prevAutoSlugs } = parseCuratedFromProjectsMd(PROJECTS_MD);
const curatedSlugs = new Set(curated.map(c => c.slug));

// Build a set of slugs that already have a file in docs/projects/,
// plus the repo URLs they reference, so auto-discovery doesn't
// re-generate pages for repos that already have a hand-written page.
const existingProjectSlugs = new Set();
const coveredRepoUrls = new Set();

for (const f of fs.readdirSync(PROJECTS_DIR)) {
  if (f.endsWith(".md") && f !== "index.md") {
    const slug = f.replace(/\.md$/, "");
    existingProjectSlugs.add(slug);

    const filePath = path.join(PROJECTS_DIR, f);
    const raw = fs.readFileSync(filePath, "utf-8");
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      for (const line of fmMatch[1].split("\n")) {
        const kv = line.match(/^repo:\s*(.+)/);
        if (kv) {
          const repoUrl = kv[1].trim().replace(/^["']|["']$/g, "");
          coveredRepoUrls.add(repoUrl);
        }
      }
    }
  }
}

fs.mkdirSync(PROJECTS_DIR, { recursive: true });

//Phase 1: Fetch all repos from GitHub (used for auto-discovery)

const repos = await fetchUserRepos(GITHUB_TOKEN, GITHUB_USER);

//Phase 2: Curated - verify files exist, inject date into frontmatter

for (const { slug } of curated) {
  const outPath = path.join(PROJECTS_DIR, `${slug}.md`);

  if (fs.existsSync(outPath)) {
    let content = fs.readFileSync(outPath, "utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let repoUrl = null;
    if (fmMatch) {
      for (const line of fmMatch[1].split("\n")) {
        const kv = line.match(/^repo:\s*(.+)/);
        if (kv) repoUrl = kv[1].trim().replace(/^["']|["']$/g, "");
      }
    }

    if (repoUrl) {
      const date = await fetchLatestCommitDate(GITHUB_TOKEN, repoUrl);
      if (date) {
        if (fmMatch) {
          if (fmMatch[1].includes("date:")) {
            content = content.replace(/^date:.*$/m, `date: "${date}"`);
          } else {
            content = content.replace(/^(title:.*)$/m, `$1\ndate: "${date}"`);
          }
          fs.writeFileSync(outPath, content, "utf-8");
        }
      }
      console.log(`   ✓ ${slug}${date ? ` (${date})` : ""} (local markdown)`);
    } else {
      console.log(`   ✓ ${slug} (local markdown, no repo in frontmatter)`);
    }
  } else {
    const r = await writeProject({
      slug, title: slug, description: "", repo: null,
      tags: [], url: null, embed_ids: [], isAuto: false, date: null,
      projectsDir: PROJECTS_DIR, autoCacheDir: AUTO_CACHE_DIR
    });
    console.log(`  ${r.log}`);
  }
}

//Phase 3: Auto-discover - only for repos without an existing curated page

fs.mkdirSync(AUTO_CACHE_DIR, { recursive: true });
fs.readdirSync(AUTO_CACHE_DIR).forEach(f => {
  if (f.endsWith(".md")) fs.unlinkSync(path.join(AUTO_CACHE_DIR, f));
});

const autoResults = [];

// Seed with previously-discovered slugs from "Automatically Fetched" section,
// so they persist across rebuilds. Filter out any now in IGNORED_REPOSITORIES.
// Match ignored repos against the cached slug in several normalised forms:
// slugFromRepoName() collapses "SadDiscordBot" -> "saddiscordbot", but the
// cached slug may be the hyphenated "sad-discord-bot", so include both.
const toWords = s => s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join("-");
const ignoredSlugs = new Set();
for (const name of IGNORED_REPOSITORIES) {
  ignoredSlugs.add(slugFromRepoName(name));
  ignoredSlugs.add(toWords(name));
}
const autoSlugsSet = new Set();
for (const slug of prevAutoSlugs) {
  if (!ignoredSlugs.has(slug)) {
    autoSlugsSet.add(slug);
    autoResults.push({ slug });
  }
}

for (const repo of repos) {
  const slug = slugFromRepoName(repo.name);

  if (curatedSlugs.has(slug)) continue;
  if (coveredRepoUrls.has(repo.html_url)) continue;
  if (existingProjectSlugs.has(slug)) continue;
  if (IGNORED_REPOSITORIES.has(repo.name)) continue;
  if (repo.archived || repo.fork) continue;
  if (autoSlugsSet.has(slug)) continue;

  const tags = repo.language ? [repo.language] : [];
  const ghDesc = (repo.description || "").trim();
  const description = ghDesc.length > 0 ? ghDesc : "";
  const title = titleFromRepoName(repo.name);
  const date = await fetchLatestCommitDate(GITHUB_TOKEN, repo.html_url);

  const r = await writeProject({
    slug, title, description, repo: repo.html_url,
    tags, url: null, embed_ids: [], isAuto: true, date,
    projectsDir: PROJECTS_DIR, autoCacheDir: AUTO_CACHE_DIR
  });
  autoResults.push(r);
}

//Phase 4: Promote auto files for VitePress routing

const autoSlugs = autoResults.map(r => r.slug);
promoteAutoFiles(autoSlugs, AUTO_CACHE_DIR, PROJECTS_DIR);

//Phase 5: Generate projects.md catalogue

generateProjectsPage(PROJECTS_MD, curated, autoSlugs);

//Phase 6: Summary & persist slug list for cleanup

console.log(`\nDone: ${curated.length} curated, ${autoResults.length} auto-discovered`);
fs.writeFileSync(path.join(AUTO_CACHE_DIR, ".auto-slugs.json"), JSON.stringify(autoSlugs, null, 2));
