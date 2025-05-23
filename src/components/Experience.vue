<script lang="ts" setup>
defineOptions({ name: 'ExperienceSection' })
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useMode } from '@/composables/useMode'
import { Mode } from '@/types/mode'
import SectionTitle from '@/components/SectionTitle.vue'

interface TimelineItem {
  date: string
  title: string
  company?: string
  location?: string
  description: string
}

const { mode } = useMode()

const developerExperience: TimelineItem[] = [
  {
    date: 'May 2025 - Present',
    title: 'Cloud Engineer Intern',
    company: 'AWS First Cloud Journey',
    location: 'HCM, Vietnam',
    description:
      'Participate in FCJ community where I gain hands-on experience in cloud computing and AWS services. My role involves assisting in the development and deployment of cloud-based solutions, as well as learning about best practices in cloud architecture',
  },
  {
    date: 'Spring 2025 - Present',
    title: 'ITea Lab Operations',
    company: 'ITea Lab Community',
    location: 'HCM, Vietnam',
    description:
      'Work along with head of ITea Lab to lead developer team in building projects and organizing community events. Collaborate with other industries to create a vibrant learning environment for CS students.',
  },
  {
    date: 'Spring 2024 - December 2024',
    title: 'IT Lab Assistant',
    company: 'Swinburne Vietnam HCMC',
    location: 'HCM, Vietnam',
    description:
      'I joined the IT Lab as an assistant and worked with other members who share the same passion to improve my skills and gain practical experience in the field througn hands-on, real-life projects',
  },
]

const gamerExperience: TimelineItem[] = []

const timelineItems = computed(() =>
  mode.value === Mode.Developer ? developerExperience : gamerExperience,
)

// Scroll animation
const timelineItemsRef = ref<HTMLElement[]>([])
const observer = ref<IntersectionObserver | null>(null)
onMounted(() => {
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          // Stop observing after animation triggers
          observer.value?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.2 }, // Trigger when 10% of the item is visible
  )

  timelineItemsRef.value.forEach((item) => {
    if (item) observer.value?.observe(item)
  })
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<style scoped>
.timeline-item {
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  transition-delay: 500ms;
}

/* Initial state: hidden and slightly offset */
.timeline-item:not(.is-visible) {
  opacity: 0;
  transform: translateY(20px);
}

/* Visible state: fully visible and in place */
.timeline-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Alternate direction for even-indexed items (slide from right) */
.timeline-item.md\:flex-row-reverse:not(.is-visible) {
  transform: translateY(20px);
}
</style>

<template>
  <section :class="['mb-24', mode === Mode.Developer ? '' : 'hidden']" id="experience">
    <SectionTitle :title="mode === Mode.Developer ? 'Work Experience' : 'Gaming Milestones'" />

    <div class="relative">
      <!-- Timeline vertical line -->
      <div
        :class="[
          'absolute left-0 md:left-1/2 h-full w-0.5 -translate-x-1/2 transform',
          mode === Mode.Developer ? 'bg-gray-200' : 'bg-purple-900',
        ]"
        aria-hidden="true"
      ></div>

      <div class="space-y-12">
        <div
          v-for="(item, index) in timelineItems"
          :key="index"
          :class="[
            'relative flex flex-col md:flex-row timeline-item opacity-0',
            index % 2 === 0 ? 'md:flex-row-reverse' : '',
          ]"
          ref="timelineItemsRef"
        >
          <!-- Timeline dot -->
          <div
            :class="[
              'absolute left-0 md:left-1/2 w-5 h-5 rounded-full -translate-x-1/2 transform z-10',
              mode === 'developer' ? 'bg-gray-900' : 'bg-purple-600',
            ]"
            style="top: 24px"
            aria-hidden="true"
          ></div>

          <!-- Date column -->
          <div
            :class="[
              'md:w-1/2 pb-8 md:pb-0 md:px-8',
              index % 2 === 0 ? 'md:text-left md:pl-8' : 'md:text-right md:pr-8',
            ]"
          >
            <span
              :class="[
                'inline-block text-sm font-medium px-3 py-1 rounded-full mb-2',
                mode === 'developer' ? 'bg-gray-100 text-gray-700' : 'bg-gray-800 text-purple-300',
              ]"
            >
              {{ item.date }}
            </span>
          </div>

          <!-- Content column -->
          <div
            :class="[
              'md:w-1/2 pl-8 md:pl-0 md:px-8 border-l md:border-l-0',
              mode === 'developer' ? 'border-gray-200' : 'border-purple-900',
              index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8',
            ]"
          >
            <h3
              :class="[
                'text-xl font-bold mb-1 transition-colors',
                mode === 'developer' ? 'font-serif' : 'font-mono',
              ]"
            >
              {{ item.title }}
            </h3>
            <p
              v-if="item.company"
              :class="[
                'text-sm font-medium mb-2',
                mode === 'developer' ? 'text-gray-600' : 'text-purple-400',
              ]"
            >
              {{ item.company }} {{ item.location ? ` • ${item.location}` : '' }}
            </p>
            <p
              :class="[
                'transition-colors',
                mode === 'developer' ? 'text-gray-600' : 'text-purple-200',
              ]"
            >
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
