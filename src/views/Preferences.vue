<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const preferences = ref([])
const loading = ref(true)
const updating = ref(false)
const error = ref('')
const success = ref(false)

async function fetchPreferences() {
  loading.value = true
  const { data, error: supaError } = await supabase
    .from('preferences')
    .select('*')
    .order('updated_at', { ascending: false })
  if (supaError) {
    error.value = supaError.message
  } else {
    preferences.value = data || []
  }
  loading.value = false
}

async function updateAllPreferences() {
  updating.value = true
  error.value = ''
  success.value = false
  try {
    // Pour chaque préférence, met à jour son is_hidden
    const updates = preferences.value.map(pref =>
      supabase.from('preferences')
        .update({
          is_hidden: pref.is_hidden,
          updated_at: new Date().toISOString()
        })
        .eq('id', pref.id)
    )
    // On attend toutes les updates (en parallèle)
    await Promise.all(updates)
    success.value = true
    setTimeout(() => { success.value = false }, 2000)
  } catch (e) {
    error.value = "Erreur lors de la mise à jour."
  }
  updating.value = false
}

onMounted(() => {
  fetchPreferences()
})
</script>


<template>
  <div class="min-h-screen bg-[#18181b] flex flex-col items-center px-2 py-10">
    <div class="w-full max-w-3xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-6 text-center">Préférences cibles</h1>
      <div class="rounded-xl border border-[#232323] bg-[#1a1a1d] overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b border-[#232323] text-gray-400 font-semibold bg-[#161618]">
              <th class="py-3 px-4 text-left font-medium">Cible</th>
              <th class="py-3 px-4 text-center font-medium">Caché</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pref in preferences"
              :key="pref.id"
              class="hover:bg-[#202021] border-b border-[#232323] transition"
            >
              <td class="py-3 px-4 font-mono text-[15px] font-medium text-white">{{ pref.target || '—' }}</td>
              <td class="py-3 px-4 flex items-center justify-center">
                <!-- Switch carré -->
                <button
                  :aria-checked="!!pref.is_hidden"
                  @click="pref.is_hidden = !pref.is_hidden"
                  type="button"
                  class="relative inline-flex h-6 w-11 items-center rounded-md transition-colors
                    duration-200 focus:outline-none
                    border border-[#232323]
                    bg-[#242426]"
                  :class="pref.is_hidden ? 'bg-[#1adb5b]/70 border-[#1adb5b]' : 'bg-[#242426] border-[#232323]'"
                >
                  <span
                    class="inline-block h-5 w-5 transform rounded bg-white shadow transition-transform duration-200"
                    :class="pref.is_hidden ? 'translate-x-5 bg-[#1adb5b] border border-[#1adb5b]' : 'translate-x-1 bg-[#fff] border border-[#232323]'"
                  ></span>
                </button>
              </td>
            </tr>
            <tr v-if="!loading && preferences.length === 0">
              <td colspan="2" class="py-8 text-center text-gray-400">Aucune cible trouvée.</td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="flex justify-center items-center py-10">
          <svg class="animate-spin h-8 w-8 text-[#1adb5b]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="#1adb5b" stroke-width="4"/>
            <path class="opacity-75" fill="#1adb5b" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
        <div v-if="error" class="text-center text-sm text-red-400 bg-red-950 rounded py-2 my-2">{{ error }}</div>
      </div>
      <div class="flex flex-col items-center mt-6 gap-2">
        <button
          @click="updateAllPreferences"
          :disabled="updating || loading"
          class="inline-flex items-center rounded-md bg-[#1adb5b] text-black px-8 py-3 text-base font-bold transition
            hover:bg-[#17c44a] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="updating">
            <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="#fff" stroke-width="4"/>
              <path class="opacity-75" fill="#fff" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Mise à jour...
          </span>
          <span v-else>Mettre à jour</span>
        </button>
        <span v-if="success" class="text-base text-green-400 mt-2">Préférences mises à jour !</span>
      </div>
    </div>
  </div>
</template>
