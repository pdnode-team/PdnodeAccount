<script setup lang="ts">
</script>

<template>
  <Header />
  <div class="min-h-full my-4 w-full flex items-center justify-center bg-base-100 px-4">
    <div class="w-full max-w-4xl flex flex-col md:flex-row items-center gap-10 md:gap-16">
      <div class="w-full md:w-1/2 text-center md:text-left">
        <h1 class="text-4xl md:text-5xl font-bold mb-3">Forget Password</h1>
        <p class="text-lg text-base-content/70">If you forget your password</p>
      </div>
      <div class="w-full md:w-1/2">
        <div class="bg-base-200 p-8 rounded-xl shadow-lg">
          <form>
            <!-- <div v-if="message" role="alert" class="alert alert-info alert-soft"> -->
            <!--   <span>{{ message }}</span> -->
            <!-- </div> -->
            <!-- <div v-if="error" role="alert" class="alert alert-error alert-soft"> -->
            <!--   <span>{{ error }}</span> -->
            <!-- </div> -->

            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input v-model.trim="email" type="email" name="email" placeholder="you@example.com"
                class="input input-bordered w-full" required />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Password</span>
              </label>
              <input v-model="password" type="password" name="password" placeholder="••••••••"
                class="input input-bordered w-full" minlength="8" required />
            </div>

            <label class="flex flex-row items-start gap-2 mt-6 cursor-pointer">
              <input v-model="agreed" type="checkbox" name="agree" class="checkbox checkbox-sm mt-0.5" required />
              <p class="text-xs text-gray-500 leading-snug">
                I have read and agree to the
                <a href="https://pdnode.com/terms" target="_blank" class="link">
                  Terms of Service
                </a>
                and
                <a href="https://pdnode.com/privacy" target="_blank" class="link">
                  Privacy Policy </a>.
              </p>
            </label>

            <button :disabled="loading" type="submit" class="btn btn-primary w-full mt-2">
              <span v-if="loading" class="loading loading-spinner loading-xs"></span>
              {{ loading ? "Please wait..." : "Login" }}
            </button>
          </form>

          <hr class="my-4 text-base-100" />

          <p class="text-center mt-4 text-sm">
            You remembered the password?
            <router-link to="/login" class="link link-primary">
              Login
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
