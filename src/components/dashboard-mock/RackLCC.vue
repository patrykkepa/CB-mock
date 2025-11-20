<script setup>
import { ref, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const props = defineProps({
    controller: { type: Object, required: true },
    autoExpand: { type: Boolean, default: false },
    formatUptime: { type: Function, required: true },
    timeAgo: { type: Function, required: true }
})

/* ----------------------------------
   STATE
---------------------------------- */
const expanded = ref(false)
const powerModal = ref(false)
const powerData = ref(null)

onMounted(() => {
    if (props.autoExpand) expanded.value = true
})

function toggle() {
    expanded.value = !expanded.value
}

function openPower() {
    powerData.value = props.controller
    powerModal.value = true
}

/* ----------------------------------
   STATS
---------------------------------- */
function channelStats(ctrl) {
    const total = ctrl.lamps?.length || 0
    const on = ctrl.lamps?.filter(l => l.state === 'ON').length || 0
    return { on, total }
}

function status(ctrl) {
    const s = channelStats(ctrl)
    if (s.total === 0) return 'idle'
    if (s.on === 0) return 'error'
    if (s.on < s.total) return 'warn'
    return 'ok'
}

/* ----------------------------------
   SEGMENT DISPLAY
---------------------------------- */
const charSegments = {
    0:[1,2,3,4,5,6],1:[2,3],2:[1,2,7,5,4],3:[1,2,7,3,4],
    4:[6,7,2,3],5:[1,6,7,3,4],6:[1,6,5,4,3,7],7:[1,2,3],
    8:[1,2,3,4,5,6,7],9:[1,2,3,4,6,7],
    C:[1,6,5,4],T:[1,8],R:[1,2,6,7,8,3],L:[6,5,4],
    A:[1,2,3,5,6,7],E:[1,6,7,5,4],F:[1,6,7,5],
    '-':[7],' ':[], '?':[1,2,7,5,4]
}

function segForChar(c) {
    return charSegments[c.toUpperCase()] || charSegments['?']
}
function segments(str) {
    return [...String(str)].map(ch => segForChar(ch))
}
</script>

<template>
    <div class="lcc-module">
        <!-- TOP PANEL -->
        <div class="lcc-top">
            <div class="lcc-top-left">
                <span class="lcc-led" :class="status(controller)" />
                <span class="lcc-slot">LCC</span>

                <div class="seg-display">
                    <div v-for="(charSeg, idx) in segments(controller.id)" :key="idx" class="seg-char">
                        <div v-for="s in 8" :key="s" :class="['seg', 'seg-' + s, charSeg.includes(s) ? 'on' : 'off']"></div>
                    </div>
                </div>
            </div>

            <div class="lcc-top-right">
                <Button icon="pi pi-bolt" text rounded @click="openPower" />
                <Button
                    text
                    rounded
                    size="small"
                    :icon="expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
                    @click="toggle"
                />
            </div>
        </div>

        <!-- META -->
        <div class="lcc-meta">
            <div class="meta-row">
                <span class="meta-label">Chip</span>
                <span class="meta-value">{{ controller.chip_rev ?? 'N/A' }}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">FW</span>
                <span class="meta-value">{{ controller.firmware ?? 'N/A' }}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Heap</span>
                <span class="meta-value">{{ controller.free_heap }}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Uptime</span>
                <span class="meta-value">{{ formatUptime(controller.uptime) }}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Last seen</span>
                <span class="meta-value">{{ timeAgo(controller.last_seen) }}</span>
            </div>
        </div>

        <!-- LAMPS -->
        <transition name="fade">
            <div v-if="expanded" class="lcc-lamps">
                <div v-for="(lamp, idx) in controller.lamps" :key="idx" class="lamp-card">
                    <span class="lamp-led" :class="{ on: lamp.state === 'ON' }" />

                    <div class="lamp-details">
                        <div class="lamp-name">L{{ idx + 1 }}</div>
                        <div class="lamp-meta">
                            {{ lamp.state }} • seq {{ lamp.seq ?? '-' }}
                        </div>
                    </div>

                    <Button icon="pi pi-eye" text rounded size="small" />
                </div>
            </div>
        </transition>

        <!-- POWER MODAL -->
        <Dialog v-model:visible="powerModal" modal dismissableMask
                :showHeader="false" :style="{ width: '380px' }" class="lcm-dialog">
            <div v-if="powerData" class="lcm-panel">

                <div class="lcm-panel-header lcm-panel-header-space">
                    <div>
                        <div class="lcm-label">POWER</div>
                        <div class="lcm-title">Controller {{ powerData.id }}</div>
                        <div class="lcm-sub">Status: {{ status(powerData).toUpperCase() }}</div>
                    </div>

                    <div class="lcm-pill">
                        <span class="lcm-dot" :class="status(powerData)"></span>
                        <span class="lcm-pill-text">{{ status(powerData) }}</span>
                    </div>
                </div>

                <div class="lcm-section">
                    <div class="lcm-row">
                        <span class="lcm-row-label">Voltage</span>
                        <span class="lcm-row-value">24V (mock)</span>
                    </div>
                    <div class="lcm-row">
                        <span class="lcm-row-label">Current</span>
                        <span class="lcm-row-value">0.42A (mock)</span>
                    </div>
                    <div class="lcm-row">
                        <span class="lcm-row-label">Active lamps</span>
                        <span class="lcm-row-value">{{ channelStats(powerData).on }}</span>
                    </div>
                    <div class="lcm-row">
                        <span class="lcm-row-label">Total lamps</span>
                        <span class="lcm-row-value">{{ channelStats(powerData).total }}</span>
                    </div>
                </div>

                <div class="lcm-grid">
                    <div class="lcm-tile">
                        <div class="lcm-tile-label">Load Estimate</div>
                        <div class="lcm-tile-value">{{ channelStats(powerData).on * 30 }} W</div>
                        <div class="lcm-tile-note">30W per lamp</div>
                    </div>

                    <div class="lcm-tile">
                        <div class="lcm-tile-label">Utilization</div>
                        <div class="lcm-tile-value">
                            {{
                                Math.round(
                                    (channelStats(powerData).on / channelStats(powerData).total) * 100
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
/* ===========================
   INDUSTRIAL LCC MODULE
=========================== */
.lcc-module {
    background: linear-gradient(180deg, #090b0d, #0e1116);
    border: 1px solid #1c1f24;
    border-radius: 10px;
    overflow: hidden;
    box-shadow:
        0 3px 6px rgba(0, 0, 0, 0.35),
        inset 0 0 0 1px rgba(255, 255, 255, 0.03);
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
    font-family: 'JetBrains Mono', monospace;
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
.lcc-led.ok {
    background: #22c55e;
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.8);
}
.lcc-led.warn {
    background: #facc15;
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.8);
}
.lcc-led.error {
    background: #ef4444;
    box-shadow: 0 0 6px rgba(239, 68, 68, 0.8);
}
.lcc-led.idle {
    background: #6b7280;
}

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
    transition: 0.12s;
}
.seg.on {
    background: #facc15;
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.85);
}

.seg-1 {
    top: 0;
    left: 3px;
    width: 8px;
    height: 3px;
}
.seg-2 {
    top: 3px;
    right: 0;
    width: 3px;
    height: 8px;
}
.seg-3 {
    bottom: 3px;
    right: 0;
    width: 3px;
    height: 8px;
}
.seg-4 {
    bottom: 0;
    left: 3px;
    width: 8px;
    height: 3px;
}
.seg-5 {
    bottom: 3px;
    left: 0;
    width: 3px;
    height: 8px;
}
.seg-6 {
    top: 3px;
    left: 0;
    width: 3px;
    height: 8px;
}
.seg-7 {
    top: 10px;
    left: 3px;
    width: 8px;
    height: 3px;
}
.seg-8 {
    top: 3px;
    left: 50%;
    transform: translateX(-50%);
    width: 3px;
    height: 16px;
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
    transition:
        border-color 0.15s ease,
        transform 0.08s ease;
}
.lamp-card:hover {
    border-color: rgba(59, 130, 246, 0.4);
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
    box-shadow: 0 0 4px rgba(34, 197, 94, 0.8);
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
.fade-leave-active {
    transition: 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-5px);
}

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

/* ===================== POWER MODAL — LCM STYLE ===================== */

.lcm-dialog {
    background: #0f1115;
    border-radius: 12px;
    border: 1px solid #3a3f47;
    box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.03),
        0 10px 32px rgba(0, 0, 0, 0.85);
}

.lcm-panel {
    background: radial-gradient(circle at 0 0, #27313b 0, #05070a 55%);
    border-radius: 10px;
    border: 1px solid #3a3f47;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: "JetBrains Mono", monospace;
    color: #d4d7dc;
}

.lcm-panel-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.lcm-panel-header-space {
    justify-content: space-between;
    align-items: center;
}

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

.lcm-title {
    font-size: 18px;
    font-weight: 700;
    color: #f3f4f6;
}

.lcm-sub {
    font-size: 12px;
    color: #b5bcc4;
}

.lcm-section {
    padding: 12px 0;
    border-top: 1px solid #394049;
    border-bottom: 1px solid #394049;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.lcm-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
}

.lcm-row-label {
    color: #9ca3af;
}

.lcm-row-value {
    color: #e5e7eb;
    font-weight: 600;
}

.lcm-pill {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    gap: 6px;
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

.lcm-dot.ok { background: #22c55e; color: #22c55e; }
.lcm-dot.warn { background: #facc15; color: #facc15; }
.lcm-dot.error { background: #ef4444; color: #ef4444; }
.lcm-dot.idle { background: #6b7280; color: #6b7280; }

.lcm-pill-text {
    font-size: 11px;
    color: #e5e7eb;
    text-transform: uppercase;
    font-weight: 600;
}

.lcm-grid {
    margin-top: 4px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
}

.lcm-tile {
    background: #0c0f13;
    border-radius: 8px;
    border: 1px solid #394049;
    padding: 12px;
}

.lcm-tile-label {
    font-size: 12px;
    color: #9ca3af;
}

.lcm-tile-value {
    font-size: 20px;
    margin-top: 6px;
    font-weight: 700;
    color: #ffffff;
}

.lcm-tile-note {
    color: #9ca3af;
    font-size: 11px;
    margin-top: 4px;
}
.lcm-dialog {
    background: #0f1115;
    border-radius: 12px;
    border: 1px solid #3a3f47;
    box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.03),
        0 10px 32px rgba(0, 0, 0, 0.85);
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
