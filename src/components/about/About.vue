<script lang="ts" setup>
import { Globe, Cpu, Cloud, Terminal, MonitorSmartphone, Smartphone } from 'lucide-vue-next'
import { inject, computed } from 'vue'
import SectionTitle from '@/components/SectionTitle.vue'
import SkillItem from './Skill.vue'

// Inject mode from parent
const { mode } = inject('mode')

// Computed property for skills based on mode
const skills = computed(() => {
  return mode.value === 'developer'
    ? [
        { text: 'Web Development', icon: { component: Globe } },
        { text: 'IoT Programming', icon: { component: Cpu } },
        { text: 'Cloud Computing', icon: { component: Cloud } },
        { text: 'Linux', icon: { component: Terminal } },
      ]
    : [
        { text: 'PC Gaming', icon: { component: MonitorSmartphone } },
        { text: 'Mobile Gaming', icon: { component: Smartphone } },
      ]
})
</script>
<template>
  <section class="mb-24" id="about">
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
              : 'I love gaming because it’s a doorway to connection, creativity, and unwinding after a long day of coding. To me, games are more than fun—they bring people together, teach lessons about life, and tell stories that stick with you. Open-world RPGs are my jam, with their deep narratives and stunning designs that show the heart and effort poured into every detail. I’m a sucker for that kind of artistry, where every pixel feels like a labor of love.'
          }}
        </p>
        <p
          :class="['transition-colors', mode === 'developer' ? 'text-gray-600' : 'text-purple-200']"
        >
          {{
            mode === 'developer'
              ? 'My approach is all about staying versatile and learning as much as I can across web, cloud, and IoT, so I’m ready for today’s fast-moving tech world, where startups expect freshers to wear multiple hats. With about six months of AWS experience and a hunger to grow, I’m chasing internships to dive into real-world projects, level up my skills, and help teams build something awesome.'
              : 'My approach to gaming is about chasing those moments of awe and community, whether I’m exploring a vast RPG world or chatting with friends online. Games inspire me to think creatively, just like coding does, and I’m excited to bring that passion to internships where I can blend my love for tech and gaming to help build projects that spark joy for others.'
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
          />
        </ul>
      </div>
    </div>
  </section>
</template>
