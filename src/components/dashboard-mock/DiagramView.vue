<script setup>
import { ref, watch, nextTick } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { Background } from '@vue-flow/background'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useI18n } from 'vue-i18n'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const { t } = useI18n()

const props = defineProps({
    building: { type: Object, required: true },
})

const initialized = ref(false)

const nodes = ref([])
const edges = ref([])
const { fitView } = useVueFlow()

// --- modal ---
const showDialog = ref(false)
const dialogData = ref(null)

function nodeStyle(color) {
    return {
        background: color,
        color: 'white',
        padding: '8px 14px',
        borderRadius: '10px',
        fontWeight: '600',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
    }
}

// helpers
function findStationByNodeId(nodeId) {
    const deviceId = nodeId.replace(/^station-/, '')
    return props.building?.stations?.find(s => String(s.device_id) === String(deviceId))
}
function findControllerByNodeId(nodeId) {
    const ctrlKey = nodeId.replace(/^ctrl-/, '')
    for (const st of props.building?.stations || []) {
        for (const c of (st.controllers || [])) {
            const idStr = c.id != null ? String(c.id) : ''
            if (idStr && idStr === ctrlKey) return { station: st, controller: c }
        }
    }
    const m = ctrlKey.match(/^(\d+)-(\d+)$/)
    if (m) {
        const si = Number(m[1]), ci = Number(m[2])
        const st = props.building?.stations?.[si]
        const c = st?.controllers?.[ci]
        if (st && c) return { station: st, controller: c }
    }
    return null
}
function findLampByNodeId(nodeId) {
    const m = nodeId.match(/^lamp-(\d+)-(\d+)-(\d+)$/)
    if (!m) return null
    const [ , siS, ciS, liS ] = m
    const si = Number(siS), ci = Number(ciS), li = Number(liS)
    const st = props.building?.stations?.[si]
    const ctrl = st?.controllers?.[ci]
    const lamp = ctrl?.lamps?.[li]
    if (st && ctrl && lamp) return { station: st, controller: ctrl, lamp }
    return null
}

// klik w node → modal
function handleNodeClick({ node }) {
    if (!node?.id) return

    if (node.id.startsWith('station-')) {
        const st = findStationByNodeId(node.id)
        if (st) {
            dialogData.value = {
                type: 'station',
                title: `📡 ${st.name}`,
                meta: {
                    [t('dashboard.device_id')]: st.device_id,
                    [t('dashboard.channels')]: st.controllers?.length ?? 0,
                    [t('dashboard.lamps')]: (st.controllers || []).reduce((acc, c) => acc + (c.lamps?.length || 0), 0),
                    [t('station.last_seen')]: st.last_seen ? new Date(st.last_seen * 1000).toLocaleString() : '—',
                }
            }
            showDialog.value = true
        }
        return
    }

    if (node.id.startsWith('ctrl-')) {
        const found = findControllerByNodeId(node.id)
        if (found) {
            const { station, controller: c } = found
            dialogData.value = {
                type: 'controller',
                title: `⚙️ ${c.name ?? 'Controller'}`,
                meta: {
                    'ID': c.id ?? '—',
                    [t('dashboard.stations')]: station.name,
                    [t('dashboard.lamps')]: c.lamps?.length ?? 0,
                    [t('dashboard.status')]: c.status ?? '—',
                }
            }
            showDialog.value = true
        }
        return
    }

    if (node.id.startsWith('lamp-')) {
        const found = findLampByNodeId(node.id)
        if (found) {
            const { station, controller: c, lamp: l } = found
            dialogData.value = {
                type: 'lamp',
                title: `${l.name ?? '💡 Lamp'}`,
                meta: {
                    [t('dashboard.status')]: l.state ?? '—',
                    [t('dashboard.stations')]: station.name,
                }
            }
            showDialog.value = true
        }
        return
    }

    if (node.id.startsWith('building-')) {
        const b = props.building
        dialogData.value = {
            type: 'building',
            title: `🏢 ${b.name}`,
            meta: {
                [t('dashboard.building_id')]: b.id,
                [t('dashboard.stations')]: b.stations?.length ?? 0,
            }
        }
        showDialog.value = true
    }
}

