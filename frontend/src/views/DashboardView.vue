<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { Project, Game, Experience } from '@/types/profile'
import { useMode } from '@/composables/useMode'
import { useToast } from '@/composables/useToast'
import CustomTerminal from '@/components/about/Terminal.vue'
import ProjectForm from '@/components/dashboard/ProjectForm.vue'
import GameForm from '@/components/dashboard/GameForm.vue'
import ExperienceForm from '@/components/dashboard/ExperienceForm.vue'
import CertificationForm from '@/components/dashboard/CertificationForm.vue'
import ToastNotification from '@/components/dashboard/ToastNotification.vue'
import type { ProjectFormData, GameFormData, ExperienceFormData, CertificationFormData } from '@/types/forms'
import { projectsApi, gamesApi, experiencesApi, certificationsApi } from '@/api'
import type { Certification } from '@/types/profile'

const authStore = useAuthStore()
const router = useRouter()
const { mode } = useMode()
const toast = useToast()

type Section = 'projects' | 'games' | 'experiences' | 'certifications'
const activeSection = ref<Section>('projects')

const projects = ref<Project[]>([])
const games = ref<Game[]>([])
const experiences = ref<Experience[]>([])
const certifications = ref<Certification[]>([])
const loading = ref<Record<Section, boolean>>({ projects: false, games: false, experiences: false, certifications: false })
const activeMenuId = ref<string | null>(null)

const pageSize = {
  projects: 5,
  games: 5,
  experiences: 5,
  certifications: 5,
}

const currentPage = ref<Record<Section, number>>({
  projects: 1,
  games: 1,
  experiences: 1,
  certifications: 1,
})

const editingProject = ref<Project | null>(null)
const editingGame = ref<Game | null>(null)
const editingExperience = ref<Experience | null>(null)
const editingCertification = ref<Certification | null>(null)
const projectFormRef = ref<InstanceType<typeof ProjectForm> | null>(null)
const gameFormRef = ref<InstanceType<typeof GameForm> | null>(null)
const experienceFormRef = ref<InstanceType<typeof ExperienceForm> | null>(null)
const certificationFormRef = ref<InstanceType<typeof CertificationForm> | null>(null)

const submitLoading = ref({
  projects: false,
  games: false,
  experiences: false,
  certifications: false,
})

const getPageCount = (total: number, size: number) => Math.max(1, Math.ceil(total / size))

const paginate = <T,>(items: T[], page: number, size: number) => {
  const start = (page - 1) * size
  return items.slice(start, start + size)
}

const pagedProjects = computed(() =>
  paginate(projects.value, currentPage.value.projects, pageSize.projects),
)

const pagedGames = computed(() => paginate(games.value, currentPage.value.games, pageSize.games))

const pagedExperiences = computed(() =>
  paginate(experiences.value, currentPage.value.experiences, pageSize.experiences),
)

const pagedCertifications = computed(() =>
  paginate(certifications.value, currentPage.value.certifications, pageSize.certifications),
)

const projectPageCount = computed(() => getPageCount(projects.value.length, pageSize.projects))

const gamePageCount = computed(() => getPageCount(games.value.length, pageSize.games))

const experiencePageCount = computed(() =>
  getPageCount(experiences.value.length, pageSize.experiences),
)

const certificationPageCount = computed(() =>
  getPageCount(certifications.value.length, pageSize.certifications),
)

const normalizePage = (section: Section, total: number, size: number) => {
  const maxPage = getPageCount(total, size)
  if (currentPage.value[section] > maxPage) {
    currentPage.value[section] = maxPage
  }
}

const setPage = (section: Section, page: number, maxPage: number) => {
  const next = Math.min(Math.max(page, 1), maxPage)
  currentPage.value[section] = next
}

onMounted(async () => {
  const isAuth = await authStore.checkAuth()
  if (!isAuth) router.push('/')
  // Load all sections upfront
  fetchProjects()
  fetchGames()
  fetchExperiences()
  fetchCertifications()
})

