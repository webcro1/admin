<script setup>
import { ref, computed, watch } from 'vue'
import VisitorInfoDialog from '@/components/VisitorInfoDialog.vue'
import BlockedIpDialog from '@/components/BlockedIpDialog.vue'

const blockDialogOpen = ref(false) // Il manquait ça ici !
const ipToBlock = ref(null)
const ipToBlockIsBlocked = ref(false)

function openBlockDialog(ip, isBlocked) {
  ipToBlock.value = ip
  ipToBlockIsBlocked.value = isBlocked
  blockDialogOpen.value = true
}
function closeBlockDialog() {
  blockDialogOpen.value = false
  ipToBlock.value = null
  ipToBlockIsBlocked.value = false
}


const visitorDialogOpen = ref(false)
const selectedIp = ref(null)

function openVisitorDialog(ip) {
  selectedIp.value = ip
  visitorDialogOpen.value = true
}
function closeVisitorDialog() {
  visitorDialogOpen.value = false
  selectedIp.value = null
}

const props = defineProps({
  visitors: {
    type: Array,
    default: () => [],
  }
})

const page = ref(1)
const perPage = ref(10)
const perPageOptions = [10, 30, 50]
const totalPages = computed(() => Math.ceil(props.visitors.length / perPage.value))

const paginatedVisitors = computed(() => {
  const start = (page.value - 1) * perPage.value
  return props.visitors.slice(start, start + perPage.value)
})

// Si perPage change, on revient à la page 1
watch(perPage, () => {
  page.value = 1
})

function prev() {
  if (page.value > 1) page.value--
}
function next() {
  if (page.value < totalPages.value) page.value++
}
function goTo(p) {
  page.value = p
}
</script>

<template>
  <!-- Desktop TABLE -->
  <div class="hidden md:block mt-8">
    <div class="flex justify-between items-center pb-2">
      <div></div>
      <!-- Dropdown "par page" -->
      <div class="flex items-center gap-2">
        <label for="per-page" class="text-sm text-gray-400">Afficher</label>
        <select
          id="per-page"
          v-model="perPage"
          class="bg-[#18181b] border border-[#232323] rounded px-2 py-1 text-sm text-gray-100 focus:border-[#1adb5b] transition"
        >
          <option v-for="option in perPageOptions" :key="option" :value="option">
            {{ option }} / page
          </option>
        </select>
      </div>
    </div>
    <div class="w-full overflow-x-auto rounded-xl shadow bg-[#18181b]">
      <table class="min-w-full text-sm text-left">
        <thead>
          <tr class="text-gray-400 border-b border-[#232323]">
            <th class="px-4 py-3 font-medium">ID</th>
            <th class="px-4 py-3 font-medium">Status</th>
            <th class="px-4 py-3 font-medium">IP</th>
            <th class="px-4 py-3 font-medium">Location</th>
            <th class="px-4 py-3 font-medium">Page</th>
            <th class="px-4 py-3 font-medium">Stage</th>
            <th class="px-4 py-3 font-medium">Actions</th>

          </tr>
        </thead>
        <tbody>
          <tr v-for="(v, index) in paginatedVisitors" :key="v.id" class="border-b border-[#232323] hover:bg-[#222226]">
            <td class="px-4 py-3 font-mono"> {{ (page - 1) * perPage + index + 1 }}</td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium',
                  v.active
                    ? 'bg-green-900 text-green-300'
                    : 'bg-red-900 text-red-300'
                ]"
              >
                <span
                  :class="[
                    'w-2 h-2 rounded-full inline-block',
                    v.active ? 'bg-green-400' : 'bg-red-400'
                  ]"
                ></span>
                {{ v.active ? 'Connecté' : 'Déconnecté' }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-200">{{ v.ip }}</td>
            <td class="px-4 py-3 text-gray-200">{{ v.location }}</td>
            <td class="px-4 py-3 text-gray-200">{{ v.page }}</td>
            <td class="px-4 py-3 text-gray-200">{{ v.is_typing }}</td>
           <td class="px-4 py-3 flex gap-2">
  <button
    @click="openVisitorDialog(v.ip)"
    class="inline-flex items-center px-2 py-1 rounded bg-[#232323] hover:bg-[#1adb5b] hover:text-black text-gray-200 transition text-sm"
    title="Voir les infos"
  >
    <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke="#1adb5b" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke="#1adb5b" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
    Voir
  </button>
<button
  v-if="!v.is_blocked"
  @click="openBlockDialog(v.ip, false)"
  class="inline-flex items-center px-2 py-1 rounded bg-[#2e1111] hover:bg-red-600 text-red-400 hover:text-white transition text-sm"
  title="Bloquer cette IP"
>
  <!-- ...icon... -->
  Block
</button>
<button
  v-else
  @click="openBlockDialog(v.ip, true)"
  class="inline-flex items-center px-2 py-1 rounded bg-[#193726] hover:bg-[#1adb5b] text-[#1adb5b] hover:text-black transition text-sm"
  title="Débloquer cette IP"
>
  <!-- ...icon unlock... -->
  Unblock
</button>
</td>

          </tr>
          <tr v-if="!paginatedVisitors.length">
            <td class="px-4 py-8 text-center text-gray-500" colspan="6">Aucun visiteur</td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination desktop -->
      <div v-if="totalPages > 1" class="flex justify-end items-center gap-2 px-4 py-4">
        <button
          @click="prev"
          :disabled="page === 1"
          class="px-3 py-1 rounded text-sm font-medium border border-[#27272a] bg-[#151516] text-gray-400 hover:text-white hover:bg-[#232323] disabled:opacity-50"
        >Précédent</button>
        <template v-for="p in totalPages" :key="p">
          <button
            @click="goTo(p)"
            :class="[
              'px-3 py-1 rounded text-sm font-medium',
              page === p ? 'bg-[#1adb5b] text-black' : 'border border-[#27272a] bg-[#151516] text-gray-400 hover:text-white hover:bg-[#232323]'
            ]"
          >{{ p }}</button>
        </template>
        <button
          @click="next"
          :disabled="page === totalPages"
          class="px-3 py-1 rounded text-sm font-medium border border-[#27272a] bg-[#151516] text-gray-400 hover:text-white hover:bg-[#232323] disabled:opacity-50"
        >Suivant</button>
      </div>
    </div>
  </div>

  <!-- Mobile CARDS -->
  <div class="flex flex-col gap-4 md:hidden mt-8">
    <!-- Dropdown mobile -->
    <div class="flex justify-end mb-2 pr-2">
      <select
        v-model="perPage"
        class="bg-[#18181b] border border-[#232323] rounded px-2 py-1 text-sm text-gray-100 focus:border-[#1adb5b] transition"
      >
        <option v-for="option in perPageOptions" :key="option" :value="option">
          {{ option }} / page
        </option>
      </select>
    </div>
    <div
      v-for="(v, index) in paginatedVisitors"
      :key="v.id"
      class="rounded-xl shadow bg-[#18181b] p-4 flex flex-col gap-2"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="font-mono text-base font-semibold">#{{ (page - 1) * perPage + index + 1 }}</span>
        <span
          :class="[
            'inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium',
            v.active
              ? 'bg-green-900 text-green-300'
              : 'bg-red-900 text-red-300'
          ]"
        >
          <span
            :class="[
              'w-2 h-2 rounded-full inline-block',
              v.active ? 'bg-green-400' : 'bg-red-400'
            ]"
          ></span>
          {{ v.active ? 'Connecté' : 'Déconnecté' }}
        </span>
      </div>
      <div class="flex flex-col gap-1 text-sm text-gray-200">
        <div><span class="text-gray-400">IP:</span> {{ v.ip }}</div>
        <div><span class="text-gray-400">Location:</span> {{ v.location }}</div>
        <div><span class="text-gray-400">Page:</span> {{ v.page }}</div>
        <div><span class="text-gray-400">Stage:</span> {{ v.is_typing }}</div>
        <button
  @click="openVisitorDialog(v.ip)"
  class="inline-flex items-center mt-2 px-2 py-1 rounded bg-[#232323] hover:bg-[#1adb5b] hover:text-black text-gray-200 transition text-sm"
