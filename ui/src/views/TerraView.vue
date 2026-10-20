<script setup lang="ts">
import { onMounted } from "vue";
import Header from "@/components/Header.vue";

onMounted(() => {
    document.title = "Pdnode Account | Terra";
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-base-100">
        <Header />
        <div
            class="flex w-full h-full justify-start items-center flex-col gap-15"
        >
            <div
                class="flex justify-center items-center flex-col relative top-10"
            >
                <h1 class="text-4xl font-bold">About Terra</h1>
                <p class="py-6 text-gray-500 text-center">
                    Hack Club Terra is an online programming incentive
                    program—dubbed
                    <br />
                    "You Ship, We Ship" (YSWS)—launched by the globally renowned
                    <br />
                    non-profit organization for teenage coders, Hack Club, and
                    designed
                    <br />
                    for youth aged 13–18 worldwide. <br />
                </p>
            </div>

            <div class="flex justify-center items-center flex-col">
                <h3 class="text-2xl font-bold">
                    Relationship with the Pdnode Account?
                </h3>
                <p class="py-6 text-gray-500 text-center">
                    Pdnode Account is a participating project in the first
                    official week of Terra.
                </p>
            </div>

            <div class="flex justify-center items-center flex-col">
                <h3 class="text-2xl font-bold">Notes for Reviewer / Voter</h3>
                <p class="py-6 text-gray-500 text-center">
                    This website contains a few subtle Terra Easter eggs—find
                    them and get a reward!
                </p>
            </div>
        </div>
    </div>
</template>
