<script setup>
import { inject, computed, ref, onMounted, onBeforeUnmount } from "vue";
import {
  HomeIcon,
  Cog6ToothIcon,
  ClockIcon,
  ChevronUpDownIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  mobileOpen: Boolean,
});
const emit = defineEmits(["close-mobile", "open-mobile"]);

const session = inject("session");
const supabase = inject("supabase");

const userDropdownOpen = ref(false);
const dropdownRef = ref(null);

const email = computed(() => session?.value?.user?.email || "");
const name = computed(() => session?.value?.user?.user_metadata?.name || "");
const avatarUrl = computed(
  () =>
    session?.value?.user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/6.x/identicon/svg?seed=${email.value || "webcro"}`
);

function toggleUserDropdown() {
  userDropdownOpen.value = !userDropdownOpen.value;
}
function logout() {
  supabase.auth.signOut().then(() => {
    window.location.href = "/";
  });
  userDropdownOpen.value = false;
}

// Clic en dehors pour le dropdown user
function onClickOutside(event) {
  if (
    userDropdownOpen.value &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target)
  ) {
    userDropdownOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener("mousedown", onClickOutside);
});
onBeforeUnmount(() => {
  window.removeEventListener("mousedown", onClickOutside);
});
</script>

<template>
  <div>
    <!-- Overlay mobile -->
    <div
      v-if="mobileOpen"
      @click="$emit('close-mobile')"
      class="fixed inset-0 bg-black/60 z-40 md:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed z-50 md:static top-0 left-0 h-screen w-64 bg-[#09090b] text-white flex flex-col transition-transform',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:h-screen',
      ]"
    >
      <!-- Top logo/title -->
      <div class="flex items-center gap-3 p-4 border-b border-[#27272a]">
        <img
          src="/webcro.png"
          alt="logo"
          class="w-10 h-10 rounded-md object-cover"
        />
        <div>
          <div class="font-bold leading-tight">webcro</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-2 py-4 overflow-y-auto space-y-1">
        <!-- <router-link to="/dashboard" class="flex items-center px-3 py-2 rounded hover:bg-[#18181b] transition">
          <HomeIcon class="w-5 h-5 mr-2" />
          Dashboard
        </router-link>
        <router-link to="/preferences" class="flex items-center px-3 py-2 rounded hover:bg-[#18181b] transition">
          <Cog6ToothIcon class="w-5 h-5 mr-2" />
          Preferences
        </router-link>
        -->
        <router-link
          to="/session"
          class="flex items-center px-3 py-2 rounded hover:bg-[#18181b] transition"
        >
          <ClockIcon class="w-5 h-5 mr-2" />
          Session
        </router-link>
        <router-link
          to="/check-phone"
          class="flex items-center px-3 py-2 rounded hover:bg-[#18181b] transition"
        >
          Check Phone
        </router-link>
      </nav>

      <!-- User dropdown at the bottom -->
      <div
        class="border-t border-[#27272a] p-4 mt-auto relative flex flex-col items-stretch"
      >
        <div ref="dropdownRef" class="flex flex-col items-stretch">
          <button
            @click="toggleUserDropdown"
            class="flex items-center w-full gap-3 focus:outline-none rounded px-2 py-1 hover:bg-[#18181b] transition"
            aria-haspopup="true"
            :aria-expanded="userDropdownOpen"
          >
            <img
              :src="avatarUrl"
              alt="user"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div class="flex-1 text-left min-w-0">
              <div class="font-medium text-sm truncate">
                {{ email || "Utilisateur" }}
              </div>
              <div class="text-xs text-gray-400 truncate">{{ name }}</div>
            </div>
            <ChevronUpDownIcon
              class="w-4 h-4 text-gray-400 transition-transform duration-200"
              :class="{ '-rotate-180': userDropdownOpen }"
            />
          </button>
          <!-- Dropdown -->
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-4 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-4 scale-95"
          >
            <div
              v-if="userDropdownOpen"
              class="absolute bottom-16 left-1/2 -translate-x-1/2 min-w-[220px] max-w-xs bg-[#18181b] rounded-xl shadow-2xl py-2 z-30 flex flex-col items-stretch ring-1 ring-[#232323] ring-opacity-60"
            >
              <div
                class="flex items-center px-4 py-3 gap-3 border-b border-[#232323]"
              >
                <img
                  :src="avatarUrl"
                  alt="user"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div class="min-w-0">
                  <div class="font-medium text-sm truncate">{{ name }}</div>
                  <div class="text-xs text-gray-400 truncate">
                    {{ email || "Utilisateur" }}
                  </div>
                </div>
              </div>
              <button
                @click="logout"
                class="flex items-center gap-2 text-left px-4 py-3 rounded-b-xl hover:bg-[#27272a] text-red-400 transition font-semibold"
              >
                <ArrowLeftOnRectangleIcon class="w-5 h-5" />
                Se déconnecter
              </button>
            </div>
          </transition>
        </div>
      </div>
    </aside>

    <!-- Mobile toggle button -->
    <button
      class="flex-1 md:hidden bg-[#09090b] text-white p-2 rounded shadow h-screen"
      @click="$emit('open-mobile')"
      v-if="!mobileOpen"
      aria-label="Ouvrir le menu"
    >
      <Bars3Icon class="w-6 h-6" />
    </button>
  </div>
</template>
