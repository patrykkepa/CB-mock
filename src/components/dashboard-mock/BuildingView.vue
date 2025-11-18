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

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, LinearScale, Tooltip, Legend, Filler, Title)

const { t } = useI18n()

const props = defineProps({
    building: { type: Object, required: true },
    stations: { type: Array, required: true },
    formatUptime: { type: Function, required: true },
    selectStation: { type: Function, required: true },
    onControl: { type: Function, default: () => {} },
    onBack: { type: Function, default: () => {} }
})

// --- stats for whole building ---
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

// --- tiny trend charts (mock) ---
const chartLabels = ['1', '2', '3', '4', '5', '6', '7']

const stationsTrend = computed(() => Array(7).fill(stats.value.stations))
const channelsTrend = computed(() => Array(7).fill(stats.value.channels))

const chartOptions = (color) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
    },
    scales: {
        x: { display: false },
        y: { display: false }
    },
    elements: {
        line: {
            borderWidth: 2,
            tension: 0.2,
            borderColor: color,
            backgroundColor: color + '22',
            fill: true
        },
        point: {
            radius: 0
        }
    }
})
</script>

<template>
    <div class="building-industrial space-y-6">

        <!-- HEADER PANEL -->
        <div class="header">
            <div class="header-title">
                <div>
                    <i class="pi pi-home mr-2 text-black-500"></i>
                    {{ t('dashboard.building_overview')}}
                </div>
                <span class="bi-header-rack-id">ID: {{ building.id }}</span>
            </div>

            <div class="bi-header-rack-actions">
                <slot name="header-actions" />
                <Button
                    icon="pi pi-times"
                    severity="secondary"
                    text
                    size="small"
                    :label="t('buttons.close')"
                    @click="onBack"
                />
            </div>
        </div>


        <!-- KPI ROW -->
        <div class="bi-kpi-grid">
            <!-- Stations -->
            <Card class="bi-panel bi-kpi-card">
                <template #title>
                    <div class="bi-kpi-title">
                        <span class="bi-kpi-label">
                            <i class="pi pi-building mr-1"></i>
                            {{ t('dashboard.stations') }}
                        </span>
                    </div>
                </template>
                <template #content>
                    <div class="bi-kpi-content">
                        <div class="bi-kpi-value bi-kpi-value-blue">
                            {{ stats.stations }}
                        </div>
                        <div class="bi-kpi-chart">
                            <Line
                                :data="{
                                    labels: chartLabels,
                                    datasets: [{ data: stationsTrend }]
                                }"
                                :options="chartOptions('#2563EB')"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Channels -->
            <Card class="bi-panel bi-kpi-card">
                <template #title>
                    <div class="bi-kpi-title">
                        <span class="bi-kpi-label">
                            <i class="pi pi-sitemap mr-1"></i>
                            {{ t('dashboard.channels') }}
                        </span>
                    </div>
                </template>
                <template #content>
                    <div class="bi-kpi-content">
                        <div class="bi-kpi-value bi-kpi-value-green">
                            {{ stats.channels }}
                        </div>
                        <div class="bi-kpi-chart">
                            <Line
                                :data="{
                                    labels: chartLabels,
                                    datasets: [{ data: channelsTrend }]
                                }"
                                :options="chartOptions('#22C55E')"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Lamps -->
            <Card class="bi-panel bi-kpi-card">
                <template #title>
                    <div class="bi-kpi-title">
                        <span class="bi-kpi-label">
                            <i class="pi pi-lightbulb mr-1"></i>
                            {{ t('dashboard.lamps') }}
                        </span>
                    </div>
                </template>
                <template #content>
                    <div class="bi-kpi-content bi-kpi-lamps">
                        <div class="bi-kpi-value">
                            {{ stats.lampsOn }}/{{ stats.lampsTotal }}
                        </div>
                        <div class="bi-kpi-bar">
                            <div
                                class="bi-kpi-bar-fill"
                                :style="{
                                    width: (stats.lampsTotal ? (stats.lampsOn / stats.lampsTotal) * 100 : 0) + '%'
                                }"
                            ></div>
                        </div>
                        <div class="bi-kpi-footnote">
                            {{ t('dashboard.lamps_on') || 'Luminaires ON' }}
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- ADDRESS + OPERATOR -->
        <div class="bi-two-col">
            <!-- ADDRESS -->
            <div class="bi-panel bi-info-panel p-3">
                <div class="bi-info-header">
                    <h4 class="bi-info-title">
                        <i class="pi pi-map-marker mr-2"></i>
                        {{ t('dashboard.address_info') }}
                    </h4>
                    <Button
                        icon="pi pi-pencil"
                        text
                        rounded
                        size="small"
                        class="bi-icon-btn"
                        :tooltip="t('buttons.edit_building')"
                        @click.stop="$emit('edit-building', building)"
                    />
                </div>
                <div class="bi-info-body">
                    <p>
                        <span class="bi-info-label">
                            <i class="pi pi-globe mr-2 text-gray-400"></i>
                            {{ t('dashboard.location') || 'Location' }}
                        </span>
                        <span class="bi-info-value">{{ building.address || '—' }}</span>
                    </p>
                    <p>
                        <span class="bi-info-label">
                            <i class="pi pi-home mr-2 text-gray-400"></i>
                            {{ t('dashboard.type') || 'Type' }}
                        </span>
                        <span class="bi-info-value">{{ building.type || '—' }}</span>
                    </p>
                    <p v-if="building.area_m2">
                        <span class="bi-info-label">
                            <i class="pi pi-expand mr-2 text-gray-400"></i>
                            {{ t('dashboard.area') || 'Area' }}
                        </span>
                        <span class="bi-info-value">{{ building.area_m2 }} m²</span>
                    </p>
                </div>
            </div>

            <!-- OPERATOR -->
            <div
                v-if="building.operator"
                class="bi-panel bi-info-panel p-3"
            >
                <div class="bi-info-header">
                    <h4 class="bi-info-title">
                        <i class="pi pi-id-card mr-2"></i>
                        {{ t('dashboard.operator') }}
                    </h4>
                    <Button
                        icon="pi pi-user-edit"
                        text
                        rounded
                        size="small"
                        class="bi-icon-btn"
                        :tooltip="t('buttons.edit_operator')"
                        @click.stop="$emit('edit-operator', building.operator)"
                    />
                </div>
                <div class="bi-info-body">
                    <p>
                        <span class="bi-info-label">
                            <i class="pi pi-briefcase mr-2 text-gray-400"></i>
                            {{ t('dashboard.operator') || 'Company' }}
                        </span>
                        <span class="bi-info-value">{{ building.operator.name }}</span>
                    </p>
                    <p v-if="building.operator.contact_person">
                        <span class="bi-info-label">
                            <i class="pi pi-user mr-2 text-gray-400"></i>
                            {{ t('dashboard.operator_contact') || 'Contact' }}
                        </span>
                        <span class="bi-info-value">{{ building.operator.contact_person }}</span>
                    </p>
                    <p v-if="building.operator.phone">
                        <span class="bi-info-label">
                            <i class="pi pi-phone mr-2 text-gray-400"></i>
                            {{ t('dashboard.phone') || 'Phone' }}
                        </span>
                        <span class="bi-info-value">{{ building.operator.phone }}</span>
                    </p>
                    <p v-if="building.operator.email">
                        <span class="bi-info-label">
                            <i class="pi pi-envelope mr-2 text-gray-400"></i>
                            E-mail
                        </span>
                        <span class="bi-info-value">{{ building.operator.email }}</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- TEST BAR -->
        <div class="bi-panel bi-tests-panel">
            <div class="bi-tests-header">
                <div>
                    <h4 class="bi-tests-title">
                        <i class="pi pi-check-square mr-2"></i>
                        {{ t('dashboard.tests') || 'Functional tests' }}
                    </h4>
                </div>
                <div class="bi-tests-count">
                    <span class="bi-tests-count-number">147</span>
                    <span class="bi-tests-count-label">tests</span>
                </div>
            </div>

            <div class="bi-tests-body">
                <div class="bi-tests-row">
                    <div class="bi-tests-col">
                        <span class="bi-tests-label error">
                            <i class="pi pi-exclamation-circle mr-1"></i>
                            {{ t('dashboard.invalid') || 'Invalid' }}
                        </span>
                        <span class="bi-tests-value error">3%</span>
                        <span class="bi-tests-detail">3</span>
                    </div>
                    <div class="bi-tests-col">
                        <span class="bi-tests-label ok">
                            {{ t('dashboard.valid') || 'Valid' }}
                        </span>
                        <span class="bi-tests-value ok">97%</span>
                        <span class="bi-tests-detail">116</span>
                    </div>
                </div>

                <div class="bi-tests-bar">
                    <div class="bi-tests-bar-segment error" style="width:3%;"></div>
                    <div class="bi-tests-bar-segment ok" style="width:97%;"></div>
                </div>
            </div>
        </div>

        <!-- LOWER CARDS -->
        <div class="bi-two-col">
            <!-- POWER SUMMARY -->
            <Card class="bi-panel bi-power-panel">
                <template #title>
                    <div class="bi-panel-title-row">
                        <span class="bi-panel-title">
                            <i class="pi pi-bolt mr-2"></i>
                            {{ t('dashboard.power_summary') || 'Power summary' }}
                        </span>
                    </div>
                </template>
                <template #content>
                    <div class="bi-power-body">
                        <div>
                            <div class="bi-power-label">
                                {{ t('dashboard.total_consumption') || 'Total consumption' }}
                            </div>
                            <div class="bi-power-value">
                                148.6 kWh
                            </div>
                        </div>

                        <div class="bi-power-meta">
                            <span>
                                {{ t('dashboard.avg_load') || 'Avg load' }}:
                                <b>24.3 kWh</b>
                            </span>
                            <span>
                                {{ t('dashboard.max_load') || 'Max load' }}:
                                <b>310.8 W</b>
                            </span>
                        </div>

                        <div class="bi-power-bar">
                            <div class="bi-power-bar-fill" style="width:68%;"></div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- EXPORT / DOWNLOAD -->
            <Card class="bi-panel bi-export-panel">
                <template #title>
                    <div class="bi-panel-title-row">
                        <span class="bi-panel-title">
                            <i class="pi pi-download mr-2"></i>
                            {{ t('dashboard.download_stats') || 'Download statistics' }}
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
                            @click="console.log('📊 Exporting stats for', building.name)"
                        />
                    </div>
                </template>
            </Card>
        </div>

    </div>
