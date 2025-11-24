<script setup lang="ts">
defineOptions({ name: 'ProjectSection' })
import { ref, onMounted } from 'vue'
import { useMode } from '@/composables/useMode'
import SectionTitle from '../SectionTitle.vue'
import ProjectCard from './ProjectCard.vue'
import GameSlider from './GameSlider.vue'
import { projectsApi } from '@/api'
import type { Project } from '@/types/profile'

const { mode } = useMode()

// Projects from API
const projects = ref<Project[]>([])
const loadingProjects = ref(false)
const fetchError = ref<string | null>(null)

// Fetch projects from API
const fetchProjects = async () => {
  try {
    loadingProjects.value = true
    fetchError.value = null
    const response = await projectsApi.getAll()
    // Sort by created_at from newest to oldest
    projects.value = response.projects.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })
    console.log('Projects loaded:', projects.value.length)
  } catch (error) {
    fetchError.value = error instanceof Error ? error.message : 'Failed to fetch projects'
    console.error('Error fetching projects:', error)
  } finally {
    loadingProjects.value = false
  }
}

// Fetch on mount
onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <section class="mb-24" id="projects">
    <SectionTitle :title="mode === 'developer' ? 'Projects' : 'Games'" />

    <!-- Developer Mode: Projects -->
    <div v-if="mode === 'developer'">
      <!-- Loading State -->
      <div v-if="loadingProjects" class="flex items-center justify-center py-12">
        <div class="text-center">
          <svg
            class="mx-auto h-12 w-12 animate-spin text-purple-300"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="mt-4 text-gray-400">Loading projects...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="fetchError" class="flex items-center justify-center py-12">
        <div class="text-center">
          <p class="mb-4 text-red-400">{{ fetchError }}</p>
          <button
            @click="fetchProjects"
            class="rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="projects.length === 0" class="flex items-center justify-center py-12">
        <p class="text-gray-400">No projects available</p>
      </div>

      <!-- Projects Grid -->
      <div v-else class="grid md:grid-cols-2 gap-8">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :title="project.title"
          :description="project.description"
          :tags="project.tags"
          :link="project.link"
          :status="project.status"
          :time-range="project.time_range"
        />
      </div>
    </div>

    <!-- Gamer Mode: Games -->
    <GameSlider v-else />
  </section>
</template>
