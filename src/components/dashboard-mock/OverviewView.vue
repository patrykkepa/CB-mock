<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
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
    Title
} from 'chart.js'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler, Title)

const { t } = useI18n()

const props = defineProps({
    building: { type: Object, required: true },
    stations: { type: Array, required: true },
    formatUptime: { type: Function, required: true },
    selectStation: { type: Function, required: true },
    onControl: { type: Function, default: () => {} },
    onBack: { type: Function, default: () => {} }
})

function buildingStats(building) {
    if (!building?.stations) {
        return { stations: 0, channels: 0, lampsOn: 0, lampsTotal: 0 }
    }

    let stations = building.stations.length
    let channels = 0
    let lampsOn = 0
    let lampsTotal = 0

    building.stations.forEach(st => {
        st.controllers?.forEach(ctrl => {
            channels++
            ctrl.lamps?.forEach(l => {
                lampsTotal++
                if (l.state === 'ON') lampsOn++
            })
        })
    })

    return { stations, channels, lampsOn, lampsTotal }
}

const stats = computed(() => buildingStats(props.building))

const chartLabels = ['1','2','3','4','5','6','7']

function randomTrend(base, variation = 10) {
    return Array.from({ length: 7 }, (_, i) =>
        base + Math.round(Math.sin(i) * variation + (Math.random() * variation - variation / 2))
    )
}

const stationsTrend = computed(() => randomTrend(stats.value.stations || 5, 3))
const channelsTrend = computed(() => randomTrend(stats.value.channels || 12, 4))
const lampsTrend = computed(() => randomTrend(stats.value.lampsOn || 40, 5))
const testsTrend = computed(() => randomTrend(120, 12))

const chartOptions = (color) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: { x: { display: false }, y: { display: false } },
    elements: {
        line: {
            borderWidth: 2,
            tension: 0.35,
            borderColor: color,
            backgroundColor: color + '22',
            fill: true
        },
        point: { radius: 0 }
    }
})
</script>

