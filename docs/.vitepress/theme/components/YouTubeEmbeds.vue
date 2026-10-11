<!-- YouTubeEmbeds.vue
  Renders one library <Embed> per frontmatter `embed_ids` entry.

  Thin frontmatter-driven wrapper around @jdlanyon/lotus-library's <Embed>.

  NOTE: the library <Embed> hardcodes the youtube.com host and offers no
  nocookie / privacy option (issue JDLanyon/lotus-library#1). We use it as-is
  rather than working around it.
-->
<template>
  <Embed v-for="id in embedIds" :key="id" :uuid="id" />
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { Embed } from '@jdlanyon/lotus-library/vue'

const { frontmatter } = useData()
const embedIds = (frontmatter.value?.embed_ids || []) as string[]
</script>
