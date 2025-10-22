<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useMode } from '@/composables/useMode'
import CustomTerminal from '@/components/about/Terminal.vue'
import ProjectForm from '@/components/dashboard/ProjectForm.vue'
import GameForm from '@/components/dashboard/GameForm.vue'
import type { ProjectFormData, GameFormData } from '@/types/forms'

const authStore = useAuthStore()
const router = useRouter()
const { mode } = useMode()
const activeTab = ref<'project' | 'game'>('project')

onMounted(async () => {
  // Double-check authentication on mount
  const isAuth = await authStore.checkAuth()
  if (!isAuth) {
    router.push('/')
  }
})

const handleSignout = async () => {
  await authStore.signout()
  router.push('/')
}

const handleProjectSubmit = async (data: ProjectFormData) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
    const response = await fetch(`${backendUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create project')
    }

    const result = await response.json()
    console.log('Project created:', result)
    alert('Project created successfully!')
  } catch (error) {
    console.error('Error creating project:', error)
    alert(error instanceof Error ? error.message : 'Failed to create project')
  }
}

const handleGameSubmit = async (data: GameFormData) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
    const response = await fetch(`${backendUrl}/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create game')
    }

    const result = await response.json()
    console.log('Game created:', result)
    alert('Game created successfully!')
  } catch (error) {
    console.error('Error creating game:', error)
    alert(error instanceof Error ? error.message : 'Failed to create game')
  }
}
</script>

<template>
  <main>
    <section class="mb-24">
      <!-- Welcome Section -->
      <div
        :class="[
          'mb-8 p-6 rounded-lg transition-colors',
          mode === 'developer' ? 'bg-white shadow-md' : 'bg-gray-800 border border-purple-900',
        ]"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2
              :class="[
                'text-2xl font-bold mb-2 transition-colors',
                mode === 'developer' ? 'font-serif text-gray-900' : 'font-mono text-purple-100',
              ]"
            >
              Portfolio Dashboard
            </h2>
            <p
              :class="[
                'mb-4 transition-colors',
                mode === 'developer' ? 'text-gray-600' : 'text-purple-200',
              ]"
            >
              Update your information and manage your account settings below.
            </p>
          </div>
          <button
            @click="handleSignout"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              mode === 'developer'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-purple-900 text-purple-100 hover:bg-purple-800',
            ]"
          >
            Sign Out
          </button>
        </div>

        <!-- User Info -->
        <div
          :class="[
            'p-4 rounded-lg border transition-colors',
            mode === 'developer' ? 'bg-gray-50 border-gray-200' : 'bg-gray-900 border-purple-800',
          ]"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p
                :class="[
                  'text-sm font-medium mb-1',
                  mode === 'developer' ? 'text-gray-500' : 'text-purple-400',
                ]"
              >
                User ID
              </p>
              <p
                :class="[
                  'font-mono text-sm break-all',
                  mode === 'developer' ? 'text-gray-900' : 'text-purple-100',
                ]"
              >
                {{ authStore.user?.id }}
              </p>
            </div>
            <div>
              <p
                :class="[
                  'text-sm font-medium mb-1',
                  mode === 'developer' ? 'text-gray-500' : 'text-purple-400',
                ]"
              >
                Email
              </p>
              <p
                :class="[
                  'font-mono text-sm',
                  mode === 'developer' ? 'text-gray-900' : 'text-purple-100',
                ]"
              >
                {{ authStore.user?.email }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Terminal Section -->
      <div
        :class="[
          'p-6 rounded-lg transition-colors',
          mode === 'developer' ? 'bg-white shadow-md' : 'bg-gray-800 border border-purple-900',
        ]"
      >
        <h3
          :class="[
            'text-xl font-bold mb-4 transition-colors',
            mode === 'developer' ? 'font-serif text-gray-900' : 'font-mono text-purple-100',
          ]"
        >
          Terminal
        </h3>
        <CustomTerminal />
      </div>

      <!-- Forms Section -->
      <div class="mt-8">
        <!-- Form Tabs -->
        <div
          class="flex gap-2 mb-6 border-b"
          :class="mode === 'developer' ? 'border-gray-200' : 'border-purple-900'"
        >
          <button
            @click="activeTab = 'project'"
            :class="[
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'project'
                ? mode === 'developer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-purple-500 text-purple-300'
                : mode === 'developer'
                  ? 'border-transparent text-gray-600 hover:text-gray-900'
                  : 'border-transparent text-purple-400 hover:text-purple-200',
            ]"
          >
            New Project
          </button>
          <button
            @click="activeTab = 'game'"
            :class="[
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'game'
                ? mode === 'developer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-purple-500 text-purple-300'
                : mode === 'developer'
                  ? 'border-transparent text-gray-600 hover:text-gray-900'
                  : 'border-transparent text-purple-400 hover:text-purple-200',
            ]"
          >
            New Game
          </button>
        </div>

        <!-- Project Form -->
        <div v-if="activeTab === 'project'">
          <ProjectForm @submit="handleProjectSubmit" />
        </div>

        <!-- Game Form -->
        <div v-if="activeTab === 'game'">
          <GameForm @submit="handleGameSubmit" />
        </div>
      </div>
    </section>
  </main>
</template>
