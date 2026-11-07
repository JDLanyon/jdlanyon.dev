<!-- ColourSwatch.vue
A backticked hex code (`#e8cb91`) rendered inline as a colour token. Clicking
copies the hex to the clipboard and confirms it with a "Copied!" tooltip.

The tooltip is click-only: the library Tooltip reveals on :hover and
:focus-within, so wrapping the token in one would show a tooltip on hover. This
component instead renders the Tooltip's own text element (.lotus-tooltip-text,
so it inherits the library look) and gates its visibility on `copied`. It always
reads "Copied!" rather than the hex, which would be unreadable on top of a token
of that very colour.

The hex text and its background are one element, so the hover popout translates
them together.
-->
<template>
  <button
    type="button"
    class="vp-colour"
    :class="[className, { 'is-copied': copied }]"
    :style="style"
    :aria-label="`Copy colour ${hex}`"
    @click="copy"
  >
    {{ hex }}
    <!-- Same markup the library Tooltip renders, so it inherits that styling;
         only the reveal trigger differs (click, not hover). Kept on one line so
         Vue's whitespace condensing cannot drop the interpolation. -->
    <span class="lotus-tooltip-text vp-colour__tip" role="status" aria-live="polite">{{ tip }}</span>
  </button>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** The hex code as authored, e.g. `#e8cb91` (copied verbatim). */
    hex: string
    /** Variant classes contributed by the markdown plugin. */
    className?: string
    /** Precomputed colour for the token (inline hex styles). */
    style?: string
  }>(),
  { className: '', style: '' },
)

// How long the "Copied!" confirmation stays up after a click.
const CONFIRM_MS = 1200

const copied = ref(false)
const tip = ref('')
let resetTimer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  // Clipboard API is unavailable on insecure origins; the fallback keeps the
  // token useful on plain-http previews.
  try {
    await navigator.clipboard.writeText(props.hex)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = props.hex
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  tip.value = 'Copied!'
  copied.value = true
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    copied.value = false
  }, CONFIRM_MS)
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>


