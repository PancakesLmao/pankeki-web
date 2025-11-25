<script lang="ts" setup>
import { useMode } from '@/composables/useMode';
defineProps({
  title: String
})

const { mode } = useMode()
</script>
<template>
  <div
    :class="[
      'mb-12 inline-block px-4 py-1 rounded-full text-md font-medium transition-colors',
      mode === 'developer' ? 'bg-gray-200 text-gray-700' : 'bg-purple-900 text-purple-100'
    ]"
  >
    {{ title }}
  </div>
</template>

