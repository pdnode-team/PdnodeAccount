<script setup lang="ts">
import UserAvatar from "@/components/UserAvatar.vue";
import UserAvatarDropdown from "@/components/UserAvatarDropdown.vue";
import { pb } from "@/pb";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Settings from "./Settings.vue";
import { recordLogoClick } from "@/utils/easterEgg";
import { isTerraWorker } from "@/utils/terraAuth";

const router = useRouter();
const route = useRoute();

const isLogin = ref(pb.authStore.isValid);
const currentUser = ref(pb.authStore.record);

const showSettings = ref(false);

watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/settings") {
      showSettings.value = true;
    }
  },
  { immediate: true }
);

let unsubscribeAuth: (() => void) | null = null;

onMounted(() => {
  unsubscribeAuth = pb.authStore.onChange((_, model) => {
    isLogin.value = pb.authStore.isValid;
    currentUser.value = model;
  });
});

onUnmounted(() => {
  if (unsubscribeAuth) {
    unsubscribeAuth();
  }
});

function handleLogout() {
  pb.authStore.clear();
  router.push("/login");
}
</script>

<template>
  <header class="navbar bg-base-100 shadow-sm px-4">
    <div class="flex-1">
      <router-link
        to="/"
        class="text-xl font-bold select-none transition-transform active:scale-95"
        @click="isTerraWorker ? recordLogoClick() : undefined"
      >
        Pdnode Account
      </router-link>
    </div>
    <nav class="flex-none">
      <ul class="flex flex-row items-center gap-6 text-sm font-medium">
        <li v-if="isTerraWorker">
          <router-link to="/terra" class="text-base-content/70 hover:text-base-content transition-colors">
            Terra
          </router-link>
        </li>
        <li>
          <router-link to="/help" class="text-base-content/70 hover:text-base-content transition-colors">
            Help
          </router-link>
        </li>
        <li v-if="!isLogin">
          <router-link to="/login" class="text-base-content/70 hover:text-base-content transition-colors">
            Log In
          </router-link>
        </li>
        <li v-if="!isLogin">
          <router-link to="/register" class="btn btn-primary btn-sm px-4">
            Sign Up
          </router-link>
        </li>
        <li v-else class="flex justify-center items-center">
          <UserAvatarDropdown :name="currentUser?.name || currentUser?.email || 'User'" align="end">
            <template #trigger>
              <div class="indicator cursor-pointer">
                <UserAvatar :id="currentUser?.id || currentUser?.email || 'User'" :name="currentUser?.name"
                  :size="36" />
              </div>
            </template>

        <li class="menu-title px-4 py-2 border-b border-base-200">
          <span class="font-bold text-base-content">{{
            currentUser?.name || "Account"
            }}</span>
          <span class="text-xs text-base-content/60 truncate">{{
            currentUser?.email
            }}</span>
        </li>

        <li class="mt-1">
          <button type="button" class="w-full text-left" @click="showSettings = true">
            Settings
          </button>
        </li>

        <li class="mt-1">
          <router-link :to="'/@' + currentUser?.id">
            Public Profile
          </router-link>
        </li>

        <div class="divider my-1"></div>

        <li>
          <button class="text-error hover:bg-error/10" @click="handleLogout">
            Sign Out
          </button>
        </li>
        </UserAvatarDropdown>
        </li>
      </ul>
    </nav>
  </header>
  <Settings v-model:open="showSettings" />
</template>
