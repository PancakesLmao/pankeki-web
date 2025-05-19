<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMode } from '@/composables/useMode'
import { Mode } from '@/types/mode'
import { ArrowUp } from 'lucide-vue-next'

const { mode } = useMode()

const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  const contactSection = document.querySelector('#contact')
  if (!contactSection) {
    console.warn('Contact section (#contact) not found')
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible.value = entry.isIntersecting
      })
    },
    {
      threshold: 0.8, // Trigger only when the entire section is visible
    }
  )

  observer.observe(contactSection)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
button {
  opacity: 0.9;
}
button:hover {
  opacity: 1;
}
</style>

<template>
  <button
    v-if="isVisible"
    :class="['fixed bottom-6 right-6 p-4 text-white rounded-full shadow-lg transition-all duration-300', mode === Mode.Developer ? 'bg-gray-900' : 'bg-purple-900']"
    @click="scrollToTop"
    aria-label="Scroll to top"
  >
    <ArrowUp class="w-6 h-6" />
  </button>
</template>
