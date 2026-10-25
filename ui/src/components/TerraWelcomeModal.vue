<script setup lang="ts">
import { currentSlackId, showTerraWelcomeModal } from "@/utils/terraAuth";

function closeModal() {
  showTerraWelcomeModal.value = false;
}
</script>

<template>
  <div v-if="showTerraWelcomeModal"
    class="fixed inset-0 z-10001 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
    <div
      class="card w-full max-w-md bg-base-100 shadow-2xl border-2 border-emerald-500 overflow-hidden transform animate-scale-up">
      <div
        class="bg-linear-to-r from-emerald-600 via-teal-700 to-green-800 p-6 flex flex-col items-center justify-center text-white text-center relative">
        <img src="https://terra.hackclub.com/assets/loginscreen/terra-logo-with-banner-q80.webp" alt="Terra"
          class="h-16 object-contain mb-2 drop-shadow-md" />
        <h2 class="text-2xl font-black tracking-wide">
          Welcome Terra Reviewer!
        </h2>
      </div>

      <div class="card-body p-6 flex flex-col gap-4 text-center">
        <p class="text-sm text-base-content/80 leading-relaxed">
          Detected that you have logged in via Hack Club OAuth and have been authenticated by a Cloudflare Worker as
          <span class="font-bold text-emerald-600">Terra Reviewer</span>！
        </p>

        <div v-if="currentSlackId"
          class="bg-base-200/80 rounded-lg p-2.5 text-xs flex items-center justify-center gap-2 border border-base-300">
          <span class="text-base-content/60">Slack ID:</span>
          <span class="font-mono font-bold text-primary">{{ currentSlackId }}</span>
        </div>

        <div
          class="text-xs text-base-content/70 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-left space-y-1">
          <div class="font-bold text-emerald-700 flex items-center gap-1">
            Explore this site and see if you can find any hidden Easter eggs! (There’s a reward for finding one.) (Sorry
            but US only)
          </div>
        </div>

        <div class="card-actions justify-center mt-2">
          <button class="btn btn-primary btn-block font-bold" @click="closeModal">
            Start TERRRAAA!~
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes scaleUp {
  from {
    transform: scale(0.92);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
