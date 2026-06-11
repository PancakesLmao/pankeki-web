<script lang="ts" setup>
import { computed } from 'vue'
import { useMode } from '@/composables/useMode'
import type { SectionId } from '@/composables/useStickySection'

const props = defineProps<{
  activeSection: SectionId | null
}>()

const { mode } = useMode()

const LABELS: Record<'developer' | 'gamer', Record<SectionId, string>> = {
  developer: {
    about: 'About',
    certifications: 'Certifications',
    experience: 'Work Experience',
    projects: 'Projects',
    music: '',
    contact: 'Contact',
  },
  gamer: {
    about: 'About',
    certifications: 'Certifications',
    experience: 'Work Experience',
    projects: 'Games',
    music: 'Playlist',
    contact: 'Connect',
  },
}

const label = computed(() => {
  if (!props.activeSection) return null
  const map = mode.value === 'gamer' ? LABELS.gamer : LABELS.developer
  return map[props.activeSection] ?? null
})

const scrollTo = () => {
  if (!props.activeSection) return
  document.getElementById(props.activeSection)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <!--
    Fixed bar spans full width at top of viewport.
    Inner content-column mirrors App.vue's max-w-5xl mx-auto px-4
    so the pill aligns with the left edge of page content.
  -->
  <div class="fixed-bar" :class="{ 'is-visible': !!label }">
    <div class="content-column">
      <Transition name="label-swap" mode="out-in">
        <button
          v-if="label"
          :key="activeSection"
          @click="scrollTo"
          :aria-label="`Jump to ${label} section`"
          :class="[
            'sticky-pill',
            mode === 'developer'
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-transparent text-purple-200 hover:text-white border border-purple-800/30 backdrop-blur-sm',
          ]"
        >
          {{ label }}
        </button>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* Fixed to viewport — always at the top, never in the layout flow */
.fixed-bar {
  position: fixed;
  top: 1rem;
  left: 0;
  right: 0;
  z-index: 40;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.fixed-bar.is-visible {
  opacity: 1;
}

/* Mirrors App.vue's max-w-5xl mx-auto px-4 */
.content-column {
  max-width: 64rem;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Pill matches SectionTitle: px-4 py-1 rounded-full font-medium */
.sticky-pill {
  pointer-events: auto;
  display: inline-block;
  padding: 0.25rem 1rem;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  user-select: none;
}

.sticky-pill:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Text cross-fade only — no positional movement */
.label-swap-enter-active,
.label-swap-leave-active {
  transition: opacity 0.1s ease;
}

.label-swap-enter-from,
.label-swap-leave-to {
  opacity: 0;
}
</style>
