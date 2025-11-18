<script setup>
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import { Line } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'

import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
    Title,
} from 'chart.js'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler, Title)

const { t } = useI18n()

const labels = ref(['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'])
const powerData = ref([250, 280, 310, 400, 460, 520, 480, 350])

const chartData = computed(() => ({
    labels: labels.value,
    datasets: [
        {
            label: 'Power (kWh)',
            data: powerData.value,
            fill: true,
            tension: 0.25,
            borderColor: '#facc15',
            backgroundColor: 'rgba(250,204,21,0.15)',
            pointRadius: 3,
            pointBackgroundColor: '#facc15',
        },
    ],
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#6b7280' },
        },
        y: {
            beginAtZero: true,
            ticks: { color: '#6b7280' },
            grid: { color: 'rgba(156,163,175,0.15)' },
        },
    },
}
</script>


<template>
    <div class="power-industrial space-y-8">

        <!-- INDUSTRIAL HEADER (Rack-like) -->
        <div class="header">
            <div class="header-title">
                <i class="pi pi-bolt text-yellow-500 mr-2"></i>
                {{ t('dashboard.power') || 'Power Consumption' }}
            </div>
        </div>

        <!-- POWER SUMMARY CARDS -->
        <div class="power-grid">
            <Card class="power-panel">
                <template #title>
                    <span class="power-panel-title">{{ t('dashboard.total_consumption') || 'Total Power Usage' }}</span>
                </template>
                <template #content>
                    <p class="power-value yellow">412 kWh</p>
                    <p class="power-desc">Last 24h</p>
                </template>
            </Card>

            <Card class="power-panel">
                <template #title>
                    <span class="power-panel-title">{{ t('dashboard.avg_load') || 'Average Per Station' }}</span>
                </template>
                <template #content>
                    <p class="power-value blue">68.7 kWh</p>
                    <p class="power-desc">Across all controllers</p>
                </template>
            </Card>

            <Card class="power-panel">
                <template #title>
                    <span class="power-panel-title">{{ t('dashboard.max_load') || 'Peak Usage' }}</span>
                </template>
                <template #content>
                    <p class="power-value red">127%</p>
                    <p class="power-desc">vs baseline</p>
                </template>
            </Card>
        </div>

        <!-- TREND CHART -->
        <Card class="power-panel">
            <template #title>
                <span class="power-panel-title">{{ t('dashboard.daily_trend') || 'Daily Power Trend' }}</span>
            </template>

            <template #content>
                <div class="power-chart-wrapper">
                    <Line :data="chartData" :options="chartOptions" />
                </div>
            </template>
        </Card>

    </div>
</template>


<style scoped>
h2 i {
    font-size: 1.5rem;
}
/* ============================
   SECTION WRAPPER
============================ */
.power-industrial {
    padding-bottom: 1.5rem;
}

/* ============================
   INDUSTRIAL HEADER (Rack-like)
============================ */
.header {
    padding: 14px 18px;
    border-radius: 10px;

    background: #e7e8eb;
    border: 1px solid #c2c4c7;

    box-shadow:
        inset 0 0 1px rgba(255,255,255,0.7),
        0 1px 2px rgba(0,0,0,0.08);
}

.app-dark .header {
    background: #1b1d1f;
    border-color: #2d2f31;
    box-shadow:
        inset 0 0 1px rgba(255,255,255,0.05),
        0 1px 3px rgba(0,0,0,0.7);
}

.header-title {
    font-size: 15px;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
}

.app-dark .header-title {
    color: #e5e7eb;
}

/* ============================
   GRID FOR SUMMARY CARDS
============================ */
.power-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 768px) {
    .power-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* ============================
   INDUSTRIAL PANEL STYLE
============================ */
.power-panel {
    border-radius: 10px !important;
    border: 1px solid #c2c4c7 !important;
    background: #f5f6f7 !important;

    box-shadow:
        inset 0 0 1px rgba(255,255,255,0.8),
        0 1px 2px rgba(0,0,0,0.05) !important;
}

.app-dark .power-panel {
    background: #1a1c1e !important;
    border-color: #2d2f31 !important;

    box-shadow:
        inset 0 0 1px rgba(255,255,255,0.06),
        0 1px 3px rgba(0,0,0,0.65) !important;
}

.power-panel :deep(.p-card-body) {
    padding: 14px 16px;
}

.power-panel-title {
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #4b5563;
}

.app-dark .power-panel-title {
    color: #e5e7eb;
}

/* ============================
   KPI VALUES
============================ */
.power-value {
    font-size: 30px;
    font-weight: 700;
    text-align: center;
}

.power-value.yellow { color: #eab308; }
.power-value.blue   { color: #2563eb; }
.power-value.red    { color: #ef4444; }

.power-desc {
    text-align: center;
    font-size: 13px;
    margin-top: 4px;
    color: #6b7280;
}

.app-dark .power-desc {
    color: #9ca3af;
}

/* ============================
   CHART
============================ */
.power-chart-wrapper {
    position: relative;
    height: 250px;
}

</style>
