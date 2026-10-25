<script setup lang="ts">
import Header from "@/components/Header.vue";
import { ClientResponseError, pb } from "@/pb";
import { ref } from "vue";

const email = ref<string>("")
const message = ref<string>("")

const loading = ref<boolean>(false)


async function handleSubmit() {
  message.value = "";

  if (!email.value) {
    message.value = "Please fill in your email!";
    return;
  }

  loading.value = true;

  try {
    await pb.collection('users').requestPasswordReset(email.value);
    message.value = "You should receive an email about resetting your password if your email exists in our system."
  } catch (err: unknown) {
    if (err instanceof ClientResponseError) {
      console.warn("PocketBase Auth Error:", err.status, err.response);
      message.value = err.message || "Failed to authenticate.";

    } else {
      message.value = "Network error";
    }
  }
}

</script>

<template>
  <Header />
  <div class="min-h-full my-4 w-full flex items-center justify-center bg-base-100 px-4">
    <div class="w-full max-w-4xl flex flex-col md:flex-row items-center gap-10 md:gap-16">
      <div class="w-full md:w-1/2 text-center md:text-left">
        <h1 class="text-4xl md:text-5xl font-bold mb-3">Forget Password</h1>
        <p class="text-lg text-base-content/70">If you forget your password</p>
      </div>
      <div class="w-full md:w-1/2">
        <div class="bg-base-200 p-8 rounded-xl shadow-lg">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div v-if="message" role="alert" class="alert alert-info alert-soft"> -->
              <span>{{ message }}</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input v-model.trim="email" type="email" name="email" placeholder="you@example.com"
                class="input input-bordered w-full" required />
            </div>
            <button :disabled="loading" type="submit" class="btn btn-primary w-full mt-2">
              {{ loading ? "Please wait..." : "Send Reset Email" }}
            </button>
          </form>

          <hr class="my-4 text-base-100" />

          <p class="text-center mt-4 text-sm">
            You remembered the password?
            <router-link to="/login" class="link link-primary">
              Login
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
