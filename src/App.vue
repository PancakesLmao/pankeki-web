<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, provide } from 'vue';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

// Reactive mode state
const mode = ref('developer')
// Provide mode and setMode to child components
provide('mode', {
  mode,
  setMode: (newMode) => {
    mode.value = newMode
  }
})
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>
