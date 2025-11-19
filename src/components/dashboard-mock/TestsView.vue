<script setup>
import Card from 'primevue/card'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const kpiData = {
    totalToday: 120,
    passedToday: 116,
    failedToday: 4,
    avgDuration: '4m 32s',
    flakySuites: 3
}

const recentRuns = [
    { id: '#2025-11-18-01', status: 'passed', passed: 116, failed: 4, duration: '4m 12s', when: '3 hours ago', type: 'Nightly' },
    { id: '#2025-11-17-02', status: 'passed', passed: 118, failed: 2, duration: '3m 58s', when: '1 day ago', type: 'Manual' },
    { id: '#2025-11-16-01', status: 'failed', passed: 110, failed: 10, duration: '5m 21s', when: '2 days ago', type: 'Nightly' },
    { id: '#2025-11-15-03', status: 'passed', passed: 119, failed: 1, duration: '3m 44s', when: '3 days ago', type: 'Nightly' },
]

const failureByModule = [
    { name: 'EmergencyChannelService', failures: 5, last: '3 hours ago' },
    { name: 'PowerMonitoringJob', failures: 3, last: '1 day ago' },
    { name: 'FirmwareUpgradeFlow', failures: 2, last: '2 days ago' },
]

const environments = [
    { name: 'Staging LCC-01', branch: 'develop', firmware: 'v2.4.1', lastSync: '35 min ago', status: 'online' },
    { name: 'QA Rack-Cluster', branch: 'release/1.8.0', firmware: 'v2.3.9', lastSync: '2 h ago', status: 'online' },
    { name: 'Sandbox', branch: 'feature/test-improvements', firmware: 'v2.5.0-beta', lastSync: '6 h ago', status: 'degraded' }
]
</script>

