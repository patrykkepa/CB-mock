<script setup>
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const logs = ref([
    { id: 1, level: 'critical', icon: 'pi pi-exclamation-triangle', date: '2025-11-12 12:31', event: 'Power anomaly detected on Rack L3', user: 'MonitorAgent' },
    { id: 2, level: 'warning', icon: 'pi pi-bolt', date: '2025-11-12 09:20', event: 'Phase imbalance on Station 4', user: 'System' },
    { id: 3, level: 'info', icon: 'pi pi-refresh', date: '2025-11-12 08:12', event: 'Station rebooted', user: 'System' },
    { id: 4, level: 'info', icon: 'pi pi-cog', date: '2025-11-11 19:15', event: 'Firmware update completed', user: 'Admin' },
    { id: 5, level: 'warning', icon: 'pi pi-clock', date: '2025-11-11 16:40', event: 'Response delay above threshold', user: 'MonitorAgent' },
    { id: 6, level: 'critical', icon: 'pi pi-times-circle', date: '2025-11-10 23:58', event: 'Controller overheating (82°C)', user: 'System' }
])

const counts = computed(() => ({
    total: logs.value.length,
    critical: logs.value.filter(l => l.level === 'critical').length,
    warning: logs.value.filter(l => l.level === 'warning').length,
    info: logs.value.filter(l => l.level === 'info').length,
}))

const activeFilter = ref('all')
const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'critical', label: 'Critical' },
    { key: 'warning', label: 'Warnings' },
    { key: 'info', label: 'Info' }
]

const filteredLogs = computed(() => {
    if (activeFilter.value === 'all') return logs.value
    return logs.value.filter(l => l.level === activeFilter.value)
})
</script>



<template>
    <div class="history-view space-y-8">
        <header class="ui-header">
            <h2 class="ui-header-title">System Event History</h2>

            <div class="ui-header-meta">
                <span class="ui-meta-pill">
                    <i class="pi pi-clock mr-1"></i>
                    Updated 3 min ago
                </span>
                <span class="ui-meta-pill">
                    <i class="pi pi-database mr-1"></i>
                    {{ counts.total }} entries
                </span>
            </div>
        </header>

        <section class="ui-kpi-grid">

            <div class="cx-kpi-card cx-kpi-yellow">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">Total Events</span>
                    <span class="cx-kpi-badge">All logs</span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">{{ counts.total }}</span>
                </div>
            </div>

            <div class="cx-kpi-card cx-kpi-teal">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">Critical</span>
                    <span class="cx-kpi-badge">Immediate</span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">{{ counts.critical }}</span>
                </div>
            </div>

            <div class="cx-kpi-card cx-kpi-pink">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">Warnings</span>
                    <span class="cx-kpi-badge">Potential issues</span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">{{ counts.warning }}</span>
                </div>
            </div>

            <div class="cx-kpi-card cx-kpi-indigo">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">Info Logs</span>
                    <span class="cx-kpi-badge">General</span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">{{ counts.info }}</span>
                </div>
            </div>

        </section>

        <div class="history-filters">
            <Button
                v-for="f in filterOptions"
                :key="f.key"
                :label="f.label"
                text
                @click="activeFilter = f.key"
                :class="['cx-chip-filter', { active: activeFilter === f.key }]"
            />
        </div>

        <Card class="ui-panel">
            <template #title>
                <span class="ui-panel-title">Recent Activity Timeline</span>
            </template>

            <template #content>
                <ul class="ui-list timeline-list">

                    <li
                        v-for="log in filteredLogs"
                        :key="log.id"
                        class="timeline-row"
                    >
                        <span class="timeline-icon" :class="log.level">
                            <i :class="log.icon"></i>
                        </span>

                        <div class="timeline-body">
                            <div class="timeline-main">
                                <span class="tl-event">{{ log.event }}</span>
                                <span class="tl-time">{{ log.date }}</span>
                            </div>
                            <div class="tl-meta">
                                <i class="pi pi-user mr-1"></i>
                                {{ log.user }}
                            </div>
                        </div>
                    </li>

                </ul>
            </template>
        </Card>

        <Card class="ui-panel">
            <template #title>
                <span class="ui-panel-title">Event Table</span>
            </template>

            <template #content>
                <DataTable
                    :value="filteredLogs"
                    class="p-datatable-sm cx-table"
                    paginator
                    :rows="10"
                >
                    <Column field="date" header="Date" sortable />
                    <Column field="event" header="Event" />
                    <Column field="user" header="User" />
                    <Column
                        field="level"
                        header="Level"
                        :body="row => row.level.toUpperCase()"
                        style="width: 100px; text-align:center;"
                    />
                </DataTable>
            </template>
        </Card>

        <Card class="bi-panel">
            <template #title>
                <span class="bi-panel-title-row">Event Insights</span>
            </template>

            <template #content>
                <div class="insight-grid">

                    <div class="insight-box">
                        <i class="pi pi-shield insight-icon critical"></i>
                        <div class="insight-value">{{ counts.critical }}</div>
                        <div class="insight-label">Critical Issues</div>
                    </div>

                    <div class="insight-box">
                        <i class="pi pi-info-circle insight-icon warning"></i>
                        <div class="insight-value">{{ counts.warning }}</div>
                        <div class="insight-label">Warnings</div>
                    </div>

                    <div class="insight-box">
                        <i class="pi pi-list insight-icon info"></i>
                        <div class="insight-value">{{ counts.info }}</div>
                        <div class="insight-label">Informational</div>
                    </div>

                    <div class="insight-box">
                        <i class="pi pi-database insight-icon neutral"></i>
                        <div class="insight-value">{{ counts.total }}</div>
                        <div class="insight-label">Total Logged</div>
                    </div>

                </div>
            </template>
        </Card>

    </div>
