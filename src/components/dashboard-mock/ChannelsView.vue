<script setup>
import { ref } from "vue"
import Dialog from "primevue/dialog"
import Button from "primevue/button"

/* ---------------- PROPS ---------------- */
const props = defineProps({
    station: { type: Object, required: true },
    channels: { type: Array, required: true },
    formatUptime: { type: Function, required: true },
    timeAgo: { type: Function, required: true }
})

const emit = defineEmits(["back"])

/* ---------------- STATE ---------------- */
const expanded = ref(new Set())
const powerModal = ref(false)
const powerData = ref(null)

function toggle(id) {
    expanded.value.has(id)
        ? expanded.value.delete(id)
        : expanded.value.add(id)
}

function isExpanded(id) {
    return expanded.value.has(id)
}

function openPower(ch) {
    powerData.value = ch
    powerModal.value = true
}

/* ---------------- HELPERS ---------------- */
function channelStats(ctrl) {
    const total = ctrl.lamps?.length || 0
    const on = ctrl.lamps?.filter(l => l.state === "ON").length || 0
    return { on, total }
}

function status(ctrl) {
    const s = channelStats(ctrl)
    if (s.total === 0) return "idle"
    if (s.on === 0) return "error"
    if (s.on < s.total) return "warn"
    return "ok"
}

/* -------- MULTI-CHAR SEGMENT DISPLAY -------- */
const charSegments = {
    "0": [1,2,3,4,5,6],
    "1": [2,3],
    "2": [1,2,7,5,4],
    "3": [1,2,7,3,4],
    "4": [6,7,2,3],
    "5": [1,6,7,3,4],
    "6": [1,6,5,4,3,7],
    "7": [1,2,3],
    "8": [1,2,3,4,5,6,7],
    "9": [1,2,3,4,6,7],

    "C": [1,6,5,4],
    "T": [1,8],
    "R": [1,2,6,7,8,3],
    "L": [6,5,4],
    "A": [1,2,3,5,6,7],
    "E": [1,6,7,5,4],
    "F": [1,6,7,5],

    "-": [7],
    " ": [],
    "?": [1,2,7,5,4]
}

function getSegmentsForChar(char) {
    return charSegments[char.toUpperCase()] || charSegments["?"]
}

function getSegmentsForString(str) {
    return [...String(str)].map(ch => getSegmentsForChar(ch))
}
</script>

