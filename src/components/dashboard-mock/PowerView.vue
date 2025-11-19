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

const labels = ref(['00:00','03:00','06:00','09:00','12:00','15:00','18:00','21:00'])
const powerData = ref([250, 280, 310, 400, 460, 520, 480, 350])

const liveLoad = ref([52, 55, 60, 63, 70, 74, 69, 61, 58, 60, 62, 59])
const liveLoadLabels = ref(['10s','20s','30s','40s','50s','60s','70s','80s','90s','100s','110s','120s'])

const topConsumers = ref([
    { name: 'Station R1 – Controller A', value: '32.4 kWh' },
    { name: 'Station R4 – Controller C', value: '29.1 kWh' },
    { name: 'Station L2 – Controller A', value: '27.3 kWh' },
])

const powerEvents = ref([
    { type: 'Voltage spike', time: '11:42', severity: 'high' },
    { type: 'Phase imbalance', time: '09:15', severity: 'medium' },
    { type: 'Overload – rack L1', time: '02:50', severity: 'low' },
])

const environments = ref([
    { name: 'UPS Unit A', status: 'online', load: '27%' },
    { name: 'UPS Unit B', status: 'standby', load: '0%' },
    { name: 'Grid Line #1', status: 'online', load: '73%' },
])

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
        }
    ]
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#6b7280' } },
        y: { beginAtZero: true, ticks: { color: '#6b7280' }, grid: { color: 'rgba(156,163,175,0.15)' } }
    }
}

const loadChartData = computed(() => ({
    labels: liveLoadLabels.value,
    datasets: [
        {
            label: 'Live Load (%)',
            data: liveLoad.value,
            tension: 0.3,
            borderColor: '#3b82f6',
            pointRadius: 0,
            fill: false
        }
    ]
}))

const loadChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { display: false },
        y: { min: 40, max: 90, grid: { color: 'rgba(156,163,175,0.15)' } }
    }
}
</script>



