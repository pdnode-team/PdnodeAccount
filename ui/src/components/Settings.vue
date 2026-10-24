<script setup lang="ts">
import { pb, ClientResponseError } from "@/pb";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import type { RecordModel } from "pocketbase";
import OAuthCard from "./OauthCard.vue";
// TODO: Add info message when updated

const router = useRouter();

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

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && pb.authStore.isValid) {
      const user = pb.authStore.record;
      nickname.value = user?.name || "";
      email.value = user?.email || "";
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
  router.push("/");
  emit("update:open", false);
}
</script>
<template>
  <dialog id="settings_modal" class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box max-h-[calc(100vh-5rem)]">
      <h3 class="text-lg font-bold">Settings</h3>
      <div class="flex flex-col">
        <p class="font-bold">Account Information</p>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Nickname</legend>
          <input
            type="text"
            class="input w-full"
            placeholder="Type your nickname here"
            v-model="nickname"
          />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Email</legend>
          <input
            type="text"
            class="input w-full"
            placeholder="Type your email here"
            v-model="email"
          />
        </fieldset>

        <template v-if="email === pb.authStore.record?.email">
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend">Current Password</legend>
            <input
              type="password"
              class="input w-full"
              placeholder="Current password"
              v-model="password"
            />
          </fieldset>
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend">New Password</legend>
            <input
              type="password"
              class="input w-full"
              placeholder="New password"
              v-model="newPassword"
            />
          </fieldset>
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend">Confirm Password</legend>
            <input
              type="password"
              class="input w-full"
              placeholder="Repeat new password"
              v-model="confirmPassword"
            />
          </fieldset>
        </template>
      </div>
      <div class="flex flex-col gap-1" v-if="externalAuths.length > 0">
        <p class="font-bold">OAuth</p>
        <OAuthCard
          v-for="item in externalAuths"
          :key="item.id"
          :provider="item.provider"
          :display-name="providerName(item.provider)"
          :provider-id="item.providerId"
          @delete="unlink(item)"
        />
      </div>
      <p v-if="error" class="text-red-500">{{ error }}</p>
      <div class="modal-action">
        <form method="dialog" class="flex gap-2 justify-center items-center">
          <p v-if="info" class="text-green-500 text-center">{{ info }}</p>

          <button class="btn" @click="close">Close</button>

          <Transition name="fade" mode="out-in">
            <button
              v-if="!loading"
              key="save"
              class="btn btn-primary"
              :disabled="disable"
              @click="save"
            >
              Save
            </button>
            <button
              v-else
              key="loading"
              class="btn btn-primary min-w-16"
              disabled
            >
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
