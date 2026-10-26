<script setup lang="ts">
import { ClientResponseError, pb } from "@/pb";
import type { RecordModel } from "pocketbase";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import OAuthCard from "./OauthCard.vue";
// TODO: Add info message when updated

const router = useRouter();
const route = useRoute();

const props = defineProps<{
  open: boolean;
}>();

// FIRST TIME USE IT!
const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const disable = ref<boolean>(true);
const nickname = ref<string>("");
const email = ref<string>("");
const password = ref<string>(""); // Current / Old Password
const newPassword = ref<string>(""); // New Password
const confirmPassword = ref<string>(""); // Confirm New Password

const loading = ref<boolean>(false);

const info = ref<string>("");
const error = ref<string>("");

const externalAuths = ref<RecordModel[]>([]);

// 2FA state
const mfaEnabled = ref<boolean>(false);
const mfaStep = ref<"idle" | "enable_verify" | "confirm_disable">("idle");
const mfaCode = ref<string>("");
const mfaOtpId = ref<string>("");
const mfaLoading = ref<boolean>(false);
const mfaError = ref<string>("");
const mfaResendCooldown = ref<number>(0);
let mfaCooldownTimer: ReturnType<typeof setInterval> | null = null;

function startCooldown() {
  mfaResendCooldown.value = 60;
  if (mfaCooldownTimer) clearInterval(mfaCooldownTimer);
  mfaCooldownTimer = setInterval(() => {
    if (mfaResendCooldown.value > 0) {
      mfaResendCooldown.value--;
    } else if (mfaCooldownTimer) {
      clearInterval(mfaCooldownTimer);
      mfaCooldownTimer = null;
    }
  }, 1000);
}

function cancelMfaStep() {
  mfaStep.value = "idle";
  mfaCode.value = "";
  mfaError.value = "";
  if (mfaCooldownTimer) {
    clearInterval(mfaCooldownTimer);
    mfaCooldownTimer = null;
  }
}

async function startEnableMfa() {
  const user = pb.authStore.record;
  if (!user?.email) return;

  mfaLoading.value = true;
  mfaError.value = "";
  mfaCode.value = "";

  try {
    const res = await pb.collection("users").requestOTP(user.email);
    mfaOtpId.value = res.otpId;
    mfaStep.value = "enable_verify";
    startCooldown();
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      mfaError.value = err.message || "Failed to send verification code.";
    } else {
      mfaError.value = "Network error";
    }
  } finally {
    mfaLoading.value = false;
  }
}

function startDisableMfa() {
  mfaStep.value = "confirm_disable";
  mfaError.value = "";
}

async function disableMfa() {
  const user = pb.authStore.record;
  if (!user?.id) return;

  mfaLoading.value = true;
  mfaError.value = "";

  try {
    await pb.collection("users").update(user.id, {
      mfa_enabled: false,
    });

    if (pb.authStore.record) {
      (pb.authStore.record as any).mfa_enabled = false;
    }
    mfaEnabled.value = false;
    cancelMfaStep();
    info.value = "Two-Factor Authentication has been disabled.";
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      mfaError.value = err.message || "Failed to disable 2FA.";
    } else {
      mfaError.value = "Failed to disable 2FA.";
    }
  } finally {
    mfaLoading.value = false;
  }
}

async function resendMfaOtp() {
  const user = pb.authStore.record;
  if (!user?.email || mfaResendCooldown.value > 0) return;

  mfaLoading.value = true;
  mfaError.value = "";

  try {
    const res = await pb.collection("users").requestOTP(user.email);
    mfaOtpId.value = res.otpId;
    startCooldown();
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      mfaError.value = err.message || "Failed to resend code.";
    } else {
      mfaError.value = "Network error";
    }
  } finally {
    mfaLoading.value = false;
  }
}

async function confirmMfa() {
  const user = pb.authStore.record;
  const code = mfaCode.value.replace(/[\s-]/g, "").trim();
  if (!user?.id || !mfaOtpId.value || !code) {
    mfaError.value = "Please enter the verification code.";
    return;
  }

  mfaLoading.value = true;
  mfaError.value = "";

  try {
    // Verify OTP first using authWithOTP (succeeds because mfa_enabled is false)
    await pb.collection("users").authWithOTP(mfaOtpId.value, code);

    // Update mfa_enabled field
    await pb.collection("users").update(user.id, {
      mfa_enabled: true,
    });

    if (pb.authStore.record) {
      (pb.authStore.record as any).mfa_enabled = true;
    }
    mfaEnabled.value = true;
    cancelMfaStep();
    info.value = "Two-Factor Authentication has been enabled.";
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      if (err.message?.toLowerCase().includes("invalid or expired otp") || err.status === 400) {
        mfaError.value =
          "Invalid or expired verification code. If you requested a code multiple times, please ensure you use the latest email received.";
      } else {
        mfaError.value = err.message || "Failed to verify code.";
      }
    } else {
      mfaError.value = "Failed to verify code.";
    }
  } finally {
    mfaLoading.value = false;
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && pb.authStore.isValid) {
      const user = pb.authStore.record;
      nickname.value = user?.name || "";
      email.value = user?.email || "";
      mfaEnabled.value = !!(user as any)?.mfa_enabled;
      cancelMfaStep();
      externalAuths.value = await pb.collection("_externalAuths").getFullList({
        filter: `recordRef = "${user?.id}"`,
      });
      console.log(externalAuths.value);
    }
  },
);

