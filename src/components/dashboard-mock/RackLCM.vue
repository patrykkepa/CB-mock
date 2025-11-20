<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog'

const props = defineProps({
    station: Object,
    stationStatus: Function,
    channelStatus: Function,
    stationStats: Function,
    channelStats: Function
})

const emit = defineEmits(['select-station', 'open-channel'])

const stationDialogVisible = ref(false)
const channelDialogVisible = ref(false)
const powerDialogVisible = ref(false)

const channelDialogData = ref(null)
const powerDialogData = ref(null)

function openStationModal() {
    stationDialogVisible.value = true
}

function openChannel(ctrl) {
    channelDialogData.value = {
        station: props.station,
        controller: ctrl,
        stats: props.channelStats(ctrl)
    }
    channelDialogVisible.value = true
}

function openPower() {
    powerDialogData.value = {
        ...props.station,
        stats: props.stationStats(props.station)
    }
    powerDialogVisible.value = true
}

function goToChannel(ctrl) {
    emit('select-station', props.station)
    emit('open-channel', {
        stationId: props.station.device_id,
        channelId: ctrl.id
    })
}
</script>

<template>
    <div class="rack19">
        <!-- LCM TOP -->
        <div class="rack19-top">
            <div class="rack19-top-left">
                <span
                    class="rack19-led"
                    :class="[stationStatus(station), stationStatus(station)==='ok' ? 'rack19-led-pulse':'' ]"
                ></span>
                <span class="rack19-top-label">LCM</span>
            </div>

            <div class="rack19-top-right">
                <button class="rack19-power-btn" @click.stop="openPower">
                    <i class="pi pi-bolt rack19-power-icon" :class="stationStatus(station)"></i>
                </button>
                <span class="rack19-top-id">{{ station.device_id }}</span>
            </div>
        </div>

        <!-- BODY -->
        <div class="rack19-inner">
            <div class="rack19-rail rack19-rail-left">
                <div class="rack19-hole" v-for="i in 10" :key="'l'+i"></div>
            </div>

            <div class="rack19-body">
                <!-- STATION MODULE -->
                <button class="rack19-station-module" @click="openStationModal">
                    <div class="rack19-station-icon-wrapper">
                        <i class="pi pi-server rack19-station-icon" :class="stationStatus(station)"></i>
                    </div>

                    <div class="rack19-station-text">
                        <div class="rack19-station-name">{{ station.name }}</div>

                        <div class="rack19-station-meta">
                            LUM {{ stationStats(station).lampsOn }}/{{ stationStats(station).lampsTotal }}
                        </div>

                        <div class="rack19-station-bar">
                            <div
                                class="rack19-station-bar-fill"
                                :class="stationStatus(station)"
                                :style="{
                                    width: (stationStats(station).lampsOn /
                                            stationStats(station).lampsTotal) * 100 + '%'
                                }"
                            ></div>
                        </div>
                    </div>
                </button>

                <!-- CHANNEL MODULES -->
                <div class="rack19-modules">
                    <div
                        v-for="ctrl in station.controllers"
                        :key="ctrl.id"
                        class="rack19-module"
                        :class="channelStatus(ctrl)"
                    >
                        <div class="rack19-module-header" @click.stop="openChannel(ctrl)">
                            <div class="rack19-module-slot">LCC</div>

                            <div class="rack19-module-main">
                                <div class="rack19-module-name">
                                    {{ ctrl.name || ctrl.id }}
                                </div>
                                <div class="rack19-module-meta">
                                    {{ channelStats(ctrl).lampsOn }}/{{ channelStats(ctrl).lampsTotal }} LUM ON
                                </div>
                            </div>

                            <span class="rack19-module-led" :class="channelStatus(ctrl)"></span>
                        </div>

                        <button
                            class="rack19-module-btn"
                            :class="channelStatus(ctrl)"
                            @click.stop="goToChannel(ctrl)"
                        >
                            <i class="pi pi-lightbulb text-xs"></i>
                            <span>LUM</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="rack19-rail rack19-rail-right">
                <div class="rack19-hole" v-for="i in 10" :key="'r'+i"></div>
            </div>
        </div>

        <!-- ===================== MODALS ===================== -->

        <!-- STATION MODAL -->
        <Dialog
            v-model:visible="stationDialogVisible"
            modal
            dismissableMask
            :showHeader="false"
            :style="{ width: '460px' }"
            class="lcm-dialog"
        >
            <div class="lcm-panel">
                <div class="lcm-panel-header">
                    <div class="lcm-label">STATION</div>
                    <div>
                        <div class="lcm-title">{{ station.name }}</div>
                        <div class="lcm-sub">Device ID: {{ station.device_id }}</div>
                    </div>
                </div>

                <div class="lcm-section">
                    <div class="lcm-row">
                        <span class="lcm-row-label">Channels</span>
                        <span class="lcm-row-value">{{ stationStats(station).channels }}</span>
                    </div>
                    <div class="lcm-row">
                        <span class="lcm-row-label">Lamps</span>
                        <span class="lcm-row-value">
                            {{ stationStats(station).lampsOn }}/{{ stationStats(station).lampsTotal }} ON
                        </span>
                    </div>
                </div>
            </div>
        </Dialog>

        <!-- CHANNEL MODAL -->
        <Dialog
            v-model:visible="channelDialogVisible"
            modal
            dismissableMask
            :showHeader="false"
            :style="{ width: '460px' }"
            class="lcm-dialog"
        >
            <div class="lcm-panel" v-if="channelDialogData">
                <div class="lcm-panel-header">
                    <div class="lcm-label">CHANNEL</div>
                    <div>
                        <div class="lcm-title">
                            {{ channelDialogData.controller.name || ('Channel ' + channelDialogData.controller.id) }}
                        </div>
                        <div class="lcm-sub">
                            Station: {{ channelDialogData.station.name }}
                        </div>
                    </div>
                </div>

                <div class="lcm-section">
                    <div class="lcm-row">
                        <span class="lcm-row-label">Lamps</span>
                        <span class="lcm-row-value">
                            {{ channelDialogData.stats.lampsOn }}/{{ channelDialogData.stats.lampsTotal }} ON
                        </span>
                    </div>

                    <div class="lcm-row">
                        <span class="lcm-row-label">Free memory</span>
                        <span class="lcm-row-value">
                            {{ channelDialogData.controller.free_heap }}
                        </span>
                    </div>
                </div>
            </div>
        </Dialog>

        <!-- POWER MODAL -->
        <Dialog
            v-model:visible="powerDialogVisible"
            modal
            dismissableMask
            :showHeader="false"
            :style="{ width: '460px' }"
            class="lcm-dialog"
        >
            <div class="lcm-panel" v-if="powerDialogData">
                <div class="lcm-panel-header lcm-panel-header-space">
                    <div>
                        <div class="lcm-label">POWER</div>
                        <div class="lcm-title">{{ powerDialogData.name }}</div>
                        <div class="lcm-sub">Device ID: {{ powerDialogData.device_id }}</div>
                    </div>

                    <div class="lcm-pill">
                        <span
                            class="lcm-dot"
                            :class="stationStatus(powerDialogData)"
                        ></span>
                        <span class="lcm-pill-text">
                            {{ stationStatus(powerDialogData).toUpperCase() }}
                        </span>
                    </div>
                </div>

                <div class="lcm-note">
                    (Demo) Real power metrics coming later.
                </div>

                <div class="lcm-grid">
                    <div class="lcm-tile">
                        <div class="lcm-tile-label">Estimated load</div>
                        <div class="lcm-tile-value">{{ powerDialogData.stats.lampsOn * 30 }} W</div>
                        <div class="lcm-tile-note">30 W per lamp</div>
                    </div>

                    <div class="lcm-tile">
                        <div class="lcm-tile-label">Utilization</div>
                        <div class="lcm-tile-value">
                            {{
                                Math.round(
                                    (powerDialogData.stats.lampsOn / powerDialogData.stats.lampsTotal) * 100
                                )
                            }}%
                        </div>
                        <div class="lcm-tile-note">Active vs total</div>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
