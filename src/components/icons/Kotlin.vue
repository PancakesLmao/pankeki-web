<template>
  <svg
    :width="size"
    :height="size"
    class="inline-block"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="kotlin">
      <g id="kotlin_2">
        <path
          id="Vector"
          d="M100 100H0V0.000488281H100L48.965 49.2755L100 100Z"
          fill="url(#paint0_radial_790_1084)"
        />
      </g>
    </g>
    <defs>
      <radialGradient
        id="paint0_radial_790_1084"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(96.675 4.11049) scale(114.549)"
      >
        <stop offset="0.003" stop-color="#EF4857" />
        <stop offset="0.469" stop-color="#D211EC" />
        <stop offset="1" stop-color="#7F52FF" />
      </radialGradient>
    </defs>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  size?: number | string
}>()
</script>
