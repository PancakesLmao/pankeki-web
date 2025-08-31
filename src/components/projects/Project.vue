<script setup lang="ts">
defineOptions({ name: 'ProjectSection' })
import { useMode } from '@/composables/useMode'
import SectionTitle from '../SectionTitle.vue'
import ProjectCard from './ProjectCard.vue'
import GameSlider from './GameSlider.vue'

const { mode } = useMode()

const developerProjects = [
  {
    title: 'Weather Platform',
    description: 'Centralized IoT platform that build specifically for weather stations',
    tags: ['Nextjs', 'Typescript', 'Tailwind', 'Shadcn', 'AWS'],
    link: 'https://github.com/Itea-Lab/Weather-Platform'
  },
  {
    title: 'Astral Nexus',
    description: 'A platform for sharing game contents',
    tags: ['Vuejs', 'Typescript', 'Tailwind', 'Elysia', 'PosgreSQL', 'Docker'],
    link: 'https://github.com/PancakesLmao/Astral-Nexus'
  },
  {
    title: 'Weather Edge Station',
    description: 'Weather station runs IoT devices to collect data from a weather station',
    tags: ['ESP32', 'Raspberry Pi', 'Docker', 'InfluxDB'],
    link: 'https://github.com/Itea-Lab/Weather-Edge'
  },
  {
    title: 'Weather Dashboard',
    description: 'A rework version from AIoT Akathon 2024 project. A simple dashboard that visualize data from the weather edge station',
    tags: ['Nextjs', 'Typescript', 'Tailwind'],
    link: 'https://github.com/Itea-Lab/Weather-Dashboard'
  },
  {
    title: 'The Relaxing Koala',
    description: 'A Restaurant Information System builded to optimize the new workflow of the rerstaurant',
    tags: ['React', 'Javascript', 'Tailwind', 'FastAPI', 'SQLite'],
    link: 'https://github.com/PancakesLmao/The-Relaxing-Koala-RIS'
  }
]
</script>

<template>
  <section class="mb-24" id="projects">
    <SectionTitle :title="mode === 'developer' ? 'Projects' : 'Games'" />

    <div v-if="mode === 'developer'" class="grid md:grid-cols-2 gap-8">
      <ProjectCard
        v-for="(project, index) in developerProjects"
        :key="index"
        :title="project.title"
        :description="project.description"
        :tags="project.tags"
        :link="project.link"
      />
    </div>
    <GameSlider v-else />
  </section>
</template>
