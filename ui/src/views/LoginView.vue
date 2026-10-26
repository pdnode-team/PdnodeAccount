<script setup lang="ts">
import Header from "@/components/Header.vue";
import OauthLogin from "@/components/OauthLogin.vue";
import { ClientResponseError, pb } from "@/pb";
import { checkTerraWorkerStatus } from "@/utils/terraAuth";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
if (pb.authStore.isValid) {
  router.push("/");
}

const email = ref("");
const password = ref("");
const agreed = ref(false);

const loading = ref(false);
const error = ref("");
const message = ref("");

const verificationEmailModal = ref<HTMLDialogElement | null>(null);

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
  const targetEmail = mfaEmail.value || email.value;
  if (!targetEmail) {
    mfaError.value = "Please enter your email to receive a verification code.";
    return;
  }
  mfaLoading.value = true;
  mfaError.value = "";
  try {
    const res = await pb.collection("users").requestOTP(targetEmail);
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

async function handleMfaSubmit() {
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

    const isWorker = await checkTerraWorkerStatus({ showModal: true });
    if (isWorker) {
      router.push("/terra");
    } else {
      router.push("/");
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
      mfaError.value = "Network error during authentication.";
    }
  } finally {
    mfaLoading.value = false;
  }
}

function handleOAuthMfa(payload: { mfaId: string; provider: string }) {
  currentMfaId.value = payload.mfaId;
  isMfaRequired.value = true;
  mfaEmail.value = email.value || "";
  if (email.value) {
    requestMfaCode();
  }
}

async function sendVerificationEmail() {
  await pb.collection("users").requestVerification(email.value);
  error.value = "";
  message.value =
    "Please check your email. If you haven't received it, please check your spam folder or try again later.";
}

