<script setup lang="ts">
import Header from "@/components/Header.vue";
import {
  ACHIEVEMENTS,
  easterEggState,
  resetAchievements,
} from "@/utils/easterEgg";
import { computed, onMounted } from "vue";

onMounted(() => {
  document.title = "Pdnode Account | Terra";
});

const allUnlocked = computed(() =>
  [1, 2, 3, 4].every((id) => easterEggState.unlockedIds.includes(id))
);

function openRewardModal() {
  easterEggState.showSpecialModal = true;
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-base-100">
    <Header />
    <div class="flex w-full h-full justify-start items-center flex-col gap-12 py-10 px-4">
      <div class="flex justify-center items-center flex-col text-center max-w-2xl">
        <h1 class="text-4xl font-black tracking-tight text-base-content">
          About Terra
        </h1>
        <p class="py-4 text-base-content/70 leading-relaxed">
          Hack Club Terra is an online programming incentive program—dubbed
          <br class="hidden sm:inline" />
          <span class="font-semibold text-primary">"You Ship, We Ship" (YSWS)</span>—launched by the globally renowned
          <br class="hidden sm:inline" />
          non-profit organization for teenage coders, Hack Club, and designed
          <br class="hidden sm:inline" />
          for youth aged 13–18 worldwide.
        </p>
      </div>

      <div class="flex justify-center items-center flex-col text-center max-w-xl">
        <h3 class="text-2xl font-bold">
          Relationship with the Pdnode Account?
        </h3>
        <p class="py-3 text-base-content/70">
          Pdnode Account is a participating project in the first official week of
          Terra.
        </p>
      </div>

      <!-- Easter egg achievements tracker -->
      <div class="card w-full max-w-2xl bg-base-200/60 border border-base-300 shadow-lg">
        <div class="card-body p-6">
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-base-300 pb-4">
            <div>
              <h3 class="text-xl font-bold flex items-center gap-2">
                Terra Easter Egg
                <span class="badge badge-sm" :class="allUnlocked ? 'badge-success' : 'badge-neutral'">
                  {{easterEggState.unlockedIds.filter(id => id <= 4).length}} / 4 </span>
              </h3>
              <p class="text-xs text-base-content/60 mt-1">
                Find the four hidden Easter eggs on the website to earn a reward!
              </p>
            </div>

            <div class="flex gap-2">
              <button v-if="allUnlocked" class="btn btn-sm btn-primary" @click="openRewardModal">
                YEAAAAA!
              </button>
              <button class="btn btn-sm btn-ghost text-xs text-base-content/60" @click="resetAchievements">
                Reset
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div v-for="ach in ACHIEVEMENTS.slice(0, 4)" :key="ach.id"
              class="flex items-center gap-3 p-3 rounded-lg border transition-all" :class="easterEggState.unlockedIds.includes(ach.id)
                ? 'bg-base-100 border-success/40 shadow-xs'
                : 'bg-base-100/40 border-dashed border-base-300 opacity-60'
                ">

              <div class="flex flex-col overflow-hidden">
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-sm truncate">{{ ach.title }}</span>
                  <span v-if="easterEggState.unlockedIds.includes(ach.id)"
                    class="badge badge-success badge-xs text-white">
                    Unclocked
                  </span>
                </div>
                <span class="text-xs text-base-content/60 truncate mt-0.5">
                  {{ ach.desc }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="easterEggState.unlockedIds.includes(5)"
            class="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="/easteregg/achievement-5.png" class="w-8 h-8 object-contain"
                style="image-rendering: pixelated;" />
              <div>
                <div class="font-bold text-sm text-warning-content">
                  Terra Traveler!
                </div>
                <div class="text-xs text-base-content/70">
                  WOW! Please send me an email (bret@pdnode.com) or reach out on the <a
                    href="https://hackclub.enterprise.slack.com/team/U0AHHTFJ4TV">HackClub Slack</a>.
                </div>
              </div>
            </div>
            <button class="btn btn-xs btn-warning" @click="openRewardModal">
              Open
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-center items-center flex-col text-center max-w-md">
        <h3 class="text-lg font-bold">Notes for Reviewer / Voter</h3>
        <p class="py-2 text-xs text-base-content/60">
          This website contains a few subtle Terra Easter eggs—find them and get a reward!
        </p>
      </div>
    </div>
  </div>
</template>
