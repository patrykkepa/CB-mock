<script setup>
import { computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { Line } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
    Title
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler, Title);

const { t } = useI18n();

const props = defineProps({
    building: { type: Object, required: true },
    stations: { type: Array, required: true },
    formatUptime: { type: Function, required: true },
    selectStation: { type: Function, required: true },
    onControl: { type: Function, default: () => {} },
    onBack: { type: Function, default: () => {} }
});

// Statystyki budynku
function buildingStats(building) {
    if (!building?.stations) return { stations: 0, channels: 0, lampsOn: 0, lampsTotal: 0 };
    let stations = building.stations.length;
    let channels = 0, lampsOn = 0, lampsTotal = 0;
    building.stations.forEach(st => {
        st.controllers?.forEach(ctrl => {
            channels++;
            ctrl.lamps?.forEach(l => {
                lampsTotal++;
                if (l.state === 'ON') lampsOn++;
            });
        });
    });
    return { stations, channels, lampsOn, lampsTotal };
}
const stats = computed(() => buildingStats(props.building));

// Mockowane dane trendów (na wykresach)
const stationsTrend = computed(() => Array(7).fill(stats.value.stations));
const channelsTrend = computed(() => Array(7).fill(stats.value.channels));
const chartOptions = (label, color) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: false, tooltip: { enabled: true } },
    scales: { x: { display: false }, y: { display: false } },
    elements: {
        line: { borderWidth: 2, tension: 0, borderColor: color, backgroundColor: color + '22', fill: true },
        point: { radius: 0 }
    }
});
</script>

