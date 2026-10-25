<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { pb } from "@/pb"

const route = useRoute()
const router = useRouter()

const status = ref<"loading" | "success" | "error">("loading")
const message = ref("Confirming...")

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    status.value = "error"
    message.value = "Invalid link"
    return
  }

  try {
    await pb.send("/api/confirm-delete", {
      method: "POST",
      body: { token }
    })
    status.value = "success"
    message.value = "Account deleted successfully"
    pb.authStore.clear()

    // 可选：几秒后跳转
    setTimeout(() => router.push("/login"), 2000)
  } catch (err: any) {
    status.value = "error"
    message.value = err?.response?.message || "Invalid or expired link"
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <span v-if="status === 'loading'" class="loading loading-spinner loading-lg"></span>
      <div v-else-if="status === 'success'" class="alert alert-success">
        {{ message }}
      </div>
      <div v-else class="alert alert-error">
        {{ message }}
      </div>
    </div>
  </div>
</template>