</template>

<style scoped>
.building-industrial {
    padding-bottom: 0.5rem;
}

/* HEADER PANEL */
.bi-header-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-radius: 9px;
    border: 1px solid #c2c4c7;
    background: linear-gradient(180deg, #f4f5f7, #dfe1e4);
    box-shadow:
        inset 0 0 1px rgba(255, 255, 255, 0.7),
        0 1px 2px rgba(0, 0, 0, 0.06);
}

.app-dark .bi-header-panel {
    border-color: #2d2f31;
    background: linear-gradient(180deg, #222426, #1a1c1e);
    box-shadow:
        inset 0 0 1px rgba(255, 255, 255, 0.05),
        0 1px 2px rgba(0, 0, 0, 0.7);
}

.bi-header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.bi-header-title-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.bi-header-tag {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #4b5563;
}

.bi-header-id {
    font-size: 11px;
    color: #6b7280;
}

.app-dark .bi-header-tag {
    color: #e5e7eb;
}

.app-dark .bi-header-id {
    color: #9ca3af;
}

.bi-header-sub {
    font-size: 12px;
    color: #6b7280;
}

.app-dark .bi-header-sub {
    color: #9ca3af;
}

.bi-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* GENERIC INDUSTRIAL PANEL */
.bi-panel {
    border-radius: 10px !important;
    border: 1px solid #c2c4c7 !important;
    background: linear-gradient(180deg, #f7f8fa, #e5e6e8) !important;
    box-shadow:
        inset 0 0 1px rgba(255, 255, 255, 0.8),
        0 1px 2px rgba(0, 0, 0, 0.06) !important;
}

.app-dark .bi-panel {
    border-color: #2a2c2e !important;
    background: #1c1e1f !important;

    /* Industrial matte + inset */
    box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.05),
        inset 0 -1px 2px rgba(0,0,0,0.5),
        0 1px 2px rgba(0,0,0,0.55) !important;
}


/* KPI GRID */
.bi-kpi-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 0.9rem;
}
@media (min-width: 768px) {
    .bi-kpi-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

/* KPI CARDS */
.bi-kpi-card :deep(.p-card-body) {
    padding: 10px 12px;
}
.bi-kpi-card :deep(.p-card-title) {
    margin-bottom: 0.35rem;
}

.bi-kpi-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.bi-kpi-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #4b5563;
}
.app-dark .bi-kpi-label {
    color: #d1d5db;
}