<template>
    <div class="space-y-6">
        <!-- Nagłówek -->
        <div class="flex justify-between items-start border-b pb-3">
            <div>
                <h2 class="text-2xl font-semibold text-primary-700 dark:text-primary-300">
                    {{ building.name }}
                </h2>
                <p class="text-sm text-gray-500">ID: {{ building.id }}</p>
            </div>
            <div class="flex items-center gap-3">
                <slot name="header-actions" />
                <Button icon="pi pi-times" severity="secondary" text :label="t('buttons.close')" @click="onBack" />
            </div>
        </div>

        <!-- KPI Sekcja -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <template #title>{{ t('dashboard.stations') }}</template>
                <template #content>
                    <h3 class="text-2xl font-bold text-primary-600 text-center">{{ stats.stations }}</h3>
                    <div class="relative h-20">
                        <Line :data="{ labels: ['1','2','3','4','5','6','7'], datasets: [{ data: stationsTrend }] }"
                              :options="chartOptions('', '#3B82F6')" />
                    </div>
                </template>
            </Card>

            <Card>
                <template #title>{{ t('dashboard.channels') }}</template>
                <template #content>
                    <h3 class="text-2xl font-bold text-emerald-500 text-center">{{ stats.channels }}</h3>
                    <div class="relative h-20">
                        <Line :data="{ labels: ['1','2','3','4','5','6','7'], datasets: [{ data: channelsTrend }] }"
                              :options="chartOptions('', '#10B981')" />
                    </div>
                </template>
            </Card>

            <Card>
                <template #title>{{ t('dashboard.lamps') }}</template>
                <template #content>
                    <h3 class="text-2xl font-bold text-yellow-500 text-center">
                        {{ stats.lampsOn }}/{{ stats.lampsTotal }}
                    </h3>
                    <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <div class="h-full bg-yellow-400"
                             :style="{ width: (stats.lampsTotal ? (stats.lampsOn / stats.lampsTotal) * 100 : 0) + '%' }"></div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Adres i operator -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Adres -->
            <div class="border border-gray-200 dark:border-gray-700 p-4 rounded-xl bg-white/70 dark:bg-surface-800/50 relative">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-semibold text-primary-600">{{ t('dashboard.address_info') }}</h4>
                    <Button icon="pi pi-pencil" text rounded size="small" class="text-primary-500"
                            :tooltip="t('buttons.edit_building')"
                            @click.stop="$emit('edit-building', building)" />
                </div>
                <p><i class="pi pi-map-marker mr-2 text-gray-400"></i>{{ building.address || '—' }}</p>
                <p><i class="pi pi-home mr-2 text-gray-400"></i>{{ building.type || '—' }}</p>
                <p v-if="building.area_m2"><i class="pi pi-expand mr-2 text-gray-400"></i>{{ building.area_m2 }} m²</p>
            </div>

            <!-- Operator -->
            <div v-if="building.operator"
                 class="border border-gray-200 dark:border-gray-700 p-4 rounded-xl bg-white/70 dark:bg-surface-800/50 relative">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-semibold text-primary-600">{{ t('dashboard.operator') }}</h4>
                    <Button icon="pi pi-user-edit" text rounded size="small" class="text-primary-500"
                            :tooltip="t('buttons.edit_operator')"
                            @click.stop="$emit('edit-operator', building.operator)" />
                </div>
                <p><i class="pi pi-briefcase mr-2 text-gray-400"></i>{{ building.operator.name }}</p>
                <p v-if="building.operator.contact_person"><i class="pi pi-user mr-2"></i>{{ building.operator.contact_person }}</p>
                <p v-if="building.operator.phone"><i class="pi pi-phone mr-2"></i>{{ building.operator.phone }}</p>
                <p v-if="building.operator.email"><i class="pi pi-envelope mr-2"></i>{{ building.operator.email }}</p>
            </div>
        </div>

        <!-- Pasek testów -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white/80 dark:bg-surface-800/50 shadow-sm">
            <div class="flex justify-between items-center mb-1">
                <h4 class="font-semibold text-lg">{{ t('dashboard.tests') || 'Testy funkcjonalne' }}</h4>
                <span class="text-xl font-bold text-gray-900 dark:text-gray-100">147</span>
            </div>
            <div class="flex justify-between text-sm mb-1">
                <div class="text-right text-blue-500">
                    <span class="font-medium">{{ t('dashboard.valid') || 'Prawidłowe' }}</span>
                    <span class="block font-bold text-base">97%</span>
                    <span class="text-xs text-gray-500">116</span>
                </div>
                <div class="text-red-500">
                    <i class="pi pi-exclamation-circle mr-1"></i>
                    {{ t('dashboard.invalid') || 'Nieprawidłowe' }}
                    <span class="block font-bold text-base">3%</span>
                    <span class="text-xs text-gray-500">3</span>
                </div>
            </div>
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-red-400" style="width: 3%;"></div>
                <div class="h-full bg-blue-500" style="width: 97%; margin-top: -0.5rem;"></div>
            </div>
        </div>

        <!-- Dodatkowe kafelki -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Power Summary -->
            <Card class="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-yellow-900/30 dark:to-surface-800/60 shadow-sm">
                <template #title>
                    <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <i class="pi pi-bolt"></i>
                        <span>{{ t('dashboard.power_summary') || 'Power Summary' }}</span>
                    </div>
                </template>
                <template #content>
                    <div class="space-y-2">
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('dashboard.total_consumption') || 'Total Consumption' }}</p>
                        <h3 class="text-2xl font-bold text-amber-600 dark:text-amber-400">148.6 kWh</h3>

                        <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                            <span>{{ t('dashboard.avg_load') || 'Avg Load' }}: <b>24.3 kWh</b></span>
                            <span>{{ t('dashboard.max_load') || 'Max Load' }}: <b>310.8 W</b></span>
                        </div>

                        <!-- Pasek trendu -->
                        <div class="h-2 mt-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full bg-amber-400 dark:bg-amber-500" style="width: 68%;"></div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Download stats -->
            <Card class="flex flex-col justify-center items-center text-center bg-white/70 dark:bg-surface-800/50 shadow-sm border border-gray-200 dark:border-gray-700">
                <template #title>
                    <div class="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
                        <i class="pi pi-download"></i>
                        <span>{{ t('dashboard.download_stats') || 'Download Statistics' }}</span>
                    </div>
                </template>
                <template #content>
                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        {{ t('dashboard.download_hint') || 'Export current building statistics as report file.' }}
                    </p>
                    <Button
                        icon="pi pi-file-export"
                        label="Export CSV"
                        severity="primary"
                        outlined
                        class="w-full md:w-auto"
                        @click="console.log('📊 Exporting stats for', building.name)"
                    />
                </template>
            </Card>
        </div>


    </div>
</template>
