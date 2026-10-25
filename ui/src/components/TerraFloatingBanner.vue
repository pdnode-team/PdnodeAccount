<script setup lang="ts">
import { easterEggState } from "@/utils/easterEgg";
import { watch } from "vue";

watch(
  () => easterEggState.showFloatingBanner,
  (val) => {
    if (val) {
      setTimeout(() => {
        easterEggState.showFloatingBanner = false;
      }, 4200);
    }
  }
);
</script>

<template>
  <div
    v-if="easterEggState.showFloatingBanner"
    class="fixed inset-0 pointer-events-none z-[9998] overflow-hidden"
  >
    <div class="floating-banner-wrapper">
      <img
        src="https://terra.hackclub.com/assets/loginscreen/terra-logo-with-banner-q80.webp"
        alt="Terra Banner"
        class="w-[380px] md:w-[480px] drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
      />
    </div>
  </div>
</template>

<style scoped>
.floating-banner-wrapper {
  position: absolute;
  top: 30%;
  left: -500px;
  animation: floatAcross 4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes floatAcross {
  0% {
    transform: translateX(0) translateY(0) rotate(-6deg) scale(0.85);
    opacity: 0;
  }
  15% {
    opacity: 1;
    transform: translateX(calc(20vw)) translateY(-20px) rotate(3deg) scale(1);
  }
  50% {
    transform: translateX(calc(55vw)) translateY(15px) rotate(-3deg) scale(1.05);
  }
  85% {
    opacity: 1;
    transform: translateX(calc(90vw)) translateY(-10px) rotate(4deg) scale(1);
  }
  100% {
    transform: translateX(calc(120vw + 500px)) translateY(0) rotate(8deg) scale(0.9);
    opacity: 0;
  }
}
</style>
