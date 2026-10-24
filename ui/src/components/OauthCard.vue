<template>
  <div
    class="card bg-base-100 shadow-md border border-base-200 w-full max-w-md"
  >
    <div class="card-body p-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <p class="font-medium truncate">{{ displayName }}</p>
          <p class="text-sm opacity-60 truncate">{{ providerId }}</p>
        </div>

        <button
          class="btn btn-sm btn-error btn-outline"
          @click="$emit('delete')"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  provider: string;
  displayName?: string;
  providerId: string;
}>();

defineEmits<{
  delete: [];
}>();
</script>
