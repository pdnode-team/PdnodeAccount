<script setup lang="ts">
import Header from "@/components/Header.vue";
import { pb } from "@/pb";
import {
  checkTerraWorkerStatus,
  isTerraWorker,
  showTerraWelcomeModal,
} from "@/utils/terraAuth";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(false);
const accessDenied = ref(false);
const deniedSlackId = ref<string | null>(null);
const errorMessage = ref("");

onMounted(async () => {
  document.title = "Pdnode Account | Terra Reviewer Login";

  // If already logged in, verify whether user is a Terra Worker
  if (pb.authStore.isValid && pb.authStore.record) {
    const isWorker = await checkTerraWorkerStatus();
    if (isWorker) {
      router.push("/terra");
    } else {
      // Not an authorized reviewer, auto logout and display message
      const currentSlack = (
        pb.authStore.record as unknown as { slack_id?: string }
      )?.slack_id;
      deniedSlackId.value = currentSlack || "Unable to get Slack ID";
      accessDenied.value = true;
      pb.authStore.clear();
      isTerraWorker.value = false;
    }
  }
});

async function handleReviewerLogin() {
  loading.value = true;
  accessDenied.value = false;
  errorMessage.value = "";
  deniedSlackId.value = null;

  try {
    // Only Hack Club (oidc) is enabled
    await pb.collection("users").authWithOAuth2({
      provider: "oidc",
      scopes: ["openid", "profile", "email", "name", "slack_id"],
    });

    // Check with Cloudflare Worker
    const isWorker = await checkTerraWorkerStatus({ forceRedirect: false });

    if (isWorker) {
      showTerraWelcomeModal.value = true;
      router.push("/terra");
    } else {
      // Ineligible slack_id: auto logout and display message
      const slackId = (
        pb.authStore.record as unknown as { slack_id?: string }
      )?.slack_id;
      deniedSlackId.value = slackId || "Slack ID not linked";
      accessDenied.value = true;

      // Auto logout immediately
      pb.authStore.clear();
      isTerraWorker.value = false;
    }
  } catch (err: unknown) {
    const msg = (err as { message?: string })?.message || "Login failed, please try again";
    errorMessage.value = msg;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-base-100">
    <Header />

    <main class="flex-1 flex items-center justify-center p-4">
      <div class="card w-full max-w-md bg-base-200/90 shadow-2xl border-2 border-emerald-500/30 overflow-hidden">
        <!-- Top Banner -->
        <div
          class="bg-gradient-to-r from-emerald-600 via-teal-700 to-green-800 p-6 flex flex-col items-center justify-center text-white text-center relative">
          <img src="https://terra.hackclub.com/assets/loginscreen/terra-logo-with-banner-q80.webp" alt="Terra"
            class="h-14 object-contain mb-2 drop-shadow-md" />
          <h2 class="text-2xl font-black tracking-wide">
            Terra Reviewer Access
          </h2>
        </div>

        <div class="card-body p-6 flex flex-col gap-5">
          <p class="text-sm text-base-content/80 text-center leading-relaxed">
            Only reviewers can use this channel.
          </p>

          <!-- Access Denied Banner when slack_id does not match -->
          <div v-if="accessDenied"
            class="alert alert-error alert-soft flex flex-col items-start gap-2 text-left animate-shake">
            <div class="flex items-center gap-2 font-bold text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Access restricted</span>
            </div>

            <p class="text-xs leading-relaxed">
              Slack ID of the current account:
              <span class="font-mono font-bold underline">{{ deniedSlackId }}</span>
              You are not on the list of authorized reviewers; the system has automatically logged you out and ended
              your
              session.
            </p>

            <p class="text-[11px]">
              If you are indeed a Terra reviewer, please contact an administrator to have your Slack ID added to the
              Cloudflare Worker.
            </p>
          </div>

          <!-- General error message -->
          <div v-if="errorMessage" class="alert alert-warning text-xs p-3 shadow-sm">
            {{ errorMessage }}
          </div>

          <!-- Only Hack Club Login Button Enabled -->
          <div class="space-y-3">
            <button
              class="btn w-full bg-[#ec3750] hover:bg-[#d6283e] text-white border-none shadow-md hover:shadow-lg transition-all duration-200 gap-3 text-base font-bold"
              :disabled="loading" @click="handleReviewerLogin">
              <img src="https://assets.hackclub.com/icon-rounded.svg" alt="Hack Club" class="w-6 h-6" />
              <span v-if="!loading">Log in with Hack Club</span>
              <span v-else class="loading loading-spinner loading-sm"></span>
            </button>
          </div>

          <!-- Footer Back link -->
          <div class="text-center pt-2">
            <router-link to="/login" class="text-xs text-base-content/60 hover:text-base-content transition-colors">
              ← Return to the standard login screen
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  20%,
  60% {
    transform: translateX(-6px);
  }

  40%,
  80% {
    transform: translateX(6px);
  }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
