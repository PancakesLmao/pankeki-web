<script lang="ts" setup>
import { useMode } from '@/composables/useMode';
defineProps({
  title: String
})

const { mode } = useMode()

const scrollToSection = (e: Event) => {
  const target = (e.currentTarget as HTMLElement).closest('section');
  if (target) {
    const rect = target.getBoundingClientRect();
    window.scrollBy({
      top: rect.top - 84, // 64px (header) + 20px (breathing room)
      behavior: 'smooth'
    });
  }
}
</script>
<template>
  <div 
    class="sticky top-16 z-40 py-4 mb-8 -mx-4 px-4 transition-colors duration-500"
    :class="mode === 'developer' ? 'bg-gray-50/95 backdrop-blur-md' : 'bg-gray-900/95 backdrop-blur-md'"
  >
    <button
      @click="scrollToSection"
      :class="[
        'inline-block px-4 py-1 rounded-full text-md font-medium transition-colors cursor-pointer border-none',
        mode === 'developer' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-purple-900 text-purple-100 hover:bg-purple-800'
      ]"
    >
      {{ title }}
    </button>
  </div>
</template>
