<script setup>
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
    building: { type: Object, required: true },
})

const emit = defineEmits(['select-station', 'open-channel'])

const stationDialogVisible = ref(false)
const channelDialogVisible = ref(false)
const powerDialogVisible = ref(false)

const stationDialogData = ref(null)
const channelDialogData = ref(null)
const powerDialogData = ref(null)

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

function openStationModal(station) {
    stationDialogData.value = { ...station, stats: stationStats(station) }
    stationDialogVisible.value = true
}

function openChannelModal(station, ctrl) {
    channelDialogData.value = {
        station,
        controller: ctrl,
        stats: channelStats(ctrl)
    }
    channelDialogVisible.value = true
}

function openPowerModal(station) {
    powerDialogData.value = { ...station, stats: stationStats(station) }
    powerDialogVisible.value = true
}

function goToChannel(station, controller) {
    emit('select-station', station)
    emit('open-channel', controller.id)
}
</script>

<template>
    <div class="flex flex-col gap-4 h-full">
        <!-- HEADER (Rack-style) -->
        <div class="header">
            <div class="header-title">
                <i class="pi pi-server text-black-500 mr-2"></i>
                {{ t('dashboard.rack')}}
            </div>
        </div>

        <div class="flex-1 overflow-y-auto py-2">
            <div
                class="rack-grid"
                style="grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));"
            >
                <!-- RACK 19" STATION -->
                <div
                    v-for="st in stations"
                    :key="st.device_id"
                    class="rack19"
                >
                    <!-- GÓRNY PANEL RACKU -->
                    <div class="rack19-top">
                        <div class="rack19-top-left">
                            <span
                                class="rack19-led"
                                :class="[
                                    stationStatus(st),
                                    stationStatus(st) === 'ok' ? 'rack19-led-pulse' : ''
                                ]"
                            ></span>
                            <span class="rack19-top-label">
                                LCM
                            </span>
                        </div>

                        <div class="rack19-top-right">
                            <button
                                class="rack19-power-btn"
                                title="Power details"
                                @click.stop="openPowerModal(st)"
                            >
                                <i
                                    class="pi pi-bolt rack19-power-icon"
                                    :class="stationStatus(st)"
                                ></i>
                            </button>

                            <span class="rack19-top-id" :title="st.device_id">
                                {{ st.device_id }}
                            </span>
                        </div>
                    </div>

                    <!-- SZYNOWANIE + MODUŁY -->
                    <div class="rack19-inner">
                        <!-- LEWA SZYNA 19" -->
                        <div class="rack19-rail rack19-rail-left">
                            <div class="rack19-hole" v-for="i in 10" :key="'l'+i"></div>
                        </div>

                        <!-- ŚRODEK (MODUŁY / STACJA) -->
                        <div class="rack19-body">
                            <!-- „MODULE” STACJI -->
                            <button
                                class="rack19-station-module"
                                @click="openStationModal(st)"
                            >
                                <div class="rack19-station-icon-wrapper">
                                    <i
                                        class="pi pi-server rack19-station-icon"
                                        :class="stationStatus(st)"
                                    ></i>
                                </div>
                                <div class="rack19-station-text">
                                    <div class="rack19-station-name" :title="st.name">
                                        {{ st.name }}
                                    </div>
                                    <div class="rack19-station-meta">
                                        LUM: {{ stationStats(st).lampsOn }}/{{ stationStats(st).lampsTotal }}
                                    </div>

                                    <!-- Pasek udziału lamp ON -->
                                    <div class="rack19-station-bar">
                                        <div
                                            class="rack19-station-bar-fill"
                                            :style="{
                                                width: ((stationStats(st).lampsOn / stationStats(st).lampsTotal) * 100 || 0) + '%'
                                            }"
                                            :class="stationStatus(st)"
                                        ></div>
                                    </div>
                                </div>
                            </button>

                            <!-- SLOTY MODUŁÓW (CHANNELS) -->
                            <div class="rack19-modules">
                                <div
                                    v-for="ctrl in st.controllers || []"
                                    :key="ctrl.id"
                                    class="rack19-module"
                                    :class="channelStatus(ctrl)"
                                >
                                    <!-- GÓRA MODUŁU -->
                                    <div
                                        class="rack19-module-header"
                                        @click.stop="openChannelModal(st, ctrl)"
                                    >
                                        <div class="rack19-module-slot">
                                            LCC
                                        </div>
                                        <div class="rack19-module-main">
                                            <div class="rack19-module-name" :title="ctrl.name || (ctrl.id)">
                                                {{ ctrl.name || (ctrl.id) }}
                                            </div>
                                            <div class="rack19-module-meta">
                                                {{ channelStats(ctrl).lampsOn }}/{{ channelStats(ctrl).lampsTotal }} LUM ON
                                            </div>
                                        </div>
                                        <span class="rack19-module-led" :class="channelStatus(ctrl)"></span>
                                    </div>

                                    <!-- DÓŁ MODUŁU – BUTTON „LAMPS” (oryginalny, zostawiony) -->
                                    <button
                                        class="rack19-module-btn"
                                        :class="channelStatus(ctrl)"
                                        @click.stop="goToChannel(st, ctrl)"
                                    >
                                        <i class="pi pi-lightbulb text-xs"></i>
                                        <span>LUM</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- PRAWA SZYNA 19" -->
                        <div class="rack19-rail rack19-rail-right">
                            <div class="rack19-hole" v-for="i in 10" :key="'r'+i"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- STATION MODAL -->
        <Dialog
            v-model:visible="stationDialogVisible"
            modal
            :style="{ width: '420px' }"
            header="Station details"
        >
            <div v-if="stationDialogData" class="space-y-2 text-sm">
                <div class="font-semibold text-primary-700 dark:text-primary-300">
                    {{ stationDialogData.name }}
                </div>
                <div class="text-xs text-gray-500">
                    Device ID: {{ stationDialogData.device_id }}
                </div>
                <div>Channels: {{ stationDialogData.stats.channels }}</div>
                <div>
                    Lamps: {{ stationDialogData.stats.lampsOn }}/{{ stationDialogData.stats.lampsTotal }} ON
                </div>
                <div class="text-xs mt-3 text-gray-500">
                    FW: {{ stationDialogData.firmware }}<br />
                    Uptime: {{ stationDialogData.uptime }}s<br />
                    Heartbeats: {{ stationDialogData.heartbeats }}
                </div>
            </div>
        </Dialog>

        <!-- CHANNEL MODAL -->
        <Dialog
            v-model:visible="channelDialogVisible"
            modal
            :style="{ width: '420px' }"
            header="Channel details"
        >
            <div v-if="channelDialogData" class="space-y-2 text-sm">
                <div class="font-semibold text-primary-700 dark:text-primary-300">
                    {{ channelDialogData.controller.name || ('Channel ' + channelDialogData.controller.id) }}
                </div>
                <div class="text-xs text-gray-500">
                    Station: {{ channelDialogData.station.name }}
                </div>
                <div>
                    Lamps: {{ channelDialogData.stats.lampsOn }}/{{ channelDialogData.stats.lampsTotal }} ON
                </div>
                <div class="text-xs mt-3 text-gray-500">
                    Free memory: {{ channelDialogData.controller.free_heap }}
                </div>
            </div>
        </Dialog>

        <!-- POWER MODAL -->
        <Dialog
            v-model:visible="powerDialogVisible"
            modal
            :style="{ width: '420px' }"
            header="Power details"
        >
            <div v-if="powerDialogData" class="space-y-3 text-sm">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="font-semibold text-primary-700 dark:text-primary-300">
                            {{ powerDialogData.name }}
                        </div>
                        <div class="text-xs text-gray-500">
                            Device ID: {{ powerDialogData.device_id }}
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-xs">
                        <span
                            class="inline-flex h-2.5 w-2.5 rounded-full"
                            :class="{
                                'bg-emerald-400': stationStatus(powerDialogData) === 'ok',
                                'bg-amber-400': stationStatus(powerDialogData) === 'warn',
                                'bg-red-400': stationStatus(powerDialogData) === 'error',
                                'bg-slate-400': stationStatus(powerDialogData) === 'idle',
                            }"
                        ></span>
                        <span class="uppercase tracking-wide text-gray-500">
                            {{ stationStatus(powerDialogData).toUpperCase() }}
                        </span>
                    </div>
                </div>

                <div class="text-xs text-gray-500">
                    (Demo) Tutaj możesz później podpiąć realne dane o zasilaniu:
                    fazy, napięcia, prądy, zabezpieczenia itd.
                </div>

                <div class="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div class="p-2 rounded border border-gray-200 dark:border-gray-700">
                        <div class="text-gray-500 mb-1">Estimated load</div>
                        <div class="font-semibold">
                            ~{{ powerDialogData.stats.lampsOn * 30 }} W
                        </div>
                        <div class="text-[11px] text-gray-400">
                            (30 W per active luminaire – mock)
                        </div>
                    </div>
                    <div class="p-2 rounded border border-gray-200 dark:border-gray-700">
                        <div class="text-gray-500 mb-1">Utilization</div>
                        <div class="font-semibold">
                            {{
                                Math.round(
                                    (powerDialogData.stats.lampsOn / (powerDialogData.stats.lampsTotal || 1)) * 100
                                )
                            }}%
                        </div>
                        <div class="text-[11px] text-gray-400">
                            Active vs total luminaires
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.rack-grid {
    display: grid;
    gap: 1.25rem;
}

