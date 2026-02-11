<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { Project, Game } from '@/types/profile'
import { useMode } from '@/composables/useMode'
import CustomTerminal from '@/components/about/Terminal.vue'
import ProjectForm from '@/components/dashboard/ProjectForm.vue'
import GameForm from '@/components/dashboard/GameForm.vue'
import type { ProjectFormData, GameFormData } from '@/types/forms'
import { projectsApi, gamesApi } from '@/api'

const authStore = useAuthStore()
const router = useRouter()
const { mode } = useMode()
const activeTab = ref<'create-project' | 'create-game' | 'view-projects' | 'view-games'>(
  'create-project',
)
const projects = ref<Project[]>([])
const games = ref<Game[]>([])
const loading = ref(false)
const activeMenuId = ref<string | null>(null)
const editingProject = ref<Project | null>(null)
const editingGame = ref<Game | null>(null)

onMounted(async () => {
  // Double-check authentication on mount
  const isAuth = await authStore.checkAuth()
  if (!isAuth) {
    router.push('/')
  }
})

const fetchProjects = async () => {
  try {
    loading.value = true
    const data = await projectsApi.getAll()
    projects.value = data.projects || []
  } catch (error) {
    console.error('Error fetching projects:', error)
  } finally {
    loading.value = false
  }
}

