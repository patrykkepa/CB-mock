<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const history = ref([
    { id: 1, date: '2025-11-12', event: 'Station rebooted', user: 'System' },
    { id: 2, date: '2025-11-11', event: 'Power anomaly detected', user: 'MonitorAgent' },
    { id: 3, date: '2025-11-10', event: 'Firmware updated', user: 'Admin' }
])
</script>

<template>
    <div class="history-industrial space-y-6">

        <!-- HEADER (Rack-style) -->
        <div class="header">
            <div class="header-title">
                <i class="pi pi-clock text-black-500 mr-2"></i>
                {{ t('dashboard.history') || 'Event History' }}
            </div>
        </div>

        <!-- TABLE PANEL WRAPPER -->
        <div class="history-panel">
            <DataTable
                :value="history"
                class="p-datatable-sm"
                tableStyle="min-width: 100%"
                paginator
                :rows="10"
            >
                <Column field="date" header="Date" sortable />
                <Column field="event" header="Event" />
                <Column field="user" header="User" />
            </DataTable>
        </div>

    </div>
</template>

<style scoped>
/* ============================================================
   WRAPPER
============================================================ */
.history-industrial {
    padding-bottom: 1rem;
}

/* ============================================================
   HEADER — same style as Rack View
============================================================ */
.header {
    padding: 14px 18px;
    border-radius: 10px;

    background: #e7e8eb;
    border: 1px solid #c2c4c7;

    box-shadow:
        inset 0 0 1px rgba(255,255,255,0.7),
        0 1px 2px rgba(0,0,0,0.07);
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
    letter-spacing: 0.02em;
    color: #373a40;
    display: flex;
    align-items: center;
}

.app-dark .header-title {
    color: #e5e7eb;
}

/* ============================================================
   TABLE PANEL — industrial card style
============================================================ */
.history-panel {
    border-radius: 10px;
    padding: 8px 10px;

    background: #f5f6f7;
    border: 1px solid #c2c4c7;

    box-shadow:
        inset 0 0 1px rgba(255,255,255,0.8),
        0 1px 2px rgba(0,0,0,0.05);
}

.app-dark .history-panel {
    background: #1a1c1e;
    border-color: #2d2f31;

    box-shadow:
        inset 0 0 1px rgba(255,255,255,0.06),
        0 1px 3px rgba(0,0,0,0.65);
}

/* ============================================================
   PRIMEVUE TABLE SKINNING — Industrial Table Theme
============================================================ */

/* Header */
.history-panel :deep(.p-datatable-thead > tr > th) {
    background: #e4e5e7;
    border-color: #c4c6c9;
    color: #374151;
    font-weight: 600;
    padding: 10px;
}

.app-dark .history-panel :deep(.p-datatable-thead > tr > th) {
    background: #2a2c2f;
    border-color: #3a3c3f;
    color: #e5e7eb;
}

/* Body rows */
.history-panel :deep(.p-datatable-tbody > tr > td) {
    padding: 10px;
    border-color: #d3d4d6;
    color: #1f2937;
}

.app-dark .history-panel :deep(.p-datatable-tbody > tr > td) {
    border-color: #3a3c3f;
    color: #e5e7eb;
}

/* Row hover */
.history-panel :deep(.p-datatable-tbody > tr:hover) {
    background: #eef0f2 !important;
}

.app-dark .history-panel :deep(.p-datatable-tbody > tr:hover) {
    background: #2b2d30 !important;
}

/* Paginator */
.history-panel :deep(.p-paginator) {
    background: transparent !important;
    border: none !important;
}

.history-panel :deep(.p-paginator-page) {
    color: #4b5563 !important;
}

.app-dark .history-panel :deep(.p-paginator-page) {
    color: #d1d5db !important;
}

/* Selected page */
.history-panel :deep(.p-paginator-page.p-highlight) {
    background: #d1d5db !important;
    color: #111827 !important;
}

.app-dark .history-panel :deep(.p-paginator-page.p-highlight) {
    background: #3c4043 !important;
    color: #fff !important;
}
</style>
