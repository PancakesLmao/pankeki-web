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
    // console.log('Projects loaded:', projects.value.length)
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
  <section class="mb-24 pt-12" id="projects">
    <SectionTitle :title="mode === 'developer' ? 'Projects' : 'Games'" />

    <!-- Developer Mode: Projects -->
    <div v-if="mode === 'developer'">
      <!-- Loading State -->
      <div v-if="loadingProjects" class="flex items-center justify-center py-12">
        <div class="text-center">
          <svg
            :class="[
              'mx-auto h-12 w-12 animate-spin',
              mode === 'developer' ? 'text-gray-400' : 'text-purple-300',
            ]"
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
          <p :class="['mt-4', mode === 'developer' ? 'text-gray-500' : 'text-gray-400']">
            Loading projects...
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="fetchError" class="flex items-center justify-center py-12">
        <div class="text-center">
          <svg
            :class="[
              'mx-auto h-10 w-10 mb-3',
              mode === 'developer' ? 'text-gray-400' : 'text-gray-500',
            ]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p
            :class="['mb-1 font-medium', mode === 'developer' ? 'text-gray-700' : 'text-gray-300']"
          >
            Projects couldn't be loaded
          </p>
          <p :class="['mb-4 text-sm', mode === 'developer' ? 'text-gray-500' : 'text-gray-500']">
            The service may be temporarily unavailable. Try again in a moment.
          </p>
          <button
            @click="fetchProjects"
            :class="[
              'rounded-md px-4 py-2 text-white transition-colors text-sm',
              mode === 'developer'
                ? 'bg-gray-700 hover:bg-gray-800'
                : 'bg-purple-600 hover:bg-purple-700',
            ]"
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
          :project-img="project.image_url"
        />
      </div>
    </div>

    <!-- Gamer Mode: Games -->
    <GameSlider v-else />
  </section>
</template>
