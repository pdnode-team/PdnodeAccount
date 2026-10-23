<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { pb, ClientResponseError } from "@/pb";
import Header from "@/components/Header.vue";

const router = useRouter();
if (pb.authStore.isValid) {
    router.push("/");
}

const email = ref("");
const password = ref("");
const agreed = ref(false);

const loading = ref(false);
const error = ref("");
const message = ref("");

const verificationEmailModal = ref<HTMLDialogElement | null>(null);

async function sendVerificationEmail() {
    await pb.collection("users").requestVerification(email.value);
    error.value = "";
    message.value =
        "Please check your email. If you haven't received it, please check your spam folder or try again later.";
}

async function handleSubmit() {
    error.value = "";

    if (!email.value || !password.value) {
        error.value = "Please fill in all the fields!";
        return;
    }

    if (!agreed.value) {
        error.value = "Please agree to the terms";
        return;
    }

    loading.value = true;

    try {
        await pb
            .collection("users")
            .authWithPassword(email.value, password.value);

        router.push("/");
    } catch (err: unknown) {
        if (err instanceof ClientResponseError) {
            console.warn("PocketBase Auth Error:", err.status, err.response);
            const fieldErrors = Object.values(err.data?.data || {})
                .map((f: any) => f?.message)
                .filter(Boolean);

            if (fieldErrors.length > 0) {
                error.value = fieldErrors.join("; ");
            } else if (
                err.message.includes(
                    "The request doesn't satisfy the collection requirements",
                )
            ) {
                error.value = "Please verify your email first.";
                verificationEmailModal.value?.showModal();
            } else if (err.status === 400) {
                error.value = "Invalid email or password.";
            } else {
                error.value = err.message || "Failed to authenticate.";
            }
        } else {
            error.value = "Network error";
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <Header />
    <div
        class="min-h-full my-4 w-full flex items-center justify-center bg-base-100 px-4"
    >
        <div
            class="w-full max-w-4xl flex flex-col md:flex-row items-center gap-10 md:gap-16"
        >
            <!-- 左侧：标题 + 文字 -->
            <div class="w-full md:w-1/2 text-center md:text-left">
                <h1 class="text-4xl md:text-5xl font-bold mb-3">Login</h1>
                <p class="text-lg text-base-content/70">Log in your account</p>
            </div>

            <!-- 右侧：表单 -->
            <div class="w-full md:w-1/2">
                <div class="bg-base-200 p-8 rounded-xl shadow-lg">
                    <form @submit.prevent="handleSubmit" class="space-y-4">
                        <div
                            v-if="message"
                            role="alert"
                            class="alert alert-info alert-soft"
                        >
                            <span>{{ message }}</span>
                        </div>
                        <div
                            v-if="error"
                            role="alert"
                            class="alert alert-error alert-soft"
                        >
                            <span>{{ error }}</span>
                        </div>

                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">Email</span>
                            </label>
                            <input
                                v-model.trim="email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                class="input input-bordered w-full"
                                required
                            />
                        </div>

                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">Password</span>
                            </label>
                            <input
                                v-model="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                class="input input-bordered w-full"
                                minlength="8"
                                required
                            />
                        </div>

                        <label
                            class="flex flex-row items-start gap-2 mt-6 cursor-pointer"
                        >
                            <input
                                v-model="agreed"
                                type="checkbox"
                                name="agree"
                                class="checkbox checkbox-sm mt-0.5"
                                required
                            />
                            <p class="text-xs text-gray-500 leading-snug">
                                I have read and agree to the
                                <a
                                    href="https://pdnode.com/terms"
                                    target="_blank"
                                    class="link"
                                >
                                    Terms of Service
                                </a>
                                and
                                <a
                                    href="https://pdnode.com/privacy"
                                    target="_blank"
                                    class="link"
                                >
                                    Privacy Policy </a
                                >.
                            </p>
                        </label>

                        <button
                            :disabled="loading"
                            type="submit"
                            class="btn btn-primary w-full mt-2"
                        >
                            <span
                                v-if="loading"
                                class="loading loading-spinner loading-xs"
                            ></span>
                            {{ loading ? "Please wait..." : "Login" }}
                        </button>
                    </form>

                    <p class="text-center mt-4 text-sm">
                        Don't have a account?
                        <router-link to="/register" class="link link-primary">
                            Register
                        </router-link>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <dialog ref="verificationEmailModal" class="modal">
        <div class="modal-box">
            <h3 class="text-lg font-bold">Action Required</h3>
            <p class="py-4">
                Please verify your email address to ensure system security.
            </p>
            <div class="modal-action">
                <button
                    class="btn"
                    @click="() => verificationEmailModal?.close()"
                >
                    Cancel
                </button>
                <form method="dialog">
                    <button
                        class="btn btn-primary"
                        @click="sendVerificationEmail"
                    >
                        Send Email
                    </button>
                </form>
            </div>
        </div>
    </dialog>
</template>
