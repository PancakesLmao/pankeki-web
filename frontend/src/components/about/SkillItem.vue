<script lang="ts" setup>
defineProps({
  text: String,
  icon: Object,
  isGamerMode: Boolean,
})
</script>

<template>
  <li class="mb-2">
    <div
      :class="[
        'skill-card p-3 rounded-lg border transition-all hover:translate-x-1',
        isGamerMode
          ? 'bg-gray-800 border-purple-500 text-purple-100'
          : 'bg-white border-gray-200 text-gray-700'
      ]"
    >
      <div class="flex items-center gap-2">
        <component
          v-if="icon && icon.component"
          :is="icon.component"
          :size="18"
          :class="isGamerMode ? 'text-purple-400' : 'text-gray-500'"
        />
        <span>{{ text }}</span>
      </div>
    </div>
  </li>
</template>
