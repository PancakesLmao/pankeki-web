<template>
  <section class="mb-24" id="projects">
    <SectionTitle :title="mode === 'developer' ? 'Projects' : 'Games'" />

    <div class="grid md:grid-cols-2 gap-8">
      <ProjectCard
        v-for="(project, index) in projects"
        :key="index"
        :title="project.title"
        :description="project.description"
        :tags="project.tags"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import SectionTitle from '../SectionTitle.vue'
import ProjectCard from './ProjectCard.vue'

const { mode } = inject('mode')

const developerProjects = [
  {
    title: 'Decentralized Exchange Platform',
    description: 'my first project using ReactJS, where me and my team developed a simple Decentralized Exchange Platform leveraging blockchain technology for peer-to-peer asset transfers',
    tags: ['React', 'JavaScript', 'Tailwind', 'Expressjs', 'ProgreSQL', 'Ganache'],
  },
  {
    title: 'The Relaxing Koala',
    description: 'A Restaurant Information System builded to optimize the new workflow of the rerstaurant',
    tags: ['React', 'Javascript', 'Tailwind', 'FastAPI', 'SQLite'],
  },
  {
    title: 'Weather Edge Station',
    description: 'Weather station runs IoT devices to collect data from a weather station',
    tags: ['Arduino', 'Raspberry Pi', 'Docker', 'InfluxDB'],
  },
  {
    title: 'Weather Dashboard',
    description: 'A customizable CMS for content creators with real-time collaboration and publishing workflows.',
    tags: ['React', 'Javascript', 'Tailwind', 'Expressjs'],
  },
]

const gamerProjects = [
  {

  }
]

const projects = computed(() => mode.value === 'developer' ? developerProjects : gamerProjects)
</script>
