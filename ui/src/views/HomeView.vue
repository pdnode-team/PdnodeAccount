<script setup lang="ts">
import { onMounted } from "vue";
import Header from "@/components/Header.vue";

onMounted(() => {
    document.title = "Pdnode Account";
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-base-100">
        <Header />
        <div
            class="flex w-full h-full justify-start items-center flex-col gap-10"
        >
            <div
                class="flex justify-center items-center flex-col relative top-10"
            >
                <h1 class="text-4xl font-bold">Pdnode Account</h1>
                <p class="py-6 text-gray-500 text-center">
                    Welcome! This is the official introduction page for Pdnode
                    Account.
                </p>
            </div>

            <div>
                <p class="text-gray-500 text-center">
                    <router-link class="link" to="/login">Login</router-link> or
                    <router-link class="link" to="/register"
                        >Register</router-link
                    >
                    to continue
                </p>
            </div>

            <div class="flex justify-center items-center flex-col">
                <h3 class="text-3xl font-bold m-10">Development Team</h3>
                <div
                    class="flex flex-col items-center gap-4 md:flex-row md:flex-wrap md:justify-center"
                >
                    <div class="card w-96 bg-base-100 card-md shadow-sm">
                        <div class="card-body">
                            <h2 class="card-title">Pidan (github@BretRen)</h2>
                            <p class="text-gray-600">
                                <b>Title</b>: Person in Charge and Lead
                                Developer
                            </p>
                            <p class="text-gray-600">
                                <b>Scope</b>: Everythings (Code, Test, Debug)
                            </p>
                        </div>
                    </div>
                    <div class="card w-96 bg-base-100 card-md shadow-sm">
                        <div class="card-body">
                            <h2 class="card-title">Terra Reviewer</h2>
                            <p class="text-gray-600">
                                Title: Free Tester & Feedback
                            </p>
                            <p class="text-gray-600">Scope: Review</p>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="flex justify-center items-center flex-col gap-4 relative bottom-5"
            >
                <h3 class="text-3xl font-bold">Contact Us</h3>
                <ul class="flex justify-center items-center flex-col gap-1">
                    <li class="text-gray-600"><b>Email:</b> bret@pdnode.com</li>
                    <li class="text-gray-600">Maybe more...</li>
                </ul>
            </div>
        </div>
    </div>
</template>
