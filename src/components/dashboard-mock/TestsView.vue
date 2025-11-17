<script setup>
import Card from 'primevue/card'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
    <div class="tests-industrial space-y-6">

        <!-- INDUSTRIAL HEADER (rack style) -->
        <div class="tests-header">
            <div class="tests-header-title">
                <i class="pi pi-check-circle mr-2 text-green-500"></i>
                {{ t('dashboard.tests') || 'System Tests' }}
            </div>
        </div>

        <!-- GRID WITH TEST PANELS -->
        <div class="tests-grid">
            <!-- Successful -->
            <Card class="tests-panel">
                <template #title>
                    <span class="tests-panel-title">
                        {{ t('dashboard.valid') || 'Successful Tests' }}
                    </span>
                </template>
                <template #content>
                    <p class="tests-value success">97%</p>
                    <p class="tests-desc">116 of 120 passed</p>
                </template>
            </Card>

            <!-- Failed -->
            <Card class="tests-panel">
                <template #title>
                    <span class="tests-panel-title">
                        {{ t('dashboard.invalid') || 'Failed Tests' }}
                    </span>
                </template>
                <template #content>
                    <p class="tests-value error">3%</p>
                    <p class="tests-desc">4 failed</p>
                </template>
            </Card>

            <!-- Last run -->
            <Card class="tests-panel">
                <template #title>
                    <span class="tests-panel-title">
                        {{ t('dashboard.last_test_run') || 'Last Test Run' }}
                    </span>
                </template>
                <template #content>
                    <p class="tests-run-time">
                        <i class="pi pi-clock mr-1"></i>
                        3 hours ago
                    </p>
                    <p class="tests-run-hint">
                        Automated nightly run
                    </p>
                </template>
            </Card>
        </div>

    </div>
</template>

<style scoped>
/* ============================
   MAIN WRAPPER
============================ */
.tests-industrial {
    padding-bottom: 1rem;
}

/* ============================
   INDUSTRIAL HEADER (Rack style)
============================ */
.tests-header {
    padding: 14px 18px;
    border-radius: 10px;

    background: #e7e8eb;
    border: 1px solid #c2c4c7;

    box-shadow:
        inset 0 0 1px rgba(255, 255, 255, 0.7),
        0 1px 2px rgba(0, 0, 0, 0.08);
}

.app-dark .tests-header {
    background: #1d1f21;
    border-color: #2d2f31;

    box-shadow:
        inset 0 0 1px rgba(255, 255, 255, 0.06),
        0 1px 3px rgba(0, 0, 0, 0.65);
}

.tests-header-title {
    font-size: 15px;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
}

.app-dark .tests-header-title {
    color: #e5e7eb;
}


/* ============================
   GRID
============================ */
.tests-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 768px) {
    .tests-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* ============================
   PANEL (Rack-style)
============================ */

.tests-panel {
    border-radius: 10px !important;
    border: 1px solid #c2c4c7 !important;
    background: #f5f6f7 !important;

    box-shadow:
        inset 0 0 1px rgba(255, 255, 255, 0.8),
        0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.app-dark .tests-panel {
    background: #1a1c1e !important;
    border-color: #2d2f31 !important;

    box-shadow:
        inset 0 0 1px rgba(255, 255, 255, 0.06),
        0 1px 3px rgba(0, 0, 0, 0.65) !important;
}

.tests-panel :deep(.p-card-body) {
    padding: 14px 16px;
}

.tests-panel-title {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #374151;
}

.app-dark .tests-panel-title {
    color: #e5e7eb;
}

/* ============================
   KPI VALUES
============================ */

.tests-value {
    text-align: center;
    font-size: 30px;
    font-weight: 700;
}

.tests-value.success {
    color: #22c55e;
}

.tests-value.error {
    color: #ef4444;
}

.tests-desc {
    text-align: center;
    font-size: 13px;
    margin-top: 4px;
    color: #6b7280;
}

.app-dark .tests-desc {
    color: #9ca3af;
}

/* ============================
   LAST RUN PANEL
============================ */

.tests-run-time {
    text-align: center;
    color: #374151;
    font-size: 15px;
}

.app-dark .tests-run-time {
    color: #e5e7eb;
}

.tests-run-hint {
    text-align: center;
    margin-top: 4px;
    font-size: 12px;
    color: #6b7280;
}

.app-dark .tests-run-hint {
    color: #9ca3af;
}

</style>
