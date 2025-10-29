<script setup>
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import DeviceTable from './DeviceTable.vue';

const props = defineProps({
    device: { type: Object, required: true }
});

const emit = defineEmits(['onPayload', 'onControl']);

function countLampsOff(dev) {
    if (!dev.lamps) return 0;
    return Object.values(dev.lamps).filter(l => l.on === false || l.raw?.turn == 0).length;
}
</script>


<template>
    <Card class="relative shadow-md border border-surface-200 dark:border-surface-700">
        <template #title>
            <div class="relative">
                <Tag
                    v-if="countLampsOff(device) > 0"
                    :value="`${countLampsOff(device)} OFF`"
                    severity="danger"
                    rounded
                    class="absolute top-0 right-0 translate-x-8 -translate-y-8 z-10 shadow-md"
                />
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-lg">{{ device.device_id }}</span>
                    <Tag severity="info" :value="`FW: ${device.firmware || '-'}`" />
                </div>
            </div>
        </template>

        <template #content>
            <div class="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-3">
                <div><strong>Chip:</strong> {{ device.chip_rev ?? 'N/A' }}</div>
                <div><strong>Free mem:</strong> {{ device.free_heap ? device.free_heap + ' B' : 'N/A' }}</div>
                <div><strong>Heartbeats:</strong> {{ device.heartbeats ?? '-' }}</div>
                <div><strong>Uptime:</strong> {{ device.uptimeFormatted }}</div>
                <div><strong>Last seen:</strong> {{ device.lastSeenFormatted }}</div>
            </div>

            <DeviceTable :lamps="device.lamps" @show-payload="payload => emit('onPayload', payload)" />
        </template>

        <template #footer>
            <div class="flex justify-between">
                <Button icon="pi pi-info-circle" label="Details" severity="secondary" text rounded size="small" />
                <Button
                    icon="pi pi-terminal"
                    label="Control"
                    severity="help"
                    text
                    rounded
                    size="small"
                    @click="() => emit('onControl', device.device_id)"
                />
            </div>
        </template>
    </Card>
</template>
