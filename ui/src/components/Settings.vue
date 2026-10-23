<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps<{
    open: boolean;
}>();

// FIRST TIME USE IT!
const emit = defineEmits<{
    (e: "update:open", value: boolean): void;
}>();

function close() {
    router.push("/");
    emit("update:open", false);
}
</script>
<template>
    <dialog id="settings_modal" class="modal" :class="{ 'modal-open': open }">
        <div class="modal-box">
            <h3 class="text-lg font-bold">Hello!</h3>
            <p class="py-4">Press ESC key or click the button below to close</p>
            <div class="modal-action">
                <form method="dialog">
                    <button class="btn" @click="close">Close</button>
                </form>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop" @click="close">
            <button>close</button>
        </form>
    </dialog>
</template>