</template>



<style scoped>
.history-view { padding-bottom: 1rem; }

/* ============================================================
   FILTER CHIP (CoreX style)
============================================================ */
.cx-chip-filter {
    border-radius: 10px !important;
    padding: 6px 12px !important;
    color: var(--ui-text-muted) !important;
    font-size: 13px !important;
}

.cx-chip-filter.active {
    background: var(--ui-primary) !important;
    color: var(--ui-text) !important;
}

/* ============================================================
   TIMELINE LIST
============================================================ */
.timeline-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.timeline-row {
    display: flex;
    gap: 14px;
    padding: 6px 0;
}

.timeline-icon {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.timeline-icon.critical { background: #dc2626; }
.timeline-icon.warning  { background: #f59e0b; }
.timeline-icon.info     { background: #2563eb; }

.timeline-body {
    flex: 1;
    border-bottom: 1px solid var(--ui-border);
    padding-bottom: 6px;
}

.timeline-main {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 600;
}

.tl-event { color: var(--ui-text); }
.tl-time  { color: var(--ui-text-muted); font-size: 12px; }

.tl-meta {
    margin-top: 4px;
    font-size: 12px;
    color: var(--ui-text-muted);
}

/* ============================================================
   TABLE IMPROVEMENTS
============================================================ */
.cx-table :deep(.p-datatable-tbody tr:hover) {
    background: var(--ui-hover) !important;
}

/* ============================================================
   INSIGHT GRID
============================================================ */
.insight-grid {
    display: grid;
    gap: 1rem;
}

@media (min-width: 768px) {
    .insight-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

.insight-box {
    text-align: center;
    padding: 14px;
    border-radius: var(--ui-radius);
    border: 1px solid var(--ui-border);
    background: var(--ui-bg-soft);
}

.insight-icon {
    font-size: 22px;
    margin-bottom: 4px;
}

.insight-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--ui-text);
}

.insight-label {
    font-size: 12px;
    color: var(--ui-text-muted);
    margin-top: 2px;
}

.insight-icon.critical { color:#dc2626; }
.insight-icon.warning  { color:#f59e0b; }
.insight-icon.info     { color:#2563eb; }
.insight-icon.neutral  { color:#6b7280; }
</style>