>
  <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke="#1adb5b" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path stroke="#1adb5b" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
  Voir
</button>
<button
  v-if="!v.is_blocked"
  @click="openBlockDialog(v.ip, false)"
  class="inline-flex items-center px-2 py-1 rounded bg-[#2e1111] hover:bg-red-600 text-red-400 hover:text-white transition text-sm"
  title="Bloquer cette IP"
>
  <!-- ...icon... -->
  Block
</button>
<button
  v-else
  @click="openBlockDialog(v.ip, true)"
  class="inline-flex items-center px-2 py-1 rounded bg-[#193726] hover:bg-[#1adb5b] text-[#1adb5b] hover:text-black transition text-sm"
  title="Débloquer cette IP"
>
  <!-- ...icon unlock... -->
  Unblock
</button>

      </div>
    </div>
    <div v-if="!paginatedVisitors.length" class="text-center text-gray-500 py-8">
      Aucun visiteur
    </div>
    <!-- Pagination mobile -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 py-4">
      <button
        @click="prev"
        :disabled="page === 1"
        class="px-3 py-1 rounded text-sm font-medium border border-[#27272a] bg-[#151516] text-gray-400 hover:text-white hover:bg-[#232323] disabled:opacity-50"
      >Précédent</button>
      <template v-for="p in totalPages" :key="p">
        <button
          @click="goTo(p)"
          :class="[
            'px-3 py-1 rounded text-sm font-medium',
            page === p ? 'bg-[#1adb5b] text-black' : 'border border-[#27272a] bg-[#151516] text-gray-400 hover:text-white hover:bg-[#232323]'
          ]"
        >{{ p }}</button>
      </template>
      <button
        @click="next"
        :disabled="page === totalPages"
        class="px-3 py-1 rounded text-sm font-medium border border-[#27272a] bg-[#151516] text-gray-400 hover:text-white hover:bg-[#232323] disabled:opacity-50"
      >Suivant</button>
    </div>
  </div>
  <VisitorInfoDialog :open="visitorDialogOpen" :ip="selectedIp" @close="closeVisitorDialog" />
<BlockedIpDialog
  :open="blockDialogOpen"
  :ip="ipToBlock"
  :isBlocked="ipToBlockIsBlocked"
  @close="closeBlockDialog"
  @blocked="onIpBlocked"
/>

</template>
