<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  SquareArrowOutUpRight
} from 'lucide-vue-next'

interface GameProject {
  id: string
  title: string
  description: string
  coverImage: string
  iconImage: string
  platform: string
  genre: string
  tags: string[]
}

const games: GameProject[] = [
  {
    id: 'gbf-relink',
    title: 'Grandblue Fantasy: Relink',
    description:
      'Journey through the Zegagrande Skydom, a world of floating islands adrift in a sea of clouds, forsaken by the gods. As a young skyfarer, follow your father’s letter to find Estalucia, the legendary Island of the Astrals. Alongside Lyria, a girl linked to powerful primal beasts, navigate a fragile peace 500 years after a great war',
    coverImage: '',
    iconImage: 'https://cdn.jsdelivr.net/gh/PancakesLmao/pankeki-web/src/assets/256x256.png',
    platform: 'PC / PlayStation',
    genre: 'JRPG',
    tags: ['JRPG', 'Action RPG', 'Fantasy'],
  },
  {
    id: 'wuwa',
    title: 'Wuthering Waves',
    description:
      'Explore Solaris-3, a futuristic, post-apocalyptic world ravaged by the Lament, a catastrophe that nearly eradicated humanity and unleashed monstrous Tacet Discords. As civilizations slowly rebuild, you awaken as Rover, an amnesiac wanderer, embarking on a journey to uncover the mysteries of this transformed world.',
    coverImage: 'https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/images/1734710400000/ztdem9zj1pyr3ar7gy-1734783143275.jpg?x-oss-process=image/format,webp',
    iconImage: '/placeholder.svg?height=120&width=120',
    platform: 'PC / Mobile',
    genre: 'Action RPG',
    tags: ['Open world', 'Action RPG', 'Gacha RPG', 'Hack and Slash'],
  },
  {
    id: 'hi3',
    title: 'Honkai Impact 3rd',
    description:
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. ',
    coverImage: '/placeholder.svg?height=600&width=1200',
    iconImage: '/placeholder.svg?height=120&width=120',
    platform: 'PC / Mobile',
    genre: 'Action RPG',
    tags: ['Action RPG', 'Gacha RPG', 'Science Fiction'],
  },
  {
    id: 'hsr',
    title: 'Honkai: Star Rail',
    description:
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. ',
    coverImage: '/placeholder.svg?height=600&width=1200',
    iconImage: '/placeholder.svg?height=120&width=120',
    platform: 'PC / Mobile',
    genre: 'Turn-based RPG',
    tags: ['Turn-based RPG', 'Gacha RPG', 'Turn-based'],
  },
  {
    id: 'gi',
    title: 'Genshin Impact',
    description:
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. ',
    coverImage: '/placeholder.svg?height=600&width=1200',
    iconImage: '/placeholder.svg?height=120&width=120',
    platform: 'PC / Mobile',
    genre: 'Open World RPG',
    tags: ['Open world', 'Gacha RPG', 'Action RPG', 'Fantasy'],
  },
  {
    id: 'zzz',
    title: 'Zenless Zone Zero',
    description:
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. ',
    coverImage: '/placeholder.svg?height=600&width=1200',
    iconImage: '/placeholder.svg?height=120&width=120',
    platform: 'PC / Mobile',
    genre: 'Action RPG',
    tags: ['Action RPG', 'Gacha RPG', 'Hack and Slash'],
  },
  {
    id: 'pubg',
    title: 'PUBG: Battlegrounds',
    description:
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. ',
    coverImage: '/placeholder.svg?height=600&width=1200',
    iconImage: '/placeholder.svg?height=120&width=120',
    platform: 'PC',
    genre: 'Battle Royale',
    tags: ['Battle Royale', 'FPS', 'Survival'],
  },
  {
    id: 'fgo',
    title: 'Fate/Grand Order',
    description:
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. ',
    coverImage: 'https://cdn.jsdelivr.net/gh/PancakesLmao/pankeki-web/src/assets/3a3c7831e6971e28d730f410b461e8f2.png',
    iconImage: '/placeholder.svg?height=120&width=120',
    platform: 'Mobile',
    genre: 'Visual Novel',
    tags: ['Visual Novel', 'Turn-based RPG', 'Gacha RPG', 'Fantasy'],
  },
  {
    id: 'ba',
    title: 'Blue Archive',
    description:
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. ',
    coverImage: '/placeholder.svg?height=600&width=1200',
    iconImage: '/placeholder.svg?height=120&width=120',
    platform: 'Mobile',
    genre: 'Gacha RPG',
    tags: ['Gacha RPG'],
  },
]
// State
const activeIndex = ref(0)
const isAnimating = ref(false)
const showLeftScroll = ref(false)
const showRightScroll = ref(true)
const sliderRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

