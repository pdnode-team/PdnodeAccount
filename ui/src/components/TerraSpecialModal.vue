<script setup lang="ts">
import { ACHIEVEMENTS, easterEggState, resetAchievements } from "@/utils/easterEgg";

function closeModal() {
  easterEggState.showSpecialModal = false;
}

function handleReset() {
  if (confirm("确定要重置所有彩蛋进度并重新体验吗？")) {
    resetAchievements();
  }
}
</script>

<template>
  <div v-if="easterEggState.showSpecialModal"
    class="fixed inset-0 z-10000 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
    <div
      class="card w-full max-w-lg bg-base-100 shadow-2xl border-2 border-primary/30 overflow-hidden transform animate-scale-up">
      <!-- Top banner image -->
      <div
        class="relative bg-linear-to-r from-emerald-600 via-teal-700 to-green-800 p-6 flex flex-col items-center justify-center text-white">
        <h2 class="text-2xl font-black tracking-wide text-center">
          Easter egg unlocked!
        </h2>
        <p class="text-xs text-emerald-100 opacity-90 mt-1">
          Hack Club Terra • You Ship, We Ship
        </p>
      </div>

      <div class="card-body p-6 flex flex-col gap-5">
        <p class="text-sm text-base-content/80 text-center font-medium">
          Congratulations! You’ve successfully unlocked all 4 hidden Terra Easter eggs and earned the title of Terra
          Master!
        </p>

        <!-- Achievements checklist -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div v-for="ach in ACHIEVEMENTS.slice(0, 4)" :key="ach.id"
            class="flex items-center gap-2 p-2 rounded-lg bg-base-200/70 border border-base-300">
            <div class="truncate">
              <div class="font-bold truncate">{{ ach.title }}</div>
              <div class="text-[10px] text-success">✓ Finished</div>
            </div>
          </div>
        </div>

        <!-- Placeholder block as requested -->
        <div
          class="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-center flex flex-col items-center justify-center gap-2">
          <div class="text-base font-bold text-primary">
            Rewards
          </div>
          <p class="text-xs text-base-content/70 leading-relaxed max-w-sm">
            Thank you for your contributions to Terra; this is a gift from me personally, as well as a gift from Pdnode
            to Terra.
          </p>
          <p class="text-xs text-base-content/70 leading-relaxed max-w-sm">
            Congratulations, you’ve received a $20 gift card! (US only)
          </p>
          <p class="text-xs text-base-content/70 leading-relaxed max-w-sm">
            Please send me a private message on Slack or an email at bret@pdnode.com, and include this screenshot.
          </p>
        </div>

        <!-- Action buttons -->
        <div class="card-actions flex flex-col sm:flex-row gap-2 mt-2">
          <button class="btn btn-outline btn-sm sm:flex-1 text-base-content/60" @click="handleReset">
            Reset
          </button>
          <button class="btn btn-primary btn-sm sm:flex-1 font-bold" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

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
