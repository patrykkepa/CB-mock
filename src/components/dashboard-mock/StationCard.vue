<script setup>
import Card from 'primevue/card';
import Tag from 'primevue/tag';

const props = defineProps({
    station: Object,
    active: Boolean
});
const emit = defineEmits(['select']);
</script>

<template>
    <Card
        class="cursor-pointer transition-all border hover:shadow-lg"
        :class="active ? 'border-primary' : 'border-gray-200'"
        @click="emit('select')"
    >
        <template #title>
            <div class="flex justify-between">
                <span>{{ station.name }}</span>
                <Tag severity="info" :value="`FW: ${station.firmware}`" />
            </div>
        </template>
        <template #content>
            <div class="text-sm text-gray-600 space-y-1">
                <div><b>Uptime:</b> {{ Math.round(station.uptime) }}s</div>
                <div><b>HB:</b> {{ station.heartbeats }}</div>
            </div>
        </template>
    </Card>
</template>
