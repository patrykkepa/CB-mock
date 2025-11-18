<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Tag from 'primevue/tag'

import { initMockServer, mockServer } from '@/service/MockServer'

import SidebarLocation from '@/components/dashboard-mock/SidebarLocation.vue'
import DashboardBootLoader from '@/components/dashboard-mock/BootLoader.vue'

import BuildingView from '@/components/dashboard-mock/BuildingView.vue'
import StationsTable from '@/components/dashboard-mock/StationsTable.vue'
import StationChannelsView from '@/components/dashboard-mock/StationChannelsView.vue'
import EmptyMapView from '@/components/dashboard-mock/EmptyMapView.vue'
import TestsView from '@/components/dashboard-mock/TestsView.vue'
import PowerView from '@/components/dashboard-mock/PowerView.vue'
import HistoryView from '@/components/dashboard-mock/HistoryView.vue'
import DiagramView from '@/components/dashboard-mock/DiagramView.vue'
import RackView from '@/components/dashboard-mock/RackView.vue'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const buildings = computed(() => mockServer.getBuildings())
const selectedBuilding = ref(null)
const selectedStation = ref(null)
const expandedChannel = ref(null)
const loading = ref(true)
const activeSubView = ref('overview')

onMounted(async () => {
    loading.value = true

    const MIN_LOADING_TIME = 1000
    const start = performance.now()

    try {
        await initMockServer()

        if (route.params.buildingId) {
            selectedBuilding.value = mockServer.getBuildingById(route.params.buildingId)
        }
    } catch (err) {
        console.error('❌ MockServer init error:', err)
    } finally {
        const elapsed = performance.now() - start
        const remaining = MIN_LOADING_TIME - elapsed

        if (remaining > 0) {
            setTimeout(() => (loading.value = false), remaining)
        } else {
            loading.value = false
        }
    }
})

watch(
    () => route.params.buildingId,
    id => {
        selectedBuilding.value = mockServer.getBuildingById(id)
        selectedStation.value = null
        expandedChannel.value = null
        activeSubView.value = 'overview'
    }
)

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
</script>

<template>
    <!-- FULLSCREEN BOOT / LOADER -->
    <DashboardBootLoader v-if="loading" />

    <!-- DASHBOARD WŁAŚCIWY -->
    <div
        v-else
        class="flex flex-col h-[calc(100vh-0rem)] bg-gray-50 dark:bg-surface-900"
    >
        <div
            class="flex flex-col flex-1
                   bg-white dark:bg-surface-800
                   rounded-2xl shadow-xl
                   overflow-hidden"
        >

            <!-- TOPBAR -->
            <header class="topbar-industrial-v2">
                <div class="ti2-left">

                    <!-- Back icon -->
                    <button
                        v-if="selectedBuilding"
                        class="ti2-back"
                        @click="router.push('/dashboard-mock')"
                    >
                        <i class="pi pi-arrow-left"></i>
                    </button>

                    <!-- Title plate -->
                    <div class="ti2-title-plate">
                        <span class="ti2-title">
                            {{ selectedBuilding ? selectedBuilding.name : 'Admin Dashboard' }}
                        </span>
                    </div>
                </div>

                <Tag value="Offline Mock" severity="info" class="text-xs" />
            </header>

            <div class="flex flex-1 overflow-hidden">

                <!-- Sidebar -->
                <SidebarLocation
                    v-if="selectedBuilding"
                    :activeSubView="activeSubView"
                    @set-subview="v => activeSubView = v"
                    class="shrink-0"
                />

                <div
                    v-else
                    class="shrink-0 w-64 flex items-center justify-center
                           text-gray-500 bg-white dark:bg-surface-800 border-r dark:border-gray-700"
                >
                    Select a building
                </div>

                <!-- MAIN CONTENT -->
                <main class="flex-1 p-6 overflow-y-auto relative">
                    <transition name="fade" mode="out-in">

                        <EmptyMapView
                            v-if="!selectedBuilding && !selectedStation"
                            key="empty"
                            :buildings="buildings"
                            @select-building="b => router.push(`/dashboard-mock/${b.id}`)"
                        />

                        <BuildingView
                            v-else-if="selectedBuilding && activeSubView === 'overview' && !selectedStation"
                            :key="'overview-' + selectedBuilding.id"
                            :building="selectedBuilding"
                            :stations="selectedBuilding.stations"
                            :formatUptime="formatUptime"
                            :selectStation="st => selectedStation = st"
                            :onControl="handleControl"
                            :onBack="() => router.push('/dashboard-mock')"
                        />

                        <StationsTable
                            v-else-if="selectedBuilding && activeSubView === 'stations' && !selectedStation"
                            :key="'stations-' + selectedBuilding.id"
                            :stations="selectedBuilding.stations"
                            :formatUptime="formatUptime"
                            :selectStation="st => selectedStation = st"
                            :onControl="handleControl"
                        />

                        <StationChannelsView
                            v-else-if="selectedStation"
                            key="channels"
                            :station="selectedStation"
                            :channels="selectedStation.controllers"
                            :formatUptime="formatUptime"
                            :timeAgo="timeAgo"
                            :expandedChannel="expandedChannel"
                            @toggle-channel="id => expandedChannel = expandedChannel === id ? null : id"
                            @back="resetToStations"
                        />

                        <TestsView
                            v-else-if="selectedBuilding && activeSubView === 'tests'"
                            :key="'tests-' + selectedBuilding.id"
                            :building="selectedBuilding"
                        />

                        <PowerView
                            v-else-if="selectedBuilding && activeSubView === 'power'"
                            :key="'power-' + selectedBuilding.id"
                            :building="selectedBuilding"
                        />

                        <HistoryView
                            v-else-if="selectedBuilding && activeSubView === 'history'"
                            :key="'history-' + selectedBuilding.id"
                            :building="selectedBuilding"
                        />

                        <DiagramView
                            v-else-if="selectedBuilding && activeSubView === 'diagram'"
                            :key="'diagram-' + selectedBuilding.id"
                            :building="selectedBuilding"
                            :selectStation="st => selectedStation = st"
                        />

                        <RackView
                            v-else-if="selectedBuilding && activeSubView === 'rack'"
                            :key="'rack-' + selectedBuilding.id"
                            :building="selectedBuilding"
                            @select-station="st => selectedStation = st"
                            @open-channel="id => expandedChannel = id"
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

