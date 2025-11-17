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
    <div class="flex flex-col gap-6 h-full">

        <!-- HEADER -->
        <div class="flex items-center justify-between mb-2">
            <div>
                <h3 class="text-lg font-semibold text-primary-500 dark:text-primary-300">
                    Channels of station {{ station.name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    ID: {{ station.device_id }}
                </p>
            </div>
            <Button icon="pi pi-arrow-left" label="Back" text @click="emit('back')" />
        </div>

        <!-- MASONRY LAYOUT -->
        <div class="masonry columns-1 md:columns-2 lg:columns-3 xl:columns-3">
            <div
                v-for="ch in channels"
                :key="ch.id"
                class="masonry-item break-inside-avoid pb-4"
            >
                <div class="lcc-module">

                    <!-- TOP PANEL -->
                    <div class="lcc-top">
                        <div class="flex items-center gap-3">
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

                        <div class="flex items-center gap-2">
                            <Button icon="pi pi-bolt" text rounded @click="openPower(ch)" />
                            <Button
                                text rounded size="small"
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
                                <span class="lamp-led" :class="{ on: lamp.state === 'ON' }"></span>

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

        <!-- POWER MODAL -->
        <Dialog
            v-model:visible="powerModal"
            modal
            header="Power Info"
            :style="{ width:'380px' }"
        >
            <div v-if="powerData" class="space-y-3 text-sm">
                <div class="flex items-center gap-2">
                    <span class="lcc-led" :class="status(powerData)" />
                    <strong>{{ powerData.id }}</strong>
                </div>

                <div><strong>Voltage:</strong> {{ powerData.voltage ?? "24V (mock)" }}</div>
                <div><strong>Current:</strong> {{ powerData.current ?? "0.42A (mock)" }}</div>
                <div><strong>Active lamps:</strong> {{ channelStats(powerData).on }}</div>
            </div>
        </Dialog>

    </div>
</template>


<style scoped>
/* MASONRY */
.masonry-item { break-inside: avoid; }

/* MODULE */
.lcc-module {
    background: linear-gradient(180deg, #090b0d, #0e1116);
    border: 1px solid #1c1f24;
    border-radius: 10px;
    overflow: hidden;
    box-shadow:
        0 3px 6px rgba(0,0,0,0.35),
        inset 0 0 0 1px rgba(255,255,255,0.03);
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

/* LED */
.lcc-led {
    width: 12px;
    height: 12px;
    border-radius: 999px;
}
.lcc-led.ok { background:#22c55e; }
.lcc-led.warn { background:#facc15; }
.lcc-led.error { background:#ef4444; }
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
    width: 16px;
    height: 28px;
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

.seg-1 { top:0; left:3px; width:10px; height:3px; }
.seg-2 { top:3px; right:0; width:3px; height:10px; }
.seg-3 { bottom:3px; right:0; width:3px; height:10px; }
.seg-4 { bottom:0; left:3px; width:10px; height:3px; }
.seg-5 { bottom:3px; left:0; width:3px; height:10px; }
.seg-6 { top:3px; left:0; width:3px; height:10px; }
.seg-7 { top:13px; left:3px; width:10px; height:3px; }
.seg-8 {
    top:3px;
    left:50%;
    transform:translateX(-50%);
    width:3px;
    height:20px;
}

/* META */
.lcc-meta {
    padding: 10px 12px;
    background: #0f1216;
    border-bottom: 1px solid #1b1d21;
    font-size: 11px;
    color: #9ca3af;
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
}

/* TRANSITION */
.fade-enter-active,
.fade-leave-active { transition:0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity:0; transform:translateY(-5px); }

/* META SECTION — FIXED, CLEAN, ALIGNED */
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
    min-width: 90px;          /* stała szerokość lewej kolumny */
}

.meta-value {
    font-weight: 600;
    color: #e5e7eb;
    text-align: right;
}

</style>
