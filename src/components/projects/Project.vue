<script setup lang="ts">
defineOptions({ name: 'ProjectSection' })
import { useMode } from '@/composables/useMode'
import SectionTitle from '../SectionTitle.vue'
import ProjectCard from './ProjectCard.vue'
import GameSlider from './GameSlider.vue'

const { mode } = useMode()

const developerProjects = [
  {
    title: 'Decentralized Exchange Platform',
    description: 'My first project using ReactJS, where me and my team developed a simple Decentralized Exchange Platform leveraging blockchain technology for peer-to-peer asset transfers',
    tags: ['React', 'JavaScript', 'Tailwind', 'Expressjs', 'ProgreSQL', 'Ganache'],
    link: 'https://github.com/asianmurphyCo/Decentralized-Trading-Platform'
  },
  {
    title: 'The Relaxing Koala',
    description: 'A Restaurant Information System builded to optimize the new workflow of the rerstaurant',
    tags: ['React', 'Javascript', 'Tailwind', 'FastAPI', 'SQLite'],
    link: 'https://github.com/PancakesLmao/The-Relaxing-Koala-RIS'
  },
  {
    title: 'Weather Edge Station',
    description: 'Weather station runs IoT devices to collect data from a weather station',
    tags: ['Arduino', 'Raspberry Pi', 'Docker', 'InfluxDB'],
    link: 'https://github.com/Itea-Lab/Weather-Edge'
  },
  {
    title: 'Weather Dashboard',
    description: 'A project from AIoT Akathon 2024. A web application that visualize weather information from the weather edge station',
    tags: ['React', 'Javascript', 'Tailwind', 'Expressjs'],
    link: 'https://github.com/asianmurphyCo/Weather-Dashboard'
  },
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
