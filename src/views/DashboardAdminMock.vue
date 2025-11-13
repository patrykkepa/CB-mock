<script setup>
import { computed, ref, onMounted } from 'vue'
import Tag from 'primevue/tag'
import { initMockServer, mockServer } from '@/service/MockServer'
import BuildingView from '@/components/dashboard-mock/BuildingView.vue'
import StationsTable from '@/components/dashboard-mock/StationsTable.vue'
import StationChannelsView from '@/components/dashboard-mock/StationChannelsView.vue'
import EmptyMapView from '@/components/dashboard-mock/EmptyMapView.vue'
import TestsView from '@/components/dashboard-mock/TestsView.vue'
import PowerView from '@/components/dashboard-mock/PowerView.vue'
import HistoryView from '@/components/dashboard-mock/HistoryView.vue'
import DiagramView from '@/components/dashboard-mock/DiagramView.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const buildings = computed(() => mockServer.getBuildings())

const selectedBuilding = ref(null)
const selectedStation = ref(null)
const expandedChannel = ref(null)
const loading = ref(true)
const activeSubView = ref('overview')

onMounted(async () => {
    loading.value = true
    try {
        await initMockServer()
    } catch (err) {
        console.error('❌ Błąd inicjalizacji mock serwera:', err)
    } finally {
        loading.value = false
    }
})

function buildingStats(building) {
    if (!building?.stations) return { stations: 0, channels: 0, lampsOn: 0, lampsTotal: 0 };
    let stations = building.stations.length;
    let channels = 0, lampsOn = 0, lampsTotal = 0;
    building.stations.forEach(st => {
        st.controllers?.forEach(ctrl => {
            channels++;
            ctrl.lamps?.forEach(l => {
                lampsTotal++;
                if (l.state === 'ON') lampsOn++;
            });
        });
    });
    return { stations, channels, lampsOn, lampsTotal };
}

function formatUptime(uptime) {
    if (!uptime) return '-';
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    return `${h}h ${m}m`;
}

function timeAgo(ts) {
    if (!ts) return '-';
    const diff = Date.now() / 1000 - ts;
    if (diff < 60) return `${Math.floor(diff)}s ${t('station.ago')}`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${t('station.ago')}`;
    return `${Math.floor(diff / 3600)}h ${t('station.ago')}`;
}

function handleControl(deviceId) {
    console.log('Control device:', deviceId);
}

function resetToBuildings() {
    selectedBuilding.value = null;
    selectedStation.value = null;
    expandedChannel.value = null;
    activeSubView.value = 'overview';
}

function resetToStations() {
    selectedStation.value = null;
    expandedChannel.value = null;
}

function selectBuilding(bld) {
    selectedStation.value = null;
    expandedChannel.value = null;
    selectedBuilding.value = bld;
    activeSubView.value = 'overview';
}
</script>

<template>
    <div class="flex flex-col h-[calc(100vh-0rem)] bg-gray-50 dark:bg-surface-900">
        <!-- Pasek tytułowy -->
        <header
            class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-800 flex items-center justify-between"
        >
            <h1 class="text-2xl font-semibold text-primary-600 dark:text-primary-400 tracking-tight">
                Admin Dashboard
            </h1>
            <Tag value="Offline Mock" severity="info" class="text-xs" />
        </header>

        <div class="grid grid-cols-12 flex-1 overflow-hidden">
            <!-- Sidebar-->
            <SidebarLocations
                :buildings="buildings"
                :selectedBuilding="selectedBuilding"
                :activeSubView="activeSubView"
                @select-building="selectBuilding"
                @set-subview="(v) => (activeSubView = v)"
            />

            <!-- Main panel -->
            <main class="col-span-9 p-6 overflow-y-auto relative">
                <transition name="fade" mode="out-in">
                    <!-- Pusty widok -->
                    <EmptyMapView
                        v-if="!selectedBuilding && !selectedStation"
                        key="empty"
                        :buildings="buildings"
                        @select-building="selectBuilding"
                    />

                    <!-- Widok informacji o budynku -->
                    <BuildingView
                        v-else-if="selectedBuilding && activeSubView === 'overview' && !selectedStation"
                        :key="'overview-' + selectedBuilding.id"
                        :building="selectedBuilding"
                        :stations="selectedBuilding.stations || []"
                        :formatUptime="formatUptime"
                        :selectStation="(st) => (selectedStation = st)"
                        :onControl="handleControl"
                        :onBack="resetToBuildings"
                    />

                    <!-- Widok stacji -->
                    <StationsTable
                        v-else-if="selectedBuilding && activeSubView === 'stations' && !selectedStation"
                        :key="'stations-' + selectedBuilding.id"
                        :stations="selectedBuilding.stations || []"
                        :formatUptime="formatUptime"
                        :selectStation="(st) => (selectedStation = st)"
                        :onControl="handleControl"
                    />

                    <!-- Widok kanałów -->
                    <StationChannelsView
                        v-else-if="selectedStation"
                        key="channels"
                        :station="selectedStation"
                        :channels="selectedStation.controllers || []"
                        :formatUptime="formatUptime"
                        :timeAgo="timeAgo"
                        :expandedChannel="expandedChannel"
                        @toggle-channel="(id) => (expandedChannel = expandedChannel === id ? null : id)"
                        @back="resetToStations"
                    />

                    <!-- Tests -->
                    <TestsView
                        v-else-if="selectedBuilding && activeSubView === 'tests' && !selectedStation"
                        :key="'tests-' + selectedBuilding.id"
                        :building="selectedBuilding"
                    />

                    <!-- Power -->
                    <PowerView
                        v-else-if="selectedBuilding && activeSubView === 'power' && !selectedStation"
                        :key="'power-' + selectedBuilding.id"
                        :building="selectedBuilding"
                    />

                    <!-- History -->
                    <HistoryView
                        v-else-if="selectedBuilding && activeSubView === 'history' && !selectedStation"
                        :key="'history-' + selectedBuilding.id"
                        :building="selectedBuilding"
                    />

                    <DiagramView
                        v-else-if="selectedBuilding && activeSubView === 'diagram' && !selectedStation"
                        :key="'diagram-' + selectedBuilding.id"
                        :building="selectedBuilding"
                        :selectStation="(st) => (selectedStation = st)"
                    />

                </transition>

                <!-- Ładowanie -->
                <div
                    v-if="loading"
                    class="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-surface-900/60"
                >
                    <i class="pi pi-spin pi-spinner text-2xl text-primary-500"></i>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.35s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(8px);
}
</style>