.bi-kpi-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.bi-kpi-value {
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    color: #111827;
}
.app-dark .bi-kpi-value {
    color: #f9fafb;
}
.bi-kpi-value-blue {
    color: #1d4ed8;
}
.bi-kpi-value-green {
    color: #16a34a;
}
.bi-kpi-chart {
    position: relative;
    height: 64px;
}

/* Lamps KPI */
.bi-kpi-lamps {
    align-items: stretch;
}
.bi-kpi-bar {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: #d1d5db;
    overflow: hidden;
}
.bi-kpi-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #a3e635);
    transition: width 0.25s ease;
}
.app-dark .bi-kpi-bar {
    background: #374151;
}
.app-dark .bi-kpi-bar-fill {
    background: linear-gradient(90deg, #22c55e, #4ade80);
}
.bi-kpi-footnote {
    margin-top: 2px;
    font-size: 11px;
    text-align: right;
    color: #6b7280;
}
.app-dark .bi-kpi-footnote {
    color: #9ca3af;
}

/* TWO COLUMN GRID */
.bi-two-col {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
}
@media (min-width: 768px) {
    .bi-two-col {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

/* INFO PANELS */
.bi-info-panel :deep(.p-card-body),
.bi-power-panel :deep(.p-card-body),
.bi-export-panel :deep(.p-card-body) {
    padding: 12px 14px;
}
.bi-info-panel {
    position: relative;
}
.bi-info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
}
.bi-info-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2933;
}
.app-dark .bi-info-title {
    color: #e5e7eb;
}
.bi-icon-btn {
    color: #2563eb !important;
}
.bi-info-body p {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 4px;
}
.bi-info-label {
    display: inline-flex;
    align-items: center;
    color: #6b7280;
}
.bi-info-value {
    font-weight: 500;
    color: #111827;
}
.app-dark .bi-info-label {
    color: #9ca3af;
}
.app-dark .bi-info-value {
    color: #f9fafb;
}

/* TESTS PANEL */
.bi-tests-panel {
    padding: 12px 14px;
}
.bi-tests-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}
.bi-tests-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
}
.app-dark .bi-tests-title {
    color: #f9fafb;
}
.bi-tests-sub {
    font-size: 11px;
    color: #6b7280;
}
.app-dark .bi-tests-sub {
    color: #9ca3af;
}
.bi-tests-count {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}
.bi-tests-count-number {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
}
.bi-tests-count-label {
    font-size: 11px;
    color: #6b7280;
}
.app-dark .bi-tests-count-number {
    color: #f9fafb;
}
.app-dark .bi-tests-count-label {
    color: #9ca3af;
}
.bi-tests-body {
    margin-top: 4px;
}
.bi-tests-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
}
.bi-tests-col {
    font-size: 12px;
}
.bi-tests-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.bi-tests-label.ok {
    color: #2563eb;
}
.bi-tests-label.error {
    color: #ef4444;
}
.bi-tests-value {
    display: block;
    font-weight: 700;
}
.bi-tests-value.ok {
    color: #2563eb;
}
.bi-tests-value.error {
    color: #ef4444;
}
.bi-tests-detail {
    display: block;
    font-size: 11px;
    color: #6b7280;
}
.app-dark .bi-tests-detail {
    color: #9ca3af;
}
.bi-tests-bar {
    margin-top: 4px;
    height: 6px;
    border-radius: 999px;
    background: #d1d5db;
    overflow: hidden;
    display: flex;
}
.app-dark .bi-tests-bar {
    background: #374151;
}
.bi-tests-bar-segment.ok {
    background: linear-gradient(90deg, #22c55e, #4ade80);
}
.bi-tests-bar-segment.error {
    background: linear-gradient(90deg, #ef4444, #b91c1c);
}

/* POWER PANEL */
.bi-panel-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.bi-panel-title {
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #374151;
}
.app-dark .bi-panel-title {
    color: #e5e7eb;
}
.bi-power-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
}
.bi-power-label {
    color: #6b7280;
}
.app-dark .bi-power-label {
    color: #9ca3af;
}
.bi-power-value {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
}
.app-dark .bi-power-value {
    color: #fbbf24;
}
.bi-power-meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #6b7280;
}
.app-dark .bi-power-meta {
    color: #9ca3af;
}
.bi-power-bar {
    margin-top: 4px;
    height: 6px;
    border-radius: 999px;
    background: #d1d5db;
    overflow: hidden;
}
.app-dark .bi-power-bar {
    background: #374151;
}
.bi-power-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #f97316, #fbbf24);
}

