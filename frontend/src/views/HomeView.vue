<script setup lang="ts">
import { useMode } from '@/composables/useMode'
import Hero from '@/components/Hero.vue';
import About from '@/components/about/About.vue';
import Certifications from '@/components/Certifications.vue';
import Experience from '@/components/Experience.vue';
import Project from '@/components/projects/Project.vue';
import Contact from '@/components/contact/Contact.vue';
import BottomButton from '@/components/BottomButton.vue';
import MusicSection from '@/components/music/MusicSection.vue';

const { mode } = useMode()
</script>

<template>
  <main>
    <Hero></Hero>
    <About></About>
    <Certifications></Certifications>
    <Experience></Experience>
    <Project></Project>
    <!-- Music section: only visible in gamer mode -->
    <MusicSection v-if="mode !== 'developer'" />
    <Contact></Contact>
    <BottomButton></BottomButton>
  </main>
</template>
