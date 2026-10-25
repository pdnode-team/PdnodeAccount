<script setup lang="ts">
import Header from "@/components/Header.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import { ClientResponseError, pb } from "@/pb";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  emailVisibility?: boolean;
  created: string;
  updated?: string;
}

const route = useRoute();
const router = useRouter();

const userId = computed(() => {
  const param = route.params.userid;
  return Array.isArray(param) ? param[0] : param || "";
});

const loading = ref(true);
const notFound = ref(false);
const user = ref<UserProfile | null>(null);
const copySuccess = ref(false);

const isOwnProfile = computed(() => {
  return pb.authStore.isValid && pb.authStore.record?.id === userId.value;
});

const formattedJoinedDate = computed(() => {
  if (!user.value?.created) return "";
  try {
    return new Date(user.value.created).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return user.value.created;
  }
});

async function fetchUserProfile(id: string) {
  if (!id) {
    notFound.value = true;
    loading.value = false;
    return;
  }

  loading.value = true;
  notFound.value = false;

  try {
    // If viewing own profile and logged in, use the local auth record if available
    if (pb.authStore.isValid && pb.authStore.record?.id === id) {
      user.value = pb.authStore.record as unknown as UserProfile;
    } else {
      const record = await pb.collection("users").getOne(id);
      user.value = record as unknown as UserProfile;
    }
    document.title = `${user.value?.name || "User"} (@${id}) | Pdnode Account`;
  } catch (err: unknown) {
    if (err instanceof ClientResponseError && err.status === 404) {
      notFound.value = true;
    } else {
      notFound.value = true;
    }
    user.value = null;
    document.title = "User Not Found | Pdnode Account";
  } finally {
    loading.value = false;
  }
}

async function copyProfileLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy URL:", err);
  }
}

onMounted(() => {
  fetchUserProfile(userId.value);
});

watch(userId, (newId) => {
  if (newId) {
    fetchUserProfile(newId);
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-base-100">
    <Header />

    <main class="flex-1 flex items-center justify-center p-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center gap-4 py-20">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="text-sm text-base-content/60">Loading profile...</p>
      </div>

      <!-- Not Found State -->
      <div v-else-if="notFound || !user" class="card w-full max-w-md bg-base-200 shadow-xl text-center">
        <div class="card-body items-center py-12">
          <div class="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="card-title text-2xl font-bold">User Not Found</h2>
          <p class="text-base-content/70 text-sm mt-1">
            The profile for <span class="font-mono text-xs bg-base-300 px-2 py-0.5 rounded">@{{ userId }}</span> does
            not exist or has restricted access.
          </p>
          <div class="card-actions mt-6">
            <button class="btn btn-primary btn-sm" @click="router.push('/')">
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <!-- User Profile Card -->
      <div v-else class="card w-full max-w-lg bg-base-200 shadow-xl overflow-hidden">
        <!-- Top decorative banner -->
        <div class="h-28 w-full relative">
          <div v-if="isOwnProfile"
            class="badge badge-accent absolute top-3 right-3 gap-1 shadow-sm font-semibold text-xs">
            Your Profile
          </div>
        </div>

        <div class="card-body pt-0 relative">
          <!-- Avatar offset -->
          <div class="-mt-14 mb-4 flex items-end justify-between">
            <div class="avatar ring-4 ring-base-200 rounded-full bg-base-200 shadow-md">
              <UserAvatar :id="user.id" :name="user.name || user.email || 'User'" :size="88" />
            </div>

            <!-- Share / Copy Profile Button -->
            <button class="btn btn-sm btn-outline gap-2" @click="copyProfileLink">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {{ copySuccess ? "Copied!" : "Share Profile" }}
            </button>
          </div>

          <!-- Name & ID -->
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-base-content flex items-center gap-2">
              {{ user.name || "Anonymous User" }}
            </h1>
            <p class="text-sm font-mono text-base-content/60">
              @{{ user.id }}
            </p>
          </div>

          <div class="divider my-3"></div>

          <!-- Details Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div class="bg-base-100 p-3 rounded-lg flex flex-col gap-1">
              <span class="text-xs text-base-content/60 font-medium">Joined Date</span>
              <span class="font-semibold text-base-content">
                {{ formattedJoinedDate || "Unknown" }}
              </span>
            </div>

            <div class="bg-base-100 p-3 rounded-lg flex flex-col gap-1">
              <span class="text-xs text-base-content/60 font-medium">Email</span>
              <span class="font-semibold text-base-content truncate">
                {{
                  isOwnProfile || user.emailVisibility
                    ? user.email || "No email visible"
                    : "Hidden by user"
                }}
              </span>
            </div>
          </div>

          <!-- Footer Action -->
          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost btn-sm" @click="router.push('/')">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
