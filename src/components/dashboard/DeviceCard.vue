<script setup>
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import DeviceTable from './DeviceTable.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
        <!-- 🧩 Nagłówek -->
        <template #title>
            <div class="relative">
                <!-- 🔴 Tag z wyłączonymi lampami -->
                <Tag
                    v-if="countLampsOff(device) > 0"
                    :value="`${countLampsOff(device)} ${t('device.off')}`"
                    severity="danger"
                    rounded
                    class="absolute top-0 right-0 translate-x-8 -translate-y-8 z-10 shadow-md"
                />

                <!-- 🔹 Główne info -->
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-lg">{{ device.device_id }}</span>
                    <Tag severity="info" :value="`FW: ${device.firmware || '-'}`" />
                </div>
            </div>
        </template>

        <!-- 📦 Zawartość -->
        <template #content>
            <div class="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-3">
                <div><strong>{{ t('device.chip') }}:</strong> {{ device.chip_rev ?? 'N/A' }}</div>
                <div><strong>{{ t('device.free_mem') }}:</strong> {{ device.free_heap ? device.free_heap + ' B' : 'N/A' }}</div>
                <div><strong>{{ t('device.heartbeats') }}:</strong> {{ device.heartbeats ?? '-' }}</div>
                <div><strong>{{ t('device.uptime') }}:</strong> {{ device.uptimeFormatted }}</div>
                <div><strong>{{ t('device.last_seen') }}:</strong> {{ device.lastSeenFormatted }}</div>
            </div>

            <!-- 💡 Tabela lamp -->
            <DeviceTable
                :lamps="device.lamps"
                @show-payload="payload => emit('onPayload', payload)"
            />
        </template>

        <!-- ⚙️ Stopka -->
        <template #footer>
            <div class="flex justify-between">
                <Button
                    icon="pi pi-info-circle"
                    :label="t('buttons.details')"
                    severity="secondary"
                    text
                    rounded
                    size="small"
                />
                <Button
                    icon="pi pi-terminal"
                    :label="t('buttons.control')"
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
