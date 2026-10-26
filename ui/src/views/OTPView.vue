<script setup lang="ts">
import Header from "@/components/Header.vue";
import { ClientResponseError, pb } from "@/pb";
import { checkTerraWorkerStatus } from "@/utils/terraAuth";
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref<string>("");
const otp = ref<string>("");
const otpId = ref<string>("");
const password = ref<string>("");

const message = ref<string>("");
const error = ref<string>("");

const loading = ref<boolean>(false);
const emailInputDisable = ref<boolean>(false);

// 2FA state when logging in via OTP
const isMfaStep = ref<boolean>(false);
const mfaId = ref<string>("");

const router = useRouter();
if (pb.authStore.isValid) {
  router.push("/");
}

async function handleSend() {
  message.value = "";
  error.value = "";

  if (!email.value) {
    message.value = "Please fill in your email!";
    return;
  }

  loading.value = true;
  emailInputDisable.value = true;

  try {
    const result = await pb.collection("users").requestOTP(email.value);
    otpId.value = result.otpId;
    message.value =
      "You should receive an email with your one-time password if your email exists in our system.";
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      console.warn("PocketBase Auth Error:", err.status, err.response);
      error.value = err.message || "Failed to send OTP.";
    } else {
      error.value = "Network error";
    }
    emailInputDisable.value = false;
  } finally {
    loading.value = false;
  }
}

async function handleConfirm() {
  message.value = "";
  error.value = "";

  const code = otp.value.replace(/[\s-]/g, "").trim();
  if (!code || !otpId.value) {
    error.value = "Please enter the OTP code.";
    return;
  }

  loading.value = true;

  try {
    await pb.collection("users").authWithOTP(otpId.value, code);
    const isWorker = await checkTerraWorkerStatus({ showModal: true });
    if (isWorker) {
      router.push("/terra");
    } else {
      router.push("/");
    }
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      const respMfaId = (err.response as any)?.mfaId || (err.data as any)?.mfaId;
      if (err.status === 401 && respMfaId) {
        mfaId.value = respMfaId;
        isMfaStep.value = true;
        message.value = "Two-factor authentication is required. Please enter your account password.";
        return;
      }

      console.warn("PocketBase Auth Error:", err.status, err.response);
      if (err.message?.toLowerCase().includes("invalid or expired otp") || err.status === 400) {
        error.value =
          "Invalid or expired OTP code. If you requested a code multiple times, please ensure you use the latest email received.";
      } else {
        error.value = err.message || "Invalid OTP code.";
      }
    } else {
      error.value = "Network error";
    }
  } finally {
    loading.value = false;
  }
}

async function handleMfaPasswordConfirm() {
  message.value = "";
  error.value = "";

  if (!password.value) {
    error.value = "Please enter your password.";
    return;
  }

  loading.value = true;

  try {
    await pb.collection("users").authWithPassword(email.value, password.value, {
      query: { mfaId: mfaId.value },
    });
    const isWorker = await checkTerraWorkerStatus({ showModal: true });
    if (isWorker) {
      router.push("/terra");
    } else {
      router.push("/");
    }
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      error.value = err.message || "Invalid password.";
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
        <h1 class="text-4xl md:text-5xl font-bold mb-3">One-time password</h1>
        <p class="text-lg text-base-content/70">Log in with a temporary code</p>
      </div>
      <div class="w-full md:w-1/2">
        <div class="bg-base-200 p-8 rounded-xl shadow-lg">
          <form class="space-y-4">
            <div v-if="message" role="alert" class="alert alert-info alert-soft">
              <span>{{ message }}</span>
            </div>
            <div v-if="error" role="alert" class="alert alert-error alert-soft">
              <span>{{ error }}</span>
            </div>

            <!-- Normal OTP flow -->
            <template v-if="!isMfaStep">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Email</span>
                </label>
                <div class="flex gap-2">
                  <input
                    :disabled="emailInputDisable"
                    v-model.trim="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    class="input input-bordered flex-1"
                    required
                  />
                  <button
                    :disabled="loading"
                    type="button"
                    class="btn btn-primary"
                    @click.prevent="handleSend"
                  >
                    Send
                  </button>
                </div>

                <div class="form-control mt-4">
                  <label class="label">
                    <span class="label-text">One-time Password</span>
                  </label>
                  <input
                    v-model.trim="otp"
                    type="text"
                    name="otp"
                    maxlength="8"
                    placeholder="00000000"
                    class="input input-bordered w-full font-mono text-center tracking-wider text-base"
                    required
                  />
                </div>
                <button
                  :disabled="loading || !otpId"
                  type="button"
                  class="btn btn-primary w-full mt-4"
                  @click="handleConfirm"
                >
                  <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                  Confirm
                </button>
              </div>
            </template>

            <!-- 2FA Password Step -->
            <template v-else>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Account Password (2FA)</span>
                </label>
                <input
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  class="input input-bordered w-full"
                  required
                  @keyup.enter="handleMfaPasswordConfirm"
                />
                <button
                  :disabled="loading || !password"
                  type="button"
                  class="btn btn-primary w-full mt-4"
                  @click="handleMfaPasswordConfirm"
                >
                  <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                  Verify & Sign In
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm w-full mt-2"
                  @click="isMfaStep = false"
                >
                  Back
                </button>
              </div>
            </template>
          </form>

          <hr class="my-4 text-base-100" />

          <p class="text-center mt-4 text-sm">
            Log in with a password?
            <router-link to="/login" class="link link-primary">
              Login
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
