<!-- Blog.vue
Displays the 3 most recent posts in a "Latest Posts" section, then groups
remaining posts into a nested directory tree derived from their URL folder
segments. Supports arbitrary nesting depth (h2 through h6).
-->
<template>
  <div class="blog-page">

    <!--  Latest Posts: LATEST_COUNT most recent  -->
    <section class="blog-section">
      <h2 id="latest-posts" tabindex="-1">
        Latest Posts
        <a class="header-anchor" href="#latest-posts" aria-label='Permalink to "Latest Posts"'>​</a>
      </h2>
      <div class="blog-post-list">
        <Card
          v-for="post in latestPosts"
          :key="post.url"
          :href="post.url"
          :title="post.frontmatter?.title || 'Untitled'"
          :date="post.frontmatter?.date ? formatDate(post.frontmatter.date) : undefined"
          :description="post.frontmatter?.description || undefined"
          :tags="post.frontmatter?.tags || undefined"
        />
      </div>
    </section>

    <!-- Recursive nested tree for remaining (older) posts  -->
    <CategoryTree
      v-if="categoryTree.length > 0"
      :nodes="categoryTree"
      :depth="0"
    />

    <!--  Empty state  -->
    <p v-if="allPosts.length === 0" class="subtle">
      No posts yet, but they're coming soon trust
    </p>
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error - VitePress injects the `data` named export at build time
import { data as allPosts } from './blog.data'
// @ts-ignore - duplicates across <script> blocks; Vue separates them at build time
import type { PostData } from './blog.data'
import { computed } from 'vue'

// How many posts to show in the "Latest Posts" section.
const LATEST_COUNT = 3

// Types

interface TreeNode {
  // Display name (folder segment or post title).
  name: string
  // Dot-delimited path used for slug generation (e.g. "webdev.css").
  key: string
  // Posts attached directly at this node (leaf or mixed branch).
  posts: PostData[]
  // Child category nodes.
  children: TreeNode[]
}

// Helpers

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatDate(dateStr: string | Date): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}


// Computed state
// These reactive values are derived from the raw allPosts array
// and drive the two main sections of the blog page.

// The LATEST_COUNT most recent posts (already sorted by date in blog.data).
const latestPosts = computed(() => allPosts.slice(0, LATEST_COUNT))

//  Nested category tree

// Walk the remaining posts (after LATEST_COUNT) and build a nested tree
//  where each level corresponds to a folder-segment in the post URL.
//  /blog/webdev/css/grid_layouts: segments: ["webdev", "css"]
//  /blog/hello-world: segments: [] -> ["General"]
const categoryTree = computed(() => {
  const remaining = allPosts.slice(LATEST_COUNT)
  const root: TreeNode[] = []

  for (const post of remaining) {
    const segments = post.segments.length > 0 ? post.segments : ['General']
    let level = root
    let key = ''

    // Walk (or create) the folder path
    for (const seg of segments) {
      key = key ? `${key}.${seg}` : seg
      let node = level.find((n) => n.name === seg)
      if (!node) {
        node = { name: seg, key, posts: [], children: [] }
        level.push(node)
      }
      level = node.children
    }

    // Leaf node representing the post itself
    level.push({
      name: post.frontmatter?.title || 'Untitled',
      key: `${key}.${slugify(post.frontmatter?.title || 'untitled')}`,
      posts: [post],
      children: [],
    })
  }

  // Recursively sort sibling nodes - folders first (alphabetically),
  // then leaf posts (alphabetically).
  function sortTree(nodes: TreeNode[]) {
    // Folders (has children) sort before leaves (no children)
    nodes.sort((a, b) => {
      // If one is a leaf and the other is a folder
      const aLeaf = a.children.length === 0
      const bLeaf = b.children.length === 0
      if (aLeaf !== bLeaf) return aLeaf ? -1 : 1  // leaves first
      return a.name.localeCompare(b.name)         // then alphabetical
    })
    for (const n of nodes) sortTree(n.children)
  }
  sortTree(root)

  return root
})
</script>

<script lang="ts">
// CategoryTree Component - Render-Function (JSX-free)

// This is a separate <script lang="ts"> block (Vue 3 supports
// multiple script blocks). It defines ONLY the CategoryTree
// component, which renders the nested category hierarchy using
// raw render functions (h() calls) rather than templates.

