<script setup lang="ts">
import { onMounted } from "vue";
import Header from "@/components/Header.vue";

onMounted(() => {
  document.title = "Pdnode Account | Help";
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-base-100">
    <Header />
    <div class="flex w-full h-full justify-start items-center flex-col gap-15">
      <div class="flex justify-center items-center flex-col relative top-10">
        <h1 class="text-4xl font-bold">Help</h1>
        <p class="py-6 text-gray-500 text-center">
          If you have any questions, you can contact me at: bret@pdnode.com
        </p>
      </div>

      <div class="flex justify-center items-center flex-col">
        <h3 class="text-2xl font-bold">
          I have forgotten my password.
        </h3>
        <p class="py-6 text-gray-500 text-center">
          You can reset your password via your email address in <a class="link" href="/forget-password">here</a>. If you
          are unable
          to access your email, please contact me.
        </p>
      </div>
    </div>
  </div>
</template>
