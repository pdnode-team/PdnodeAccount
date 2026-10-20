<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import PocketBase, { ClientResponseError } from "pocketbase";

const router = useRouter();
const pb = new PocketBase(import.meta.env.DEV ? "http://127.0.0.1:8090" : "/");

const nickname = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const agreed = ref(false);

const loading = ref(false);
const error = ref("");

async function handleSubmit() {
    error.value = "";

    if (
        !nickname.value ||
        !email.value ||
        !password.value ||
        !confirmPassword.value
    ) {
        error.value = "Please fill in all the fields!";
        return;
    }

    if (password.value !== confirmPassword.value) {
        error.value = "Passwords do not match";
        return;
    }

    if (!agreed.value) {
        error.value = "Please agree to the terms";
        return;
    }

    loading.value = true;

    try {
        // 写入 PocketBase 自带的 users 集合
        await pb.collection("users").create({
            email: email.value,
            password: password.value,
            passwordConfirm: confirmPassword.value,
            nickname: nickname.value,
        });

        // （可选）如果开启了邮箱验证，可在此自动触发验证邮件：
        // await pb.collection('users').requestVerification(email.value)

        router.push("/login");
    } catch (err: unknown) {
        if (err instanceof ClientResponseError) {
            // 解析 PocketBase 接口返回的详细字段错误或默认 message
            const fieldErrors = Object.values(err.data?.data || {})
                .map((f: any) => f?.message)
                .filter(Boolean);

            error.value =
                fieldErrors.length > 0
                    ? `Registration failed: ${fieldErrors.join("; ")}`
                    : `Registration failed: ${err.message}`;
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
            <h1 class="text-3xl font-bold text-center mb-2">Register</h1>
            <p class="text-center text-base-content/70 mb-6">
                Create your account
            </p>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- 错误提示组件 -->
                <div
                    v-if="error"
                    role="alert"
                    class="alert alert-error alert-soft"
                >
                    <span>{{ error }}</span>
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Nickname</span>
                    </label>
                    <input
                        v-model.trim="nickname"
                        type="text"
                        name="nickname"
                        placeholder="Pidan"
                        class="input input-bordered w-full"
                        minlength="3"
                        required
                    />
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

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Confirm Password</span>
                    </label>
                    <input
                        v-model="confirmPassword"
                        type="password"
                        name="confirmPassword"
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
                    {{ loading ? "Please wait..." : "Create Account" }}
                </button>
            </form>

            <p class="text-center mt-4 text-sm">
                Already have an account?
                <router-link to="/login" class="link link-primary"
                    >Login</router-link
                >
            </p>
        </main>
    </div>
</template>