watch(
  [nickname, email, password, newPassword, confirmPassword],
  ([newNick, newMail, currentPwd, nextPwd, confirmPwd]) => {
    const user = pb.authStore.record;
    error.value = "";

    // Changing password requires confirmation match
    if (nextPwd && nextPwd !== confirmPwd) {
      error.value = "New passwords do not match";
      disable.value = true;
      return;
    }

    const isUnchanged =
      newNick === user?.name &&
      newMail === user?.email &&
      !currentPwd &&
      !nextPwd &&
      !confirmPwd;

    disable.value = isUnchanged;
  },
);

function providerName(provider: string) {
  const map: Record<string, string> = {
    oidc: "Hack Club",
    github: "GitHub",
    discord: "Discord",
  };
  return map[provider] || provider;
}

// TODO: Replace alert()
async function unlink(item: any) {
  if (!confirm(`Are you sure you want unlink ${item.provider}?`)) return;

  try {
    await pb.collection("_externalAuths").delete(item.id);
    externalAuths.value = externalAuths.value.filter((a) => a.id !== item.id);
  } catch (err) {
    console.error(err);
    alert("Unlink Failed");
  }
}

async function save() {
  const user = pb.authStore.record;
  if (!user?.id) return;

  error.value = "";
  loading.value = true;

  try {
    const data: Record<string, any> = {
      name: nickname.value,
    };

    if (newPassword.value) {
      data.oldPassword = password.value;
      data.password = newPassword.value;
      data.passwordConfirm = confirmPassword.value;
    }

    await pb.collection("users").update(user.id, data);
    info.value = "Updated!";

    if (email.value !== user.email) {
      await pb.collection("users").requestEmailChange(email.value);
      info.value = "Please check your new email address to verify it.";
    }
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      const fieldErrors = Object.values(err.data?.data || {})
        .map((f: any) => f?.message)
        .filter(Boolean);

      error.value =
        fieldErrors.length > 0 ? fieldErrors.join("; ") : err.message;
    } else {
      error.value = "Network error";
    }
  } finally {
    loading.value = false;
  }
}

