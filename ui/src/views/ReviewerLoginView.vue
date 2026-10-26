<script setup lang="ts">
import Header from "@/components/Header.vue";
import { pb, ClientResponseError } from "@/pb";
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

// 2FA state
const isMfaRequired = ref(false);
const currentMfaId = ref("");
const mfaEmail = ref("");
const mfaCode = ref("");
const mfaOtpId = ref("");
const mfaLoading = ref(false);
const mfaError = ref("");
const mfaCooldown = ref(0);
let mfaTimer: ReturnType<typeof setInterval> | null = null;

function startMfaCooldown() {
  mfaCooldown.value = 60;
  if (mfaTimer) clearInterval(mfaTimer);
  mfaTimer = setInterval(() => {
    if (mfaCooldown.value > 0) {
      mfaCooldown.value--;
    } else if (mfaTimer) {
      clearInterval(mfaTimer);
      mfaTimer = null;
    }
  }, 1000);
}

function resetMfaState() {
  isMfaRequired.value = false;
  currentMfaId.value = "";
  mfaCode.value = "";
  mfaOtpId.value = "";
  mfaError.value = "";
  mfaLoading.value = false;
  if (mfaTimer) {
    clearInterval(mfaTimer);
    mfaTimer = null;
  }
}

async function requestMfaCode() {
  if (!mfaEmail.value) {
    mfaError.value = "Please enter your account email to receive a code.";
    return;
  }
  mfaLoading.value = true;
  mfaError.value = "";
  try {
    const res = await pb.collection("users").requestOTP(mfaEmail.value);
    mfaOtpId.value = res.otpId;
    startMfaCooldown();
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      mfaError.value = err.message || "Failed to send verification code.";
    } else {
      mfaError.value = "Failed to send verification code.";
    }
  } finally {
    mfaLoading.value = false;
  }
}

async function handleReviewerMfaSubmit() {
  const code = mfaCode.value.replace(/[\s-]/g, "").trim();
  if (!mfaOtpId.value || !code || !currentMfaId.value) {
    mfaError.value = "Please enter the verification code.";
    return;
  }

  mfaLoading.value = true;
  mfaError.value = "";

  try {
    await pb.collection("users").authWithOTP(mfaOtpId.value, code, {
      query: { mfaId: currentMfaId.value },
      mfaId: currentMfaId.value,
    });

    const isWorker = await checkTerraWorkerStatus({ forceRedirect: false });
    if (isWorker) {
      showTerraWelcomeModal.value = true;
      router.push("/terra");
    } else {
      const slackId = (
        pb.authStore.record as unknown as { slack_id?: string }
      )?.slack_id;
      deniedSlackId.value = slackId || "Slack ID not linked";
      accessDenied.value = true;
      pb.authStore.clear();
      isTerraWorker.value = false;
      resetMfaState();
    }
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      if (err.message?.toLowerCase().includes("invalid or expired otp") || err.status === 400) {
        mfaError.value =
          "Invalid or expired verification code. If you requested a code multiple times, please ensure you use the latest email received.";
      } else {
        mfaError.value =
          err.message || "Invalid or expired verification code. Please try again.";
      }
    } else {
      mfaError.value = "Failed to verify code.";
    }
  } finally {
    mfaLoading.value = false;
  }
}

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
    if (
      err instanceof ClientResponseError &&
      err.status === 401 &&
      (err.response?.mfaId || err.data?.mfaId)
    ) {
      currentMfaId.value = (err.response?.mfaId || err.data?.mfaId) as string;
      isMfaRequired.value = true;
      return;
    }
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
          class="bg-linear-to-r from-emerald-600 via-teal-700 to-green-800 p-6 flex flex-col items-center justify-center text-white text-center relative">
          <img src="https://terra.hackclub.com/assets/loginscreen/terra-logo-with-banner-q80.webp" alt="Terra"
            class="h-14 object-contain mb-2 drop-shadow-md" />
          <h2 class="text-2xl font-black tracking-wide">
            Terra Reviewer Access
          </h2>
        </div>

        <div class="card-body p-6 flex flex-col gap-5">
          <!-- 2FA Verification Card -->
          <div v-if="isMfaRequired" class="space-y-4">
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="btn btn-circle btn-ghost btn-sm"
                @click="resetMfaState"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h3 class="text-lg font-bold">Two-Factor Auth</h3>
                <p class="text-xs text-base-content/70">
                  Step 2: Enter 8-digit verification code
                </p>
              </div>
            </div>

            <div v-if="mfaError" role="alert" class="alert alert-error alert-soft">
              <span>{{ mfaError }}</span>
            </div>

            <div v-if="!mfaOtpId" class="form-control">
              <label class="label">
                <span class="label-text">Account Email</span>
              </label>
              <div class="flex gap-2">
                <input
                  v-model.trim="mfaEmail"
                  type="email"
                  placeholder="you@example.com"
                  class="input input-bordered flex-1"
                />
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="mfaLoading || !mfaEmail"
                  @click="requestMfaCode"
                >
                  <span v-if="mfaLoading" class="loading loading-spinner loading-xs"></span>
                  Send Code
                </button>
              </div>
            </div>

            <template v-else>
              <div class="bg-base-300/40 p-3 rounded-lg text-xs text-base-content/80 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>
                  Code sent to <span class="font-semibold text-base-content">{{ mfaEmail }}</span>
                </span>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Verification Code</span>
                </label>
                <input
                  v-model.trim="mfaCode"
                  type="text"
                  maxlength="8"
                  placeholder="00000000"
                  class="input input-bordered w-full font-mono text-center tracking-wider text-base"
                  autofocus
                  @keyup.enter="handleReviewerMfaSubmit"
                />
              </div>

              <button
                :disabled="mfaLoading || mfaCode.length < 8"
                type="button"
                class="btn btn-primary w-full"
                @click="handleReviewerMfaSubmit"
              >
                <span v-if="mfaLoading" class="loading loading-spinner loading-xs"></span>
                {{ mfaLoading ? "Verifying..." : "Verify & Sign In" }}
              </button>

              <div class="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  class="link link-primary"
                  :disabled="mfaLoading || mfaCooldown > 0"
                  @click="requestMfaCode"
                >
                  {{ mfaCooldown > 0 ? `Resend code in ${mfaCooldown}s` : "Resend verification code" }}
                </button>
                <button
                  type="button"
                  class="link text-base-content/60"
                  @click="resetMfaState"
                >
                  Cancel
                </button>
              </div>
            </template>
          </div>

          <template v-else>
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
                your session.
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

            <!-- Hint & Link back to normal login -->
            <div class="divider my-0"></div>
            <div class="flex flex-col gap-2 text-center text-xs text-base-content/60">
              <p>
                Not a reviewer?
                <router-link to="/login" class="link link-primary font-medium">
                  Standard Account Login
                </router-link>
              </p>
              <p>
                Sign in requires an active Hack Club Slack account with reviewer permissions.
              </p>
            </div>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
