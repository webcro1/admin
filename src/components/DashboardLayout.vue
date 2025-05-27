<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'

const mobileOpen = ref(false)

function openMobile() {
  mobileOpen.value = true
}
function closeMobile() {
  mobileOpen.value = false
}
</script>

<template>
  <div class="flex bg-[#09090b] h-screen relative">
    <Sidebar
      :mobileOpen="mobileOpen"
      @close-mobile="closeMobile"
      @open-mobile="openMobile"
    />
    <main class="flex-1 h-screen overflow-y-auto bg-[#09090b] text-white p-4 md:p-8 transition-all">
      <router-view />
    </main>
  </div>
</template>
