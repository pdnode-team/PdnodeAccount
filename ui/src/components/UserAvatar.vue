<!-- Made by Gemini 4, not count time (Because I use online not agent) -->
<script setup lang="ts">
import { computed } from "vue";
import { stringToHslColor, getAvatarInitial } from "@/utils/color";

interface Props {
    name: string;
    size?: number; // Size in pixels, defaults to 40
}

const props = withDefaults(defineProps<Props>(), {
    size: 40,
});

// Compute deterministic values reactively
const initial = computed(() => getAvatarInitial(props.name));
const backgroundColor = computed(() => stringToHslColor(props.name, 65, 45));
const dimension = computed(() => `${props.size}px`);
const fontSize = computed(() => `${props.size * 0.45}px`);
</script>

<template>
    <div
        class="avatar-circle"
        :style="{
            backgroundColor,
            width: dimension,
            height: dimension,
            fontSize,
        }"
    >
        {{ initial }}
    </div>
</template>

<style scoped>
.avatar-circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #ffffff;
    font-weight: 600;
    user-select: none;
    text-transform: uppercase;
    flex-shrink: 0;
}
</style>
