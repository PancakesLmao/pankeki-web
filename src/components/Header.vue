<script setup lang="ts">
import { inject } from 'vue'
import { Gamepad2, Code } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
// Inject mode and setMode from parent
const { mode, setMode } = inject<{ mode: string; setMode: (newMode: string) => void }>('mode')!
</script>
<template>
  <header class="flex justify-between items-center mb-16">
    <h1
      :class="[
        'text-2xl font-medium transition-colors',
        mode === 'developer' ? 'font-serif' : 'font-mono',
      ]"
    >
      {{ mode === 'developer' ? 'Nguyen Thinh' : 'Pancakes' }}
    </h1>

    <div class="flex items-center gap-3">
      <span
        :class="[
          'text-sm transition-colors',
          mode === 'developer' ? 'text-gray-600' : 'text-purple-400',
        ]"
      >
        <!-- {{ mode === 'developer' ? 'Developer' : 'Gamer' }} -->
      </span>
      <button
        @click="setMode(mode === 'developer' ? 'gamer' : 'developer')"
        :class="[
          'p-2 rounded-full transition-colors',
          mode === 'developer'
            ? 'bg-gray-200'
            : 'bg-purple-900',
        ]"
        :aria-label="`Switch to ${mode === 'developer' ? 'gamer' : 'developer'} mode`"
      >
        <Code v-if="mode === 'developer'" :size="20" />
        <Gamepad2 v-else :size="20" />
      </button>
    </div>
  </header>
</template>
