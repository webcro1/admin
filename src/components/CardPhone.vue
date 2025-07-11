<script setup>
import { ref, watch } from "vue";
const props = defineProps({
  loading: Boolean,
  found: Boolean,
  error: String,
  phone: String,
});
const emit = defineEmits(["submit", "add"]);
const input = ref(props.phone || "");

// Canadien : commence par 1, ou 514, 438, 581, 418, 819 etc., ou +1 (accepte format brut/espaces)
const phoneRegex =
  /^(?:\+1|1)?[ -.]?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})[ -.]?[0-9]{3}[ -.]?[0-9]{4}$/;

watch(
  () => props.phone,
  (val) => (input.value = val || "")
);

function onSubmit(e) {
  e.preventDefault();
  if (!isValid()) return;
  emit("submit", cleaned());
}
function onAdd() {
  if (!isValid()) return;
  emit("add", cleaned());
}
function isValid() {
  return phoneRegex.test(input.value.trim());
}
function cleaned() {
  return input.value.replace(/[^\d]/g, ""); // Only digits
}
</script>

<template>
  <div
    class="w-full max-w-xl mx-auto bg-[#19191d] border border-[#232323] rounded-2xl shadow-2xl px-6 py-7 flex flex-col gap-5 backdrop-blur"
  >
    <form @submit="onSubmit" class="flex flex-col gap-4 w-full">
      <div>
        <label class="block text-sm font-semibold text-gray-200 mb-2">
          Numéro de téléphone canadien
        </label>
        <div class="relative">
          <input
            v-model="input"
            type="text"
            inputmode="tel"
            maxlength="17"
            autocomplete="off"
            placeholder="Ex: 514 123 4567"
            class="w-full px-5 py-3 pl-11 text-base rounded-lg border border-[#232323] focus:border-[#1adb5b] focus:ring-2 focus:ring-[#1adb5b]/40 bg-[#171718] text-gray-200 shadow-lg placeholder-gray-500 transition"
            :class="{
              'border-red-500 focus:border-red-500': input && !isValid(),
            }"
            :disabled="loading"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                stroke="currentColor"
                stroke-width="2"
                d="M18 2h-3.5A2.5 2.5 0 0 0 12 4.5v3A2.5 2.5 0 0 0 14.5 10H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.5A2.5 2.5 0 0 1 12 19.5v-3A2.5 2.5 0 0 1 14.5 14H18m0-12v0zm0 0V4m0-2h-3.5A2.5 2.5 0 0 0 12 4.5v3A2.5 2.5 0 0 0 14.5 10H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.5A2.5 2.5 0 0 1 12 19.5v-3A2.5 2.5 0 0 1 14.5 14H18"
              />
            </svg>
          </span>
        </div>
        <span
          v-if="input && !isValid()"
          class="text-xs text-red-400 mt-1 block"
        >
          Format invalide. Exemple : 514 123 4567 ou +1 438 234 1234
        </span>
      </div>
      <button
        type="submit"
        class="h-12 px-8 rounded-lg font-semibold text-base bg-[#1adb5b] text-black hover:bg-[#12bb4a] focus-visible:ring-2 focus-visible:ring-[#1adb5b]/30 transition flex items-center justify-center gap-2 disabled:opacity-60"
        :disabled="loading || !isValid()"
      >
        <svg
          v-if="loading"
          class="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-80"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        {{ loading ? "Vérification..." : "Vérifier" }}
      </button>
    </form>

    <transition name="fade">
      <div
        v-if="error"
        class="flex items-center gap-2 text-sm text-red-400 font-semibold mt-2"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 20 20">
          <path
            fill="currentColor"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 112 0v1a1 1 0 11-2 0v-1zm0-4a1 1 0 112 0v1a1 1 0 11-2 0v-1z"
          />
        </svg>
        {{ error }}
      </div>
      <div
        v-else-if="found === true"
        class="flex items-center gap-2 text-green-400 font-semibold mt-2"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-width="2"
            d="M5 13l4 4L19 7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Ce numéro est déjà enregistré.
      </div>
      <div
        v-else-if="found === false && input && isValid()"
        class="flex flex-wrap items-center gap-3 text-yellow-400 font-semibold mt-2"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-width="2"
            d="M18.364 5.636l-1.414 1.414M6.343 17.657l-1.415 1.415M5.636 5.636l1.414 1.414M17.657 17.657l1.415 1.415M12 8v4m0 4h.01"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Ce numéro n'est pas enregistré.
        <button
          @click="onAdd"
          class="px-5 py-2 rounded-lg bg-[#232323] border border-[#2a2a2a] hover:bg-[#1adb5b] hover:text-black text-[#1adb5b] font-semibold text-xs transition"
          :disabled="loading"
        >
          Ajouter ce numéro
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
