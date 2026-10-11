// lotus-adapter.ts
//
// Maps the lotus-library's framework-agnostic adapter onto VitePress:
//   - Link  -> VitePress-routed <a> (SPA navigation via the VitePress router)
//   - Image -> native <img>
//   - usePathname -> VitePress route path
//   - useRouter   -> VitePress router, exposed as the library's
//                    { push, back, refresh } navigation surface so components
//                    like Modal/ProjectModal can dismiss themselves.
//
// This is the ONE linking mechanism the README documents for Vue hosts
// (provideLotusAdapter / createLotusAdapter). No local link shims elsewhere.

import { defineComponent, h, type PropType } from 'vue'
import { useRoute, useRouter as useVitePressRouter } from 'vitepress'
import { createLotusAdapter, type VueLotusAdapter } from '@jdlanyon/lotus-library/vue'

// Match VitePress' own behaviour: external / protocol / mailto / tel links open
// normally; everything else is an internal route handled by the router.
function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}

const LotusRouterLink = defineComponent({
  name: 'LotusRouterLink',
  inheritAttrs: false,
  props: {
    href: { type: String, required: true },
    target: { type: String as PropType<string | undefined>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const router = useVitePressRouter()

    function onClick(event: MouseEvent) {
      // Respect modifier-click / middle-click / target=_blank (browser handles these).
      if (
        props.target === '_blank' ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return
      }
      if (isExternal(props.href) || props.href.startsWith('#')) return
      event.preventDefault()
      router.go(props.href)
    }

    return () =>
      h(
        'a',
        { href: props.href, target: props.target, onClick, ...attrs },
        slots.default ? slots.default() : [],
      )
  },
})

export const lotusAdapter: Partial<VueLotusAdapter> = {
  Link: LotusRouterLink,
  usePathname: () => useRoute().path,
  useRouter: () => {
    const router = useVitePressRouter()
    return {
      push: (href: string) => router.go(href),
      back: () => {
        if (typeof window !== 'undefined') window.history.back()
      },
      refresh: () => router.go(router.route.path),
    }
  },
}

// Vue plugin form: app.use(lotusAdapterPlugin)
export const lotusAdapterPlugin = createLotusAdapter(lotusAdapter)
