<script setup lang="ts">
import { pb, ClientResponseError } from "@/pb";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

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

const error = ref<string>("");

onMounted(() => {
  if (!pb.authStore.isValid) {
    close();
    return;
  }
  const user = pb.authStore.record;
  console.log(user);
  nickname.value = user?.name;
  email.value = user?.email;
});

watch(
  [nickname, email, password, newPassword, confirmPassword],
  ([newNick, newMail, currentPwd, nextPwd, confirmPwd]) => {
    const user = pb.authStore.record;
    error.value = "";

    // Changing email requires current password
    if (user?.email !== newMail && !currentPwd) {
      error.value =
        "You must enter your current password when changing your email address!";
      disable.value = true;
      return;
    }

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

    if (email.value !== user.email) {
      await pb.collection("users").requestEmailChange(email.value);
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
    <div class="modal-box">
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
        <fieldset class="fieldset flex-1">
          <legend class="fieldset-legend">Current Password</legend>
          <input
            type="password"
            class="input w-full"
            placeholder="Current password"
            v-model="password"
          />
        </fieldset>

        <template v-if="email === pb.authStore.record?.email">
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
      <p v-if="error" class="text-red-500">{{ error }}</p>
      <div class="modal-action">
        <form method="dialog" class="flex gap-2">
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