// Computed
const activeGame = computed(() => games[activeIndex.value])

// Functions
const handlePrev = () => {
  if (isAnimating.value || activeIndex.value === 0) return
  isAnimating.value = true
  activeIndex.value--
  setTimeout(() => (isAnimating.value = false), 500)
}

const handleNext = () => {
  if (isAnimating.value || activeIndex.value === games.length - 1) return
  isAnimating.value = true
  activeIndex.value++
  setTimeout(() => (isAnimating.value = false), 500)
}

const handleSelectGame = (index: number) => {
  if (isAnimating.value || index === activeIndex.value) return
  isAnimating.value = true
  activeIndex.value = index
  setTimeout(() => (isAnimating.value = false), 500)
}

const scrollSlider = (direction: 'left' | 'right') => {
  if (!sliderRef.value) return
  const scrollAmount = direction === 'left' ? -300 : 300
  sliderRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
}

// Scroll visibility
const checkScroll = () => {
  if (!sliderRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = sliderRef.value
  showLeftScroll.value = scrollLeft > 0
  showRightScroll.value = scrollLeft < scrollWidth - clientWidth - 10
}

// Scroll active game into view
const scrollActiveGameIntoView = () => {
  if (!sliderRef.value) return
  const activeElement = sliderRef.value.children[activeIndex.value] as HTMLElement
  if (activeElement) {
    const sliderRect = sliderRef.value.getBoundingClientRect()
    const activeRect = activeElement.getBoundingClientRect()
    const isInView = activeRect.left >= sliderRect.left && activeRect.right <= sliderRect.right - 40
    if (!isInView) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }
}

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    handlePrev()
  } else if (e.key === 'ArrowRight') {
    handleNext()
  }
}

// Lifecycle hooks
onMounted(() => {
  if (sliderRef.value) {
    sliderRef.value.addEventListener('scroll', checkScroll)
    checkScroll()
  }
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (sliderRef.value) {
    sliderRef.value.removeEventListener('scroll', checkScroll)
  }
  window.removeEventListener('keydown', handleKeyDown)
})

// Watch activeIndex to scroll active game into view
watch(activeIndex, () => {
  scrollActiveGameIntoView()
})

// Utility for className concatenation (equivalent to cn)
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(' ')
}
</script>

