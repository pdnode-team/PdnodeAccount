<script setup lang="ts">
import { ref } from "vue";
import { pb, ClientResponseError } from "@/pb";
import { useRouter } from "vue-router";
import { checkTerraWorkerStatus } from "@/utils/terraAuth";

const emit = defineEmits<{
  (e: "mfa", payload: { mfaId: string; provider: string }): void;
}>();

const router = useRouter();
const loading = ref(false);
const error = ref("");

async function login(provider: string) {
  loading.value = true;
  error.value = "";
  try {
    await pb.collection("users").authWithOAuth2({
      provider,
      scopes:
        provider === "oidc"
          ? ["openid", "profile", "email", "name", "slack_id"]
          : undefined,
    });

    if (provider === "oidc") {
      const isWorker = await checkTerraWorkerStatus({ forceRedirect: true });
      if (isWorker) {
        router.push("/terra");
        return;
      }
    }

    router.push("/");
  } catch (err: any) {
    if (
      err instanceof ClientResponseError &&
      err.status === 401 &&
      (err.response?.mfaId || err.data?.mfaId)
    ) {
      emit("mfa", {
        mfaId: (err.response?.mfaId || err.data?.mfaId) as string,
        provider,
      });
      return;
    }
    error.value = err.message || "Login Failed";
    if (err.message && err.message.includes("doesn't satisfy the collection requirements")) {
      error.value = "This account has been deleted and cannot be used to log in.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-1 w-full max-w-sm mx-auto">
    <!-- GitHub -->
    <button
      class="btn w-full bg-neutral hover:bg-neutral-focus text-white border-none shadow-lg hover:shadow-xl transition-all duration-200 gap-3"
      :disabled="loading" @click="login('github')">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.38.6.12.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.24-3.24-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.92 1.23 3.24 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
      </svg>
      <span v-if="!loading" class="font-medium">Log in with GitHub</span>
      <span v-else class="loading loading-spinner loading-sm"></span>
    </button>

    <!-- Discord -->
    <button
      class="btn w-full bg-[#5865F2] hover:bg-[#4752C4] text-white border-none shadow-lg hover:shadow-xl transition-all duration-200 gap-3"
      :disabled="loading" @click="login('discord')">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.7 19.7 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.1 14.1 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01q.181.149.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.8 19.8 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
      <span v-if="!loading" class="font-medium">Log in with Discord</span>
      <span v-else class="loading loading-spinner loading-sm"></span>
    </button>

    <!-- Hack Club -->
    <button
      class="btn w-full bg-rose-500 hover:bg-rose-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200 gap-3"
      :disabled="loading" @click="login('oidc')">
      <img src="https://assets.hackclub.com/icon-rounded.svg" alt="Hack Club" class="w-7 h-7" />
      <span v-if="!loading" class="font-medium">Log in with Hack Club</span>
      <span v-else class="loading loading-spinner loading-sm"></span>
    </button>

    <div v-if="error" class="alert alert-error alert-soft shadow-md w-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>
  </div>
</template>