/* EXPORT PANEL */
.bi-export-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.bi-export-text {
    font-size: 13px;
    color: #6b7280;
}
.app-dark .bi-export-text {
    color: #9ca3af;
}
/* ============================================
   INDUSTRIAL RACK-STYLE TOP HEADER
   Matches .rack-backplane & .rack-title
============================================ */

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 14px 18px;
    border-radius: 10px;

    background: #e7e8eb;
    border: 1px solid #c2c4c7;

    box-shadow:
        inset 0 0 1px rgba(255, 255, 255, 0.7),
        0 1px 2px rgba(0, 0, 0, 0.08);

    margin-bottom: 0.75rem;
}

.app-dark .header {
    background: #1d1f21;
    border-color: #2d2f31;

    box-shadow:
        inset 0 0 1px rgba(255,255,255,0.06),
        0 1px 3px rgba(0,0,0,0.65);
}

/* Title styling like rack-title */
.header-title {
    font-size: 15px;
    font-weight: 600;
    color: #374151;
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.app-dark .header-title {
    color: #e5e7eb;
}

/* ID line (smaller, subtle) */
.bi-header-rack-id {
    font-size: 12px;
    font-weight: 400;
    color: #6b7280;
    margin-top: 2px;
}

.app-dark .bi-header-rack-id {
    color: #9ca3af;
}

/* Actions on the right */
.bi-header-rack-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

</style>
