<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import RackLCM from '@/components/dashboard-mock/RackLCM.vue'

const { t } = useI18n()

const props = defineProps({
    building: { type: Object, required: true }
})

const emit = defineEmits(['select-station', 'open-channel'])

const stations = computed(() => {
    if (!props.building?.stations) return []
    return [...props.building.stations].sort((a, b) =>
        (a.name || a.device_id).localeCompare(b.name || b.device_id)
    )
})

function stationStats(station) {
    if (!station?.controllers) return { channels: 0, lampsOn: 0, lampsTotal: 0 }
    let channels = station.controllers.length
    let lampsOn = 0
    let lampsTotal = 0

    station.controllers.forEach(ctrl => {
        ctrl.lamps?.forEach(l => {
            lampsTotal++
            if (l.state === 'ON') lampsOn++
        })
    })

    return { channels, lampsOn, lampsTotal }
}

function channelStats(ctrl) {
    if (!ctrl?.lamps) return { lampsOn: 0, lampsTotal: 0 }
    const lampsOn = ctrl.lamps.filter(l => l.state === 'ON').length
    return { lampsOn, lampsTotal: ctrl.lamps.length }
}

function stationStatus(st) {
    const s = stationStats(st)
    if (s.lampsTotal === 0) return 'idle'
    const pct = s.lampsOn / s.lampsTotal
    if (pct === 0) return 'error'
    if (pct < 1) return 'warn'
    return 'ok'
}

function channelStatus(ctrl) {
    const s = channelStats(ctrl)
    if (s.lampsTotal === 0) return 'idle'
    const pct = s.lampsOn / s.lampsTotal
    if (pct === 0) return 'error'
    if (pct < 1) return 'warn'
    return 'ok'
}
</script>

<template>
    <div class="rack-view space-y-6">
        <!-- HEADER-->
        <header class="ui-header">
            <h2 class="ui-header-title">
                {{ t('dashboard.stations') || 'Stations overview' }}
            </h2>
            <div class="ui-header-meta">
                <span class="ui-meta-pill">
                    <i class="pi pi-server mr-1"></i>
                    {{ stations.length }} stations
                </span>
                <span class="ui-meta-pill">
                    <i class="pi pi-sitemap mr-1"></i>
                    LCM · LCC · LUM topology
                </span>
            </div>
        </header>

        <!-- PANEL z rackami -->
        <div class="ui-panel rack-panel">
            <div class="rack-grid">
                <RackLCM
                    v-for="st in stations"
                    :key="st.device_id"
                    :station="st"
                    :stationStatus="stationStatus"
                    :channelStatus="channelStatus"
                    :stationStats="stationStats"
                    :channelStats="channelStats"
                    @select-station="(station) => emit('select-station', station)"
                    @open-channel="(payload) => emit('open-channel', payload)"
                />

            </div>
        </div>
    </div>
</template>

<style scoped>
.rack-view {
    padding-bottom: 1rem;
}

.rack-panel {
    padding: 16px !important;
}

.rack-grid {
    display: grid;
    gap: 1.25rem;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
</style>
