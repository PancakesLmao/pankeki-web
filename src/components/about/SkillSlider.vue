<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Javascript from '../icons/Javascript.vue'
import Typescript from '../icons/Typescript.vue'
import Vite from '../icons/Vite.vue'
import Tailwind from '../icons/Tailwind.vue'
import React from '../icons/React.vue'
import Vue from '../icons/Vue.vue'
import Nextjs from '../icons/Nextjs.vue'
import Kotlin from '../icons/Kotlin.vue'
import Git from '../icons/Git.vue'
import Github from '../icons/Github.vue'
import Docker from '../icons/Docker.vue'
import AWS from '../icons/AWS.vue'
import Raspberry from '../icons/Raspberry.vue'
import Arduino from '../icons/Arduino.vue'
import Linux from '../icons/Linux.vue'
import Postgresql from '../icons/Postgresql.vue'
import Mongodb from '../icons/Mongodb.vue'

import { useMode } from '@/composables/useMode'
const { mode } = useMode()

const sliderRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (sliderRef.value) {
    sliderRef.value.style.animation = 'none'
    // Force reflow
    void sliderRef.value.offsetWidth
    sliderRef.value.style.animation = ''
  }
})
</script>

<style scoped>
@keyframes slide {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0%);
  }
}

.skills-slider {
  display: flex;
  animation: slide 30s linear infinite;
  width: fit-content;
}

</style>

<template>
  <div class="mt-16 overflow-hidden">
    <div
      class="relative py-6 before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 before:bg-gradient-to-r after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 after:bg-gradient-to-l"
      :class="[
        mode === 'developer'
          ? 'before:from-gray-50 before:to-transparent after:from-gray-50 after:to-transparent'
          : 'before:from-gray-800 before:to-transparent after:from-gray-800 after:to-transparent',
      ]"
    >
      <div class="skills-slider" ref="sliderRef">
        <div v-for="setIndex in 2" :key="setIndex" class="flex items-center gap-16 px-8">
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Git :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Github :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Docker :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Javascript :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Typescript :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Tailwind :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Vite :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <React :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Vue :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Nextjs :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Kotlin :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Postgresql :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Mongodb :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Arduino :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Raspberry :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <Linux :size="50" />
          </div>
          <div class="transform transition-transform duration-300 hover:scale-125">
            <AWS :size="50" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
