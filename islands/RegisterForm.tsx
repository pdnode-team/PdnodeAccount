import { useSignal } from "@preact/signals";

export function RegisterForm() {
  const nickname = useSignal<string>();
  const email = useSignal<string>();
  const password = useSignal<string>();
  const confirmPassword = useSignal<string>();
  const agreed = useSignal<boolean>(false);
  const loading = useSignal(false);
  const error = useSignal<string>();

  async function submit(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    if (
      !nickname.value || !email.value || !password.value ||
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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.value,
          email: email.value,
          password: password.value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        error.value = "Registration failed: " + data.error ||
          "Registration failed";
        return;
      }

      location.href = "/login";
      return;
    } catch {
      error.value = "Network error";
    } finally {
      loading.value = false;
    }
  }

  return (
    <form class="space-y-4">
      {error.value
        ? (
          <div role="alert" class="alert alert-error alert-soft animate-in">
            <span>{error}</span>
          </div>
        )
        : null}

      <div class="form-control">
        <label class="label">
          <span class="label-text">Nickname</span>
        </label>
        <input
          type="text"
          name="nickname"
          value={nickname}
          onInput={(e) => {
            nickname.value = e.currentTarget.value;
          }}
          placeholder="Pidan"
          class="input input-bordered w-full"
          minLength={3}
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Email</span>
        </label>
        <input
          type="email"
          name="email"
          value={email}
          onInput={(e) => {
            email.value = e.currentTarget.value;
          }}
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
          type="password"
          name="password"
          value={password}
          onInput={(e) => {
            password.value = e.currentTarget.value;
          }}
          placeholder="••••••••"
          class="input input-bordered w-full"
          minLength={8}
          required
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Confirm Password</span>
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onInput={(e) => {
            confirmPassword.value = e.currentTarget.value;
          }}
          placeholder="••••••••"
          class="input input-bordered w-full"
          minLength={8}
          required
        />
      </div>

      <label class="flex flex-row items-start gap-2 mt-6">
        <input
          type="checkbox"
          name="agree"
          checked={agreed}
          onChange={(e) =>
            agreed.value = (e.currentTarget as HTMLInputElement).checked}
          class="checkbox checkbox-sm"
          required
        />
        <p class="text-xs text-gray-500 leading-snug">
          I have read and agree to the{" "}
          <a href="https://pdnode.com/terms" target="_blank" class="link">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="https://pdnode.com/privacy" target="_blank" class="link">
            Privacy Policy
          </a>.
        </p>
      </label>

      <button
        disabled={loading}
        onClick={submit}
        type="button"
        class="btn btn-primary w-full mt-2"
      >
        {loading.value ? "Please wait..." : "Create Account"}
      </button>
    </form>
  );
}