/* ==========================================================
   TOPBAR — INDUSTRIAL / SIEMENS / WAGO hybrid V2
========================================================== */
.topbar-industrial-v2 {
    height: 70px;
    padding: 0 22px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    background: linear-gradient(180deg, #e8e9eb, #d6d7d9);
    border-bottom: 2px solid #b7b9bd;

    box-shadow:
        inset 0 1px 1px rgba(255,255,255,0.6),
        inset 0 -1px 1px rgba(0,0,0,0.15);
}

.app-dark .topbar-industrial-v2 {
    background: linear-gradient(180deg, #1a1b1d, #222426);
    border-bottom-color: #2e3032;
    box-shadow:
        inset 0 1px 1px rgba(255,255,255,0.05),
        inset 0 -1px 1px rgba(0,0,0,0.5);
}

.ti2-left {
    display: flex;
    align-items: center;
    gap: 18px;
}

.ti2-back {
    width: 34px;
    height: 34px;
    border-radius: 6px;
    background: linear-gradient(180deg, #f3f4f6, #e5e7eb);
    border: 1px solid #b6b7b9;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.15s;
}
.ti2-back:hover {
    background: #e1e2e5;
    border-color: #8ca3d2;
}

.app-dark .ti2-back {
    background: #2a2c2f;
    border-color: #414447;
}
.app-dark .ti2-back:hover {
    background: #35373b;
    border-color: #5c83c9;
}

.ti2-title-plate {
    padding: 10px 24px;
    background: linear-gradient(180deg, #f5f6f7, #e1e2e4);
    border: 1px solid #bfc1c4;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 12px;

    box-shadow:
        inset 0 1px 1px rgba(255,255,255,0.6),
        inset 0 -1px 2px rgba(0,0,0,0.08);
}

.app-dark .ti2-title-plate {
    background: linear-gradient(180deg, #2a2c2f, #222426);
    border-color: #3a3c3e;

    box-shadow:
        inset 0 1px 1px rgba(255,255,255,0.03),
        inset 0 -1px 2px rgba(0,0,0,0.6);
}

.ti2-title {
    font-size: 18px;
    font-weight: 600;
    color: #222;
    white-space: nowrap;
}

.app-dark .ti2-title {
    color: #e5e7eb;
}
</style>