<template>
    <div class="tests-view space-y-6">
        <!-- HEADER -->
        <header class="ui-header">
            <div>
                <h2 class="ui-header-title">
                    {{ t('dashboard.functional_tests') || 'Functional tests' }}
                </h2>
                <div class="ui-header-meta">
                    <span class="ui-meta-pill">
                        <i class="pi pi-cloud mr-1"></i>
                        CI pipeline · LCC cluster
                    </span>
                    <span class="ui-meta-pill">
                        <i class="pi pi-clock mr-1"></i>
                        Last run: 3 hours ago
                    </span>
                    <span class="ui-meta-pill">
                        <i class="pi pi-check-circle mr-1"></i>
                        Pass rate: 97%
                    </span>
                </div>
            </div>
        </header>

        <!-- KPI PASTEL GRID -->
        <section class="ui-kpi-grid">
            <!-- Total tests -->
            <div class="cx-kpi-card cx-kpi-yellow">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">
                        {{ t('dashboard.total_tests') || 'Total tests today' }}
                    </span>
                    <span class="cx-kpi-badge">
                        CI · Nightly
                    </span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">{{ kpiData.totalToday }}</span>
                    <span class="cx-kpi-trend">
                        executed
                    </span>
                </div>
            </div>

            <!-- Pass rate -->
            <div class="cx-kpi-card cx-kpi-teal">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">
                        {{ t('dashboard.valid') || 'Pass rate' }}
                    </span>
                    <span class="cx-kpi-badge">
                        +2.1% vs yesterday
                    </span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">97%</span>
                    <span class="cx-kpi-trend">
                        {{ kpiData.passedToday }} / {{ kpiData.totalToday }}
                    </span>
                </div>
            </div>

            <!-- Avg duration -->
            <div class="cx-kpi-card cx-kpi-pink">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">
                        {{ t('dashboard.avg_duration') || 'Avg duration' }}
                    </span>
                    <span class="cx-kpi-badge">
                        last 7 runs
                    </span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">{{ kpiData.avgDuration }}</span>
                    <span class="cx-kpi-trend">
                        per test run
                    </span>
                </div>
            </div>

            <!-- Flaky suites -->
            <div class="cx-kpi-card cx-kpi-indigo">
                <div class="cx-kpi-header">
                    <span class="cx-kpi-title">
                        {{ t('dashboard.flaky_suites') || 'Flaky suites' }}
                    </span>
                    <span class="cx-kpi-badge">
                        watch closely
                    </span>
                </div>
                <div class="cx-kpi-value-row">
                    <span class="cx-kpi-value">{{ kpiData.flakySuites }}</span>
                    <span class="cx-kpi-trend">
                        unstable
                    </span>
                </div>
            </div>
        </section>

        <!-- SMALL SUMMARY PANELS -->
        <section class="ui-kpi-grid tests-summary-grid">
            <!-- Successful -->
            <Card class="ui-panel tests-summary-card">
                <template #title>
                    <span class="ui-panel-title">
                        {{ t('dashboard.valid') || 'Successful Tests' }}
                    </span>
                </template>
                <template #content>
                    <p class="tests-summary-value tests-summary-success">97%</p>
                    <p class="tests-summary-meta">
                        {{ kpiData.passedToday }} of {{ kpiData.totalToday }} passed
                    </p>
                </template>
            </Card>

            <!-- Failed -->
            <Card class="ui-panel tests-summary-card">
                <template #title>
                    <span class="ui-panel-title">
                        {{ t('dashboard.invalid') || 'Failed Tests' }}
                    </span>
                </template>
                <template #content>
                    <p class="tests-summary-value tests-summary-error">
                        {{ Math.round((kpiData.failedToday / kpiData.totalToday) * 100) }}%
                    </p>
                    <p class="tests-summary-meta">
                        {{ kpiData.failedToday }} failed
                    </p>
                </template>
            </Card>

            <!-- Last run -->
            <Card class="ui-panel tests-summary-card">
                <template #title>
                    <span class="ui-panel-title">
                        {{ t('dashboard.last_test_run') || 'Last Test Run' }}
                    </span>
                </template>
                <template #content>
                    <p class="tests-summary-label">
                        <i class="pi pi-clock mr-1" />
                        3 hours ago
                    </p>
                    <p class="tests-summary-meta">
                        Automated nightly run (LCC-01)
                    </p>
                </template>
            </Card>
        </section>

        <!-- RECENT RUNS + FAILURE BY MODULE -->
        <section class="ui-two-col">
            <!-- Recent runs -->
            <Card class="ui-panel tests-list-panel">
                <template #title>
                    <span class="ui-panel-title">
                        {{ t('dashboard.recent_runs') || 'Recent test runs' }}
                    </span>
                </template>
                <template #content>
                    <ul class="ui-list tests-runs-list">
                        <li
                            v-for="run in recentRuns"
                            :key="run.id"
                            class="tests-run-row"
                        >
                            <div class="tests-run-main">
                                <span class="tests-run-id">{{ run.id }}</span>
                                <span
                                    class="tests-run-status"
                                    :class="{
                                        'tests-status-passed': run.status === 'passed',
                                        'tests-status-failed': run.status === 'failed'
                                    }"
                                >
                                    <i class="pi pi-circle-fill mr-1" />
                                    {{ run.status === 'passed' ? 'Passed' : 'Failed' }}
                                </span>
                            </div>
                            <div class="tests-run-meta">
                                <span>{{ run.passed }} passed · {{ run.failed }} failed</span>
                                <span>{{ run.duration }}</span>
                                <span>{{ run.when }} · {{ run.type }}</span>
                            </div>
                        </li>
                    </ul>
                </template>
            </Card>

            <!-- Failure by module -->
            <Card class="ui-panel tests-list-panel">
                <template #title>
                    <span class="ui-panel-title">
                        {{ t('dashboard.failure_by_module') || 'Failure by module' }}
                    </span>
                </template>
                <template #content>
                    <ul class="ui-list tests-modules-list">
                        <li
                            v-for="mod in failureByModule"
                            :key="mod.name"
                            class="tests-module-row"
                        >
                            <div class="tests-module-main">
                                <span class="tests-module-name">{{ mod.name }}</span>
                                <span class="tests-module-failures">
                                    {{ mod.failures }} failures
                                </span>
                            </div>
                            <div class="tests-module-meta">
                                <span class="tests-module-last">
                                    Last: {{ mod.last }}
                                </span>
                                <span class="tests-module-chip">
                                    <i class="pi pi-bug mr-1" />
                                    unstable
                                </span>
                            </div>
                        </li>
                    </ul>
                </template>
            </Card>
        </section>

        <!-- ENVIRONMENTS / EXECUTION CONTEXT -->
        <Card class="bi-panel tests-env-panel">
            <template #title>
                <span class="bi-panel-title-row">
                    {{ t('dashboard.test_environments') || 'Test environments' }}
                </span>
            </template>
            <template #content>
                <div class="tests-env-grid">
                    <div
                        v-for="env in environments"
                        :key="env.name"
                        class="tests-env-item"
                    >
                        <div class="tests-env-header">
                            <span class="tests-env-name">{{ env.name }}</span>
                            <span
                                class="tests-env-status"
                                :class="{
                                    'env-online': env.status === 'online',
                                    'env-degraded': env.status === 'degraded',
                                    'env-offline': env.status === 'offline'
                                }"
                            >
                                <i class="pi pi-circle-fill mr-1" />
                                {{ env.status }}
                            </span>
                        </div>
                        <div class="tests-env-body">
                            <span class="tests-env-line">
                                <i class="pi pi-code-branch mr-1" />
                                {{ env.branch }}
                            </span>
                            <span class="tests-env-line">
                                <i class="pi pi-microchip mr-1" />
                                Firmware {{ env.firmware }}
                            </span>
                            <span class="tests-env-line">
                                <i class="pi pi-refresh mr-1" />
                                Last sync: {{ env.lastSync }}
                            </span>
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.tests-view {
    padding-bottom: 1rem;
}

