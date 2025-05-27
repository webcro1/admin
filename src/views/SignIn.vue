<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const supabase = inject('supabase')
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true
  const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
  loading.value = false
  if (error) {
    errorMsg.value = error.message === "Invalid login credentials"
      ? "Email ou mot de passe incorrect."
      : error.message
  } else {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
    <form
      class="w-full max-w-sm bg-[#18181b] p-8 rounded-2xl shadow flex flex-col gap-5 sm:max-w-sm md:max-w-md"
      @submit.prevent="handleLogin"
    >
      <div>
        <h1 class="text-2xl font-bold text-white mb-1">Login</h1>
        <p class="text-gray-300 text-sm">Enter your email below to login to your account</p>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-white mb-1" for="email">Email</label>
        <input
          id="email"
          type="email"
          v-model="email"
          class="bg-[#101011] border border-[#232323] rounded-md px-3 py-2 text-white outline-none focus:border-[#1adb5b] transition"
          placeholder="m@example.com"
          required
          autocomplete="email"
        />
      </div>

      <div class="flex flex-col gap-1">
        <div class="flex justify-between items-center mb-1">
          <label class="text-sm font-medium text-white" for="password">Password</label>
        </div>
        <input
          id="password"
          type="password"
          v-model="password"
          class="bg-[#101011] border border-[#232323] rounded-md px-3 py-2 text-white outline-none focus:border-[#1adb5b] transition"
          required
          autocomplete="current-password"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="bg-[#1adb5b] hover:bg-[#19c851] text-black font-semibold rounded-md py-2 transition text-center disabled:opacity-50"
      >
        {{ loading ? 'Connexion...' : 'Login' }}
      </button>

      <div v-if="errorMsg" class="text-red-400 text-sm text-center mt-1">
        {{ errorMsg }}
      </div>


    </form>
  </div>
</template>

