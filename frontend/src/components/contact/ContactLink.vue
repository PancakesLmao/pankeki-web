<script lang="ts" setup>
import { useMode } from '@/composables/useMode'

defineProps({
  href: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    required: true
  },
  text: {
    type: String,
    required: true
  }
})

const { mode } = useMode()
</script>
<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-center gap-3 transition-colors"
    :class="
      mode === 'developer'
        ? 'text-gray-700 hover:text-gray-900'
        : 'text-purple-300 hover:text-purple-100'
    "
  >
    <component :is="icon.component" :size="icon.size" />
    <span>{{ text }}</span>
  </a>
</template>
