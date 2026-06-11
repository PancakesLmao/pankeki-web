<script lang="ts" setup>
defineOptions({ name: 'ExperienceSection' })
import { ref, onMounted } from 'vue'
import { useMode } from '@/composables/useMode'
import { Mode } from '@/types/mode'
import SectionTitle from '@/components/SectionTitle.vue'
import { experiencesApi } from '@/api'
import type { Experience } from '@/types/profile'

const { mode } = useMode()

const experiences = ref<Experience[]>([])
const loading = ref(false)
const fetchError = ref(false)
const visibleItems = ref<Set<string>>(new Set())

const fetchExperiences = async () => {
  loading.value = true
  fetchError.value = false
  try {
    const response = await experiencesApi.getAll()
    experiences.value = response.experiences ?? []
  } catch {
    fetchError.value = true
  } finally {
    loading.value = false
  }
}

const setupItemObserver = (element: HTMLElement | null, itemId: string) => {
  if (!element) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visibleItems.value.add(itemId)
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.1 },
  )
  observer.observe(element)
}

onMounted(() => fetchExperiences())
</script>

<style scoped>
.timeline-item {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.timeline-item.is-visible {
  opacity: 1;
  transform: none;
}

.logo-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 45;
}

.logo-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-out;
  z-index: 55;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
}

.logo-wrapper:hover .logo-tooltip {
  opacity: 1;
}

.logo-tooltip img {
  max-width: 120px;
  max-height: 120px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.dark-mode .logo-tooltip {
  background: #1f2937;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  color: #999;
}
</style>

<template>
  <section :class="['pb-12', mode === Mode.Developer ? '' : 'hidden']" id="experience">
    <SectionTitle :title="mode === Mode.Developer ? 'Work Experience' : 'Gaming Milestones'" />

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg
          :class="[
            'mx-auto h-12 w-12 animate-spin',
            mode === Mode.Developer ? 'text-gray-400' : 'text-purple-300',
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
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p :class="['mt-4', mode === Mode.Developer ? 'text-gray-500' : 'text-gray-400']">
          Loading experience...
        </p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="fetchError" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg
          :class="[
            'mx-auto h-10 w-10 mb-3',
            mode === Mode.Developer ? 'text-gray-400' : 'text-gray-500',
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
          :class="['mb-1 font-medium', mode === Mode.Developer ? 'text-gray-700' : 'text-gray-300']"
        >
          Experience couldn't be loaded
        </p>
        <p :class="['mb-4 text-sm', mode === Mode.Developer ? 'text-gray-500' : 'text-gray-500']">
          The service may be temporarily unavailable.
        </p>
        <button
          @click="fetchExperiences"
          :class="[
            'rounded-md px-4 py-2 text-white transition-colors text-sm',
            mode === Mode.Developer
              ? 'bg-gray-700 hover:bg-gray-800'
              : 'bg-purple-600 hover:bg-purple-700',
          ]"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <div
        :class="[
          'absolute left-0 md:left-1/2 h-full w-0.5 -translate-x-1/2 transform',
          mode === Mode.Developer ? 'bg-gray-200' : 'bg-purple-900',
        ]"
        aria-hidden="true"
      ></div>

      <div class="space-y-12">
        <div
          v-for="(item, index) in experiences"
          :key="item.id"
          :class="[
            'relative flex flex-col md:flex-row timeline-item',
            index % 2 === 0 ? 'md:flex-row-reverse' : '',
            visibleItems.has(item.id) ? 'is-visible' : '',
          ]"
          :ref="(el) => setupItemObserver(el as HTMLElement, item.id)"
        >
          <!-- Dot -->
          <div
            :class="[
              'absolute left-0 md:left-1/2 w-5 h-5 rounded-full -translate-x-1/2 transform z-10',
              mode === Mode.Developer ? 'bg-gray-900' : 'bg-purple-600',
            ]"
            style="top: 24px"
            aria-hidden="true"
          ></div>

          <!-- spacer -->
          <div
            :class="[
              'md:w-1/2 pb-8 md:pb-0 md:px-8',
              index % 2 === 0 ? 'md:text-left md:pl-8' : 'md:text-right md:pr-8',
            ]"
          >
          </div>

          <!-- Content -->
          <div
            :class="[
              'md:w-1/2 pl-8 md:pl-0 md:px-8 border-l md:border-l-0',
              mode === Mode.Developer ? 'border-gray-200' : 'border-purple-900',
              index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8',
            ]"
          >
            <!-- Company header -->
            <div
              :class="[
                'flex items-center gap-3 mb-3',
                index % 2 === 0 ? 'md:flex-row-reverse' : '',
              ]"
            >
              <div v-if="item.logo" class="logo-wrapper">
                <img
                  :src="item.logo"
                  :alt="item.company"
                  class="w-8 h-8 rounded object-contain flex-shrink-0"
                  @error="
                    (e) => {
                      const img = e.target as HTMLImageElement
                      img.style.display = 'none'
                    }
                  "
                  @load="() => {}"
                />
                <div class="logo-tooltip">
                  <img
                    :src="item.logo"
                    :alt="item.company"
                    @error="
                      (e) => {
                        const img = e.target as HTMLImageElement
                        img.parentElement!.textContent = 'Logo unavailable'
                      }
                    "
                    @load="() => {}"
                  />
                </div>
              </div>
              <div>
                <h3
                  :class="[
                    'text-xl font-bold transition-colors leading-tight',
                    mode === Mode.Developer ? 'font-serif' : 'font-mono',
                  ]"
                >
                  {{ item.company }}
                </h3>
                <p
                  v-if="item.location"
                  :class="[
                    'text-xs font-medium',
                    mode === Mode.Developer ? 'text-gray-500' : 'text-purple-400',
                  ]"
                >
                  {{ item.location }}
                </p>
              </div>
            </div>

            <!-- Positions list -->
            <div
              :class="[
                'space-y-3',
                index % 2 === 0 ? 'md:border-r md:pr-3 md:border-l-0' : 'border-l pl-3',
                mode === Mode.Developer ? 'border-gray-200' : 'border-purple-800',
              ]"
            >
              <div
                v-for="(pos, posIdx) in (item.positions && item.positions.length > 0
                  ? [...item.positions].reverse()
                  : [{ title: item.title, date: item.date, description: item.description }])"
                :key="posIdx"
                :class="[
                  posIdx > 0 ? 'pt-3' : '',
                  posIdx > 0
                    ? mode === Mode.Developer
                      ? 'border-t border-gray-100'
                      : 'border-t border-purple-900/50'
                    : '',
                ]"
              >
                <div
                  :class="[
                    'flex items-center gap-2 mb-1 flex-wrap',
                    index % 2 === 0 ? 'md:flex-row-reverse' : '',
                  ]"
                >
                  <p
                    :class="[
                      'text-sm font-semibold',
                      mode === Mode.Developer ? 'text-gray-800' : 'text-purple-100',
                    ]"
                  >
                    {{ pos.title }}
                  </p>
                  <span
                    :class="[
                      'inline-block text-xs font-medium px-2 py-0.5 rounded-full',
                      mode === Mode.Developer
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-gray-800 text-purple-300',
                    ]"
                  >
                    {{ pos.date }}
                  </span>
                </div>
                <p
                  :class="[
                    'text-sm transition-colors',
                    mode === Mode.Developer ? 'text-gray-600' : 'text-purple-200',
                  ]"
                >
                  {{ pos.description }}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>
