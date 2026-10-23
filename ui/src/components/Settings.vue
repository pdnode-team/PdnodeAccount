<script setup lang="ts">
import { pb } from "@/pb";
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
const password = ref<string>("");
const confirmPassword = ref<string>("");

const loading = ref<boolean>(false);

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
  [nickname, email, password, confirmPassword],
  ([newNickname, newEmail]) => {
    const user = pb.authStore.record;

    if (newNickname === user?.name && newEmail === user?.email) {
      disable.value = true;
    } else {
      disable.value = false;
    }
  },
);

function save() {
  loading.value = true;
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    loading.value = false;
    return;
  }

  try {
    await pb.collection("users").create({
      email: email.value,
      password: password.value,
      passwordConfirm: confirmPassword.value,
      name: nickname.value,
    });

    await pb.collection("users").requestVerification(email.value);

    router.push("/login");
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      const fieldErrors = Object.values(err.data?.data || {})
        .map((f: any) => f?.message)
        .filter(Boolean);

      error.value =
        fieldErrors.length > 0
          ? `Registration failed: ${fieldErrors.join("; ")}`
          : `Registration failed: ${err.message}`;
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
        <span class="flex flex-row gap-2 justify-between">
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend">Password</legend>
            <input
              type="text"
              class="input"
              placeholder="Type your password here"
              v-model="password"
            />
          </fieldset>
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend">Confirm Password</legend>
            <input
              type="text"
              class="input"
              placeholder="Repeat your passsword here"
              v-model="confirmPassword"
            />
          </fieldset>
        </span>
      </div>
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
