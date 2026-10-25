<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import MinecraftAchievementToast from "@/components/MinecraftAchievementToast.vue";
import TerraFloatingBanner from "@/components/TerraFloatingBanner.vue";
import TerraSpecialModal from "@/components/TerraSpecialModal.vue";
import TerraWelcomeModal from "@/components/TerraWelcomeModal.vue";
import { initKonamiListener, initConsoleEgg } from "@/utils/easterEgg";
import { isTerraWorker, checkTerraWorkerStatus } from "@/utils/terraAuth";

let stopKonami: (() => void) | null = null;
let stopConsole: (() => void) | null = null;

function setupEggs() {
  cleanupEggs();
  stopKonami = initKonamiListener();
  stopConsole = initConsoleEgg();
}

function cleanupEggs() {
  if (stopKonami) {
    stopKonami();
    stopKonami = null;
  }
  if (stopConsole) {
    stopConsole();
    stopConsole = null;
  }
}

watch(
  isTerraWorker,
  (allowed) => {
    if (allowed) {
      setupEggs();
    } else {
      cleanupEggs();
    }
  },
  { immediate: true }
);

onMounted(() => {
  checkTerraWorkerStatus();
});

onUnmounted(() => {
  cleanupEggs();
});
</script>

<template>
  <router-view />
  <template v-if="isTerraWorker">
    <MinecraftAchievementToast />
    <TerraFloatingBanner />
    <TerraSpecialModal />
    <TerraWelcomeModal />
  </template>
</template>
