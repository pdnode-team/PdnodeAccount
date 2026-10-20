// import { RegisterForm } from "@/islands/RegisterForm.tsx";
import { define } from "../utils.ts";

export default define.page(() => {
  return (
    <div class="h-screen w-screen flex justify-center items-center bg-base-100">
      <main class="bg-base-200 p-10 rounded-xl shadow-lg w-full max-w-md">
        <h1 class="text-3xl font-bold text-center mb-2">Login</h1>
        <p class="text-center text-base-content/70 mb-6">Log in your account</p>

        {/*<RegisterForm />*/}

        <p class="text-center mt-2 text-sm">
          Don't have one?{" "}
          <a href="/register" class="link link-primary">Register</a>
        </p>
      </main>
    </div>
  );
});
