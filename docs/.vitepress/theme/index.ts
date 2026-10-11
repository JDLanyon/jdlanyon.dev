import './custom.css'
import '@jdlanyon/lotus-library/style.css'

import DefaultTheme from 'vitepress/theme'

// Custom layout wrapper - adds BackToTop button before footer
import CustomLayout from './Layout.vue'

// VitePress adapter for the library's link/image/router surface.
import { lotusAdapterPlugin } from './lotus-adapter'

// --- Provided by @jdlanyon/lotus-library (Vue) -----------------------------
import {
  Button,
  Card,
  CardGrid,
  Panel,
  PanelGrid,
  Tags,
  TypeWriter,
  Embed,
  Tooltip,
  Glitch,
  GlitchLink,
  GlitchText,
  GlitchImage,
  Modal,
  ProjectModal,
  Nav,
  Footer,
} from '@jdlanyon/lotus-library/vue'

// --- Local components (project/blog-specific, no library equivalent) --------
import Blog from './components/Blog.vue'
import ProjectFullPage from './components/ProjectFullPage.vue'
import YouTubeEmbeds from './components/YouTubeEmbeds.vue'

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,

  enhanceApp({ app }) {
    // Wire the VitePress router/image adapter so library components navigate
    // through VitePress (SPA) and modal components can dismiss themselves.
    app.use(lotusAdapterPlugin)

    // Library components - registered under their bare names. The <Button>
    // SSR self-recursion (resolveDynamicComponent('button') matching a global
    // `Button`) is fixed in 0.1.7, so the bare name is safe again.
    app.component('Button', Button)
    app.component('Card', Card)
    app.component('CardGrid', CardGrid)
    app.component('Panel', Panel)
    app.component('PanelGrid', PanelGrid)
    app.component('Tags', Tags)
    app.component('TypeWriter', TypeWriter)
    app.component('Embed', Embed)
    app.component('Tooltip', Tooltip)
    app.component('Glitch', Glitch)
    app.component('GlitchLink', GlitchLink)
    app.component('GlitchText', GlitchText)
    app.component('GlitchImage', GlitchImage)
    app.component('Modal', Modal)
    app.component('ProjectModal', ProjectModal)
    app.component('Nav', Nav)
    app.component('Footer', Footer)

    // Local components
    app.component('Blog', Blog)
    app.component('ProjectFullPage', ProjectFullPage)
    app.component('YouTubeEmbeds', YouTubeEmbeds)
  },
}
