<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { Project, Game, Experience } from '@/types/profile'
import { useMode } from '@/composables/useMode'
import CustomTerminal from '@/components/about/Terminal.vue'
import ProjectForm from '@/components/dashboard/ProjectForm.vue'
import GameForm from '@/components/dashboard/GameForm.vue'
import ExperienceForm from '@/components/dashboard/ExperienceForm.vue'
import type { ProjectFormData, GameFormData, ExperienceFormData } from '@/types/forms'
import { projectsApi, gamesApi, experiencesApi } from '@/api'

const authStore = useAuthStore()
const router = useRouter()
const { mode } = useMode()

type Section = 'projects' | 'games' | 'experiences'
const activeSection = ref<Section>('projects')

const projects = ref<Project[]>([])
const games = ref<Game[]>([])
const experiences = ref<Experience[]>([])
const loading = ref<Record<Section, boolean>>({ projects: false, games: false, experiences: false })
const activeMenuId = ref<string | null>(null)

const editingProject = ref<Project | null>(null)
const editingGame = ref<Game | null>(null)
const editingExperience = ref<Experience | null>(null)

onMounted(async () => {
  const isAuth = await authStore.checkAuth()
  if (!isAuth) router.push('/')
  // Load all sections upfront
  fetchProjects()
  fetchGames()
  fetchExperiences()
})

// ── Fetch ────────────────────────────────────────────────────────────────────

const fetchProjects = async () => {
  loading.value.projects = true
  try {
    const data = await projectsApi.getAll()
    projects.value = data.projects || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value.projects = false
  }
}

const fetchGames = async () => {
  loading.value.games = true
  try {
    const data = await gamesApi.getAll()
    games.value = data.games || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value.games = false
  }
}

const fetchExperiences = async () => {
  loading.value.experiences = true
  try {
    const data = await experiencesApi.getAll()
    experiences.value = data.experiences || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value.experiences = false
  }
}

// ── Delete ───────────────────────────────────────────────────────────────────

const deleteProject = async (id: string) => {
  if (!confirm('Delete this project?')) return
  try {
    await projectsApi.delete(id)
    fetchProjects()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed')
  } finally {
    activeMenuId.value = null
  }
}

const deleteGame = async (id: string) => {
  if (!confirm('Delete this game?')) return
  try {
    await gamesApi.delete(id)
    fetchGames()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed')
  } finally {
    activeMenuId.value = null
  }
}

const deleteExperience = async (id: string) => {
  if (!confirm('Delete this experience?')) return
  try {
    await experiencesApi.delete(id)
    fetchExperiences()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed')
  } finally {
    activeMenuId.value = null
  }
}

// ── Submit ───────────────────────────────────────────────────────────────────

const handleProjectSubmit = async (data: ProjectFormData) => {
  const clean: Partial<ProjectFormData> = { ...data }
  if (!clean.description?.trim()) delete clean.description
  if (!clean.link?.trim()) delete clean.link
  if (!clean.project_img?.trim()) delete clean.project_img
  if (!clean.time_range?.trim()) delete clean.time_range
  try {
    if (editingProject.value) {
      await projectsApi.update(editingProject.value.id, clean)
      editingProject.value = null
    } else {
      await projectsApi.create(clean as ProjectFormData)
    }
    fetchProjects()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed')
  }
}

const handleGameSubmit = async (data: GameFormData) => {
  const clean: Partial<GameFormData> = { ...data }
  if (!clean.description?.trim()) delete clean.description
  if (!clean.link?.trim()) delete clean.link
  if (!clean.cover_img?.trim()) delete clean.cover_img
  if (!clean.icon_img?.trim()) delete clean.icon_img
  try {
    if (editingGame.value) {
      await gamesApi.update(editingGame.value.id, clean)
      editingGame.value = null
    } else {
      await gamesApi.create(clean as GameFormData)
    }
    fetchGames()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed')
  }
}

const handleExperienceSubmit = async (data: ExperienceFormData) => {
  const clean: Partial<ExperienceFormData> = { ...data }
  if (!clean.location?.trim()) delete clean.location
  if (!clean.logo?.trim()) delete clean.logo
  try {
    if (editingExperience.value) {
      await experiencesApi.update(editingExperience.value.id, clean)
      editingExperience.value = null
    } else {
      await experiencesApi.create(clean as ExperienceFormData)
    }
    fetchExperiences()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed')
  }
}

