<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, provide } from 'vue';
import { ModeInjectionKey } from '@/types/mode'
import Header from './components/AppHeader.vue';
import Footer from './components/AppFooter.vue';

// Reactive mode state
const mode = ref('developer')
// Provide mode and setMode to child components
provide(ModeInjectionKey, {
  mode,
  setMode: (newMode: string) => {
    mode.value = newMode
  },
})
</script>

<template>
  <div
    :class="[
      'min-h-screen transition-colors duration-500',
      mode === 'developer'
        ? 'bg-gray-50 text-gray-900'
        : 'bg-gray-900 text-gray-50 bg-[url(\'/stars.png\')] bg-fixed'
    ]"
  >
    <div class="max-w-5xl mx-auto px-4 py-8">
      <Header></Header>
      <main class="mb-8">
        <RouterView />
      </main>
      <Footer></Footer>
    </div>
  </div>
</template>