<template>
    <div class="power-view space-y-8">

        <header class="ui-header">
            <h2 class="ui-header-title">Power Overview</h2>

            <div class="ui-header-meta">
                <span class="ui-meta-pill">
                    <i class="pi pi-bolt mr-1"></i>
                    Grid load nominal
                </span>
                <span class="ui-meta-pill">
                    <i class="pi pi-clock mr-1"></i>
                    Updated 30s ago
                </span>
                <span class="ui-meta-pill">
                    <i class="pi pi-chart-line mr-1"></i>
                    Daily trend active
                </span>
            </div>
        </header>

        <section class="ui-kpi-grid">

            <div class="cx-kpi-card cx-kpi-yellow">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">Total Usage (24h)</span>
                    <span class="cx-kpi-badge">Stable</span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">412 kWh</span>
                    <span class="cx-kpi-trend positive">+4.3%</span>
                </div>
            </div>

            <div class="cx-kpi-card cx-kpi-teal">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">Average Load</span>
                    <span class="cx-kpi-badge">Controllers</span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">68.7 kWh</span>
                    <span class="cx-kpi-trend">per unit</span>
                </div>
            </div>

            <div class="cx-kpi-card cx-kpi-pink">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">Peak Usage</span>
                    <span class="cx-kpi-badge">vs baseline</span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">127%</span>
                    <span class="cx-kpi-trend">high</span>
                </div>
            </div>

            <div class="cx-kpi-card cx-kpi-indigo">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">Predicted 24h</span>
                    <span class="cx-kpi-badge">AI estimate</span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">~438 kWh</span>
                    <span class="cx-kpi-trend positive">+5.7%</span>
                </div>
            </div>

        </section>

        <Card class="ui-panel">
            <template #title>
                <span class="ui-panel-title">Daily Power Trend</span>
            </template>

            <template #content>
                <div class="power-chart">
                    <Line :data="chartData" :options="chartOptions" />
                </div>
            </template>
        </Card>

        <section class="ui-two-col power-three-grid">

            <!-- Live load -->
            <Card class="ui-panel">
                <template #title>
                    <span class="ui-panel-title">Live Load (last 2 minutes)</span>
                </template>
                <template #content>
                    <div class="mini-chart">
                        <Line :data="loadChartData" :options="loadChartOptions" />
                    </div>
                </template>
            </Card>


            <!-- Top consumers -->
            <Card class="ui-panel">
                <template #title>
                    <span class="ui-panel-title">Top Consumers</span>
                </template>
                <template #content>
                    <ul class="ui-list power-consumers">
                        <li v-for="el in topConsumers" :key="el.name" class="power-consumers-row">
                            <span class="pc-name">{{ el.name }}</span>
                            <span class="pc-value">{{ el.value }}</span>
                        </li>
                    </ul>
                </template>
            </Card>


            <!-- Events -->
            <Card class="ui-panel">
                <template #title>
                    <span class="ui-panel-title">Energy Events</span>
                </template>
                <template #content>
                    <ul class="ui-list events-list">
                        <li
                            v-for="ev in powerEvents"
                            :key="ev.time"
                            class="event-row"
                        >
                            <span class="event-type">
                                <i class="pi pi-exclamation-triangle mr-1"></i>
                                {{ ev.type }}
                            </span>
                            <span class="event-time">{{ ev.time }}</span>
                            <span class="event-chip" :class="ev.severity">
                                {{ ev.severity }}
                            </span>
                        </li>
                    </ul>
                </template>
            </Card>

        </section>

        <Card class="bi-panel">
            <template #title>
                <span class="bi-panel-title-row">Power Sources</span>
            </template>
            <template #content>
                <div class="env-grid">
                    <div
                        v-for="env in environments"
                        :key="env.name"
                        class="env-item"
                    >

                        <div class="env-header">
                            <span class="env-name">{{ env.name }}</span>
                            <span class="env-status" :class="env.status">
                                <i class="pi pi-circle-fill mr-1"></i>
                                {{ env.status }}
                            </span>
                        </div>

                        <div class="env-body">
                            <span class="env-line">
                                <i class="pi pi-gauge mr-1"></i>
                                Load {{ env.load }}
                            </span>
                        </div>

                    </div>
                </div>
            </template>
        </Card>

    </div>
</template>



<style scoped>
.power-view {
    padding-bottom: 1rem;
}

/* MAIN CHART */
.power-chart {
    height: 260px;
}

/* MINI CHART */
.mini-chart {
    height: 120px;
}

/* GRID FOR LOWER 3 CARDS */
.power-three-grid {
    grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
    .power-three-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* POWER CONSUMERS */
.power-consumers-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
}

.pc-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--ui-text-soft);
}

.pc-value {
    font-size: 13px;
    font-weight: 700;
    color: var(--ui-text);
}

/* EVENTS */
.event-row {
    display: grid;
    grid-template-columns: 1.4fr .6fr .5fr;
    align-items: center;
    padding: 6px 0;
}

.event-chip {
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    text-transform: capitalize;
    text-align: center;
}

.event-chip.high    { background: #fee2e2; color:#b91c1c; }
.event-chip.medium  { background: #fef3c7; color:#92400e; }
.event-chip.low     { background: #dcfce7; color:#166534; }

/* ENV GRID */
.env-grid {
    display: grid;
    gap: 10px;
}

@media (min-width: 768px) {
    .env-grid {
        grid-template-columns: repeat(3,1fr);
    }
}

.env-item {
    border-radius: var(--ui-radius);
    border: 1px solid var(--ui-border);
    background: var(--ui-bg-soft);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.env-header {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
}

.env-status {
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    text-transform: capitalize;
}

.env-status.online  { background:#dcfce7; color:#166534; }
.env-status.standby { background:#fef3c7; color:#92400e; }
.env-status.offline { background:#fee2e2; color:#b91c1c; }

.env-body {
    font-size: 12px;
    color: var(--ui-text-muted);
}
</style>
