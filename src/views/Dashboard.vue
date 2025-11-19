<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useWebSocketService } from '@/service/WebsocketService.js';
import DeviceCard from '@/components/dashboard/DeviceCard.vue';
import DeviceControlDialog from '@/components/dashboard/DeviceControlDialog.vue';
import DeviceDetailsDialog from '@/components/dashboard/DeviceDetailsDialog.vue';
import Tag from 'primevue/tag';

const { devices, isConnected } = useWebSocketService();
const showPayloadDialog = ref(false);
const selectedPayload = ref(null);
const showControlDialog = ref(false);
const controlDevice = ref(null);

const now = ref(Date.now() / 1000);
let timer = null;

const formattedDevices = computed(() =>
    Object.values(devices).map(dev => ({
        ...dev,
        uptimeFormatted: formatUptime(dev.uptime),
        lastSeenFormatted: timeAgo(dev.last_seen)
    }))
);

function formatUptime(uptime) {
    if (!uptime) return '-';
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    return `${h}h ${m}m`;
}
function timeAgo(ts) {
    if (!ts) return '-';
    const diff = now.value - ts;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}
onMounted(() => (timer = setInterval(() => (now.value = Date.now() / 1000), 1000)));
onUnmounted(() => clearInterval(timer));
</script>

<template>
    <div class="p-6">

        <!-- INFO PANEL — przejście do Dashboard Mock -->
        <div class="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-sm flex items-start gap-4">
            <i class="pi pi-info-circle text-blue-600 dark:text-blue-300 text-xl mt-1"></i>

            <div class="flex-1">
                <h3 class="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                    Dashboard Mock available
                </h3>
                <p class="text-blue-600 dark:text-blue-400 text-sm">
                    To view building, stations and channel data in real-time simulation mode,
                    please switch to the <strong>Dashboard Mock</strong>.
                </p>
            </div>

            <router-link
                to="/dashboard-mock"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm shadow transition"
            >
                Go to Dashboard Mock
            </router-link>
        </div>

<!--        &lt;!&ndash; HEADER &ndash;&gt;-->
<!--        <div class="flex items-center justify-between mb-4">-->
<!--            <h2 class="text-2xl font-semibold">Live Devices</h2>-->
<!--            <Tag :value="isConnected ? 'Connected' : 'Disconnected'" :severity="isConnected ? 'success' : 'danger'" />-->
<!--        </div>-->

<!--        &lt;!&ndash; DEVICES GRID &ndash;&gt;-->
<!--        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">-->
<!--            <DeviceCard-->
<!--                v-for="dev in formattedDevices"-->
<!--                :key="dev.device_id"-->
<!--                :device="dev"-->
<!--                @onPayload="payload => { selectedPayload = payload; showPayloadDialog = true; }"-->
<!--                @onControl="id => { controlDevice = id; showControlDialog = true; }"-->
<!--            />-->
<!--        </div>-->

<!--        &lt;!&ndash; DIALOGI &ndash;&gt;-->
<!--        <DeviceDetailsDialog v-model:visible="showPayloadDialog" :payload="selectedPayload" />-->
<!--        <DeviceControlDialog v-model:visible="showControlDialog" :deviceId="controlDevice" />-->
    </div>
</template>
