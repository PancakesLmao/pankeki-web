<script setup lang="ts">
import Hero from '@/components/Hero.vue';
import About from '@/components/about/About.vue';
import Certifications from '@/components/Certifications.vue';
import Experience from '@/components/Experience.vue';
import Project from '@/components/projects/Project.vue';
import Contact from '@/components/contact/Contact.vue';
import BottomButton from '@/components/BottomButton.vue';
</script>

<template>
  <main>
    <Hero></Hero>
    <About></About>
    <Certifications></Certifications>
    <Experience></Experience>
    <Project></Project>
    <Contact></Contact>
    <BottomButton></BottomButton>
  </main>
</template>
