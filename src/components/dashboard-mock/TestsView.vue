<script setup>
import Card from 'primevue/card';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-semibold text-primary-700 dark:text-primary-300">
            <i class="pi pi-check-circle mr-2 text-green-500"></i> {{ t('dashboard.tests') || 'System Tests' }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <template #title>Successful Tests</template>
                <template #content>
                    <p class="text-3xl font-bold text-green-500 text-center">97%</p>
                    <p class="text-sm text-gray-500 text-center mt-1">116 of 120 passed</p>
                </template>
            </Card>

            <Card>
                <template #title>Failed Tests</template>
                <template #content>
                    <p class="text-3xl font-bold text-red-500 text-center">3%</p>
                    <p class="text-sm text-gray-500 text-center mt-1">4 failed</p>
                </template>
            </Card>

            <Card>
                <template #title>Last Test Run</template>
                <template #content>
                    <p class="text-center text-gray-600 dark:text-gray-300">
                        <i class="pi pi-clock mr-1"></i> 3 hours ago
                    </p>
                    <p class="text-xs text-center text-gray-400 mt-1">Automated nightly run</p>
                </template>
            </Card>
        </div>
    </div>
</template>
