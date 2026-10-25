<script setup lang="ts">
import UserAvatar from "@/components/UserAvatar.vue";
import UserAvatarDropdown from "@/components/UserAvatarDropdown.vue";
import Settings from "./Settings.vue";
import { pb } from "@/pb";
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const isLogin = ref(pb.authStore.isValid);
const currentUser = ref(pb.authStore.record);

const showSettings = ref(false);

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
      <router-link to="/" class="text-xl font-bold">
        Pdnode Account
      </router-link>
    </div>
    <nav class="flex-none">
      <ul class="flex flex-row items-center gap-6 text-sm font-medium">
        <li>
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
          <router-link to="/settings" @click.prevent="showSettings = true">Settings</router-link>
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
    <!--
    <div class="flex-none ml-2">
      <label class="btn btn-ghost btn-circle swap swap-rotate">
        <input
          type="checkbox"
          data-toggle-theme="dark,light"
          data-act-class="ACTIVECLASS"
          class="theme-controller"
          value="dark"
        />

        <svg
          class="swap-off h-5 w-5 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
        </svg>

        <svg
          class="swap-on h-5 w-5 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
        </svg>
      </label>
    </div>
    -->
  </header>
  <Settings v-model:open="showSettings" />
</template>
