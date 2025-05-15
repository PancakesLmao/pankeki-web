<script lang="ts" setup>
import { inject } from 'vue'

defineProps({
  title: String
})

// Inject mode from parent
const { mode } = inject('mode')
</script>
<template>
  <div
    :class="[
      'mb-12 inline-block px-4 py-1 rounded-full text-sm font-medium transition-colors',
      mode === 'developer' ? 'bg-gray-200 text-gray-700' : 'bg-purple-900 text-purple-100'
    ]"
  >
    {{ title }}
  </div>
</template>

