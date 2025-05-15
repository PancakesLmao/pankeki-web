<script setup lang="ts">
import { inject } from 'vue'

// Inject mode from parent
const { mode } = inject('mode')
</script>

<template>
  <footer
    :class="[
      'pt-8 border-t text-center transition-colors',
      mode === 'developer' ? 'border-gray-200 text-gray-500' : 'border-gray-700 text-gray-400'
    ]"
  >
    <p class="text-sm">
      © {{ new Date().getFullYear() }} {{ mode === 'developer' ? 'PancakesLmao' : 'PancakesLmao' }}. All rights reserved.
    </p>
    <!-- <p class="text-xs mt-2">
      {{ mode === 'developer' ? 'Crafted with precision and care.' : 'May your games be lag-free and your drops legendary.' }}
    </p> -->
  </footer>
</template>
