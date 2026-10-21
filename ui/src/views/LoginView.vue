<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import PocketBase, { ClientResponseError } from "pocketbase";

const router = useRouter();
const pb = new PocketBase(import.meta.env.DEV ? "http://127.0.0.1:8090" : "/");

const email = ref("");
const password = ref("");
const agreed = ref(false);

const loading = ref(false);
const error = ref("");

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

        // await pb.collection("users").requestVerification(email.value);

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
                // 匹配到了未满足集合认证条件（通常是 users 表配了 verified = true 规则）
                error.value = "Please verify your email first.";
            } else if (err.status === 400) {
                // 普通密码或账号错误
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
    <div class="h-screen w-screen flex justify-center items-center bg-base-100">
        <main class="bg-base-200 p-10 rounded-xl shadow-lg w-full max-w-md">
            <h1 class="text-3xl font-bold text-center mb-2">Login</h1>
            <p class="text-center text-base-content/70 mb-6">
                Log in your account
            </p>

            <form @submit.prevent="handleSubmit" class="space-y-4">
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
                <router-link to="/register" class="link link-primary"
                    >Register</router-link
                >
            </p>
        </main>
    </div>
</template>
