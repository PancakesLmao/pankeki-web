<script setup lang="ts">
import { useMode } from '@/composables/useMode'
import { Mode } from '@/types/mode'
import { RouterLink } from 'vue-router'
import { Gamepad2, Code } from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'

const { mode, setMode } = useMode()
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
<template>
  <header 
    class="sticky top-0 z-50 flex justify-between items-center h-16 mb-12 -mx-4 px-4 transition-all duration-300"
    :class="[
      isScrolled
        ? (mode === Mode.Developer 
            ? 'bg-gray-50/95 backdrop-blur-md border-b border-gray-200/50' 
            : 'bg-gray-900/95 backdrop-blur-md border-b border-purple-900/50')
        : 'bg-transparent border-transparent'
    ]"
  >
    <RouterLink
      to="/"
      :class="[
        'text-2xl font-medium transition-colors hover:opacity-80 cursor-pointer',
        mode === Mode.Developer ? 'font-serif' : 'font-mono',
      ]"
    >
      {{ mode === Mode.Developer ? 'Nguyen Thinh' : 'Pankeki' }}
    </RouterLink>

    <div class="flex items-center gap-3">
      <span
        :class="[
          'text-sm transition-colors',
          mode === Mode.Developer ? 'text-gray-600' : 'text-purple-400',
        ]"
      >
        {{ mode === Mode.Developer ? 'Developer On' : 'Developer Off' }}
      </span>
      <button
        @click="setMode(mode === Mode.Developer ? 'gamer' : 'developer')"
        :class="[
          'p-2 rounded-full transition-colors',
          mode === Mode.Developer ? 'bg-gray-200' : 'bg-purple-900',
        ]"
        :aria-label="`Switch to ${mode === Mode.Developer ? 'gamer' : 'developer'} mode`"
      >
        <Code v-if="mode === Mode.Developer" :size="20" />
        <Gamepad2 v-else :size="20" />
      </button>
    </div>
  </header>
</template>