/* =================== RACK 19" PANEL (bez zmian) =================== */

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
/* Górna listwa */
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

.rack19-top-left,
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

/* Moduł stacji */
.rack19-station-module {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    background: linear_gradient(135deg, rgba(31, 41, 55, 0.85), rgba(15, 23, 42, 0.95));
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

/* przycisk dolny (LUM) */
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

/* =================== MODALE LCM — TYLKO NASZE KLASY =================== */

/* Root dialog (PrimeVue dostaje tę klasę przez `class="lcm-dialog"`) */
.lcm-dialog {
    background: #0f1115;
    border-radius: 12px;
    border: 1px solid #3a3f47;
    box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.03),
        0 10px 32px rgba(0, 0, 0, 0.85);
}

/* Wnętrze panelu */
.lcm-panel {
    background: radial-gradient(circle at 0 0, #27313b 0, #05070a 55%);
    border-radius: 10px;
    border: 1px solid #3a3f47;
    padding: 18px 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: "JetBrains Mono", monospace;
    color: #d4d7dc;
}

/* Główny header w panelu */
.lcm-panel-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.lcm-panel-header-space {
    justify-content: space-between;
    align-items: center;
}

/* Mały label (STATION / CHANNEL / POWER) */
.lcm-label {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9ca3af;
    padding: 3px 7px;
    border-radius: 999px;
    border: 1px solid #4b5563;
    background: rgba(15, 23, 42, 0.9);
}

/* Title */
.lcm-title {
    font-size: 18px;
    font-weight: 700;
    color: #f3f4f6;
}

/* Subtitle */
.lcm-sub {
    font-size: 12px;
    color: #b5bcc4;
}

/* Sekcja z liniami */
.lcm-section {
    margin-top: 6px;
    padding: 10px 0;
    border-top: 1px solid #394049;
    border-bottom: 1px solid #394049;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* Pojedynczy wiersz info */
.lcm-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 13px;
}

.lcm-row-label {
    color: #9ca3af;
}
.lcm-row-value {
    color: #e5e7eb;
    font-weight: 500;
}

/* Power note */
.lcm-note {
    font-size: 11px;
    color: #9ca3af;
}

/* Pill z LED */
.lcm-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 999px;
    border: 1px solid #4b5563;
    background: rgba(15, 23, 42, 0.95);
}

