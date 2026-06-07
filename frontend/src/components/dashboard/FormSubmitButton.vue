<script setup lang="ts">
import { useMode } from '@/composables/useMode'

interface Props {
  loading?: boolean
  label: string
  loadingLabel?: string
  type?: 'submit' | 'button'
}

withDefaults(defineProps<Props>(), {
  loading: false,
  loadingLabel: 'Loading...',
  type: 'submit',
})

const { mode } = useMode()
</script>

<template>
  <button
    :type="type"
    :disabled="loading"
    :class="[
      'relative px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 overflow-hidden',
      mode === 'developer'
        ? 'bg-gray-800 text-white hover:bg-gray-900'
        : 'bg-purple-500 text-purple-100 hover:bg-purple-600',
    ]"
  >
    <span class="flex items-center gap-2">
      <!-- Spinner icon shown while loading -->
      <svg
        v-if="loading"
        class="btn-spinner"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle class="btn-spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
        <path
          class="btn-spinner__arc"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {{ loading ? loadingLabel : label }}
    </span>

    <!-- Shimmer sweep overlay while loading -->
    <span v-if="loading" class="btn-shimmer" aria-hidden="true" />
  </button>
</template>

<style scoped>
/* Spinner */
.btn-spinner {
  width: 1rem;
  height: 1rem;
  animation: btn-spin 0.75s linear infinite;
  flex-shrink: 0;
}

.btn-spinner__track {
  opacity: 0.25;
}

.btn-spinner__arc {
  opacity: 0.85;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Shimmer sweep */
.btn-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transform: translateX(-100%);
  animation: btn-shimmer-sweep 1.2s linear infinite;
  pointer-events: none;
}

@keyframes btn-shimmer-sweep {
  100% {
    transform: translateX(100%);
  }
}
</style>
