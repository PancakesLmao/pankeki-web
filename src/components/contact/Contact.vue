<script lang="ts" setup>
import { inject } from 'vue'
import { Mail, Github, Linkedin } from 'lucide-vue-next'
import SectionTitle from '../SectionTitle.vue'
import ContactLink from './ContactLink.vue'
import ContactForm from './ContactForm.vue'
import Steam from '../icons/Steam.vue'
const { mode } = inject('mode')
</script>

<template>
  <section class="mb-16" id="contact">
    <SectionTitle :title="mode === 'developer' ? 'Contact' : 'Connect' " />

    <div
      :class="[
        'p-8 rounded-2xl transition-colors',
        mode === 'developer' ? 'bg-gray-100' : 'bg-gray-800'
      ]"
    >
      <h3
        :class="[
          'text-2xl font-bold mb-6 transition-colors',
          mode === 'developer' ? 'font-serif' : 'font-mono'
        ]"
      >
        {{ mode === 'developer' ? "Let's work together" : 'Connect with me' }}
      </h3>

      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <p
            :class="[
              'mb-6 transition-colors',
              mode === 'developer' ? 'text-gray-600' : 'text-purple-200'
            ]"
          >
            {{ mode === 'developer'
              ? 'Interested in collaborating or have a project in mind? Feel free to reach out through any of the channels below.'
              : 'Want to join my gaming community, collaborate on streams, or just chat about games? Connect with me through these platforms.' }}
          </p>

          <div class="space-y-4">
            <ContactLink
              href="mailto:phucthin29@gmail.com"
              :icon="{ component: Mail, size: 20 }"
              :text="mode === 'developer' ? 'phucthin29@gmail.com' : 'phucthin29@gmail.com'"
            />
            <ContactLink
              href="https://github.com/PancakesLmao"
              :icon="{ component: Github, size: 20 }"
              :text="mode === 'developer' ? 'PancakesLmao' : 'PancakesLmao'"
            />
            <ContactLink
              href="linkedin.com/in/khanh-phuc-thinh-nguyen-a216b928b"
              :icon="{ component: mode === 'developer' ? Linkedin : Steam, size: 20 }"
              :text="mode === 'developer' ? 'Khanh Phuc Thinh Nguyenn' : 'PancakesLmao2902'"
            />
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  </section>
</template>
