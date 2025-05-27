<script setup>
defineProps({
  label: String,
  value: [Number, String],
  icon: Object, // Un composant Heroicon si tu veux
  color: {
    type: String,
    default: 'bg-[#18181b]'
  }
})
</script>

<template>
  <div :class="['rounded-xl p-6 shadow flex flex-col items-start gap-2', color]">
    <div v-if="icon" class="mb-2 text-[#1adb5b]">
      <component :is="icon" class="w-7 h-7" />
    </div>
    <div class="text-3xl font-bold">{{ value }}</div>
    <div class="text-sm text-gray-400">{{ label }}</div>
  </div>
</template>
