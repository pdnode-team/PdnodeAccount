import { pb } from "@/pb";
import { ref } from "vue";
import { TERRA_WORKER_URL } from "@/config/terra";

export const isTerraWorker = ref<boolean>(false);
export const isVerifying = ref<boolean>(false);
export const showTerraWelcomeModal = ref<boolean>(false);
export const currentSlackId = ref<string | null>(null);

export async function checkTerraWorkerStatus(options?: {
  forceRedirect?: boolean;
  showModal?: boolean;
  onSuccess?: () => void;
}): Promise<boolean> {
  if (!pb.authStore.isValid || !pb.authStore.record) {
    isTerraWorker.value = false;
    currentSlackId.value = null;
    return false;
  }

  // Check if current user has slack_id (from Hack Club OIDC)
  const slackId = (pb.authStore.record as unknown as { slack_id?: string })
    .slack_id;

  if (!slackId || typeof slackId !== "string" || !slackId.trim()) {
    isTerraWorker.value = false;
    currentSlackId.value = null;
    return false;
  }

  currentSlackId.value = slackId.trim();
  isVerifying.value = true;

  try {
    const targetUrl = new URL(TERRA_WORKER_URL);
    targetUrl.searchParams.set("slack_id", slackId.trim());

    const res = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      const allowed = data === true || data?.allowed === true;

      isTerraWorker.value = allowed;

      if (allowed) {
        if (options?.showModal) {
          showTerraWelcomeModal.value = true;
        }
        if (options?.onSuccess) {
          options.onSuccess();
        }
        return true;
      }
    } else {
      console.warn(
        `[Terra Verification] Worker responded with status ${res.status}`
      );
      isTerraWorker.value = false;
    }
  } catch (err) {
    console.warn(
      "[Terra Verification] Cloudflare Worker verification failed or unreachable:",
      err
    );
    isTerraWorker.value = false;
  } finally {
    isVerifying.value = false;
  }

  return false;
}