<template>
    <div class="channels-view space-y-6 h-full">

        <!-- HEADER -->
        <header class="ui-header channels-header">
            <div class="channels-header-main">
                <h2 class="ui-header-title">
                    Channels of station {{ station.name }}
                </h2>
                <div class="ui-header-meta">
                    <span class="ui-meta-pill">
                        <i class="pi pi-server mr-1"></i>
                        ID: {{ station.device_id }}
                    </span>
                    <span class="ui-meta-pill">
                        <i class="pi pi-sliders-h mr-1"></i>
                        {{ channels.length }} controllers (LCC)
                    </span>
                </div>
            </div>
            <div class="channels-header-actions">
                <Button
                    icon="pi pi-arrow-left"
                    label="Back"
                    text
                    @click="emit('back')"
                    class="channels-back-btn"
                />
            </div>
        </header>

        <!-- PANEL Z MODUŁAMI LCC -->
        <section class="ui-panel channels-panel">
            <div class="channels-grid">
                <div
                    v-for="ch in channels"
                    :key="ch.id"
                    class="channels-item"
                >
                    <div class="lcc-module">
                        <!-- TOP PANEL -->
                        <div class="lcc-top">
                            <div class="lcc-top-left">
                                <span class="lcc-led" :class="status(ch)"></span>
                                <span class="lcc-slot">LCC</span>

                                <!-- SEGMENT DISPLAY -->
                                <div class="seg-display">
                                    <div
                                        v-for="(charSegs, idx) in getSegmentsForString(ch.id)"
                                        :key="idx"
                                        class="seg-char"
                                    >
                                        <div
                                            v-for="s in 8"
                                            :key="s"
                                            :class="[
                                                'seg',
                                                'seg-' + s,
                                                charSegs.includes(s) ? 'on' : 'off'
                                            ]"
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div class="lcc-top-right">
                                <Button
                                    icon="pi pi-bolt"
                                    text
                                    rounded
                                    @click="openPower(ch)"
                                />
                                <Button
                                    text
                                    rounded
                                    size="small"
                                    :icon="isExpanded(ch.id) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
                                    @click="toggle(ch.id)"
                                />
                            </div>
                        </div>

                        <!-- META -->
                        <div class="lcc-meta">
                            <div class="meta-row">
                                <span class="meta-label">Chip</span>
                                <span class="meta-value">{{ ch.chip_rev ?? "N/A" }}</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">FW</span>
                                <span class="meta-value">{{ ch.firmware ?? "N/A" }}</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Heap</span>
                                <span class="meta-value">{{ ch.free_heap }}</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Uptime</span>
                                <span class="meta-value">{{ formatUptime(ch.uptime) }}</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Last seen</span>
                                <span class="meta-value">{{ timeAgo(ch.last_seen) }}</span>
                            </div>
                        </div>

                        <!-- LAMPS -->
                        <transition name="fade">
                            <div v-if="isExpanded(ch.id)" class="lcc-lamps">
                                <div
                                    v-for="(lamp, index) in ch.lamps"
                                    :key="index"
                                    class="lamp-card"
                                >
                                    <span
                                        class="lamp-led"
                                        :class="{ on: lamp.state === 'ON' }"
                                    ></span>

                                    <div class="lamp-details">
                                        <div class="lamp-name">L{{ index + 1 }}</div>
                                        <div class="lamp-meta">
                                            {{ lamp.state }} • seq {{ lamp.seq ?? "-" }}
                                        </div>
                                    </div>

                                    <Button icon="pi pi-eye" text rounded size="small" />
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
        </section>

        <!-- POWER MODAL -->
        <Dialog
            v-model:visible="powerModal"
            modal
            header="Power Info"
            :style="{ width:'380px' }"
        >
            <div v-if="powerData" class="power-modal-content">
                <div class="power-modal-header">
                    <span class="lcc-led" :class="status(powerData)" />
                    <strong>{{ powerData.id }}</strong>
                </div>

                <div class="power-modal-row">
                    <span class="power-label">Voltage</span>
                    <span class="power-value">{{ powerData.voltage ?? "24V (mock)" }}</span>
                </div>
                <div class="power-modal-row">
                    <span class="power-label">Current</span>
                    <span class="power-value">{{ powerData.current ?? "0.42A (mock)" }}</span>
                </div>
                <div class="power-modal-row">
                    <span class="power-label">Active lamps</span>
                    <span class="power-value">{{ channelStats(powerData).on }}</span>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.channels-view {
    padding-bottom: 1rem;
}

/* HEADER */
.channels-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.channels-header-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.channels-header-actions {
    display: flex;
    align-items: center;
}

/* PANEL */
.channels-panel {
    padding: 16px !important;
}

/* TRUE MASONRY */
.channels-grid {
    column-count: 1;
    column-gap: 1.25rem;
}

@media (min-width: 768px) {
    .channels-grid {
        column-count: 2;
    }
}

@media (min-width: 1280px) {
    .channels-grid {
        column-count: 3;
    }
}

.channels-item {
    break-inside: avoid;
    -webkit-column-break-inside: avoid;
    margin-bottom: 1.25rem;
    display: block;
}


