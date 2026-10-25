<script setup lang="ts">
import { onMounted, ref } from "vue";
import Header from "@/components/Header.vue";
import { pb } from "@/pb";
import { useRouter } from "vue-router";

const disable = ref<boolean>(true);
const password = ref<string>("");
const router = useRouter();

const message = ref<string>("");

onMounted(() => {
  if (!pb.authStore.isValid) {
    router.push("/login");
  }

  document.title = "Pdnode Account | Delete Your Account";
  setTimeout(() => {
    disable.value = false;
  }, 5000);
});

async function submit() {
  disable.value = true;
  message.value = "";
  try {
    await pb.collection("delete_requests").create({
      user: pb.authStore.record?.id,
      password: password.value,
    });
  } catch (err: any) {
    if (err.status === 400 && err.message?.includes("Invalid password")) {
      message.value = "Please enter the correct password.";
    }
    disable.value = false;
    return;
  }

  message.value = "Please check your email, then follow the instruction in it";
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-base-100">
    <Header />
    <div class="flex w-full h-full justify-start items-center flex-col gap-15">
      <div class="flex justify-center items-center flex-col relative top-10">
        <h1 class="text-4xl font-bold">Delete Your Account</h1>
        <div role="alert" class="alert alert-warning alert-soft mt-4">
          <span class="text-center"
            >Once you delete your account, it will be permanently (soft)
            deleted! <br />
            You cannot recover it through normal means. <br />Your data will be
            retained but anonymized; it will not be automatically deleted from
            other sub-products. Please delete it manually or email
            bret@pdnode.com. <br /><b class="font-bold"
              >To continue, please enter your password.</b
            ></span
          >
        </div>
        <fieldset class="fieldset flex">
          <legend class="fieldset-legend">Password</legend>
          <input
            type="password"
            class="input"
            placeholder="Type here"
            v-model="password"
          />
          <button
            class="btn btn-error btn-soft"
            :disabled="disable"
            @click="submit"
          >
            {{ disable ? "Please read the instruction" : "I understand" }}
          </button>
        </fieldset>
        <div
          v-if="message"
          role="alert"
          class="alert alert-info alert-soft mt-4"
        >
          <span class="text-center">{{ message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