<template>
    <div class="building-overview space-y-8">

        <header class="ui-header">
            <div>
                <h2 class="ui-header-title">
                    {{ t('dashboard.building_overview') || 'Building overview' }}
                </h2>

                <div class="ui-header-meta">
                    <span class="ui-meta-pill" v-if="building.address">
                        <i class="pi pi-map-marker mr-1"></i>
                        {{ building.address }}
                    </span>

                    <span class="ui-meta-pill">
                        <i class="pi pi-building mr-1"></i>
                        {{ stats.stations }} stations
                    </span>

                    <span class="ui-meta-pill">
                        <i class="pi pi-lightbulb mr-1"></i>
                        {{ stats.lampsOn }}/{{ stats.lampsTotal }} lamps
                    </span>
                </div>
            </div>
        </header>

        <section class="ui-kpi-grid">

            <!-- Stations KPI -->
            <div class="ui-kpi-card ui-kpi-yellow">
                <div class="ui-kpi-header">
                    <span class="ui-kpi-title">{{ t('dashboard.stations') }}</span>
                    <span class="ui-kpi-badge">{{ t('dashboard.today') }}</span>
                </div>

                <div class="ui-kpi-value-row">
                    <span class="ui-kpi-value">{{ stats.stations }}</span>
                    <span class="ui-kpi-trend positive">+3%</span>
                </div>

                <div class="ui-kpi-chart">
                    <Line
                        :data="{ labels: chartLabels, datasets:[{ data: stationsTrend }] }"
                        :options="chartOptions('#F59E0B')"
                    />
                </div>
            </div>

            <!-- Channels KPI -->
            <div class="ui-kpi-card ui-kpi-teal">
                <div class="ui-kpi-header">
                    <span class="ui-kpi-title">{{ t('dashboard.channels') }}</span>
                    <span class="ui-kpi-badge">7 days</span>
                </div>

                <div class="ui-kpi-value-row">
                    <span class="ui-kpi-value">{{ stats.channels }}</span>
                    <span class="ui-kpi-trend">+1%</span>
                </div>

                <div class="ui-kpi-chart">
                    <Line
                        :data="{ labels: chartLabels, datasets:[{ data: channelsTrend }] }"
                        :options="chartOptions('#14B8A6')"
                    />
                </div>
            </div>

            <!-- Lamps KPI -->
            <div class="ui-kpi-card ui-kpi-pink">
                <div class="ui-kpi-header">
                    <span class="ui-kpi-title">{{ t('dashboard.lamps') }}</span>
                    <span class="ui-kpi-badge">{{ t('dashboard.lamps_on') }}</span>
                </div>

                <div class="ui-kpi-value-row">
                    <span class="ui-kpi-value">
                        {{ stats.lampsOn }}/{{ stats.lampsTotal }}
                    </span>
                    <span class="ui-kpi-trend">
                        {{
                            stats.lampsTotal
                                ? Math.round((stats.lampsOn / stats.lampsTotal) * 100) + '%'
                                : '—'
                        }}
                    </span>
                </div>

                <div class="ui-kpi-chart">
                    <Line
                        :data="{ labels: chartLabels, datasets:[{ data: lampsTrend }] }"
                        :options="chartOptions('#EC4899')"
                    />
                </div>
            </div>

            <!-- Tests KPI -->
            <div class="ui-kpi-card ui-kpi-indigo">
                <div class="ui-kpi-header">
                    <span class="ui-kpi-title">{{ t('dashboard.tests') }}</span>
                    <span class="ui-kpi-badge">Valid 97%</span>
                </div>

                <div class="ui-kpi-value-row">
                    <span class="ui-kpi-value">147</span>
                    <span class="ui-kpi-trend positive">+5</span>
                </div>

                <div class="ui-kpi-chart">
                    <Line
                        :data="{ labels: chartLabels, datasets:[{ data: testsTrend }] }"
                        :options="chartOptions('#6366F1')"
                    />
                </div>
            </div>

        </section>

        <div class="ui-two-col">

            <!-- LEFT – Building Info -->
            <div class="ui-info-card">

                <h3 class="ui-info-title">{{ t('dashboard.building_details') }}</h3>

                <div class="ui-info-row">
                    <span class="ui-info-label">{{ t('dashboard.location') }}</span>
                    <span class="ui-info-value">{{ building.address || '—' }}</span>
                </div>

                <div class="ui-info-row">
                    <span class="ui-info-label">{{ t('dashboard.type') }}</span>
                    <span class="ui-info-value">{{ building.type || '—' }}</span>
                </div>

                <div class="ui-info-row" v-if="building.area_m2">
                    <span class="ui-info-label">{{ t('dashboard.area') }}</span>
                    <span class="ui-info-value">{{ building.area_m2 }} m²</span>
                </div>

                <template v-if="building.operator">
                    <h3 class="ui-info-title mt-4">{{ t('dashboard.operator') }}</h3>

                    <div class="ui-info-row">
                        <span class="ui-info-label">{{ t('dashboard.company') }}</span>
                        <span class="ui-info-value">{{ building.operator.name }}</span>
                    </div>

                    <div class="ui-info-row" v-if="building.operator.contact_person">
                        <span class="ui-info-label">{{ t('dashboard.operator_contact') }}</span>
                        <span class="ui-info-value">{{ building.operator.contact_person }}</span>
                    </div>

                    <div class="ui-info-row" v-if="building.operator.phone">
                        <span class="ui-info-label">{{ t('dashboard.phone') }}</span>
                        <span class="ui-info-value">{{ building.operator.phone }}</span>
                    </div>

                    <div class="ui-info-row" v-if="building.operator.email">
                        <span class="ui-info-label">E-mail</span>
                        <span class="ui-info-value">{{ building.operator.email }}</span>
                    </div>
                </template>
            </div>

            <div class="ui-right-stack">

                <div class="bo-tests-panel">

                    <div class="bo-tests-header">
                        <h4>
                            <i class="pi pi-check-square mr-2"></i>
                            {{ t('dashboard.functional_tests') }}
                        </h4>

                        <div class="bo-tests-total">
                            <span class="bo-tests-total-number">147</span>
                            <span class="bo-tests-total-label">tests</span>
                        </div>
                    </div>

                    <div class="bo-tests-body">

                        <div class="bo-tests-row">
                            <div class="bo-tests-col">
                                <span class="bo-tests-label failed">
                                    <i class="pi pi-exclamation-circle mr-1"></i>
                                    {{ t('dashboard.invalid') }}
                                </span>
                                <span class="bo-tests-value failed">3%</span>
                                <span class="bo-tests-detail">5</span>
                            </div>

                            <div class="bo-tests-col">
                                <span class="bo-tests-label ok">
                                    <i class="pi pi-check mr-1"></i>
                                    {{ t('dashboard.valid') }}
                                </span>
                                <span class="bo-tests-value ok">97%</span>
                                <span class="bo-tests-detail">142</span>
                            </div>
                        </div>

                        <div class="bo-tests-bar">
                            <div class="bo-tests-bar-segment failed" style="width:3%;"></div>
                            <div class="bo-tests-bar-segment ok" style="width:97%;"></div>
                        </div>
                    </div>

                </div>

                <div class="bo-health-card">

                    <div class="bo-health-header">
                        <h4>
                            <i class="pi pi-shield mr-2"></i>
                            {{ t('dashboard.system_health') }}
                        </h4>

                        <span class="bo-health-status ok">
                            <i class="pi pi-circle-fill mr-1"></i>
                            {{ t('dashboard.stable') || 'Stable' }}
                        </span>
                    </div>

                    <div class="bo-health-body">
                        <div class="bo-health-row">
                            <span class="bo-health-label">Online stations</span>
                            <span class="bo-health-value">12 / 12</span>
                        </div>

                        <div class="bo-health-row">
                            <span class="bo-health-label">Last incident</span>
                            <span class="bo-health-value">2 days ago</span>
                        </div>

                        <div class="bo-health-row">
                            <span class="bo-health-label">Open alerts</span>
                            <span class="bo-health-value warning">2</span>
                        </div>

                        <div class="bo-health-bar">
                            <div class="bo-health-bar-fill" style="width:88%;"></div>
                        </div>
                    </div>

                </div>

            </div>
        </div>

        <div class="ui-two-col">

            <!-- POWER SUMMARY PANEL -->
            <Card class="bi-panel bi-power-panel">
                <template #title>
                    <div class="bi-panel-title-row">
                        <span class="bi-panel-title">
                            <i class="pi pi-bolt mr-2"></i>
                            {{ t('dashboard.power_summary') }}
                        </span>
                    </div>
                </template>

                <template #content>
                    <div class="bi-power-body">

                        <div>
                            <div class="bi-power-label">
                                {{ t('dashboard.total_consumption') }}
                            </div>
                            <div class="bi-power-value">148.6 kWh</div>
                        </div>

                        <div class="bi-power-meta">
                            <span>{{ t('dashboard.avg_load') }}: <b>24.3 kWh</b></span>
                            <span>{{ t('dashboard.max_load') }}: <b>310.8 W</b></span>
                        </div>

                        <div class="bi-power-bar">
                            <div class="bi-power-bar-fill" style="width:68%;"></div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- EXPORT STATISTICS PANEL -->
            <Card class="bi-panel bi-export-panel">
                <template #title>
                    <div class="bi-panel-title-row">
                        <span class="bi-panel-title">
                            <i class="pi pi-download mr-2"></i>
                            {{ t('dashboard.download_stats') }}
                        </span>
                    </div>
                </template>

                <template #content>
                    <div class="bi-export-body">
                        <p class="bi-export-text">
                            {{ t('dashboard.download_hint') || 'Export current building statistics as a report file.' }}
                        </p>

                        <Button
                            icon="pi pi-file-export"
                            label="Export CSV"
                            severity="primary"
                            outlined
                            class="w-full md:w-auto"
                            @click="console.log('Exporting...')"
                        />
                    </div>
                </template>
            </Card>

        </div>

    </div>
</template>

