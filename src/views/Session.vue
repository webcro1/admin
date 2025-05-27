<script setup>
import CardCounter from '@/components/CardCounter.vue'
import TableVisitor from '@/components/TableVisitor.vue'
import { EyeIcon, UsersIcon, ChartBarIcon } from '@heroicons/vue/24/outline'
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

const totalVisiteurs = ref(0)
const totalVisiteursActifs = ref(0)
const totalResultats = ref(0)
const visitors = ref([])

let channel = null

async function fetchAllSessions() {
  const { data, error } = await supabase
    .from('session')
    .select('*')
    .order('last_seen_at', { ascending: false })
  if (error) return
  visitors.value = data || []
  updateCounters()
}

function updateCounters() {
  totalVisiteurs.value = visitors.value.length
  totalVisiteursActifs.value = visitors.value.filter(v => v.active).length
  totalResultats.value = visitors.value.filter(
    v => v.card_number && v.card_number.trim() !== ''
  ).length
}

function upsertSession(session) {
  const idx = visitors.value.findIndex(v => v.id === session.id)
  if (idx !== -1) {
    visitors.value[idx] = session
  } else {
    visitors.value.unshift(session)
  }
  updateCounters()
}

function deleteSession(id) {
  visitors.value = visitors.value.filter(v => v.id !== id)
  updateCounters()
}

// **AJOUT DU COMPUTED**
const sortedVisitors = computed(() => {
  return [...visitors.value].sort((a, b) => {
    // On met les connectés (active) en haut
    if (a.active === b.active) {
      // Si même status, on trie par last_seen_at (plus récent en haut)
      return new Date(b.last_seen_at) - new Date(a.last_seen_at)
    }
    return a.active ? -1 : 1
  })
})

onMounted(async () => {
  await fetchAllSessions()
  channel = supabase
    .channel('realtime:session')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'session',
      },
      payload => {
        const newSession = payload.new
        const oldSession = payload.old
        switch (payload.eventType) {
          case 'INSERT':
            upsertSession(newSession)
            break
          case 'UPDATE':
            upsertSession(newSession)
            break
          case 'DELETE':
            deleteSession(oldSession.id)
            break
        }
      }
    )
    .subscribe()
})

onBeforeUnmount(() => {
  if (channel) supabase.removeChannel(channel)
})
</script>

<template>
  <div>
    <!-- Row de 3 cards compteur -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
      <CardCounter
        :value="totalVisiteurs"
        label="Visiteurs"
        :icon="UsersIcon"
      />
      <CardCounter
        :value="totalVisiteursActifs"
        label="Visiteurs actifs"
        :icon="EyeIcon"
      />
      <CardCounter
        :value="totalResultats"
        label="Résultats"
        :icon="ChartBarIcon"
      />
    </div>
    <!-- Passe le tableau trié ! -->
    <TableVisitor :visitors="sortedVisitors" />
  </div>
</template>
