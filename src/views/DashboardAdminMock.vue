<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { initMockServer, mockServer } from '@/service/MockServer'

import DashboardBootLoader from '@/components/dashboard-mock/BootLoader.vue'
import OverviewView from '@/components/dashboard-mock/OverviewView.vue'
import StationsTable from '@/components/dashboard-mock/StationsTable.vue'
import ChannelsView from '@/components/dashboard-mock/ChannelsView.vue'
import EmptyMapView from '@/components/dashboard-mock/EmptyMapView.vue'
import TestsView from '@/components/dashboard-mock/TestsView.vue'
import PowerView from '@/components/dashboard-mock/PowerView.vue'
import HistoryView from '@/components/dashboard-mock/HistoryView.vue'
import DiagramView from '@/components/dashboard-mock/DiagramView.vue'
import RackView from '@/components/dashboard-mock/RackView.vue'

const route = useRoute()
const router = useRouter()

/* DATA */
const buildings = computed(() => mockServer.getBuildings())
const selectedBuilding = ref(null)
const selectedStation = ref(null)
const expandedChannel = ref(null)
const loading = ref(true)

const activeSubView = computed(() => route.params.subview || 'overview')

/* ------------------------------------------ */
/* LOADING + INIT MOCK SERVER */
/* ------------------------------------------ */
onMounted(async () => {
    loading.value = true
    const MIN_LOADING_TIME = 1000
    const start = performance.now()

    try {
        await initMockServer()

        if (route.params.buildingId) {
            selectedBuilding.value = mockServer.getBuildingById(route.params.buildingId)
        }
    } finally {
        const elapsed = performance.now() - start
        const delay = Math.max(0, MIN_LOADING_TIME - elapsed)
        setTimeout(() => (loading.value = false), delay)
    }
})

/* Gdy zmienia się buildingId → załaduj budynek */
watch(
    () => route.params.buildingId,
    id => {
        selectedBuilding.value = mockServer.getBuildingById(id)
        selectedStation.value = null
        expandedChannel.value = null
    }
)
watch(
    () => route.params.subview,
    () => {
        selectedStation.value = null
        expandedChannel.value = null
    }
)

/* HELPERS */
function formatUptime(uptime) {
    if (!uptime) return '-'
    const h = Math.floor(uptime / 3600)
    const m = Math.floor((uptime % 3600) / 60)
    return `${h}h ${m}m`
}

