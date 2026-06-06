<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { useMode } from '@/composables/useMode'

const { toasts, dismiss } = useToast()
const { mode } = useMode()
</script>

<template>
  <!-- Fixed top-right portal -->
  <Teleport to="body">
    <div class="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      <TransitionGroup name="toast" tag="div" class="toast-stack">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'toast',
            `toast--${toast.type}`,
            mode === 'developer' ? 'toast--dev' : 'toast--gamer',
          ]"
          role="alert"
        >
          <!-- Icon -->
          <span class="toast__icon" aria-hidden="true">
            <svg v-if="toast.type === 'success'" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <svg v-else-if="toast.type === 'error'" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <svg v-else viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </span>

          <!-- Message -->
          <span class="toast__message">{{ toast.message }}</span>

          <!-- Dismiss -->
          <button class="toast__close" @click="dismiss(toast.id)" aria-label="Dismiss">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- Progress bar -->
          <span class="toast__progress" aria-hidden="true" />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 22rem;
  width: 100%;
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Toast card ── */
.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-radius: 0.625rem;
  border: 1px solid transparent;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 2px 4px -1px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(8px);
}

/* Developer mode */
.toast--dev.toast--success {
  background: #f0fdf4;
  border-color: #86efac;
  color: #166534;
}
.toast--dev.toast--error {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #991b1b;
}
.toast--dev.toast--info {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1e40af;
}

/* Gamer mode */
.toast--gamer.toast--success {
  background: rgba(20, 83, 45, 0.85);
  border-color: #4ade80;
  color: #bbf7d0;
}
.toast--gamer.toast--error {
  background: rgba(127, 29, 29, 0.85);
  border-color: #f87171;
  color: #fecaca;
}
.toast--gamer.toast--info {
  background: rgba(30, 27, 75, 0.85);
  border-color: #818cf8;
  color: #c7d2fe;
}

/* ── Icon ── */
.toast__icon {
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  margin-top: 0.05rem;
}
.toast__icon svg {
  width: 100%;
  height: 100%;
}

/* ── Message ── */
.toast__message {
  flex: 1;
  font-size: 0.8125rem;
  line-height: 1.45;
  font-weight: 500;
}

/* ── Close ── */
.toast__close {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  opacity: 0.6;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  transition: opacity 0.15s;
}
.toast__close:hover {
  opacity: 1;
}
.toast__close svg {
  width: 100%;
  height: 100%;
}

/* ── Progress bar ── */
.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background: currentColor;
  opacity: 0.35;
  animation: toast-progress 4s linear forwards;
  transform-origin: left;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* ── TransitionGroup animations ── */
.toast-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(2rem) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(2rem) scale(0.92);
}
.toast-move {
  transition: transform 0.2s ease;
}
</style>
