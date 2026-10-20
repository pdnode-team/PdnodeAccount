import { useSignal } from "@preact/signals";

export function RegisterForm() {
  const nickname = useSignal<string>();
  const email = useSignal<string>();
  const password = useSignal<string>();
  const confirmPassword = useSignal<string>();
  const agreed = useSignal<boolean>(false);
  const disabledButton = useSignal<boolean>();

  const error = useSignal<string>();

  function submit(e: Event) {
    e.preventDefault();

    if (
      !nickname.value || !email.value || !password.value ||
      !confirmPassword.value
    ) {
      error.value = "Please fill in all the fields!";
      return;
    }
  }

  return (
    <form
      onSubmit={submit}
      class="space-y-4"
    >
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
        disabled={disabledButton}
        type="submit"
        class="btn btn-primary w-full mt-2"
      >
        Create Account
      </button>
    </form>
  );
}