const handleSignout = async () => {
  await authStore.signout()
  router.push('/')
}

const setSection = (s: string) => {
  activeSection.value = s as Section
  activeMenuId.value = null
}

const startEditProject = (p: Project) => {
  editingProject.value = p
  activeMenuId.value = null
}

const startEditGame = (g: Game) => {
  editingGame.value = g
  activeMenuId.value = null
}

const startEditExperience = (e: Experience) => {
  editingExperience.value = e
  activeMenuId.value = null
}
</script>

<template>
  <main>
    <section class="mb-24">
      <!-- Header -->
      <div
        :class="[
          'mb-6 p-6 rounded-lg',
          mode === 'developer' ? 'bg-white shadow-md' : 'bg-gray-800 border border-purple-900',
        ]"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2
              :class="[
                'text-2xl font-bold mb-1',
                mode === 'developer' ? 'font-serif text-gray-900' : 'font-mono text-purple-100',
              ]"
            >
              Portfolio Dashboard
            </h2>
            <p :class="['text-sm', mode === 'developer' ? 'text-gray-500' : 'text-purple-400']">
              {{ authStore.user?.email }}
            </p>
          </div>
          <button
            @click="handleSignout"
            :class="[
              'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              mode === 'developer'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-purple-900 text-purple-100 hover:bg-purple-800',
            ]"
          >
            Sign Out
          </button>
        </div>
        <CustomTerminal />
      </div>

      <!-- Section tabs -->
      <div
        :class="[
          'flex gap-1 mb-6 p-1 rounded-lg w-fit',
          mode === 'developer' ? 'bg-gray-100' : 'bg-gray-800',
        ]"
      >
        <button
          v-for="s in ['projects', 'games', 'experiences']"
          :key="s"
          @click="setSection(s)"
          :class="[
            'px-5 py-2 rounded-md font-medium text-sm capitalize transition-colors',
            activeSection === s
              ? mode === 'developer'
                ? 'bg-white shadow text-gray-900'
                : 'bg-gray-700 text-purple-100'
              : mode === 'developer'
                ? 'text-gray-500 hover:text-gray-800'
                : 'text-purple-400 hover:text-purple-200',
          ]"
        >
          {{ s }}
        </button>
      </div>

      <!-- ── PROJECTS ─────────────────────────────────────────────────────── -->
      <div v-if="activeSection === 'projects'" class="grid lg:grid-cols-2 gap-6 items-start">
        <!-- List -->
        <div>
          <h3
            :class="[
              'text-sm font-semibold uppercase tracking-wide mb-3',
              mode === 'developer' ? 'text-gray-400' : 'text-purple-500',
            ]"
          >
            {{ projects.length }} project{{ projects.length !== 1 ? 's' : '' }}
          </h3>
          <div
            v-if="loading.projects"
            class="text-center py-8 text-sm"
            :class="mode === 'developer' ? 'text-gray-400' : 'text-purple-400'"
          >
            Loading...
          </div>
          <div
            v-else-if="projects.length === 0"
            class="text-center py-8 text-sm"
            :class="mode === 'developer' ? 'text-gray-400' : 'text-purple-400'"
          >
            No projects yet
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="project in projects"
              :key="project.id"
              :class="[
                'p-4 rounded-lg border flex justify-between items-start transition-colors',
                editingProject?.id === project.id
                  ? mode === 'developer'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-purple-500 bg-gray-700'
                  : mode === 'developer'
                    ? 'bg-white border-gray-200 hover:bg-gray-50'
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-750',
              ]"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    :class="[
                      'font-semibold text-sm',
                      mode === 'developer' ? 'text-gray-900' : 'text-purple-100',
                    ]"
                    >{{ project.title }}</span
                  >
                  <span
                    :class="[
                      'text-xs px-2 py-0.5 rounded-full',
                      mode === 'developer'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-gray-700 text-gray-300',
                    ]"
                    >{{ project.status }}</span
                  >
                </div>
                <p
                  :class="[
                    'text-xs truncate',
                    mode === 'developer' ? 'text-gray-500' : 'text-gray-400',
                  ]"
                >
                  {{ project.time_range }}
                </p>
              </div>
              <div class="relative ml-3 flex-shrink-0">
                <button
                  @click="activeMenuId = activeMenuId === project.id ? null : project.id"
                  :class="[
                    'p-1.5 rounded text-lg leading-none',
                    mode === 'developer' ? 'hover:bg-gray-200' : 'hover:bg-gray-600',
                  ]"
                >
                  ⋮
                </button>
                <div
                  v-if="activeMenuId === project.id"
                  :class="[
                    'absolute right-0 mt-1 w-36 rounded-lg shadow-lg z-10 border overflow-hidden',
                    mode === 'developer'
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-700 border-gray-600',
                  ]"
                >
                  <button
                    @click="startEditProject(project)"
                    :class="[
                      'block w-full text-left px-4 py-2 text-sm transition-colors',
                      mode === 'developer'
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-purple-100 hover:bg-gray-600',
                    ]"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteProject(project.id)"
                    :class="[
                      'block w-full text-left px-4 py-2 text-sm transition-colors',
                      mode === 'developer'
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-red-400 hover:bg-red-900/30',
                    ]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div>
          <h3
            :class="[
              'text-sm font-semibold uppercase tracking-wide mb-3',
              mode === 'developer' ? 'text-gray-400' : 'text-purple-500',
            ]"
          >
            {{ editingProject ? 'Editing project' : 'New project' }}
          </h3>
          <ProjectForm
            :editing-project="editingProject"
            @submit="handleProjectSubmit"
            @cancel="editingProject = null"
          />
        </div>
      </div>

      <!-- ── GAMES ───────────────────────────────────────────────────────── -->
      <div v-else-if="activeSection === 'games'" class="grid lg:grid-cols-2 gap-6 items-start">
        <!-- List -->
        <div>
          <h3
            :class="[
              'text-sm font-semibold uppercase tracking-wide mb-3',
              mode === 'developer' ? 'text-gray-400' : 'text-purple-500',
            ]"
          >
            {{ games.length }} game{{ games.length !== 1 ? 's' : '' }}
          </h3>
          <div
            v-if="loading.games"
            class="text-center py-8 text-sm"
            :class="mode === 'developer' ? 'text-gray-400' : 'text-purple-400'"
          >
            Loading...
          </div>
          <div
            v-else-if="games.length === 0"
            class="text-center py-8 text-sm"
            :class="mode === 'developer' ? 'text-gray-400' : 'text-purple-400'"
          >
            No games yet
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="game in games"
              :key="game.id"
              :class="[
                'p-4 rounded-lg border flex justify-between items-start transition-colors',
                editingGame?.id === game.id
                  ? mode === 'developer'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-purple-500 bg-gray-700'
                  : mode === 'developer'
                    ? 'bg-white border-gray-200 hover:bg-gray-50'
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-750',
              ]"
            >
              <div class="flex-1 min-w-0">
                <p
                  :class="[
                    'font-semibold text-sm mb-1',
                    mode === 'developer' ? 'text-gray-900' : 'text-purple-100',
                  ]"
                >
                  {{ game.title }}
                </p>
                <p :class="['text-xs', mode === 'developer' ? 'text-gray-500' : 'text-gray-400']">
                  {{ game.platform.join(', ') }}
                </p>
              </div>
              <div class="relative ml-3 flex-shrink-0">
                <button
                  @click="activeMenuId = activeMenuId === game.id ? null : game.id"
                  :class="[
                    'p-1.5 rounded text-lg leading-none',
                    mode === 'developer' ? 'hover:bg-gray-200' : 'hover:bg-gray-600',
                  ]"
                >
                  ⋮
                </button>
                <div
                  v-if="activeMenuId === game.id"
                  :class="[
                    'absolute right-0 mt-1 w-36 rounded-lg shadow-lg z-10 border overflow-hidden',
                    mode === 'developer'
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-700 border-gray-600',
                  ]"
                >
                  <button
                    @click="startEditGame(game)"
                    :class="[
                      'block w-full text-left px-4 py-2 text-sm transition-colors',
                      mode === 'developer'
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-purple-100 hover:bg-gray-600',
                    ]"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteGame(game.id)"
                    :class="[
                      'block w-full text-left px-4 py-2 text-sm transition-colors',
                      mode === 'developer'
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-red-400 hover:bg-red-900/30',
                    ]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div>
          <h3
            :class="[
              'text-sm font-semibold uppercase tracking-wide mb-3',
              mode === 'developer' ? 'text-gray-400' : 'text-purple-500',
            ]"
          >
            {{ editingGame ? 'Editing game' : 'New game' }}
          </h3>
          <GameForm
            :editing-game="editingGame"
            @submit="handleGameSubmit"
            @cancel="editingGame = null"
          />
        </div>
      </div>

      <!-- ── EXPERIENCES ──────────────────────────────────────────────────── -->
      <div
        v-else-if="activeSection === 'experiences'"
        class="grid lg:grid-cols-2 gap-6 items-start"
      >
        <!-- List -->
        <div>
          <h3
            :class="[
              'text-sm font-semibold uppercase tracking-wide mb-3',
              mode === 'developer' ? 'text-gray-400' : 'text-purple-500',
            ]"
          >
            {{ experiences.length }} experience{{ experiences.length !== 1 ? 's' : '' }}
          </h3>
          <div
            v-if="loading.experiences"
            class="text-center py-8 text-sm"
            :class="mode === 'developer' ? 'text-gray-400' : 'text-purple-400'"
          >
            Loading...
          </div>
          <div
            v-else-if="experiences.length === 0"
            class="text-center py-8 text-sm"
            :class="mode === 'developer' ? 'text-gray-400' : 'text-purple-400'"
          >
            No experiences yet
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="exp in experiences"
              :key="exp.id"
              :class="[
                'p-4 rounded-lg border flex justify-between items-start transition-colors',
                editingExperience?.id === exp.id
                  ? mode === 'developer'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-purple-500 bg-gray-700'
                  : mode === 'developer'
                    ? 'bg-white border-gray-200 hover:bg-gray-50'
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-750',
              ]"
            >
              <div class="flex gap-3 flex-1 min-w-0">
                <img
                  v-if="exp.logo"
                  :src="exp.logo"
                  :alt="exp.company"
                  class="w-8 h-8 rounded object-contain flex-shrink-0 mt-0.5"
                />
                <div class="min-w-0">
                  <p
                    :class="[
                      'font-semibold text-sm',
                      mode === 'developer' ? 'text-gray-900' : 'text-purple-100',
                    ]"
                  >
                    {{ exp.title }}
                  </p>
                  <p :class="['text-xs', mode === 'developer' ? 'text-gray-500' : 'text-gray-400']">
                    {{ exp.company }}{{ exp.location ? ` • ${exp.location}` : '' }}
                  </p>
                  <p
                    :class="[
                      'text-xs mt-0.5',
                      mode === 'developer' ? 'text-gray-400' : 'text-gray-500',
                    ]"
                  >
                    {{ exp.date }}
                  </p>
                </div>
              </div>
              <div class="relative ml-3 flex-shrink-0">
                <button
                  @click="activeMenuId = activeMenuId === exp.id ? null : exp.id"
                  :class="[
                    'p-1.5 rounded text-lg leading-none',
                    mode === 'developer' ? 'hover:bg-gray-200' : 'hover:bg-gray-600',
                  ]"
                >
                  ⋮
                </button>
                <div
                  v-if="activeMenuId === exp.id"
                  :class="[
                    'absolute right-0 mt-1 w-36 rounded-lg shadow-lg z-10 border overflow-hidden',
                    mode === 'developer'
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-700 border-gray-600',
                  ]"
                >
                  <button
                    @click="startEditExperience(exp)"
                    :class="[
                      'block w-full text-left px-4 py-2 text-sm transition-colors',
                      mode === 'developer'
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-purple-100 hover:bg-gray-600',
                    ]"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteExperience(exp.id)"
                    :class="[
                      'block w-full text-left px-4 py-2 text-sm transition-colors',
                      mode === 'developer'
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-red-400 hover:bg-red-900/30',
                    ]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div>
          <h3
            :class="[
              'text-sm font-semibold uppercase tracking-wide mb-3',
              mode === 'developer' ? 'text-gray-400' : 'text-purple-500',
            ]"
          >
            {{ editingExperience ? 'Editing experience' : 'New experience' }}
          </h3>
          <ExperienceForm
            :editing-experience="editingExperience"
            @submit="handleExperienceSubmit"
            @cancel="editingExperience = null"
          />
        </div>
      </div>
    </section>
  </main>
</template>
