<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import SidebarLocation from '@/components/dashboard-mock/SidebarLocation.vue';

import BuildingView from '@/components/dashboard-mock/BuildingView.vue';
import StationsTable from '@/components/dashboard-mock/StationsTable.vue';
import StationChannelsView from '@/components/dashboard-mock/StationChannelsView.vue';
import TestsView from '@/components/dashboard-mock/TestsView.vue';
import PowerView from '@/components/dashboard-mock/PowerView.vue';
import HistoryView from '@/components/dashboard-mock/HistoryView.vue';

// === Reactive data ===
const building = ref(null);
const selectedBuilding = ref(null);
const selectedStation = ref(null);
const expandedChannel = ref(null);
const loading = ref(true);
const activeSubView = ref('overview');

// === Load mock data ===
onMounted(async () => {
    try {
        const res = await axios.get('/demo/data/mock-backend-szpital.json');
        building.value = res.data;
        selectedBuilding.value = res.data;
    } catch (err) {
        console.error('❌ Błąd ładowania mocka budynku:', err);
    } finally {
        loading.value = false;
    }
});

// === Computed ===
const stations = computed(() => building.value?.stations || []);
const channels = computed(() => selectedStation.value?.controllers || []);

// === Helpers ===
function formatUptime(uptime) {
    if (!uptime) return '-';
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    return `${h}h ${m}m`;
}

function timeAgo(ts) {
    if (!ts) return '-';
    const diff = Date.now() / 1000 - ts;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

// === Navigation ===
const resetToStations = () => {
    selectedStation.value = null;
    expandedChannel.value = null;
};

// === Stats helper ===
function buildingStats(bld) {
    if (!bld?.stations) return { stations: 0, channels: 0, lampsOn: 0, lampsTotal: 0 };
    let stations = bld.stations.length;
    let channels = 0;
    let lampsOn = 0;
    let lampsTotal = 0;

    bld.stations.forEach(st => {
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
</script>

<template>
    <div class="h-[calc(100vh-0rem)] grid grid-cols-12 bg-gray-50 dark:bg-surface-900">
        <!-- Sidebar -->
        <SidebarLocation
            v-if="selectedBuilding && !loading"
            :buildings="[building]"
            :selectedBuilding="selectedBuilding"
            :activeSubView="activeSubView"
            @select-building="() => {}"
            @set-subview="(v) => (activeSubView = v)"
        />

        <!-- Main Panel -->
        <main class="col-span-9 p-6 overflow-y-auto relative">
            <transition name="fade" mode="out-in">
                <div :key="selectedStation ? 'channels' : activeSubView">
                    <!-- Overview -->
                    <BuildingView
                        v-if="building && activeSubView === 'overview' && !selectedStation && !loading"
                        :building="building"
                        :stations="stations"
                        :formatUptime="formatUptime"
                        :selectStation="(st) => (selectedStation = st)"
                    />

                    <!-- Stations -->
                    <StationsTable
                        v-else-if="building && activeSubView === 'stations' && !selectedStation && !loading"
                        :stations="stations"
                        :formatUptime="formatUptime"
                        :selectStation="(st) => (selectedStation = st)"
                    />

                    <!-- Channels -->
                    <StationChannelsView
                        v-else-if="selectedStation && !loading"
                        :station="selectedStation"
                        :channels="channels"
                        :formatUptime="formatUptime"
                        :timeAgo="timeAgo"
                        :expandedChannel="expandedChannel"
                        @toggle-channel="(id) => expandedChannel = expandedChannel === id ? null : id"
                        @back="resetToStations"
                    />

                    <!-- Tests -->
                    <TestsView
                        v-else-if="building && activeSubView === 'tests' && !selectedStation && !loading"
                        :building="building"
                    />

                    <!-- Power -->
                    <PowerView
                        v-else-if="building && activeSubView === 'power' && !selectedStation && !loading"
                        :building="building"
                    />

                    <!-- History -->
                    <HistoryView
                        v-else-if="building && activeSubView === 'history' && !selectedStation && !loading"
                        :building="building"
                    />
                </div>
            </transition>

            <!-- Loading -->
            <div
                v-if="loading"
                class="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-surface-900/60"
            >
                <i class="pi pi-spin pi-spinner text-2xl text-primary-500"></i>
            </div>
        </main>
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
main {
    overflow-y: scroll;
    scrollbar-gutter: stable;
    min-height: calc(100vh - 4rem);
}
</style>
