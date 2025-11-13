<script setup>
import Card from 'primevue/card';
import Tag from 'primevue/tag';

const props = defineProps({
    controller: Object,
    active: Boolean
});
const emit = defineEmits(['select']);
</script>

<template>
    <Card
        class="cursor-pointer transition-all hover:shadow-lg"
        :class="active ? 'border-primary' : 'border-gray-200'"
        @click="emit('select')"
    >
        <template #title>
            <div class="flex justify-between">
                <span>{{ controller.name }}</span>
                <Tag :value="`FW: ${controller.firmware}`" severity="info" />
            </div>
        </template>
        <template #content>
            <div class="text-sm text-gray-600 space-y-1">
                <div><b>Heartbeats:</b> {{ controller.heartbeats }}</div>
                <div><b>Free mem:</b> {{ controller.free_heap ?? '-' }}</div>
                <div><b>Uptime:</b> {{ Math.round(controller.uptime) }}s</div>
            </div>
        </template>
    </Card>
</template>