// @ts-nocheck
import { defineComponent, h, type VNode } from 'vue'
import { Card } from '@jdlanyon/lotus-library/vue'
// @ts-ignore
import type { PostData } from './blog.data'

// A single node in the category tree.
interface TreeNode {
  name: string           // Display name (folder segment or post title)
  key: string            // Dot-delimited path for slug generation (e.g. "webdev.css")
  posts: PostData[]      // Posts attached directly at this node
  children: TreeNode[]   // Sub-categories (child nodes)
}

// Convert a text string to a URL-safe slug.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-|-$/g, '') // Strip leading/trailing hyphens
}

// Format a date as e.g. "5 April 2025".
function formatDate(dateStr: string | Date): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Heading-level progression: depth=0 → h2, depth=1 → h3, ... depth=4 → h6.
// Once we reach h6 we stay there (clamp via Math.min).
const HEADING_TAGS = ['h2', 'h3', 'h4', 'h5', 'h6'] as const

// renderPost - creates a VNode tree for a single PostData object, using the library Card
function renderPost(post: PostData): VNode {
  // Vue's hyperscript - creates virtual DOM nodes
  return h(Card as any, {
    href: post.url,
    title: post.frontmatter?.title || 'Untitled',
    date: post.frontmatter?.date ? formatDate(post.frontmatter.date) : undefined,
    description: post.frontmatter?.description || undefined,
    tags: post.frontmatter?.tags || undefined,
  })
}

// CategoryTree - recursive render-function component

// Props:
//   nodes : TreeNode[]   - sibling nodes at the current depth
//   depth : number       - current nesting level (0 = root)

// The render function loops over each node and decides:
//   - If it's a **leaf** (has posts, no children), render the post directly.
//   - Otherwise, render a <section> containing:
//       1. A heading (h2..h6 depending on depth) with an anchor link
//       2. A list of any posts attached to this node
//       3. A recursive <CategoryTree> for any sub-categories
export const CategoryTree = defineComponent({
  name: 'CategoryTree',
  props: {
    nodes: { type: Array as () => TreeNode[], required: true },
    depth: { type: Number, default: 0 },
  },
  setup(props) {
    // Return a render function (no reactivity needed – props are already reactive)
    return () => {
      // Pick the correct heading tag for this depth level (clamped to h6)
      const headingTag = HEADING_TAGS[Math.min(props.depth, HEADING_TAGS.length - 1)]
      const children: VNode[] = []

      for (const node of props.nodes) {
        // Case: Leaf node (a single post, no sub-categories)
        // Render the post directly; the parent <div class="blog-post-list">
        // provides flex gap spacing between siblings.
        if (node.posts.length > 0 && node.children.length === 0) {
          children.push(renderPost(node.posts[0]))
          continue
        }

        // Case: Branch node (category with or without direct posts)
        const slug = slugify(node.key)
        const sectionChildren: VNode[] = [
          // Heading & header-anchor for permalink
          h(headingTag, { id: slug, tabindex: '-1' }, [
            node.name,
            h(
              'a',
              {
                class: 'header-anchor',
                href: `#${slug}`,
                'aria-label': `Permalink to "${node.name}"`,
              },
              '\u200B', // Zero-width space so the link has content
            ),
          ]),
        ]

        // Direct posts under this category (if any)
        if (node.posts.length > 0) {
          sectionChildren.push(
            h('div', { class: 'blog-post-list' }, node.posts.map(renderPost)),
          )
        }

        // Recursively render child categories (deeper heading level)
        if (node.children.length > 0) {
          sectionChildren.push(
            h(CategoryTree, { nodes: node.children, depth: props.depth + 1 }),
          )
        }

        children.push(h('section', { class: 'blog-section' }, sectionChildren))
      }

      return h('div', { class: 'blog-post-list' }, children)
    }
  },
})
</script>

<style scoped>
.blog-section {
  margin-bottom: 2.5rem;
}
.blog-section :deep(h2),
.blog-section :deep(h3),
.blog-section :deep(h4),
.blog-section :deep(h5),
.blog-section :deep(h6) {
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
}
.blog-post-list {
  display: flex;
  flex-direction: column;
  margin: 0;
}
</style>
