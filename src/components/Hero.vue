
<script lang="ts" setup>
defineOptions({
  name: 'HeroSection'
});

import { computed } from 'vue';
import { useMode } from '@/composables/useMode';
import light_profile from '@/assets/905429.png'
import dark_profile from '@/assets/905429.png'

const { mode } = useMode()
const developerRoles = ['Frontend Developer', 'Cloud Engineer'];
const gamerRoles = ['Gacha Gremlin'];
// watch(mode, (newMode) => {
//   console.log('Mode changed to:', newMode);
// });
// console.log('Initial mode:', mode);

const writerArray = computed(() => {
  const array = mode.value === 'developer' ? developerRoles : gamerRoles;
  return array;
});
</script>

<template>
  <section class="mb-24 flex flex-col items-center text-center">
    <div
      :class="[
        'w-40 h-40 rounded-full mb-8 overflow-hidden border-4 transition-all',
        mode === 'developer' ? 'border-gray-300' : 'border-purple-600',
      ]"
    >
      <img
        :src="
          mode === 'developer'
            ? dark_profile
            : light_profile
        "
        alt="Profile"
        class="w-full h-full object-cover"
      />
    </div>

    <h2
      :class="[
        'text-4xl md:text-5xl font-bold mb-4 transition-colors',
        mode === 'developer' ? 'font-serif' : 'font-mono',
      ]"
    >
       <!-- {{ mode === 'developer' ? 'text1' : 'text2' }} -->
       <VueWriter
        :key="mode"
        :array="writerArray"
        :typeSpeed="70"
        :eraseSpeed="50"
        :delay="2000"
        :intervals="1000"
        class="inline-block typed-text"
      />
    </h2>

    <p
      :class="[
        'max-w-2xl text-lg mb-8 transition-colors',
        mode === 'developer' ? 'text-gray-600' : 'text-purple-300'
      ]"
    >
      {{ mode === 'developer'
        ? 'Sparking curiosity through vibrant web apps and cloud-powered solutions'
        : '"90% of gambling addicts quit right before they’re about to hit it big"' }}
    </p>

    <div class="flex gap-4">
      <a
        href="#contact"
        :class="[
          'px-6 py-3 rounded-md font-medium transition-colors',
          mode === 'developer'
            ? 'bg-gray-900 text-white hover:bg-gray-800'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        ]"
      >
        Get in touch
      </a>
      <a
        href="#projects"
        :class="[
          'px-6 py-3 rounded-md font-medium transition-colors',
          mode === 'developer'
            ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            : 'bg-gray-800 text-gray-50 hover:bg-gray-700'
        ]"
      >
        {{ mode === 'developer' ? 'View projects' : 'Browse games' }}
      </a>
    </div>
  </section>
</template>