function close() {
  cancelMfaStep();
  emit("update:open", false);
  if (route.path === "/settings") {
    router.push("/");
  }
}
</script>
<template>
  <dialog id="settings_modal" class="modal" :class="{ 'modal-open': open }" @cancel.prevent="close" @close="close">
    <div class="modal-box max-h-[calc(100vh-5rem)]">
      <h3 class="text-lg font-bold">Settings</h3>
      <div class="flex flex-col">
        <p class="font-bold">Account Information</p>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Nickname</legend>
          <input type="text" class="input w-full" placeholder="Type your nickname here" v-model="nickname" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Email</legend>
          <input type="text" class="input w-full" placeholder="Type your email here" v-model="email" />
        </fieldset>

        <template v-if="email === pb.authStore.record?.email">
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend">Current Password</legend>
            <input type="password" class="input w-full" placeholder="Current password" v-model="password" />
          </fieldset>
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend">New Password</legend>
            <input type="password" class="input w-full" placeholder="New password" v-model="newPassword" />
          </fieldset>
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend">Confirm Password</legend>
            <input type="password" class="input w-full" placeholder="Repeat new password" v-model="confirmPassword" />
          </fieldset>
          <button class="btn btn-error btn-soft mt-4" @click="() => router.push('/delete-account')">
            Delete your account
          </button>
        </template>
      </div>

      <!-- Two-Factor Authentication (2FA) -->
      <div class="divider my-4"></div>
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold">Two-Factor Authentication (2FA)</span>
              <span class="badge badge-sm font-semibold" :class="mfaEnabled ? 'badge-success' : 'badge-neutral'">
                {{ mfaEnabled ? "Enabled" : "Disabled" }}
              </span>
            </div>
            <p class="text-xs text-base-content/70 mt-0.5">
              Secure your account by requiring an email verification code (OTP) at login.
            </p>
          </div>
        </div>

        <!-- Idle State Actions -->
        <div v-if="mfaStep === 'idle'" class="mt-1">
          <button v-if="!mfaEnabled" type="button" class="btn btn-outline btn-primary btn-sm gap-2"
            :disabled="mfaLoading" @click="startEnableMfa">
            <span v-if="mfaLoading" class="loading loading-spinner loading-xs"></span>
            <span>Enable 2FA</span>
          </button>
          <button v-else type="button" class="btn btn-outline btn-warning btn-sm gap-2" :disabled="mfaLoading"
            @click="startDisableMfa">
            <span v-if="mfaLoading" class="loading loading-spinner loading-xs"></span>
            <span>Disable 2FA</span>
          </button>
        </div>

        <!-- Verification Step for Enabling 2FA -->
        <div v-else-if="mfaStep === 'enable_verify'" class="bg-base-300/40 p-4 rounded-lg border border-base-300 flex flex-col gap-3 mt-1">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold">Confirm 2FA Activation</p>
              <p class="text-xs text-base-content/70 mt-0.5">
                Enter the 8-digit verification code sent to
                <span class="font-medium text-base-content">{{ email }}</span>
              </p>
            </div>
            <button type="button" class="btn btn-ghost btn-xs btn-circle" @click="cancelMfaStep">
              ✕
            </button>
          </div>

          <div class="flex gap-2 items-center">
            <input v-model.trim="mfaCode" type="text" maxlength="8" placeholder="00000000"
              class="input input-bordered flex-1 font-mono text-center tracking-wider text-base"
              @keyup.enter="confirmMfa" />
            <button type="button" class="btn btn-primary" :disabled="mfaLoading || mfaCode.length < 8"
              @click="confirmMfa">
              <span v-if="mfaLoading" class="loading loading-spinner loading-xs"></span>
              Verify & Enable
            </button>
          </div>

          <div class="flex items-center justify-between text-xs">
            <button type="button" class="link link-primary" :disabled="mfaLoading || mfaResendCooldown > 0"
              @click="resendMfaOtp">
              {{ mfaResendCooldown > 0 ? `Resend code in ${mfaResendCooldown}s` : 'Resend verification code' }}
            </button>
            <button type="button" class="link text-base-content/60" @click="cancelMfaStep">
              Cancel
            </button>
          </div>

          <p v-if="mfaError" class="text-xs text-error mt-1">{{ mfaError }}</p>
        </div>

        <!-- Confirm Disable 2FA Prompt -->
        <div v-else-if="mfaStep === 'confirm_disable'" class="bg-base-300/40 p-4 rounded-lg border border-warning/30 flex flex-col gap-3 mt-1">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold text-warning">
                Disable Two-Factor Authentication?
              </p>
              <p class="text-xs text-base-content/70 mt-1 leading-relaxed">
                Your account will no longer require an email verification code at login.
              </p>
            </div>
            <button type="button" class="btn btn-ghost btn-xs btn-circle" @click="cancelMfaStep">
              ✕
            </button>
          </div>

          <div class="flex gap-2 justify-end items-center pt-1">
            <button type="button" class="btn btn-sm btn-ghost" @click="cancelMfaStep">
              Cancel
            </button>
            <button type="button" class="btn btn-sm btn-warning" :disabled="mfaLoading" @click="disableMfa">
              <span v-if="mfaLoading" class="loading loading-spinner loading-xs"></span>
              Yes, Disable 2FA
            </button>
          </div>

          <p v-if="mfaError" class="text-xs text-error mt-1">{{ mfaError }}</p>
        </div>
      </div>
      <div class="flex flex-col gap-1 mt-4" v-if="externalAuths.length > 0">
        <p class="font-bold">OAuth</p>
        <OAuthCard v-for="item in externalAuths" :key="item.id" :provider="item.provider"
          :display-name="providerName(item.provider)" :provider-id="item.providerId" @delete="unlink(item)" />
      </div>
      <p v-if="error" class="text-red-500">{{ error }}</p>
      <div class="modal-action">
        <form method="dialog" class="flex gap-2 justify-center items-center">
          <p v-if="info" class="text-green-500 text-center">{{ info }}</p>

          <button class="btn" @click="close">Close</button>

          <Transition name="fade" mode="out-in">
            <button v-if="!loading" key="save" class="btn btn-primary" :disabled="disable" @click="save">
              Save
            </button>
            <button v-else key="loading" class="btn btn-primary min-w-16" disabled>
              <span class="loading loading-spinner loading-md"></span>
            </button>
          </Transition>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="close">
      <button>close</button>
    </form>
  </dialog>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
