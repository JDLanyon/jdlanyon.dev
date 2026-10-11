---
layout: home
title: JDLanyon | Software Engineer
---

<script setup>
import { ref } from 'vue'
import ContactContent from './contact.md'

const lotusSrc = '/lotus.svg'
const showContact = ref(false)
</script>

<div class="home-hero" id="hero">

<div class="hero-lotus">
  <GlitchImage :duration="300" :delay="3000" :variance="2000" :intensity="1.5">
    <img :src="lotusSrc" alt="lotus" class="lotus-hero-img" />
  </GlitchImage>
</div>

<div>
  <h1 class="hero-name">Jackson Lanyon</h1>
  <h2 class="hero-subtitle">Full-Stack Software Engineer</h2>
</div>

<p>
  <TypeWriter :headings="[
    'Python, C#, React and coding clean systems that scale with creative purpose',
    'React frontend with a designer\'s perspective',
    'Python automation that saves teams hours every week',
    'C# data pipelines and backend tooling',
    'Motion graphics and Visual Effects for software products',
    'Self-Hosted infrastructure on Debian Linux',
    'Full-stack development with TypeScript and Node.js',
    'CI/CD pipelines with GitHub Actions and systemd',
    'Developer tooling that accelerates workflows',
    'Automation-first engineering with a creative edge',
    'Creative technology at the intersection of art and code'
  ]" />
</p>

<div class="home-actions">
  <Button @click="showContact = true">Contact</Button>
  <Button href="/projects">View Projects</Button>
  <Button href="/blog/">Read Blog</Button>
</div>

<Modal :open="showContact" @close="showContact = false">
  <template #header-actions-left>
    <span class="modal-title">Contact</span>
  </template>
  <template #header-actions-right>
    <GlitchLink href="/contact">Open full page</GlitchLink>
  </template>
  <template #signature>
    Static site, no server required!
  </template>
  <ContactContent class="vp-doc" />
</Modal>

<!-- TODO: Contact (email, linkedin, GitHub, etc) -->

<p class="hero-intro">Thank you for visiting my portfolio! If you find the time, please feel free to check out my <GlitchLink href="https://sausytime.com" target="_blank" text="Design Portfolio" /> :&gt;</p>

<a href="#about" class="btn-primary btn-scroll">
  <span class="btn-scroll-label">About me</span>
  <br>
  <span class="btn-scroll-arrow">&darr;</span>
</a>

</div>

<div class="about-section" id="about">

<!-- @include: ./about.md -->

</div>