/* GŁÓWNY RACK 19" */
.rack19 {
    background: #15171a;
    border-radius: 10px;
    border: 1px solid #2f3237;
    box-shadow:
        0 3px 6px rgba(0, 0, 0, 0.35),
        inset 0 0 0 1px rgba(255, 255, 255, 0.03);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Górna listwa, coś jak panel identyfikacyjny */
.rack19-top {
    height: 28px;
    background: linear-gradient(180deg, #2b2f35, #1e2227);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px 0 10px;
    border-bottom: 1px solid #22262b;
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 10px;
    color: #e5e7eb;
}

.rack19-top-left {
    display: flex;
    align-items: center;
    gap: 6px;
}

.rack19-top-right {
    display: flex;
    align-items: center;
    gap: 6px;
}

.rack19-top-label {
    letter-spacing: 0.07em;
    font-weight: 600;
    font-size: 10px;
    text-transform: uppercase;
    color: #9ca3af;
}

.rack19-top-id {
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
    color: #9ca3af;
}

/* Power button / icon */
.rack19-power-btn {
    border: none;
    background: transparent;
    padding: 2px;
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, transform 0.08s ease;
}
.rack19-power-btn:hover {
    background: rgba(15, 23, 42, 0.8);
    transform: translateY(-0.5px);
}
.rack19-power-icon {
    font-size: 13px;
    color: #9ca3af;
}
.rack19-power-icon.ok {
    color: #22c55e;
}
.rack19-power-icon.warn {
    color: #facc15;
}
.rack19-power-icon.error {
    color: #ef4444;
}
.rack19-power-icon.idle {
    color: #6b7280;
}

/* LED główny */
.rack19-led {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.7), inset 0 0 3px rgba(0, 0, 0, 0.7);
}
.rack19-led.ok {
    background: #22c55e;
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.8);
}
.rack19-led.warn {
    background: #facc15;
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.8);
}
.rack19-led.error {
    background: #ef4444;
    box-shadow: 0 0 6px rgba(239, 68, 68, 0.8);
}
.rack19-led.idle {
    background: #6b7280;
}

