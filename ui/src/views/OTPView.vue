<script setup lang="ts">
import Header from "@/components/Header.vue";
import { ClientResponseError, pb } from "@/pb";
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref<string>("")
const otp = ref<string>("")
const otpId = ref<string>("")   // 新增

const message = ref<string>("")

const loading = ref<boolean>(false)
const emailInputDisable = ref<boolean>(false)

const router = useRouter();
if (pb.authStore.isValid) {
    router.push("/");
}

async function handleSend() {
    message.value = "";

    if (!email.value) {
        message.value = "Please fill in your email!";
        return;
    }

    loading.value = true;
    emailInputDisable.value = true;

    try {
        const result = await pb.collection('users').requestOTP(email.value);
        otpId.value = result.otpId;   // 保存 otpId
        message.value = "You should receive an email about your one-time password if your email exists in our system."
    } catch (err: unknown) {
        if (err instanceof ClientResponseError) {
            console.warn("PocketBase Auth Error:", err.status, err.response);
            message.value = err.message || "Failed to send OTP.";
        } else {
            message.value = "Network error";
        }
        emailInputDisable.value = false;
    } finally {
        loading.value = false;
    }
}

async function handleConfirm() {
    message.value = "";

    if (!otp.value || !otpId.value) {
        message.value = "Please enter the OTP code.";
        return;
    }

    loading.value = true;

    try {
        await pb.collection('users').authWithOTP(otpId.value, otp.value);
        router.push("/");
    } catch (err: unknown) {
        if (err instanceof ClientResponseError) {
            console.warn("PocketBase Auth Error:", err.status, err.response);
            message.value = err.message || "Invalid OTP code.";
        } else {
            message.value = "Network error";
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <Header />
    <div class="min-h-full my-4 w-full flex items-center justify-center bg-base-100 px-4">
        <div class="w-full max-w-4xl flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div class="w-full md:w-1/2 text-center md:text-left">
                <h1 class="text-4xl md:text-5xl font-bold mb-3">One-time password</h1>
            </div>
            <div class="w-full md:w-1/2">
                <div class="bg-base-200 p-8 rounded-xl shadow-lg">
                    <form class="space-y-4">
                        <div v-if="message" role="alert" class="alert alert-info alert-soft"> -->
                            <span>{{ message }}</span>
                        </div>
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">Email</span>
                            </label>
                            <div class="flex gap-2">
                                <input :disabled="emailInputDisable" v-model.trim="email" type="email" name="email"
                                    placeholder="you@example.com" class="input input-bordered flex-1" required />
                                <button :disabled="loading" type="button" class="btn btn-primary"
                                    @click.prevent="handleSend">
                                    Send
                                </button>
                            </div>

                            <div class="form-control mt-4">
                                <label class="label">
                                    <span class="label-text">One-time Password</span>
                                </label>
                                <input v-model.trim="otp" type="email" name="email" placeholder="XXXXXX"
                                    class="input input-bordered w-full" required />
                            </div>
                            <button :disabled="loading || !otpId" type="button" class="btn btn-primary w-full mt-2"
                                @click="handleConfirm">
                                Confirm
                            </button>
                        </div>

                    </form>

                    <hr class="my-4 text-base-100" />

                    <p class="text-center mt-4 text-sm">
                        Log in with a password?
                        <router-link to="/login" class="link link-primary">
                            Login
                        </router-link>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
