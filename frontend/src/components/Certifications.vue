<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMode } from '@/composables/useMode'
import { Mode } from '@/types/mode'
import SectionTitle from '@/components/SectionTitle.vue'
import { certificationsApi } from '@/api'
import type { Certification } from '@/types/profile'
import kita from '../assets/seseren-kita.gif'
import { ExternalLink } from 'lucide-vue-next'

const { mode } = useMode()

const certifications = ref<Certification[]>([])
const loading = ref(false)
const fetchError = ref(false)

const selectedCert = ref<Certification | null>(null)
const isModalOpen = ref(false)

const fetchCertifications = async () => {
  loading.value = true
  fetchError.value = false
  try {
    const response = await certificationsApi.getAll()
    certifications.value = response.certifications ?? []
  } catch {
    fetchError.value = true
  } finally {
    loading.value = false
  }
}

const openModal = (cert: Certification) => {
  selectedCert.value = cert
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  selectedCert.value = null
  document.body.style.overflow = 'auto'
}

onMounted(() => fetchCertifications())
</script>

<template>
  <section :class="['mb-12 pt-12', mode === Mode.Developer ? '' : 'hidden']" id="certifications">
    <SectionTitle title="Certifications" />

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg
          class="mx-auto h-12 w-12 animate-spin text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p class="mt-4 text-gray-500">Loading certifications...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="fetchError" class="flex items-center justify-center py-12">
      <div class="text-center">
        <p class="mb-1 font-medium text-gray-700">Certifications couldn't be loaded</p>
        <button
          @click="fetchCertifications"
          class="mt-4 rounded-md bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="certifications.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
      <img :src="kita" alt="Kita" class="w-64 h-64 mb-4 text-gray-400" />
      <p class="text-lg font-medium text-gray-600">Me have none rn...</p>
    </div>

    <!-- Certifications List -->
    <div v-else class="flex flex-wrap justify-center gap-6">
      <div
        v-for="cert in certifications"
        :key="cert.id"
        @click="openModal(cert)"
        class="group relative flex cursor-pointer flex-col items-center p-4 transition-transform hover:scale-105"
      >
        <div class="h-32 w-32 overflow-hidden rounded-full bg-white shadow-md ring-2 ring-gray-100 flex items-center justify-center p-2 group-hover:ring-gray-300 transition-all">
          <img
            v-if="cert.icon"
            :src="cert.icon"
            :alt="cert.title"
            class="h-full w-full object-contain"
          />
          <div v-else class="h-full w-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-xl">
            {{ cert.title.charAt(0).toUpperCase() }}
          </div>
        </div>
        <span class="mt-3 text-sm font-medium text-gray-700 group-hover:text-gray-900 text-center max-w-[150px] break-words">
          {{ cert.title }}
        </span>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
        
        <!-- Modal Content -->
        <div class="relative w-full max-w-4xl rounded-2xl bg-gray-50 p-6 shadow-2xl transition-all overflow-hidden flex flex-col max-h-[120vh]">
          <button
            @click="closeModal"
            class="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div class="flex-1 overflow-y-auto mt-2">
            <div class="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <!-- Left side: Badge/Image -->
              <div class="w-full md:w-2/3 flex justify-center flex-shrink-0">
                <img v-if="selectedCert?.image_url || selectedCert?.icon" 
                     :src="selectedCert.image_url || selectedCert.icon" 
                     alt="Certificate Image" 
                     class="max-w-full rounded-lg shadow-sm border border-gray-200 object-contain max-h-[60vh] w-full" />
                <div v-else class="h-48 w-48 bg-white rounded-full flex items-center justify-center text-gray-400 font-bold text-6xl shadow-sm border border-gray-100">
                  {{ selectedCert?.title.charAt(0).toUpperCase() }}
                </div>
              </div>
              
              <!-- Right side: Content -->
              <div class="text-center md:text-left space-y-4 flex-1 md:w-1/3">
                <h3 class="text-2xl font-bold text-gray-900">{{ selectedCert?.title || 'N/A' }}</h3>
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Issuer: <span class="text-gray-700">{{ selectedCert?.issuer || 'N/A' }}</span></p>
                  <p class="text-sm text-gray-400">Date: <span class="text-gray-600">{{ selectedCert?.date || 'N/A' }}</span></p>
                  <div class="text-sm text-gray-400 flex items-center">
                    URL:
                    <span v-if="selectedCert?.url" class="ml-1 inline-flex items-center">
                      <a :href="selectedCert.url" target="_blank" rel="noopener noreferrer" 
                         class="text-blue-600 hover:text-blue-500 font-medium transition-colors inline-flex items-center gap-1">
                        View Certification
                        <ExternalLink class="w-4 h-4" />
                      </a>
                    </span>
                    <span v-else class="ml-1 text-gray-600">N/A</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