.lcm-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    box-shadow: 0 0 6px currentColor;
}

.lcm-dot.ok { color: #22c55e; background: #22c55e; }
.lcm-dot.warn { color: #eab308; background: #eab308; }
.lcm-dot.error { color: #ef4444; background: #ef4444; }
.lcm-dot.idle { color: #6b7280; background: #6b7280; }

.lcm-pill-text {
    color: #e5e7eb;
    font-size: 11px;
    font-weight: 600;
}

/* Grid z kafelkami */
.lcm-grid {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
}

/* Kafel power */
.lcm-tile {
    background: #0c0f13;
    border-radius: 8px;
    border: 1px solid #394049;
    padding: 10px 12px;
}

.lcm-tile-label {
    font-size: 12px;
    color: #9ca3af;
}

.lcm-tile-value {
    margin-top: 4px;
    font-size: 20px;
    font-weight: 700;
    color: #f9fafb;
}

.lcm-tile-note {
    margin-top: 4px;
    font-size: 11px;
    color: #9ca3af;
}
</style>
<style>
/* ===========================================================
   FIX PRIMEVUE DEFAULT PADDING + WHITE BACKGROUND
=========================================================== */

.lcm-dialog.p-dialog {
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

.lcm-dialog .p-dialog-content {
    padding: 3px !important;
    background: white !important;
    border: none !important;
    border-radius: 0;
}

.lcm-dialog .p-dialog-header {
    display: none !important;
}

/* usuwa domyślne zaokrąglenia PrimeVue */
.lcm-dialog .p-dialog-content,
.lcm-dialog.p-dialog {
    border-radius: 10px !important;
}

</style>
