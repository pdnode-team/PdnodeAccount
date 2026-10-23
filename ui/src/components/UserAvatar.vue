<script setup lang="ts">
import { ref } from "vue";
import UserAvatar from "./UserAvatar.vue";

interface Props {
    name: string;
    size?: number;
    // DaisyUI dropdown alignments: dropdown-end, dropdown-top, dropdown-bottom, dropdown-left, dropdown-right
    align?: "end" | "start" | "top" | "bottom" | "left" | "right";
    // Custom CSS width classes for the dropdown popup (e.g., 'w-52', 'w-64')
    menuWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
    size: 40,
    align: "end",
    menuWidth: "w-56",
});

// Template ref for the details element to control open/closed state programmatically
const detailsRef = ref<HTMLDetailsElement | null>(null);

/**
 * Closes the dropdown menu when an item is clicked.
 */
function closeMenu() {
    if (detailsRef.value) {
        detailsRef.value.removeAttribute("open");
    }
}

// Expose the close method to parent components if needed
defineExpose({
    close: closeMenu,
});
</script>

<template>
    <!-- Using details/summary makes DaisyUI dropdowns native, keyboard-navigable, and accessible -->
    <details
        ref="detailsRef"
        class="dropdown"
        :class="`dropdown-${props.align}`"
    >
        <summary
            class="btn btn-ghost btn-circle avatar m-0 p-0 border-none bg-transparent hover:bg-transparent focus:outline-none list-none"
        >
            <!-- Trigger slot with default UserAvatar fallback -->
            <slot name="trigger">
                <UserAvatar :name="props.name" :size="props.size" />
            </slot>
        </summary>

        <!-- Dropdown content menu -->
        <ul
            class="dropdown-content menu z-[50] mt-2 p-2 shadow-lg bg-base-100 rounded-box border border-base-200"
            :class="props.menuWidth"
            @click="closeMenu"
        >
            <!-- Main customizable content slot -->
            <slot :close="closeMenu" />
        </ul>
    </details>
</template>

<style scoped>
/* Removes standard browser details-marker arrows across WebKit and Gecko */
summary::-webkit-details-marker {
    display: none;
}
summary {
    list-style: none;
}
</style>
