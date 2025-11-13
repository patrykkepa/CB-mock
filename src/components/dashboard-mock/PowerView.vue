<script setup>
import { ref, computed, onMounted } from 'vue'
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

// 🔋 Mock danych trendu mocy
const labels = ref(['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'])
const powerData = ref([250, 280, 310, 400, 460, 520, 480, 350])

const chartData = computed(() => ({
    labels: labels.value,
    datasets: [
        {
            label: 'Power (kWh)',
            data: powerData.value,
            fill: true,
            tension: 0.3,
            borderColor: '#facc15', // yellow-400
            backgroundColor: 'rgba(250, 204, 21, 0.15)',
            pointRadius: 4,
            pointBackgroundColor: '#fbbf24',
        },
    ],
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#9ca3af' },
        },
        y: {
            beginAtZero: true,
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(156, 163, 175, 0.1)' },
        },
    },
}
</script>

<template>
    <div class="space-y-8">
        <h2 class="text-2xl font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-2">
            <i class="pi pi-bolt text-yellow-500"></i>
            {{ t('dashboard.power') || 'Power Consumption' }}
        </h2>

        <!-- 🔹 Kafle z podsumowaniem -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <template #title>Total Power Usage</template>
                <template #content>
                    <p class="text-3xl font-bold text-yellow-500 text-center">412 kWh</p>
                    <p class="text-sm text-gray-500 text-center mt-1">Last 24h</p>
                </template>
            </Card>

            <Card>
                <template #title>Average Per Station</template>
                <template #content>
                    <p class="text-3xl font-bold text-blue-500 text-center">68.7 kWh</p>
                    <p class="text-sm text-gray-500 text-center mt-1">Across all controllers</p>
                </template>
            </Card>

            <Card>
                <template #title>Peak Usage</template>
                <template #content>
                    <p class="text-3xl font-bold text-red-500 text-center">127%</p>
                    <p class="text-sm text-gray-500 text-center mt-1">vs baseline</p>
                </template>
            </Card>
        </div>

        <!-- 📊 Wykres trendu mocy -->
        <Card>
            <template #title>Daily Power Trend</template>
            <template #content>
                <div class="relative h-64">
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
</style>