async function handleSubmit() {
  error.value = "";

  if (!email.value || !password.value) {
    error.value = "Please fill in all the fields!";
    return;
  }

  if (!agreed.value) {
    error.value = "Please agree to the terms";
    return;
  }

  loading.value = true;

  try {
    await pb.collection("users").authWithPassword(email.value, password.value);

    const isWorker = await checkTerraWorkerStatus({ showModal: true });
    if (isWorker) {
      router.push("/terra");
    } else {
      router.push("/");
    }
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      const mfaId = (err.response as any)?.mfaId || (err.data as any)?.mfaId;
      if (err.status === 401 && mfaId) {
        currentMfaId.value = mfaId;
        isMfaRequired.value = true;
        mfaEmail.value = email.value;
        await requestMfaCode();
        return;
      }

      console.warn("PocketBase Auth Error:", err.status, err.response);
      const fieldErrors = Object.values(err.data?.data || {})
        .map((f: any) => f?.message)
        .filter(Boolean);

      if (fieldErrors.length > 0) {
        error.value = fieldErrors.join("; ");
      } else if (
        err.message.includes(
          "The request doesn't satisfy the collection requirements",
        )
      ) {
        error.value = "Please verify your email first.";
        verificationEmailModal.value?.showModal();
      } else if (err.status === 400) {
        error.value = 'Invalid email or password. <a href="/forget-password" class="link link-primary">Forget Password?</a>';
      } else {
        error.value = err.message || "Failed to authenticate.";
      }
    } else {
      error.value = "Network error";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Header />
  <div class="min-h-full my-4 w-full flex items-center justify-center bg-base-100 px-4">
    <div class="w-full max-w-4xl flex flex-col md:flex-row items-center gap-10 md:gap-16">
      <div class="w-full md:w-1/2 text-center md:text-left">
        <h1 class="text-4xl md:text-5xl font-bold mb-3">Login</h1>
        <p class="text-lg text-base-content/70">Log in your account</p>
      </div>
      <div class="w-full md:w-1/2">
        <div class="bg-base-200 p-8 rounded-xl shadow-lg">
          <!-- 2FA Verification Card -->
          <div v-if="isMfaRequired" class="space-y-4">
            <div class="flex items-center gap-3">
              <button type="button" class="btn btn-circle btn-ghost btn-sm" @click="resetMfaState">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 class="text-xl font-bold">Two-Factor Auth</h2>
                <p class="text-xs text-base-content/70">
                  Step 2: Enter 8-digit verification code
                </p>
              </div>
            </div>

            <div v-if="mfaError" role="alert" class="alert alert-error alert-soft">
              <span>{{ mfaError }}</span>
            </div>

            <div v-if="!mfaEmail && !mfaOtpId" class="form-control">
              <label class="label">
                <span class="label-text">Account Email</span>
              </label>
              <div class="flex gap-2">
                <input v-model.trim="mfaEmail" type="email" placeholder="you@example.com"
                  class="input input-bordered flex-1" />
                <button type="button" class="btn btn-primary" :disabled="mfaLoading || !mfaEmail"
                  @click="requestMfaCode">
                  <span v-if="mfaLoading" class="loading loading-spinner loading-xs"></span>
                  Send Code
                </button>
              </div>
            </div>

            <template v-else>
              <div class="bg-base-300/40 p-3 rounded-lg text-xs text-base-content/80 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-primary" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>
                  Code sent to <span class="font-semibold text-base-content">{{ mfaEmail || email }}</span>
                </span>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Verification Code</span>
                </label>
                <input v-model.trim="mfaCode" type="text" maxlength="8" placeholder="00000000"
                  class="input input-bordered w-full font-mono text-center tracking-wider text-base" autofocus
                  @keyup.enter="handleMfaSubmit" />
              </div>

              <button :disabled="mfaLoading || mfaCode.length < 8" type="button" class="btn btn-primary w-full"
                @click="handleMfaSubmit">
                <span v-if="mfaLoading" class="loading loading-spinner loading-xs"></span>
                {{ mfaLoading ? "Verifying..." : "Verify & Sign In" }}
              </button>

              <div class="flex items-center justify-between text-xs pt-1">
                <button type="button" class="link link-primary" :disabled="mfaLoading || mfaCooldown > 0"
                  @click="requestMfaCode">
                  {{ mfaCooldown > 0 ? `Resend code in ${mfaCooldown}s` : "Resend verification code" }}
                </button>
                <button type="button" class="link text-base-content/60" @click="resetMfaState">
                  Back to login
                </button>
              </div>
            </template>
          </div>

          <!-- Standard Login Form -->
          <template v-else>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div v-if="message" role="alert" class="alert alert-info alert-soft">
                <span>{{ message }}</span>
              </div>
              <div v-if="error" role="alert" class="alert alert-error alert-soft">
                <span v-html="error"></span>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Email</span>
                </label>
                <input v-model.trim="email" type="email" name="email" placeholder="you@example.com"
                  class="input input-bordered w-full" required />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Password</span>
                </label>
                <input v-model="password" type="password" name="password" placeholder="••••••••"
                  class="input input-bordered w-full" minlength="8" required />
              </div>

              <label class="flex flex-row items-start gap-2 mt-6 cursor-pointer">
                <input v-model="agreed" type="checkbox" name="agree" class="checkbox checkbox-sm mt-0.5" required />
                <p class="text-xs text-gray-500 leading-snug">
                  I have read and agree to the
                  <a href="https://pdnode.com/terms" target="_blank" class="link">
                    Terms of Service
                  </a>
                  and
                  <a href="https://pdnode.com/privacy" target="_blank" class="link">
                    Privacy Policy </a>.
                </p>
              </label>

              <button :disabled="loading" type="submit" class="btn btn-primary w-full mt-2">
                <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                {{ loading ? "Please wait..." : "Login" }}
              </button>
            </form>

            <hr class="my-4 text-base-100" />

            <OauthLogin @mfa="handleOAuthMfa" />

            <p class="text-center mt-4 text-sm">
              Don't have a account?
              <router-link to="/register" class="link link-primary">
                Register
              </router-link>
            </p>
            <p class="text-center mt-1 text-sm">
              Like to log in with one-time password?
              <router-link to="/otp" class="link link-primary">
                OTP
              </router-link>
            </p>
            <div class="divider my-2"></div>
            <p class="text-center text-xs text-base-content/60">
              Hack Club Terra Reviewer?
              <router-link to="/login/reviewer" class="link link-success font-semibold">
                Reviewer Portal
              </router-link>
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>

  <dialog ref="verificationEmailModal" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Action Required</h3>
      <p class="py-4">
        Please verify your email address to ensure system security.
      </p>
      <div class="modal-action">
        <button class="btn" @click="() => verificationEmailModal?.close()">
          Cancel
        </button>
        <form method="dialog">
          <button class="btn btn-primary" @click="sendVerificationEmail">
            Send Email
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>
