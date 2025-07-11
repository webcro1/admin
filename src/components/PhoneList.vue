<script setup>
import { ref, watch, onMounted } from "vue";
import { supabase } from "@/lib/supabase";

const props = defineProps({
  refresh: Number, // Pour refresh quand on ajoute un numéro
});
const numbers = ref([]);
const loading = ref(false);
const error = ref("");

async function fetchNumbers() {
  loading.value = true;
  error.value = "";
  // Récupère les 30 plus récents (ajuste si tu veux)
  const { data, error: err } = await supabase
    .from("check_phone")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  if (err) error.value = "Erreur lors du chargement.";
  numbers.value = data || [];
  loading.value = false;
}
onMounted(fetchNumbers);
watch(() => props.refresh, fetchNumbers);
</script>

<template>
  <div
    class="w-full max-w-xl mx-auto mt-8 bg-[#18181b] border border-[#232323] rounded-2xl shadow px-4 py-5"
  >
    <div class="flex justify-between items-center mb-4">
      <div class="text-lg font-bold text-[#1adb5b]">Numéros enregistrés</div>
      <button
        @click="fetchNumbers"
        class="text-xs px-3 py-1 rounded bg-[#232323] border border-[#222] hover:bg-[#1adb5b] hover:text-black text-[#1adb5b] transition"
      >
        Rafraîchir
      </button>
    </div>
    <div
      class="divide-y divide-[#232323] max-h-[400px] overflow-auto scrollbar-thin"
    >
      <div
        v-for="num in numbers"
        :key="num.id"
        class="py-3 flex items-center gap-4 text-gray-200 font-mono text-base"
      >
        <svg class="w-5 h-5 text-[#1adb5b]" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            stroke-width="2"
            d="M2 6v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6m-2 0V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2m16 0H4"
          />
        </svg>
        <span class="flex-1 break-all">{{ format(num.phone) }}</span>
        <span class="text-xs text-gray-400">
          {{
            new Date(num.created_at).toLocaleString("fr-CA", {
              dateStyle: "short",
              timeStyle: "short",
            })
          }}
        </span>
      </div>
      <div
        v-if="!numbers.length && !loading"
        class="text-center py-10 text-gray-400"
      >
        Aucun numéro enregistré pour l’instant.
      </div>
      <div v-if="loading" class="text-center py-8 text-[#1adb5b] animate-pulse">
        Chargement…
      </div>
      <div v-if="error" class="text-center py-8 text-red-400">{{ error }}</div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    format(num) {
      // Format: (514) 123-4567 ou (438) 888-2222
      const cleaned = ("" + num).replace(/\D/g, "");
      if (cleaned.length === 10)
        return `(${cleaned.substr(0, 3)}) ${cleaned.substr(
          3,
          3
        )}-${cleaned.substr(6)}`;
      if (cleaned.length === 11 && cleaned.startsWith("1"))
        return `+1 (${cleaned.substr(1, 3)}) ${cleaned.substr(
          4,
          3
        )}-${cleaned.substr(7)}`;
      return num;
    },
  },
};
</script>
