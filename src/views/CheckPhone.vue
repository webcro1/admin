<script setup>
import { ref } from "vue";
import CardPhone from "@/components/CardPhone.vue";
import PhoneList from "@/components/PhoneList.vue";
import { supabase } from "@/lib/supabase";

const loading = ref(false);
const found = ref(null);
const error = ref("");
const lastChecked = ref("");
const refresh = ref(0);

async function handleSubmit(number) {
  loading.value = true;
  found.value = null;
  error.value = "";
  lastChecked.value = number;

  // Toujours 10 ou 11 chiffres (Canada)
  const num = number.replace(/[^\d]/g, "");
  const { data, error: err } = await supabase
    .from("check_phone")
    .select("*")
    .eq("phone", num)
    .single();

  if (err && err.code !== "PGRST116") {
    error.value = "Erreur lors de la vérification.";
    loading.value = false;
    return;
  }
  found.value = !!data;
  loading.value = false;
}

async function handleAdd(number) {
  loading.value = true;
  error.value = "";
  const num = number.replace(/[^\d]/g, "");
  const { error: err } = await supabase
    .from("check_phone")
    .insert([{ phone: num }]);
  if (err) {
    error.value = "Erreur lors de l'ajout.";
    loading.value = false;
    return;
  }
  found.value = true;
  refresh.value++;
  loading.value = false;
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-[#101014] px-2 pt-8 md:pt-16 pb-6">
    <h1
      class="text-2xl md:text-3xl font-bold text-[#1adb5b] mb-8 text-center drop-shadow"
    >
      Vérifier un numéro de téléphone
    </h1>
    <CardPhone
      :loading="loading"
      :found="found"
      :error="error"
      :phone="lastChecked"
      @submit="handleSubmit"
      @add="handleAdd"
    />
    <PhoneList :refresh="refresh" />
  </div>
</template>