function timeAgo(ts) {
    if (!ts) return '-'
    const diff = Date.now() / 1000 - ts
    if (diff < 60) return `${Math.floor(diff)}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
}

function handleControl(deviceId) {
    console.log('Control device:', deviceId)
}

function resetToStations() {
    selectedStation.value = null
    expandedChannel.value = null
}
function refreshView() {
    loading.value = true;
    selectedStation.value = null;
    expandedChannel.value = null;

    const MIN_LOADING_TIME = 1000;
    const start = performance.now();

    initMockServer().then(() => {
        if (route.params.buildingId) {
            selectedBuilding.value = mockServer.getBuildingById(route.params.buildingId);
        }
        const elapsed = performance.now() - start;
        const delay = Math.max(0, MIN_LOADING_TIME - elapsed);
        setTimeout(() => (loading.value = false), delay);
    });
}

</script>

<template>
    <DashboardBootLoader v-if="loading" />

    <div class="flex flex-col min-h-screen bg-transparent">

    <div class="flex flex-col flex-1 bg-transparent rounded-2xl overflow-hidden">

            <div class="flex flex-1 overflow-hidden">

                <!-- MAIN CONTENT -->
                <main class="flex-1 p-6 relative">
                    <!-- CONTEXT HEADER -->
                    <div
                        v-if="selectedBuilding"
                        class="context-header mb-6 flex items-center justify-between"
                    >
                        <!-- LEWA CZĘŚĆ -->
                        <div>
                            <h2 class="context-title">
                                {{ selectedBuilding.name }}
                            </h2>

                            <div class="context-sub">
                                ID: {{ selectedBuilding.id }}
                                •
                                {{ activeSubView.charAt(0).toUpperCase() + activeSubView.slice(1) }}
                            </div>
                        </div>

                        <!-- PRAWA CZĘŚĆ: BACK + REFRESH -->
                        <div class="flex items-center gap-2">

                            <!-- POWRÓT -->
                            <button
                                class="ctx-icon-btn"
                                @click="router.push('/dashboard-mock')"
                                title="Back"
                            >
                                <i class="pi pi-arrow-left text-sm"></i>
                            </button>

                            <!-- ODSWIEŻ -->
                            <button
                                class="ctx-icon-btn"
                                @click="refreshView"
                                title="Refresh"
                            >
                                <i class="pi pi-refresh text-sm"></i>
                            </button>

                        </div>
                    </div>



                    <transition name="fade" mode="out-in">

                        <!-- NO BUILDING SELECTED -->
                        <EmptyMapView
                            v-if="!selectedBuilding && !selectedStation"
                            key="empty"
                            :buildings="buildings"
                            @select-building="b => router.push(`/dashboard-mock/${b.id}/overview`)"
                        />

                        <!-- BUILDING OVERVIEW -->
                        <OverviewView
                            v-else-if="selectedBuilding && activeSubView === 'overview' && !selectedStation"
                            :key="'overview-' + selectedBuilding.id"
                            :building="selectedBuilding"
                            :stations="selectedBuilding.stations"
                            :formatUptime="formatUptime"
                            :selectStation="st => selectedStation = st"
                            :onControl="handleControl"
                            :onBack="() => router.push('/dashboard-mock')"
                        />

                        <!-- STATIONS TABLE -->
                        <StationsTable
                            v-else-if="selectedBuilding && activeSubView === 'stations' && !selectedStation"
                            :key="'stations-' + selectedBuilding.id"
                            :stations="selectedBuilding.stations"
                            :formatUptime="formatUptime"
                            :selectStation="st => selectedStation = st"
                            :onControl="handleControl"
                        />

                        <!-- STATION CHANNELS -->
                        <ChannelsView
                            v-else-if="selectedStation"
                            key="channels"
                            :station="selectedStation"
                            :channels="selectedStation.controllers"
                            :formatUptime="formatUptime"
                            :timeAgo="timeAgo"
                            :activeChannelId="expandedChannel"
                            @toggle-channel="(id) => (expandedChannel = expandedChannel === id ? null : id)"
                            @back="resetToStations"
                        />

                        <!-- TESTS -->
                        <TestsView
                            v-else-if="selectedBuilding && activeSubView === 'tests'"
                            :key="'tests-' + selectedBuilding.id"
                            :building="selectedBuilding"
                        />

                        <!-- POWER -->
                        <PowerView
                            v-else-if="selectedBuilding && activeSubView === 'power'"
                            :key="'power-' + selectedBuilding.id"
                            :building="selectedBuilding"
                        />

                        <!-- HISTORY -->
                        <HistoryView
                            v-else-if="selectedBuilding && activeSubView === 'history'"
                            :key="'history-' + selectedBuilding.id"
                            :building="selectedBuilding"
                        />

                        <!-- DIAGRAM -->
                        <DiagramView
                            v-else-if="selectedBuilding && activeSubView === 'diagram'"
                            :key="'diagram-' + selectedBuilding.id"
                            :building="selectedBuilding"
                            :selectStation="st => selectedStation = st"
                        />

                        <!-- RACK VIEW -->
                        <RackView
                            v-else-if="selectedBuilding && activeSubView === 'rack'"
                            :key="'rack-' + selectedBuilding.id"
                            :building="selectedBuilding"
                            @select-station="st => selectedStation = st"
                            @open-channel="payload => {
                                const station = selectedBuilding.stations.find(s => s.device_id === payload.stationId)
                                selectedStation = station
                                expandedChannel = payload.channelId
                            }"
                        />


                    </transition>
                </main>
            </div>

        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.35s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
.ctx-icon-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .15s ease;
    color: #374151;
}

.ctx-icon-btn:hover {
    background: #e5e7eb;
    border-color: #d1d5db;
}

.app-dark .ctx-icon-btn {
    background: #111827;
    border-color: #1f2937;
    color: #f3f4f6;
}

.app-dark .ctx-icon-btn:hover {
    background: #1f2937;
    border-color: #374151;
}

</style>