/* ===========================
   INDUSTRIAL LCC MODULE
=========================== */
.lcc-module {
    background: linear-gradient(180deg, #090b0d, #0e1116);
    border: 1px solid #1c1f24;
    border-radius: 10px;
    overflow: hidden;
    box-shadow:
        0 3px 6px rgba(0,0,0,0.35),
        inset 0 0 0 1px rgba(255,255,255,0.03);
    width: 100%;
}

/* TOP PANEL */
.lcc-top {
    background: linear-gradient(180deg, #262b33, #1a1e23);
    border-bottom: 1px solid #1a1c21;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: "JetBrains Mono", monospace;
}

.lcc-top-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.lcc-top-right {
    display: flex;
    align-items: center;
    gap: 6px;
}

/* LED */
.lcc-led {
    width: 12px;
    height: 12px;
    border-radius: 999px;
}
.lcc-led.ok { background:#22c55e; box-shadow:0 0 6px rgba(34,197,94,0.8); }
.lcc-led.warn { background:#facc15; box-shadow:0 0 6px rgba(250,204,21,0.8); }
.lcc-led.error { background:#ef4444; box-shadow:0 0 6px rgba(239,68,68,0.8); }
.lcc-led.idle { background:#6b7280; }

/* LCC LABEL */
.lcc-slot {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #4b5563;
    background: #161a1d;
    color: #a1a1aa;
}

/* SEG DISPLAY */
.seg-display {
    display: flex;
    gap: 4px;
    padding: 3px 6px;
    background: #000;
    border: 1px solid #333;
    border-radius: 4px;
}

.seg-char {
    position: relative;
    width: 14px;
    height: 24px;
}

/* SEGMENTS */
.seg {
    position: absolute;
    background: #111827;
    border-radius: 2px;
    transition: .12s;
}
.seg.on {
    background: #facc15;
    box-shadow: 0 0 6px rgba(250,204,21,0.85);
}

.seg-1 { top:0; left:3px; width:8px; height:3px; }
.seg-2 { top:3px; right:0; width:3px; height:8px; }
.seg-3 { bottom:3px; right:0; width:3px; height:8px; }
.seg-4 { bottom:0; left:3px; width:8px; height:3px; }
.seg-5 { bottom:3px; left:0; width:3px; height:8px; }
.seg-6 { top:3px; left:0; width:3px; height:8px; }
.seg-7 { top:10px; left:3px; width:8px; height:3px; }
.seg-8 {
    top:3px;
    left:50%;
    transform:translateX(-50%);
    width:3px;
    height:16px;
}

/* META SECTION */
.lcc-meta {
    padding: 12px 14px;
    background: #0f1216;
    border-bottom: 1px solid #1b1d21;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: #d1d5db;
}

.meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.meta-label {
    color: #9ca3af;
    font-weight: 500;
    min-width: 90px;
}

.meta-value {
    font-weight: 600;
    color: #e5e7eb;
    text-align: right;
}

/* LAMPS */
.lcc-lamps {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.lamp-card {
    background: linear-gradient(150deg, #1c2129, #0b0e12);
    border: 1px solid #2c3138;
    border-radius: 6px;
    padding: 7px 9px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: border-color 0.15s ease, transform 0.08s ease;
}
.lamp-card:hover {
    border-color: rgba(59,130,246,0.4);
    transform: translateY(-1px);
}

.lamp-led {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #3f4853;
}
.lamp-led.on {
    background: #22c55e;
    box-shadow: 0 0 4px rgba(34,197,94,0.8);
}

.lamp-details {
    flex: 1;
    min-width: 0;
}

.lamp-name {
    font-size: 12px;
    font-weight: 600;
    color: #e5e7eb;
}

.lamp-meta {
    font-size: 11px;
    color: #9ca3af;
}

/* TRANSITION */
.fade-enter-active,
.fade-leave-active { transition:0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity:0; transform:translateY(-5px); }

/* POWER MODAL */
.power-modal-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
}

.power-modal-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.power-modal-row {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--ui-border, #e5e7eb);
    padding: 4px 0;
}
.power-modal-row:last-child {
    border-bottom: none;
}

.power-label {
    color: var(--ui-text-muted, #6b7280);
}
.power-value {
    font-weight: 600;
    color: var(--ui-text, #111827);
}
</style>
