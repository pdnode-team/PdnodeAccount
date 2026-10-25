<script setup lang="ts">
import { easterEggState } from "@/utils/easterEgg";
</script>

<template>
  <div class="fixed top-5 right-5 z-9999 flex flex-col gap-3 pointer-events-none select-none">
    <TransitionGroup name="mc-toast">
      <div v-for="toast in easterEggState.activeToasts" :key="toast.toastId" class="pointer-events-auto">
        <img :src="toast.icon" :alt="toast.title"
          class="w-[320px] h-16 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
          style="image-rendering: pixelated; image-rendering: crisp-edges;" />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Toast Transitions: smooth slide in from right, then slide out */
.mc-toast-enter-active {
  transition: all 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mc-toast-leave-active {
  transition: all 0.35s ease-in;
}

.mc-toast-enter-from {
  opacity: 0;
  transform: translateX(120%) scale(0.9);
}

.mc-toast-leave-to {
  opacity: 0;
  transform: translateX(120%) scale(0.9);
}
</style>