.tests-summary-grid {
}

@media (min-width: 768px) {
    .tests-summary-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.tests-summary-card :deep(.p-card-body) {
    padding: 14px 16px;
}

.tests-summary-value {
    text-align: center;
    font-size: 26px;
    font-weight: 700;
    margin: 4px 0;
}

.tests-summary-success {
    color: #22c55e;
}

.tests-summary-error {
    color: #ef4444;
}

.tests-summary-label {
    text-align: center;
    font-size: 14px;
    color: var(--ui-text-soft);
}

.tests-summary-meta {
    text-align: center;
    font-size: 12px;
    margin-top: 4px;
    color: var(--ui-text-muted);
}

.tests-list-panel :deep(.p-card-body) {
    padding: 14px 16px;
}

.tests-runs-list,
.tests-modules-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.tests-run-row,
.tests-module-row {
    padding: 8px 0;
    border-bottom: 1px solid var(--ui-border);
}

.tests-run-row:last-child,
.tests-module-row:last-child {
    border-bottom: none;
}

.tests-run-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
}

.tests-run-id {
    font-weight: 600;
    font-size: 13px;
    color: var(--ui-text);
}

.tests-run-status {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    text-transform: capitalize;
}

.tests-run-status i {
    font-size: 8px;
}

.tests-status-passed {
    background: #dcfce7;
    color: #166534;
}

.tests-status-failed {
    background: #fee2e2;
    color: #b91c1c;
}

.tests-run-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 11px;
    color: var(--ui-text-muted);
}

/* Failure by module */
.tests-module-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
}

.tests-module-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--ui-text);
}

.tests-module-failures {
    font-size: 12px;
    font-weight: 600;
    color: #b91c1c;
}

.tests-module-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: var(--ui-text-muted);
    gap: 8px;
}

.tests-module-chip {
    padding: 3px 8px;
    border-radius: 999px;
    background: #fef3c7;
    color: #92400e;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.tests-env-panel :deep(.p-card-body) {
    padding: 14px 16px;
}

.tests-env-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
}

@media (min-width: 768px) {
    .tests-env-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.tests-env-item {
    border-radius: var(--ui-radius);
    border: 1px solid var(--ui-border);
    padding: 10px 12px;
    background: var(--ui-bg-soft);
}

.tests-env-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.tests-env-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--ui-text);
}

.tests-env-status {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    text-transform: capitalize;
}

.tests-env-status i {
    font-size: 8px;
}

.env-online {
    background: #dcfce7;
    color: #166534;
}

.env-degraded {
    background: #fef3c7;
    color: #92400e;
}

.env-offline {
    background: #fee2e2;
    color: #b91c1c;
}

.tests-env-body {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 12px;
    color: var(--ui-text-soft);
}

.tests-env-line i {
    font-size: 11px;
}
</style>
