<script lang="ts" setup>
defineOptions({ name: 'AboutSection' })
import { Globe, Cpu, Cloud, Terminal, MonitorSmartphone, Smartphone } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useMode } from '@/composables/useMode'
import SectionTitle from '@/components/SectionTitle.vue'
import SkillItem from './SkillItem.vue'
import SkillSlider from './SkillSlider.vue'
import CustomTerminal from './Terminal.vue'

const { mode } = useMode()

// Terminal state
const showTerminal = ref(false)

// Computed property for skills based on mode
const skills = computed(() => {
  return mode.value === 'developer'
    ? [
        { text: 'Web Development', icon: { component: Globe } },
        { text: 'IoT Programming', icon: { component: Cpu } },
        { text: 'Cloud Computing', icon: { component: Cloud } },
        { text: 'Linux', icon: { component: Terminal }, interactive: true },
      ]
    : [
        { text: 'PC Gaming', icon: { component: MonitorSmartphone } },
        { text: 'Mobile Gaming', icon: { component: Smartphone } },
      ]
})

// Handle skill item click
const handleSkillClick = (skillText: string) => {
  if (skillText === 'Linux') {
    showTerminal.value = !showTerminal.value
  }
}
</script>
<template>
  <section class="pb-24 pt-12" id="about">
    <SectionTitle title="About" />

    <div class="grid md:grid-cols-2 gap-12">
      <div>
        <h3
          :class="[
            'text-2xl font-bold mb-4 transition-colors',
            mode === 'developer' ? 'font-serif' : 'font-mono',
          ]"
        >
          {{ mode === 'developer' ? 'My approach' : 'Gaming philosophy' }}
        </h3>
        <p
          :class="[
            'mb-4 transition-colors',
            mode === 'developer' ? 'text-gray-600' : 'text-purple-200',
          ]"
        >
          {{
            mode === 'developer'
              ? 'I’m a third-year Software Development student who got hooked on web development after exploring big, interactive websites from major companies. I believe a great UI doesn’t just look good—it grabs attention and makes users want to stick around. That curiosity led me to frontend development with React, where I’ve spent over a year building projects, and recently to Cloud Computing with AWS and IoT, which opened my eyes to how different tech fields can work together. I love experimenting, like deploying web apps on AWS or connecting IoT devices to cloud services.'
              : 'I love gaming because it’s a doorway to connection, creativity, and unwinding after a long day of coding. Games are more than fun—they bring people together, raiding with friends or sharing wild plot theories.'
          }}
        </p>
        <p
          :class="['transition-colors', mode === 'developer' ? 'text-gray-600' : 'text-purple-200']"
        >
          {{
            mode === 'developer'
              ? 'My approach is all about staying versatile and learning as much as I can across web, cloud, and IoT, so I’m ready for today’s fast-moving tech world, where companies expect freshers to wear multiple hats. With nearly a year of AWS experience and a hunger to grow, I’m chasing internships to dive into real-world projects, level up my skills, and help teams build something awesome.'
              : 'Modern RPGs are my jam, with deep narratives and stunning designs that show the heart poured into every detail. I’m a sucker for that artistry in character designs, surrounding worlds, and stories that hook you right away—simulation and sandbox vibes included. Every pixel feels like a labor of love. Well except for gacha, its pain, we all know that.'
          }}
        </p>
      </div>

      <div>
        <h3
          :class="[
            'text-2xl font-bold mb-4 transition-colors',
            mode === 'developer' ? 'font-serif' : 'font-mono',
          ]"
        >
          {{ mode === 'developer' ? 'Skills & Expertise' : 'Games & platforms' }}
        </h3>
        <ul class="grid grid-cols-1 gap-2 list-none">
          <SkillItem
            v-for="item in skills"
            :key="item.text"
            :text="item.text"
            :icon="item.icon"
            :is-gamer-mode="mode === 'gamer'"
            @click="item.interactive ? handleSkillClick(item.text) : null"
          />
        </ul>

        <!-- Terminal inline below skills -->
        <CustomTerminal v-if="showTerminal" class="mt-4" />
      </div>
    </div>
    <!-- Skill slider -->
    <SkillSlider v-if="mode === 'developer'" />
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
