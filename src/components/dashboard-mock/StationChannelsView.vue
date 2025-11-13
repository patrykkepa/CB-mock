<script setup>
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import DeviceTable from '@/components/dashboard/DeviceTable.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    station: { type: Object, required: true },
    channels: { type: Array, required: true },
    formatUptime: { type: Function, required: true },
    timeAgo: { type: Function, required: true },
    expandedChannel: { type: String, default: null },
});

const emit = defineEmits(['toggle-channel', 'back']);
</script>

<template>
    <div class="space-y-4">
        <!-- Nagłówek stacji -->
        <div class="flex items-center justify-between mb-3">
            <div>
                <h3 class="text-lg font-semibold">
                    {{ t('station.channels_of_station') }} {{ station.name }}
                </h3>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                    ID: {{ station.device_id }}
                </div>
            </div>
            <Button
                icon="pi pi-arrow-left"
                :label="t('buttons.back_to_stations')"
                severity="secondary"
                text
                @click="emit('back')"
            />
        </div>

        <!-- Dwukolumnowy układ (masonry) -->
        <div class="masonry columns-1 md:columns-2">
            <div
                v-for="ch in channels"
                :key="ch.id"
                class="masonry-item"
            >
                <Card
                    class="border border-surface-200 dark:border-surface-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-surface-0 dark:bg-surface-900/70"
                >
                    <!-- Nagłówek kanału -->
                    <template #title>
                        <div
                            class="flex justify-between items-start cursor-pointer select-none p-3"
                            @click="emit('toggle-channel', ch.id)"
                        >
                            <!-- Lewa sekcja -->
                            <div class="flex flex-col gap-2">
                                <div class="flex items-center gap-2">
                                    <i class="pi pi-sliders-h text-primary-500 text-base"></i>
                                    <h4 class="font-semibold text-lg text-surface-900 dark:text-surface-0">
                                        {{ ch.name }}
                                    </h4>
                                </div>
                                <div class="text-gray-500 text-sm">
                                    {{ t('station.channel_id') }}: {{ ch.id }}
                                </div>
                                <div class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                    <i class="pi pi-microchip text-gray-400"></i>
                                    <span><strong>{{ t('station.chip') }}:</strong> {{ ch.chip_rev ?? 'N/A' }}</span>
                                </div>
                                <div class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                    <i class="pi pi-memory text-gray-400"></i>
                                    <span><strong>{{ t('station.free_mem') }}:</strong> {{ ch.free_heap ?? '-' }}</span>
                                </div>
                                <div class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                    <i class="pi pi-clock text-gray-400"></i>
                                    <span><strong>{{ t('station.uptime') }}:</strong> {{ formatUptime(ch.uptime) }}</span>
                                </div>
                                <div class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                    <i class="pi pi-calendar-clock text-gray-400"></i>
                                    <span><strong>{{ t('station.last_seen') }}:</strong> {{ timeAgo(ch.last_seen) }}</span>
                                </div>
                            </div>

                            <!-- Prawa sekcja -->
                            <div class="flex flex-col items-end gap-2 mt-1">
                                <Tag
                                    :value="`FW ${ch.firmware ?? 'N/A'}`"
                                    severity="info"
                                    class="text-xs"
                                />
                                <div v-if="ch.lamps?.length" class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                    <i class="pi pi-lightbulb text-yellow-500"></i>
                                    <span>{{ t('station.lamps') }}: <strong>{{ ch.lamps.length }}</strong></span>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- Rozwijana tabela lamp -->
                    <template #content>
                        <transition name="fade">
                            <div
                                v-if="expandedChannel === ch.id"
                                class="pt-4 mt-3 border-t border-gray-200 dark:border-gray-700"
                            >
                                <DeviceTable
                                    :lamps="Object.fromEntries(
                                        ch.lamps.map((l, i) => [
                                            i + 1,
                                            {
                                                on: l.state === 'ON',
                                                raw: { ...l, control: false, seq: null },
                                                control: false,
                                                seq: null,
                                            },
                                        ])
                                    )"
                                />
                            </div>
                        </transition>
                    </template>

                    <!-- Footer -->
                    <template #footer>
                        <div class="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700 mt-2">
                            <Button
                                icon="pi pi-code"
                                :label="t('buttons.control')"
                                size="small"
                                severity="help"
                                outlined
                                @click.stop="() => console.log('Control clicked for', ch.id)"
                            />
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<style scoped>
.masonry {
    column-gap: 1rem;
}
.masonry-item {
    break-inside: avoid;
    margin-bottom: 1rem;
}
.fade-enter-active,
.fade-leave-active {
    transition: all 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-5px);
}
</style>
