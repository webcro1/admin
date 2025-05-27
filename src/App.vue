<!-- src/App.vue -->
<script setup>
import { supabase } from './lib/supabase.js'
import { ref, provide, onMounted } from 'vue'
import { RouterView } from 'vue-router'

const session = ref(null)

// On rend supabase et la session accessibles dans toute l'app
provide('supabase', supabase)
provide('session', session)

onMounted(async () => {
  // Récupère la session courante, s'il y en a une
  const { data: { session: initialSession } } = await supabase.auth.getSession()
  session.value = initialSession

  // Écoute les changements de session (login, logout, refresh…)
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })
})
</script>

<template>
  <RouterView/>
</template>