<template>
  <div
    ref="containerRef"
    class="relative mt-8 overflow-hidden rounded-xl bg-gray-800 shadow-xl"
    style="min-height: 700px"
  >
    <!-- Game Cover Background with Overlay -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="h-full w-full bg-cover bg-center transition-transform duration-700 ease-out"
        :style="{
          backgroundImage: `url(${activeGame.coverImage})`,
          transform: 'scale(1.05)',
          filter: 'blur(4px)',
        }"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/50"
      ></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex h-full flex-col px-4 py-6 md:px-8">
      <!-- Game Selection Icons with Integrated Navigation -->
      <div class="relative mb-8 mt-4">
        <!-- Left Scroll Button -->
        <button
          v-if="showLeftScroll"
          @click="scrollSlider('left')"
          class="absolute -left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800/90 text-purple-300 shadow-lg transition-colors hover:bg-gray-700 hover:text-purple-200"
          aria-label="Scroll left"
        >
          <ChevronLeft :size="24" />
        </button>

        <!-- Game Icons Slider -->
        <div
          ref="sliderRef"
          class="flex space-x-3 overflow-x-auto py-2 scrollbar-hide md:space-x-4"
          style="scrollbar-width: none; -ms-overflow-style: none"
        >
          <button
            v-for="(game, index) in games"
            :key="game.id"
            @click="handleSelectGame(index)"
            :class="[
              'group relative flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl transition-all duration-300 md:h-24 md:w-24',
              index === activeIndex
                ? 'bg-gradient-to-t from-purple-900 to-purple-700 shadow-lg shadow-purple-500/20 scale-105 z-10'
                : 'bg-gray-800/90 hover:bg-gray-700/90',
            ]"
            :aria-label="`Select ${game.title}`"
            :aria-current="index === activeIndex ? 'true' : 'false'"
          >
            <div
              :class="[
                'h-16 w-16 rounded-xl bg-cover bg-center transition-transform md:h-20 md:w-20',
                index === activeIndex ? 'scale-80' : 'scale-70 group-hover:scale-75',
              ]"
              :style="{ backgroundImage: `url(${game.iconImage})` }"
            ></div>
            <!-- <span
              :class="[
                'max-w-[60%] truncate text-xs font-medium transition-colors md:text-base',
                index === activeIndex ? 'text-white' : 'text-gray-400 group-hover:text-gray-200',
              ]"
            >
              {{ game.title }}
            </span> -->
            <div
              v-if="index === activeIndex"
              class="absolute -bottom-1 h-1 w-16 rounded-full bg-purple-400"
            ></div>
          </button>
        </div>

        <!-- Right Scroll Button -->
        <button
          v-if="showRightScroll"
          @click="scrollSlider('right')"
          class="absolute -right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800/90 text-purple-300 shadow-lg transition-colors hover:bg-gray-700 hover:text-purple-200"
          aria-label="Scroll right"
        >
          <ChevronRight :size="24" />
        </button>
      </div>

      <!-- Game Indicator -->
      <div class="mb-4 flex justify-center">
        <!-- <div class="inline-block rounded-full bg-purple-900/80 px-4 py-1 text-sm text-white">
          <span class="font-bold">{{ activeIndex + 1 }}</span>
          <span class="mx-1 opacity-70">/</span>
          <span>{{ games.length }}</span>
        </div> -->
      </div>

      <!-- Selected Game Details -->
      <div class="mt-auto grid gap-8 pb-6 md:grid-cols-5">
        <!-- Game Info -->
        <div class="md:col-span-2">
          <h3 class="mb-2 font-mono text-3xl font-bold text-white">
            {{ activeGame.title }}
            <!-- <span
              v-if="activeIndex === 0"
              class="ml-2 inline-block animate-pulse rounded-md bg-purple-600 px-2 py-0.5 text-xs font-normal text-white"
            >
              NEW
            </span> -->
          </h3>
          <div class="mb-4 flex flex-wrap gap-2">
            <span
              v-for="tag in activeGame.tags"
              :key="tag"
              class="rounded-full bg-gray-700/80 px-3 py-1 text-xs text-purple-300"
            >
              {{ tag }}
            </span>
          </div>
          <p class="mb-6 text-purple-200">{{ activeGame.description }}</p>
          <div class="mt-6">
            <a
              href="#"
              class="inline-flex items-center rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
            >
              Explore
              <SquareArrowOutUpRight :size="16" class="ml-2" />
            </a>
          </div>
        </div>

        <!-- Game Cover Art -->
        <div class="md:col-span-3">
          <div
            class="aspect-video w-full overflow-hidden rounded-lg border-2 border-purple-900/50 bg-cover bg-center shadow-xl shadow-purple-900/20"
            :style="{ backgroundImage: `url(${activeGame.coverImage})` }"
          >
            <div class="flex h-full flex-col justify-between bg-gradient-to-t from-gray-900/90 p-4">
              <div class="flex justify-between">
                <span
                  class="rounded-full bg-gray-800/90 px-3 py-1 text-xs font-medium text-purple-300"
                >
                  {{ activeGame.platform }}
                </span>
              </div>
              <div class="self-end">
                <!-- <div
                  v-if="activeIndex === 0"
                  class="mb-2 inline-block rounded-lg bg-purple-600 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white"
                >
                  Featured
                </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