/* Pulsowanie LED dla OK */
@keyframes rackLedPulse {
    0% {
        transform: scale(1);
        opacity: 0.85;
    }
    50% {
        transform: scale(1.35);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 0.85;
    }
}
.rack19-led-pulse {
    animation: rackLedPulse 1.6s ease-in-out infinite;
}

/* Wnętrze racka: dwie szyny + środek */
.rack19-inner {
    display: grid;
    grid-template-columns: 14px minmax(0, 1fr) 14px;
    background: radial-gradient(circle at 10% 0%, #20252b 0, #020617 60%);
}

/* Szyny 19" */
.rack19-rail {
    background: linear-gradient(180deg, #4b5563, #111827);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 0;
    gap: 3px;
}

.rack19-hole {
    width: 6px;
    height: 4px;
    border-radius: 1px;
    background: #020617;
    box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.7);
}

/* Środkowa część racka */
.rack19-body {
    padding: 8px 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* Moduł stacji (jak główny moduł PLC) */
.rack19-station-module {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.85), rgba(15, 23, 42, 0.95));
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.08s ease;
}
.rack19-station-module:hover {
    border-color: rgba(59, 130, 246, 0.8);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
}

.rack19-station-icon-wrapper {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: radial-gradient(circle at 30% 0, #6b7280, #020617);
    display: flex;
    align-items: center;
    justify-content: center;
}

.rack19-station-icon {
    font-size: 16px;
}
.rack19-station-icon.ok {
    color: #22c55e;
}
.rack19-station-icon.warn {
    color: #facc15;
}
.rack19-station-icon.error {
    color: #ef4444;
}
.rack19-station-icon.idle {
    color: #9ca3af;
}

.rack19-station-text {
    flex: 1;
    min-width: 0;
}

.rack19-station-name {
    font-size: 13px;
    font-weight: 600;
    color: #e5e7eb;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.rack19-station-meta {
    font-size: 10px;
    color: #9ca3af;
    margin-top: 1px;
}

/* Pasek procentowy lamp ON */
.rack19-station-bar {
    margin-top: 4px;
    width: 100%;
    height: 4px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.9);
    overflow: hidden;
}
.rack19-station-bar-fill {
    height: 100%;
    transition: width 0.3s ease;
}
.rack19-station-bar-fill.ok {
    background: linear-gradient(90deg, #22c55e, #4ade80);
}
.rack19-station-bar-fill.warn {
    background: linear-gradient(90deg, #facc15, #f97316);
}
.rack19-station-bar-fill.error {
    background: linear-gradient(90deg, #ef4444, #b91c1c);
}
.rack19-station-bar-fill.idle {
    background: linear-gradient(90deg, #6b7280, #4b5563);
}

/* Moduły (sloty) kanałów */
.rack19-modules {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.rack19-module {
    border-radius: 4px;
    border: 1px solid #1f2933;
    background: linear-gradient(180deg, #030712, #020617);
    box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.85);
    color: #e5e7eb;
    font-size: 11px;
    overflow: hidden;
}

.rack19-module.ok {
    box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.35), inset 0 0 0 1px rgba(15, 23, 42, 0.85);
}
.rack19-module.warn {
    box-shadow: 0 0 0 1px rgba(250, 204, 21, 0.35), inset 0 0 0 1px rgba(15, 23, 42, 0.85);
}
.rack19-module.error {
    box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.45), inset 0 0 0 1px rgba(15, 23, 42, 0.85);
}

/* góra modułu */
.rack19-module-header {
    display: flex;
    align-items: center;
    padding: 4px 6px;
    gap: 6px;
    cursor: pointer;
}

.rack19-module-slot {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9ca3af;
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid #4b5563;
    background: rgba(15, 23, 42, 0.95);
}

.rack19-module-main {
    flex: 1;
    min-width: 0;
}

.rack19-module-name {
    font-size: 11px;
    font-weight: 600;
    color: #e5e7eb;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.rack19-module-meta {
    font-size: 10px;
    color: #9ca3af;
}

.rack19-module-led {
    width: 7px;
    height: 7px;
    border-radius: 999px;
}
.rack19-module-led.ok {
    background: #22c55e;
}
.rack19-module-led.warn {
    background: #facc15;
}
.rack19-module-led.error {
    background: #ef4444;
}
.rack19-module-led.idle {
    background: #6b7280;
}

/* przycisk dolny (LUM – jak w Twojej wersji) */
.rack19-module-btn {
    width: 100%;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    font-weight: 600;
    padding: 4px 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: none;
    cursor: pointer;
    transition: filter 0.15s ease, transform 0.08s ease;
    color: #020617;
}
.rack19-module-btn.ok {
    background: linear-gradient(90deg, #22c55e, #4ade80);
}
.rack19-module-btn.warn {
    background: linear-gradient(90deg, #facc15, #f97316);
}
.rack19-module-btn.error {
    background: linear-gradient(90deg, #ef4444, #b91c1c);
}
.rack19-module-btn.idle {
    background: linear-gradient(90deg, #6b7280, #4b5563);
}
.rack19-module-btn:hover {
    filter: brightness(1.05);
    transform: translateY(-0.5px);
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

</style>
