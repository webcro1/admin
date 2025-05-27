<script setup>
import { ref, watch } from 'vue'
import { supabase } from '@/lib/supabase'

const props = defineProps({
  open: Boolean,
  ip: String,
  isBlocked: Boolean
})

const emit = defineEmits(['close', 'blocked'])

const loading = ref(false)
const error = ref('')
const success = ref('')

watch(() => props.open, (v) => {
  if (v) {
    error.value = ''
    success.value = ''
  }
})

async function blockIp() {
  loading.value = true
  error.value = ''
  success.value = ''
  const { error: err } = await supabase
    .from('session')
    .update({ is_blocked: true })
    .eq('ip', props.ip)
  loading.value = false
  if (err) {
    error.value = "Erreur: " + err.message
  } else {
    success.value = "IP bloquée."
    emit('blocked', props.ip)
    setTimeout(() => emit('close'), 1000)
  }
}

async function unblockIp() {
  loading.value = true
  error.value = ''
  success.value = ''
  const { error: err } = await supabase
    .from('session')
    .update({ is_blocked: false })
    .eq('ip', props.ip)
  loading.value = false
  if (err) {
    error.value = "Erreur: " + err.message
  } else {
    success.value = "IP débloquée."
    emit('blocked', props.ip)
    setTimeout(() => emit('close'), 1000)
  }
}
</script>

<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative z-10 w-full max-w-xs sm:max-w-sm mx-auto rounded-xl bg-[#18181b] border border-[#232323] p-6 flex flex-col items-center">
        <div
          class="text-lg font-bold mb-3"
          :class="props.isBlocked ? 'text-[#1adb5b]' : 'text-red-400'"
        >
          {{ props.isBlocked ? 'Confirmer le déblocage' : 'Confirmer le blocage' }}
        </div>
        <div class="text-sm text-gray-300 mb-2 text-center">
          Es-tu sûr de vouloir
          <span :class="props.isBlocked ? 'text-[#1adb5b]' : 'text-red-400'">
            {{ props.isBlocked ? 'débloquer' : 'bloquer' }}
          </span>
          l'IP suivante&nbsp;?
        </div>
        <div class="mb-4 text-xs font-mono text-gray-200 break-all">{{ props.ip }}</div>
        <div class="flex gap-3 w-full">
          <button
            @click="props.isBlocked ? unblockIp() : blockIp()"
            :disabled="loading"
            class="flex-1 px-4 py-2 rounded font-semibold transition text-sm disabled:opacity-50"
            :class="props.isBlocked
              ? 'bg-[#1adb5b] text-black hover:bg-[#14c46d]'
              : 'bg-red-600 text-white hover:bg-red-700'"
          >
            <span v-if="loading">
              {{ props.isBlocked ? 'Déblocage...' : 'Blocage...' }}
            </span>
            <span v-else>
              {{ props.isBlocked ? 'Confirmer' : 'Confirmer' }}
            </span>
          </button>
          <button
            @click="emit('close')"
            class="flex-1 px-4 py-2 rounded bg-[#232323] text-gray-200 font-semibold hover:bg-[#333] transition text-sm"
          >Annuler</button>
        </div>
        <div v-if="error" class="text-xs text-red-400 mt-3 text-center">{{ error }}</div>
        <div v-if="success" class="text-xs text-green-400 mt-3 text-center">{{ success }}</div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
