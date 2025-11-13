<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const history = ref([
    { id: 1, date: '2025-11-12', event: 'Station rebooted', user: 'System' },
    { id: 2, date: '2025-11-11', event: 'Power anomaly detected', user: 'MonitorAgent' },
    { id: 3, date: '2025-11-10', event: 'Firmware updated', user: 'Admin' },
]);
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-semibold text-primary-700 dark:text-primary-300">
            <i class="pi pi-clock mr-2 text-blue-500"></i> {{ t('dashboard.history') || 'Event History' }}
        </h2>

        <DataTable :value="history" class="p-datatable-sm shadow rounded-lg">
            <Column field="date" header="Date" sortable></Column>
            <Column field="event" header="Event"></Column>
            <Column field="user" header="User"></Column>
        </DataTable>
    </div>
</template>