// ── Fetch ────────────────────────────────────────────────────────────────────

const fetchProjects = async () => {
  loading.value.projects = true
  try {
    const data = await projectsApi.getAll()
    projects.value = data.projects || []
    normalizePage('projects', projects.value.length, pageSize.projects)
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
    normalizePage('games', games.value.length, pageSize.games)
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
    normalizePage('experiences', experiences.value.length, pageSize.experiences)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value.experiences = false
  }
}

const fetchCertifications = async () => {
  loading.value.certifications = true
  try {
    const data = await certificationsApi.getAll()
    certifications.value = data.certifications || []
    normalizePage('certifications', certifications.value.length, pageSize.certifications)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value.certifications = false
  }
}

// ── Delete ───────────────────────────────────────────────────────────────────

const deleteProject = async (id: string) => {
  if (!confirm('Delete this project? This will also remove the associated image.')) return
  try {
    await projectsApi.delete(id)
    toast.success('Project deleted successfully')
    fetchProjects()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete project')
  } finally {
    activeMenuId.value = null
  }
}

const deleteGame = async (id: string) => {
  if (!confirm('Delete this game? This will also remove the associated images.')) return
  try {
    await gamesApi.delete(id)
    toast.success('Game deleted successfully')
    fetchGames()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete game')
  } finally {
    activeMenuId.value = null
  }
}

const deleteExperience = async (id: string) => {
  if (!confirm('Delete this experience? This will also remove the associated logo.')) return
  try {
    await experiencesApi.delete(id)
    toast.success('Experience deleted successfully')
    fetchExperiences()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete experience')
  } finally {
    activeMenuId.value = null
  }
}

