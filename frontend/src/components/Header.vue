<script setup lang="ts">
import { useMode } from '@/composables/useMode';
import { Mode } from '@/types/mode';
import { Gamepad2, Code } from 'lucide-vue-next'
// import { useRoute } from 'vue-router'
const { mode, setMode } = useMode()
</script>
<template>
  <header class="flex justify-between items-center mb-16">
    <h1
      :class="[
        'text-2xl font-medium transition-colors',
        mode === Mode.Developer ? 'font-serif' : 'font-mono',
      ]"
    >
      {{ mode === Mode.Developer ? 'Nguyen Thinh' : 'Pancakes' }}
    </h1>

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
          mode === Mode.Developer
            ? 'bg-gray-200'
            : 'bg-purple-900',
        ]"
        :aria-label="`Switch to ${mode === Mode.Developer ? 'gamer' : 'developer'} mode`"
      >
        <Code v-if="mode === Mode.Developer" :size="20" />
        <Gamepad2 v-else :size="20" />
      </button>
    </div>
  </header>
</template>