const fetchGames = async () => {
  try {
    loading.value = true
    const data = await gamesApi.getAll()
    games.value = data.games || []
  } catch (error) {
    console.error('Error fetching games:', error)
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab: typeof activeTab.value) => {
  activeTab.value = tab
  if (tab === 'view-projects') {
    fetchProjects()
  } else if (tab === 'view-games') {
    fetchGames()
  }
}

const deleteProject = async (id: string) => {
  if (!confirm('Are you sure you want to delete this project?')) return

  try {
    await projectsApi.delete(id)
    alert('Project deleted successfully!')
    fetchProjects()
  } catch (error) {
    console.error('Error deleting project:', error)
    alert(error instanceof Error ? error.message : 'Failed to delete project')
  }
}

const deleteGame = async (id: string) => {
  if (!confirm('Are you sure you want to delete this game?')) return

  try {
    await gamesApi.delete(id)
    alert('Game deleted successfully!')
    fetchGames()
  } catch (error) {
    console.error('Error deleting game:', error)
    alert(error instanceof Error ? error.message : 'Failed to delete game')
  }
}

const startEditProject = (project: Project) => {
  editingProject.value = project
  activeMenuId.value = null
  activeTab.value = 'create-project'
}

const startEditGame = (game: Game) => {
  editingGame.value = game
  activeMenuId.value = null
  activeTab.value = 'create-game'
}

const cancelEditProject = () => {
  editingProject.value = null
}

const cancelEditGame = () => {
  editingGame.value = null
}

const handleSignout = async () => {
  await authStore.signout()
  router.push('/')
}

const handleProjectSubmit = async (data: ProjectFormData) => {
  try {
    // Filter out empty string values for optional fields
    const cleanedData: Partial<ProjectFormData> = { ...data }
    
    // Remove empty optional fields to avoid validation errors
    if (!cleanedData.description || cleanedData.description.trim() === '') {
      delete cleanedData.description
    }
    if (!cleanedData.link || cleanedData.link.trim() === '') {
      delete cleanedData.link
    }
    if (!cleanedData.project_img || cleanedData.project_img.trim() === '') {
      delete cleanedData.project_img
    }
    if (!cleanedData.time_range || cleanedData.time_range.trim() === '') {
      delete cleanedData.time_range
    }

    if (editingProject.value) {
      // Update existing project
      await projectsApi.update(editingProject.value.id, cleanedData)
      alert('Project updated successfully!')
      editingProject.value = null
    } else {
      // Create new project
      await projectsApi.create(cleanedData as ProjectFormData)
      alert('Project created successfully!')
    }
    fetchProjects()
  } catch (error) {
    console.error('Error submitting project:', error)
    alert(error instanceof Error ? error.message : 'Failed to submit project')
  }
}

const handleGameSubmit = async (data: GameFormData) => {
  try {
    // Filter out empty string values for optional fields
    const cleanedData: Partial<GameFormData> = { ...data }
    
    // Remove empty optional fields to avoid validation errors
    if (!cleanedData.description || cleanedData.description.trim() === '') {
      delete cleanedData.description
    }
    if (!cleanedData.link || cleanedData.link.trim() === '') {
      delete cleanedData.link
    }
    if (!cleanedData.cover_img || cleanedData.cover_img.trim() === '') {
      delete cleanedData.cover_img
    }
    if (!cleanedData.icon_img || cleanedData.icon_img.trim() === '') {
      delete cleanedData.icon_img
    }

    if (editingGame.value) {
      // Update existing game
      await gamesApi.update(editingGame.value.id, cleanedData)
      alert('Game updated successfully!')
      editingGame.value = null
    } else {
      // Create new game
      await gamesApi.create(cleanedData as GameFormData)
      alert('Game created successfully!')
    }
    fetchGames()
  } catch (error) {
    console.error('Error submitting game:', error)
    alert(error instanceof Error ? error.message : 'Failed to submit game')
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
          class="flex gap-2 mb-6 border-b overflow-x-auto"
          :class="mode === 'developer' ? 'border-gray-200' : 'border-purple-900'"
        >
          <button
            @click="handleTabChange('create-project')"
            :class="[
              'px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === 'create-project'
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
            @click="handleTabChange('create-game')"
            :class="[
              'px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === 'create-game'
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
          <button
            @click="handleTabChange('view-projects')"
            :class="[
              'px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === 'view-projects'
                ? mode === 'developer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-purple-500 text-purple-300'
                : mode === 'developer'
                  ? 'border-transparent text-gray-600 hover:text-gray-900'
                  : 'border-transparent text-purple-400 hover:text-purple-200',
            ]"
          >
            View Projects
          </button>
          <button
            @click="handleTabChange('view-games')"
            :class="[
              'px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === 'view-games'
                ? mode === 'developer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-purple-500 text-purple-300'
                : mode === 'developer'
                  ? 'border-transparent text-gray-600 hover:text-gray-900'
                  : 'border-transparent text-purple-400 hover:text-purple-200',
            ]"
          >
            View Games
          </button>
        </div>

        <!-- Create Project Form -->
        <div v-if="activeTab === 'create-project'">
          <ProjectForm
            :editing-project="editingProject"
            @submit="handleProjectSubmit"
            @cancel="cancelEditProject"
          />
        </div>

        <!-- Create Game Form -->
        <div v-if="activeTab === 'create-game'">
          <GameForm
            :editing-game="editingGame"
            @submit="handleGameSubmit"
            @cancel="cancelEditGame"
          />
        </div>

        <!-- View Projects List -->
        <div v-if="activeTab === 'view-projects'">
          <div v-if="loading" class="text-center py-8">Loading...</div>
          <div
            v-else-if="projects.length === 0"
            class="text-center py-8"
            :class="mode === 'developer' ? 'text-gray-600' : 'text-purple-300'"
          >
            No projects found
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="project in projects"
              :key="project.id"
              :class="[
                'p-4 rounded-lg border flex justify-between items-start transition-colors',
                mode === 'developer'
                  ? 'bg-white border-gray-200 hover:bg-gray-50'
                  : 'bg-gray-800 border-purple-900 hover:bg-gray-700',
              ]"
            >
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-1">
                  <h4
                    :class="[
                      'font-bold',
                      mode === 'developer' ? 'text-gray-900' : 'text-purple-100',
                    ]"
                  >
                    {{ project.title }}
                  </h4>
                  <span
                    :class="[
                      'text-xs font-semibold px-2 py-1 rounded',
                      project.status === 'Completed and Published'
                        ? mode === 'developer'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-green-900 text-green-200'
                        : project.status === 'Ongoing'
                          ? mode === 'developer'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-blue-900 text-blue-200'
                          : project.status === 'Upcoming'
                            ? mode === 'developer'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-yellow-900 text-yellow-200'
                            : project.status === 'Deprecated'
                              ? mode === 'developer'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-red-900 text-red-200'
                              : project.status === 'Under Maintenance'
                                ? mode === 'developer'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-orange-900 text-orange-200'
                                : mode === 'developer'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-gray-700 text-gray-200',
                    ]"
                  >
                    {{ project.status }}
                  </span>
                </div>
                <p
                  :class="[
                    'text-sm mb-2',
                    mode === 'developer' ? 'text-gray-600' : 'text-purple-300',
                  ]"
                >
                  {{ project.description }}
                </p>
                <div class="flex gap-2 flex-wrap">
                  <span
                    v-for="tag in project.tags"
                    :key="tag"
                    :class="[
                      'text-xs px-2 py-1 rounded',
                      mode === 'developer'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-900 text-purple-200',
                    ]"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div class="relative ml-4">
                <button
                  @click="activeMenuId = activeMenuId === project.id ? null : project.id"
                  :class="[
                    'p-2 rounded hover:bg-opacity-75',
                    mode === 'developer' ? 'hover:bg-gray-200' : 'hover:bg-gray-600',
                  ]"
                >
                  ⋮
                </button>
                <div
                  v-if="activeMenuId === project.id"
                  :class="[
                    'absolute right-0 mt-1 w-40 rounded-lg shadow-lg z-10 border',
                    mode === 'developer'
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-700 border-purple-900',
                  ]"
                >
                  <button
                    @click="startEditProject(project)"
                    :class="[
                      'block w-full text-left px-4 py-2 hover:bg-opacity-75 transition-colors rounded-t-lg',
                      mode === 'developer'
                        ? 'text-gray-900 hover:bg-gray-100'
                        : 'text-purple-100 hover:bg-gray-600',
                    ]"
                  >
                    Edit
                  </button>
                  <button
                    @click="
                      () => {
                        deleteProject(project.id)
                        activeMenuId = null
                      }
                    "
                    :class="[
                      'block w-full text-left px-4 py-2 hover:bg-opacity-75 transition-colors rounded-b-lg text-red-600 hover:bg-red-50',
                      mode === 'developer'
                        ? ''
                        : 'hover:bg-red-900 hover:bg-opacity-30 text-red-400',
                    ]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- View Games List -->
        <div v-if="activeTab === 'view-games'">
          <div v-if="loading" class="text-center py-8">Loading...</div>
          <div
            v-else-if="games.length === 0"
            class="text-center py-8"
            :class="mode === 'developer' ? 'text-gray-600' : 'text-purple-300'"
          >
            No games found
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="game in games"
              :key="game.id"
              :class="[
                'p-4 rounded-lg border flex justify-between items-start transition-colors',
                mode === 'developer'
                  ? 'bg-white border-gray-200 hover:bg-gray-50'
                  : 'bg-gray-800 border-purple-900 hover:bg-gray-700',
              ]"
            >
              <div class="flex-1">
                <h4
                  :class="[
                    'font-bold mb-1',
                    mode === 'developer' ? 'text-gray-900' : 'text-purple-100',
                  ]"
                >
                  {{ game.title }}
                </h4>
                <p
                  :class="[
                    'text-sm mb-2',
                    mode === 'developer' ? 'text-gray-600' : 'text-purple-300',
                  ]"
                >
                  {{ game.description }}
                </p>
                <div class="flex gap-4 mb-2 text-sm">
                  <span :class="mode === 'developer' ? 'text-gray-600' : 'text-purple-400'">
                    Genres: {{ game.genre.join(', ') }}
                  </span>
                  <span :class="mode === 'developer' ? 'text-gray-600' : 'text-purple-400'">
                    Platforms: {{ game.platform.join(', ') }}
                  </span>
                </div>
                <div class="flex gap-2 flex-wrap">
                  <span
                    v-for="tag in game.tags"
                    :key="tag"
                    :class="[
                      'text-xs px-2 py-1 rounded',
                      mode === 'developer'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-900 text-purple-200',
                    ]"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div class="relative ml-4">
                <button
                  @click="activeMenuId = activeMenuId === game.id ? null : game.id"
                  :class="[
                    'p-2 rounded hover:bg-opacity-75',
                    mode === 'developer' ? 'hover:bg-gray-200' : 'hover:bg-gray-600',
                  ]"
                >
                  ⋮
                </button>
                <div
                  v-if="activeMenuId === game.id"
                  :class="[
                    'absolute right-0 mt-1 w-40 rounded-lg shadow-lg z-10 border',
                    mode === 'developer'
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-700 border-purple-900',
                  ]"
                >
                  <button
                    @click="startEditGame(game)"
                    :class="[
                      'block w-full text-left px-4 py-2 hover:bg-opacity-75 transition-colors rounded-t-lg',
                      mode === 'developer'
                        ? 'text-gray-900 hover:bg-gray-100'
                        : 'text-purple-100 hover:bg-gray-600',
                    ]"
                  >
                    Edit
                  </button>
                  <button
                    @click="
                      () => {
                        deleteGame(game.id)
                        activeMenuId = null
                      }
                    "
                    :class="[
                      'block w-full text-left px-4 py-2 hover:bg-opacity-75 transition-colors rounded-b-lg text-red-600 hover:bg-red-50',
                      mode === 'developer'
                        ? ''
                        : 'hover:bg-red-900 hover:bg-opacity-30 text-red-400',
                    ]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