const deleteCertification = async (id: string) => {
  if (!confirm('Delete this certification?')) return
  try {
    await certificationsApi.delete(id)
    toast.success('Certification deleted successfully')
    fetchCertifications()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete certification')
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

  submitLoading.value.projects = true
  try {
    if (editingProject.value) {
      const uploadResult = await projectFormRef.value?.uploadImages(editingProject.value.id)
      if (uploadResult?.uploaded) delete clean.project_img
      await projectsApi.update(editingProject.value.id, clean)
      editingProject.value = null
      toast.success('Project updated successfully')
    } else {
      const created = await projectsApi.create(clean as ProjectFormData)
      try {
        await projectFormRef.value?.uploadImages(String(created.project.id))
        projectFormRef.value?.reset()
      } catch (err) {
        await projectsApi.delete(String(created.project.id))
        throw new Error('Image upload failed. Record creation rolled back.')
      }
      toast.success('Project created successfully')
    }
    fetchProjects()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to save project')
  } finally {
    submitLoading.value.projects = false
  }
}

const handleGameSubmit = async (data: GameFormData) => {
  const clean: Partial<GameFormData> = { ...data }
  if (!clean.description?.trim()) delete clean.description
  if (!clean.link?.trim()) delete clean.link
  if (!clean.cover_img?.trim()) delete clean.cover_img
  if (!clean.icon_img?.trim()) delete clean.icon_img

  submitLoading.value.games = true
  try {
    if (editingGame.value) {
      const uploadResult = await gameFormRef.value?.uploadImages(editingGame.value.id)
      if (uploadResult?.uploaded) {
        delete clean.cover_img
        delete clean.icon_img
      }
      await gamesApi.update(editingGame.value.id, clean)
      editingGame.value = null
      toast.success('Game updated successfully')
    } else {
      const created = await gamesApi.create(clean as GameFormData)
      try {
        await gameFormRef.value?.uploadImages(String(created.game.id))
        gameFormRef.value?.reset()
      } catch (err) {
        await gamesApi.delete(String(created.game.id))
        throw new Error('Image upload failed. Record creation rolled back.')
      }
      toast.success('Game created successfully')
    }
    fetchGames()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to save game')
  } finally {
    submitLoading.value.games = false
  }
}

const handleExperienceSubmit = async (data: ExperienceFormData) => {
  const clean: Partial<ExperienceFormData> = { ...data }
  if (!clean.location?.trim()) delete clean.location
  if (!clean.logo?.trim()) delete clean.logo

  submitLoading.value.experiences = true
  try {
    if (editingExperience.value) {
      const uploadResult = await experienceFormRef.value?.uploadImages(editingExperience.value.id)
      if (uploadResult?.uploaded) delete clean.logo
      await experiencesApi.update(editingExperience.value.id, clean)
      editingExperience.value = null
      toast.success('Experience updated successfully')
    } else {
      const created = await experiencesApi.create(clean as ExperienceFormData)
      try {
        await experienceFormRef.value?.uploadImages(String(created.experience.id))
        experienceFormRef.value?.reset()
      } catch (err) {
        await experiencesApi.delete(String(created.experience.id))
        throw new Error('Image upload failed. Record creation rolled back.')
      }
      toast.success('Experience created successfully')
    }
    fetchExperiences()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to save experience')
  } finally {
    submitLoading.value.experiences = false
  }
}

const handleCertificationSubmit = async (data: CertificationFormData) => {
  const clean: Partial<CertificationFormData> = { ...data }
  if (!clean.date?.trim()) delete clean.date
  if (!clean.icon?.trim()) delete clean.icon
  if (!clean.image_url?.trim()) delete clean.image_url
  if (!clean.url?.trim()) delete clean.url

  submitLoading.value.certifications = true
  try {
    if (editingCertification.value) {
      const uploadResult = await certificationFormRef.value?.uploadImages(editingCertification.value.id)
      if (uploadResult?.uploaded) {
        if (uploadResult.icon) delete clean.icon
        if (uploadResult.image_url) delete clean.image_url
      }
      await certificationsApi.update(editingCertification.value.id, clean)
      editingCertification.value = null
      toast.success('Certification updated successfully')
    } else {
      const created = await certificationsApi.create(clean as CertificationFormData)
      try {
        await certificationFormRef.value?.uploadImages(String(created.certification.id))
        certificationFormRef.value?.reset()
      } catch (err) {
        await certificationsApi.delete(String(created.certification.id))
        throw new Error('Image upload failed. Record creation rolled back.')
      }
      toast.success('Certification created successfully')
    }
    fetchCertifications()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to save certification')
  } finally {
    submitLoading.value.certifications = false
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

const startEditCertification = (c: Certification) => {
  editingCertification.value = c
  activeMenuId.value = null
}
</script>

<template>
  <!-- Toast portal -->
  <ToastNotification />

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
          v-for="s in ['projects', 'games', 'experiences', 'certifications']"
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
              v-for="project in pagedProjects"
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
          <div
            v-if="projects.length > pageSize.projects"
            class="flex items-center justify-between mt-4 text-xs"
            :class="mode === 'developer' ? 'text-gray-500' : 'text-purple-400'"
          >
            <button
              type="button"
              @click="setPage('projects', currentPage.projects - 1, projectPageCount)"
              :disabled="currentPage.projects === 1"
              :class="[
                'px-2 py-1 rounded transition-colors disabled:opacity-50',
                mode === 'developer'
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-700 hover:bg-gray-600',
              ]"
            >
              Prev
            </button>
            <span>Page {{ currentPage.projects }} of {{ projectPageCount }}</span>
            <button
              type="button"
              @click="setPage('projects', currentPage.projects + 1, projectPageCount)"
              :disabled="currentPage.projects === projectPageCount"
              :class="[
                'px-2 py-1 rounded transition-colors disabled:opacity-50',
                mode === 'developer'
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-700 hover:bg-gray-600',
              ]"
            >
              Next
            </button>
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
            ref="projectFormRef"
            :editing-project="editingProject"
            :loading="submitLoading.projects"
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
              v-for="game in pagedGames"
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
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <img
                  v-if="game.icon_url || game.icon_img"
                  :src="game.icon_url || game.icon_img"
                  :alt="game.title"
                  class="w-8 h-8 rounded object-contain flex-shrink-0"
                />
                <div class="min-w-0">
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
          <div
            v-if="games.length > pageSize.games"
            class="flex items-center justify-between mt-4 text-xs"
            :class="mode === 'developer' ? 'text-gray-500' : 'text-purple-400'"
          >
            <button
              type="button"
              @click="setPage('games', currentPage.games - 1, gamePageCount)"
              :disabled="currentPage.games === 1"
              :class="[
                'px-2 py-1 rounded transition-colors disabled:opacity-50',
                mode === 'developer'
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-700 hover:bg-gray-600',
              ]"
            >
              Prev
            </button>
            <span>Page {{ currentPage.games }} of {{ gamePageCount }}</span>
            <button
              type="button"
              @click="setPage('games', currentPage.games + 1, gamePageCount)"
              :disabled="currentPage.games === gamePageCount"
              :class="[
                'px-2 py-1 rounded transition-colors disabled:opacity-50',
                mode === 'developer'
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-700 hover:bg-gray-600',
              ]"
            >
              Next
            </button>
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
            ref="gameFormRef"
            :editing-game="editingGame"
            :loading="submitLoading.games"
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
              v-for="exp in pagedExperiences"
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
                    {{ exp.company }}
                  </p>
                  <p :class="['text-xs mb-1', mode === 'developer' ? 'text-gray-500' : 'text-gray-400']">
                    {{ exp.location || 'No location' }}
                  </p>
                  <div class="space-y-0.5">
                    <p
                      v-for="(pos, i) in (exp.positions?.length ? [...exp.positions].reverse() : [{title: exp.title, date: exp.date}])"
                      :key="i"
                      :class="[
                        'text-xs flex justify-between gap-3',
                        mode === 'developer' ? 'text-gray-600' : 'text-gray-400',
                      ]"
                    >
                      <span class="truncate font-medium">• {{ pos.title }}</span>
                      <span class="flex-shrink-0 opacity-75 whitespace-nowrap">{{ pos.date }}</span>
                    </p>
                  </div>
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
          <div
            v-if="experiences.length > pageSize.experiences"
            class="flex items-center justify-between mt-4 text-xs"
            :class="mode === 'developer' ? 'text-gray-500' : 'text-purple-400'"
          >
            <button
              type="button"
              @click="setPage('experiences', currentPage.experiences - 1, experiencePageCount)"
              :disabled="currentPage.experiences === 1"
              :class="[
                'px-2 py-1 rounded transition-colors disabled:opacity-50',
                mode === 'developer'
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-700 hover:bg-gray-600',
              ]"
            >
              Prev
            </button>
            <span>Page {{ currentPage.experiences }} of {{ experiencePageCount }}</span>
            <button
              type="button"
              @click="setPage('experiences', currentPage.experiences + 1, experiencePageCount)"
              :disabled="currentPage.experiences === experiencePageCount"
              :class="[
                'px-2 py-1 rounded transition-colors disabled:opacity-50',
                mode === 'developer'
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-700 hover:bg-gray-600',
              ]"
            >
              Next
            </button>
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
            ref="experienceFormRef"
            :editing-experience="editingExperience"
            :loading="submitLoading.experiences"
            @submit="handleExperienceSubmit"
            @cancel="editingExperience = null"
          />
        </div>
      </div>

      <!-- ── CERTIFICATIONS ─────────────────────────────────────────────────── -->
      <div
        v-else-if="activeSection === 'certifications'"
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
            {{ certifications.length }} certification{{ certifications.length !== 1 ? 's' : '' }}
          </h3>
          <div
            v-if="loading.certifications"
            class="text-center py-8 text-sm"
            :class="mode === 'developer' ? 'text-gray-400' : 'text-purple-400'"
          >
            Loading...
          </div>
          <div
            v-else-if="certifications.length === 0"
            class="text-center py-8 text-sm"
            :class="mode === 'developer' ? 'text-gray-400' : 'text-purple-400'"
          >
            No certifications yet
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="cert in pagedCertifications"
              :key="cert.id"
              :class="[
                'p-4 rounded-lg border flex justify-between items-start transition-colors',
                editingCertification?.id === cert.id
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
                  v-if="cert.icon"
                  :src="cert.icon"
                  :alt="cert.title"
                  class="w-8 h-8 rounded object-contain flex-shrink-0 mt-0.5"
                />
                <div class="min-w-0">
                  <p
                    :class="[
                      'font-semibold text-sm',
                      mode === 'developer' ? 'text-gray-900' : 'text-purple-100',
                    ]"
                  >
                    {{ cert.title }}
                  </p>
                  <p :class="['text-xs mb-1', mode === 'developer' ? 'text-gray-500' : 'text-gray-400']">
                    {{ cert.issuer }}
                  </p>
                  <p :class="['text-xs opacity-75', mode === 'developer' ? 'text-gray-600' : 'text-gray-400']">
                    {{ cert.date || 'No date' }}
                  </p>
                  <p v-if="cert.url" :class="['text-xs truncate max-w-[200px] hover:underline', mode === 'developer' ? 'text-blue-600' : 'text-blue-400']">
                    <a :href="cert.url" target="_blank" rel="noopener noreferrer">{{ cert.url }}</a>
                  </p>
                </div>
              </div>
              <div class="relative ml-3 flex-shrink-0">
                <button
                  @click="activeMenuId = activeMenuId === cert.id ? null : cert.id"
                  :class="[
                    'p-1.5 rounded text-lg leading-none',
                    mode === 'developer' ? 'hover:bg-gray-200' : 'hover:bg-gray-600',
                  ]"
                >
                  ⋮
                </button>
                <div
                  v-if="activeMenuId === cert.id"
                  :class="[
                    'absolute right-0 mt-1 w-36 rounded-lg shadow-lg z-10 border overflow-hidden',
                    mode === 'developer'
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-700 border-gray-600',
                  ]"
                >
                  <button
                    @click="startEditCertification(cert)"
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
                    @click="deleteCertification(cert.id)"
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
          <div
            v-if="certifications.length > pageSize.certifications"
            class="flex items-center justify-between mt-4 text-xs"
            :class="mode === 'developer' ? 'text-gray-500' : 'text-purple-400'"
          >
            <button
              type="button"
              @click="setPage('certifications', currentPage.certifications - 1, certificationPageCount)"
              :disabled="currentPage.certifications === 1"
              :class="[
                'px-2 py-1 rounded transition-colors disabled:opacity-50',
                mode === 'developer'
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-700 hover:bg-gray-600',
              ]"
            >
              Prev
            </button>
            <span>Page {{ currentPage.certifications }} of {{ certificationPageCount }}</span>
            <button
              type="button"
              @click="setPage('certifications', currentPage.certifications + 1, certificationPageCount)"
              :disabled="currentPage.certifications === certificationPageCount"
              :class="[
                'px-2 py-1 rounded transition-colors disabled:opacity-50',
                mode === 'developer'
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-700 hover:bg-gray-600',
              ]"
            >
              Next
            </button>
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
            {{ editingCertification ? 'Editing certification' : 'New certification' }}
          </h3>
          <CertificationForm
            ref="certificationFormRef"
            :editing-certification="editingCertification"
            :loading="submitLoading.certifications"
            @submit="handleCertificationSubmit"
            @cancel="editingCertification = null"
          />
        </div>
      </div>
    </section>
  </main>
</template>