function rebuildGraph(bld) {
    const tmpNodes = []
    const tmpEdges = []

    const X_BUILDING = 0
    const X_STATION = 300
    const X_CONTROLLER = 600
    const X_LAMP_START = 900
    const GAP_Y = 50
    const GAP_LAMP_X = 120

    const buildingId = `building-${bld.id}`
    tmpNodes.push({
        id: buildingId,
        type: 'input',
        position: { x: X_BUILDING, y: 0 },
        data: { label: `🏢 ${bld.name}` },
        style: nodeStyle('#2563eb'),
    })

    let currentY = 0
    bld.stations.forEach((st, si) => {
        const stationId = `station-${st.device_id}`
        const y = currentY
        tmpNodes.push({
            id: stationId,
            position: { x: X_STATION, y },
            data: { label: `📡 ${st.name}` },
            style: nodeStyle('#10b981'),
        })
        tmpEdges.push({ id: `e-${buildingId}-${stationId}`, source: buildingId, target: stationId })

        const controllers = st.controllers || []
        let ctrlY = y
        controllers.forEach((ctrl, ci) => {
            const ctrlId = `ctrl-${ctrl.id ?? `${si}-${ci}`}`
            tmpNodes.push({
                id: ctrlId,
                position: { x: X_CONTROLLER, y: ctrlY },
                data: { label: `⚙️ ${ctrl.name ?? `Controller ${ci + 1}`}` },
                style: nodeStyle('#f59e0b'),
            })
            tmpEdges.push({ id: `e-${stationId}-${ctrlId}`, source: stationId, target: ctrlId })

            const lamps = ctrl.lamps || []
            lamps.forEach((lamp, li) => {
                const lampId = `lamp-${si}-${ci}-${li}`
                const lx = X_LAMP_START + li * GAP_LAMP_X
                const ly = ctrlY
                tmpNodes.push({
                    id: lampId,
                    position: { x: lx, y: ly },
                    data: { label: lamp.name || `💡 Lamp ${li + 1}` },
                    style: nodeStyle(lamp.state === 'ON' ? '#22c55e' : '#ef4444'),
                })
                tmpEdges.push({ id: `e-${ctrlId}-${lampId}`, source: ctrlId, target: lampId })
            })

            ctrlY += GAP_Y
        })

        currentY += Math.max(GAP_Y * controllers.length, GAP_Y)
    })

    nodes.value = tmpNodes
    edges.value = tmpEdges
}

watch(
    () => props.building,
    async (bld) => {
        if (!bld) return
        rebuildGraph(bld)
        await nextTick()

        if (!initialized.value) {
            fitView({ padding: 0.3 })
            initialized.value = true
        }
    },
    { immediate: true, deep: true }
)
</script>

<template>
    <div class="space-y-6">

        <!-- HEADER -->
        <header class="ui-header">
            <div>
                <h2 class="ui-header-title">
                    {{ t('dashboard.diagram') || 'Building Diagram' }}
                </h2>

                <div class="ui-header-meta">
                    <span class="ui-meta-pill">
                        <i class="pi pi-sitemap mr-1"></i>
                        Auto topology
                    </span>
                    <span class="ui-meta-pill">
                        <i class="pi pi-clock mr-1"></i>
                        Live sync
                    </span>
                </div>
            </div>
        </header>

        <!-- INDUSTRIAL PANEL WRAPPER -->
        <div class="ui-panel diagram-panel">
            <VueFlow
                v-model:nodes="nodes"
                v-model:edges="edges"
                @node-click="handleNodeClick"
            >
                <MiniMap nodeColor="rgb(37,99,235)" />
                <Controls />
                <Background pattern-color="#e5e7eb" :gap="20" />
            </VueFlow>
        </div>

        <!-- DETAILS MODAL -->
        <Dialog
            v-model:visible="showDialog"
            modal
            :style="{ width: '460px' }"
            class="corex-dialog"
            dismissableMask
        >
            <template #header>
                <div class="flex items-center gap-2">
                    <span class="text-lg font-semibold">{{ dialogData?.title }}</span>
                    <Tag v-if="dialogData?.type" :value="dialogData.type" severity="info" />
                </div>
            </template>

            <div v-if="dialogData?.meta" class="corex-modal-list">
                <div
                    v-for="(val, key) in dialogData.meta"
                    :key="key"
                    class="corex-modal-row"
                >
                    <span class="corex-modal-label">{{ key }}</span>
                    <span class="corex-modal-value">{{ val }}</span>
                </div>
            </div>

            <template #footer>
                <Button :label="t('buttons.close')" @click="showDialog=false" />
            </template>
        </Dialog>

    </div>
</template>

<style scoped>
/* === PANEL (industrial) === */
.diagram-panel {
    height: calc(100vh - 11rem);
    min-height: 600px;
    background: var(--ui-bg-panel);
    border-radius: var(--ui-radius);
    border: 1px solid var(--ui-border);
    box-shadow:
        inset 0 0 1px rgba(255,255,255,0.6),
        0 1px 2px rgba(0,0,0,0.06);
    overflow: hidden;
}

/* === MODAL === */
.corex-modal-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
}

.corex-modal-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 4px 0;
    border-bottom: 1px solid var(--ui-border);
}

.corex-modal-row:last-child {
    border-bottom: none;
}

.corex-modal-label {
    color: var(--ui-text-muted);
}

.corex-modal-value {
    font-weight: 600;
    color: var(--ui-text);
}
</style>
