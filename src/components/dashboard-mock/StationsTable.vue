<script setup>
import { ref, computed } from 'vue';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    stations: { type: Array, required: true },
    formatUptime: { type: Function, required: true },
    selectStation: { type: Function, required: true },
    onControl: { type: Function, default: () => {} },
});

const filterZeroChannels = ref(false);
const filterInactiveLamps = ref(false);

// 📊 Statystyki stacji
function stationStats(station) {
    if (!station?.controllers) return { channels: 0, lampsOn: 0, lampsOff: 0, lampsTotal: 0 };
    let channels = station.controllers.length;
    let lampsOn = 0, lampsOff = 0, lampsTotal = 0;
    station.controllers.forEach(ctrl => {
        ctrl.lamps?.forEach(l => {
            lampsTotal++;
            if (l.state === 'ON') lampsOn++; else lampsOff++;
        });
    });
    return { channels, lampsOn, lampsOff, lampsTotal };
}

// ✅ Flagi wiersza
function rowFlags(st) {
    const s = stationStats(st);
    const noChannels = s.channels === 0;
    const someLampsOff = s.lampsTotal > 0 && s.lampsOn < s.lampsTotal;
    return { s, noChannels, someLampsOff };
}
function rowClass(st) {
    const { noChannels, someLampsOff } = rowFlags(st);
    if (noChannels) return 'border-strong';
    if (someLampsOff) return 'border-soft';
    return '';
}

// 🔽 Filtrowanie
const filteredStations = computed(() => {
    return props.stations.filter(st => {
        const { noChannels, someLampsOff } = rowFlags(st);
        if (filterZeroChannels.value && !noChannels) return false;
        if (filterInactiveLamps.value && !someLampsOff) return false;
        return true;
    });
});
</script>

<template>
    <div class="space-y-4 mt-6">
        <!-- 🔎 Legenda i filtry -->
        <div class="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-300 select-none">
            <!-- 🔴 0 kanałów -->
            <div
                class="inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                :class="{ 'opacity-100': filterZeroChannels, 'opacity-60': !filterZeroChannels }"
                @click="filterZeroChannels = !filterZeroChannels"
            >
        <span
            class="legend-swatch bg-red-500 ring-1 ring-red-400/50"
            :class="{ 'ring-2 ring-offset-1 ring-red-600': filterZeroChannels }"
        ></span>
                <span class="font-medium">0 {{ t('dashboard.channels') }}</span>
            </div>

            <!-- 💡 Nieaktywne lampy -->
            <div
                class="inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                :class="{ 'opacity-100': filterInactiveLamps, 'opacity-60': !filterInactiveLamps }"
                @click="filterInactiveLamps = !filterInactiveLamps"
            >
        <span
            class="legend-swatch bg-red-200 ring-1 ring-red-300/60"
            :class="{ 'ring-2 ring-offset-1 ring-red-400': filterInactiveLamps }"
        ></span>
                <span class="font-medium">{{ t('dashboard.lamps_offline') || 'Nieaktywne lampy' }}</span>
            </div>
        </div>

        <!-- ⚙️ Tabela -->
        <div
            class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white/70 dark:bg-surface-800/50"
        >
            <table class="w-full text-sm text-gray-700 dark:text-gray-300">
                <thead class="bg-gray-100 dark:bg-surface-800 text-gray-800 dark:text-gray-200 text-left">
                <tr>
                    <th class="py-3 px-4">{{ t('dashboard.device_info') }}</th>
                    <th class="py-3 px-4">{{ t('dashboard.system_info') }}</th>
                    <th class="py-3 px-4 text-center">{{ t('dashboard.channels') }}</th>
                    <th class="py-3 px-4 text-center">{{ t('dashboard.lamps') }}</th>
                    <th class="py-3 px-4 text-right">{{ t('dashboard.actions') }}</th>
                </tr>
                </thead>
                <tbody>
                <tr
                    v-for="st in filteredStations"
                    :key="st.device_id"
                    class="border-t border-gray-200 dark:border-gray-700 transition-all"
                    :class="rowClass(st)"
                >
                    <td class="py-3 px-4 align-top">
                        <div class="font-semibold text-base">{{ st.name }}</div>
                        <div class="text-xs text-gray-500 mb-1">Device ID: {{ st.device_id }}</div>
                        <Tag severity="info" :value="`FW: ${st.firmware}`" />
                    </td>

                    <td class="py-3 px-4 align-top">
                        <div><strong>{{ t('dashboard.chip') }}:</strong> {{ st.chip_rev ?? 'N/A' }}</div>
                        <div><strong>{{ t('dashboard.free_mem') }}:</strong> {{ st.free_heap ? st.free_heap + ' B' : 'N/A' }}</div>
                        <div><strong>{{ t('dashboard.heartbeats') }}:</strong> {{ st.heartbeats }}</div>
                        <div><strong>{{ t('dashboard.uptime') }}:</strong> {{ props.formatUptime(st.uptime) }}</div>
                    </td>

                    <td class="py-3 px-4 text-center align-top">
                        <div class="flex justify-center items-center gap-1 text-blue-600 dark:text-blue-400">
                            <i class="pi pi-sliders-h"></i>
                            <strong>{{ stationStats(st).channels }}</strong>
                        </div>
                    </td>

                    <td class="py-3 px-4 text-center align-top">
                        <div class="flex flex-col items-center gap-1">
                            <div class="text-yellow-600 dark:text-yellow-400">
                                <i class="pi pi-lightbulb mr-1"></i>
                                <strong>{{ stationStats(st).lampsOn }}</strong> / {{ stationStats(st).lampsTotal }}
                            </div>
                        </div>
                    </td>

                    <td class="py-3 px-4 text-right align-top space-x-2">
                        <Button
                            icon="pi pi-chevron-right"
                            :label="t('buttons.details')"
                            size="small"
                            severity="info"
                            @click.stop="props.selectStation(st)"
                        />
                        <Button
                            icon="pi pi-code"
                            :label="t('buttons.control')"
                            size="small"
                            severity="help"
                            outlined
                            @click.stop="props.onControl(st.device_id)"
                        />
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
table {
    border-collapse: collapse;
    width: 100%;
}
th,
td {
    vertical-align: top;
}
th {
    font-weight: 600;
    font-size: 0.85rem;
}

/* 🔴 Pasek po lewej stronie */
.border-strong {
    border-left: 6px solid #ef4444; /* red-500 */
}
.border-soft {
    border-left: 6px solid #fecaca; /* red-200 */
}

.legend-swatch {
    width: 18px;
    height: 10px;
    border-radius: 9999px;
    display: inline-block;
    transition: all 0.2s ease;
}
</style>
