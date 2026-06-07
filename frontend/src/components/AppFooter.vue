<script setup lang="ts">
import { useMode } from '@/composables/useMode';

const { mode } = useMode()
</script>

<template>
  <footer
    :class="[
      'pt-8 border-t text-center transition-colors',
      mode === 'developer' ? 'border-gray-200 text-gray-500' : 'border-gray-700 text-gray-400'
    ]"
  >
    <p class="text-sm">
      © {{ new Date().getFullYear() }} {{ mode === 'developer' ? 'Nguyen Thinh' : 'PancakesLmao' }}.
    </p>
    <p class="text-xs mt-2">
      Code and design all rights reserved. Third-party assets belong to respective creators.
    </p>
  </footer>
</template>
