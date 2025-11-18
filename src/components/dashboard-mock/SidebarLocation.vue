<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    activeSubView: { type: String, required: true }
})

const emit = defineEmits(['set-subview'])

const collapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')

watch(collapsed, val => {
    localStorage.setItem('sidebar-collapsed', val ? 'true' : 'false')
})

const sections = [
    { key: 'overview', label: 'Overview', icon: 'pi pi-chart-bar' },
    { key: 'rack', label: 'Rack', icon: 'pi pi-server' },
    { key: 'tests', label: 'Tests', icon: 'pi pi-check-circle' },
    { key: 'power', label: 'Power', icon: 'pi pi-bolt' },
    { key: 'history', label: 'History', icon: 'pi pi-clock' },
    { key: 'diagram', label: 'Diagram', icon: 'pi pi-map' },
]
</script>

<template>
    <aside
        class="sidebar-industrial h-full flex flex-col overflow-x-hidden transition-all duration-300"
        :class="collapsed ? 'w-20' : 'w-64'"
    >

        <!-- TOP -->
        <div class="industrial-top">
            <button class="collapse-btn" @click="collapsed = !collapsed">
                <i class="pi" :class="collapsed ? 'pi-angle-right' : 'pi-angle-left'"></i>
            </button>
        </div>

        <!-- MENU -->
        <div class="flex-1 flex flex-col gap-1 px-3 pb-4 overflow-y-auto">
            <div v-for="section in sections" :key="section.key" class="relative group">

                <!-- ACTIVE LED -->
                <div v-if="props.activeSubView === section.key" class="active-led"></div>

                <button
                    class="industrial-module"
                    :class="[
                        props.activeSubView === section.key ? 'active' : '',
                        collapsed ? 'justify-center' : 'justify-start gap-3'
                    ]"
                    @click="$emit('set-subview', section.key)"
                >
                    <i :class="section.icon" class="icon" />

                    <span v-if="!collapsed" class="label">
                        {{ section.label }}
                    </span>
                </button>

                <!-- TOOLTIP -->
                <div v-if="collapsed" class="tooltip">
                    {{ section.label }}
                </div>
            </div>
        </div>

        <div class="industrial-bottom"></div>
    </aside>
</template>


<style scoped>
/* BASE LAYOUT */

.sidebar-industrial {
    background: linear-gradient(180deg, #e4e5e7, #d8d9db);
    border-right: 2px solid #bcbec1;
}

.app-dark .sidebar-industrial {
    background: linear-gradient(180deg, #1a1c1e, #222426);
    border-right-color: #2d2f31;
}

.industrial-top {
    padding: 10px;
    border-bottom: 1px solid rgba(0,0,0,0.08);
    margin-bottom: 10px;
}

.app-dark .industrial-top {
    border-bottom-color: rgba(255,255,255,0.06);
}

/* BUTTON COLLAPSE */

.collapse-btn {
    padding: 8px 10px;
    border-radius: 6px;
    background: rgba(0,0,0,0.05);
    border: 1px solid rgba(0,0,0,0.15);
    color: #333;
    transition: 0.2s;
}

.collapse-btn:hover {
    background: rgba(0,0,0,0.1);
}

.app-dark .collapse-btn {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.15);
    color: #d1d1d1;
}

.app-dark .collapse-btn:hover {
    background: rgba(255,255,255,0.15);
}

/* MODULE BUTTONS */

.industrial-module {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 6px;
    background: var(--p-surface-100);
    border: 1px solid var(--p-surface-300);
    transition: 0.18s ease;
}

.industrial-module:hover {
    background: var(--p-surface-200);
}

.app-dark .industrial-module {
    background: var(--p-surface-800);
    border-color: var(--p-surface-600);
}

.app-dark .industrial-module:hover {
    background: var(--p-surface-700);
}

/* ACTIVE STATE — DYNAMIC THEME COLORS */

.industrial-module.active {
    border-color: var(--p-primary-500);
    background: var(--p-highlight-bg);
    color: var(--p-highlight-color);
}

.app-dark .industrial-module.active {
    border-color: var(--p-primary-400);
    background: var(--p-highlight-bg);
    color: var(--p-highlight-color);
}

/* LED STRIP */

.active-led {
    position: absolute;
    left: -6px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--p-primary-500);
    border-radius: 4px;
}

.app-dark .active-led {
    background: var(--p-primary-300);
}

/* ICONS & LABELS */

.icon {
    font-size: 18px;
    color: var(--p-text-color);
}

.label {
    font-size: 14px;
    white-space: nowrap;
    color: var(--p-text-color);
}

.app-dark .icon,
.app-dark .label {
    color: var(--p-text-color);
}

/* TOOLTIP */

.tooltip {
    position: absolute;
    left: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
    background: #111;
    color: #fff;
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    pointer-events: none;
    opacity: 0;
    transition: 0.12s;
}

.group:hover .tooltip {
    opacity: 1;
}

/* BOTTOM */

.industrial-bottom {
    height: 20px;
    background: linear-gradient(180deg, #d3d4d6, #c1c2c4);
    border-top: 1px solid rgba(0,0,0,0.15);
}

.app-dark .industrial-bottom {
    background: linear-gradient(180deg, #1d1e20, #18191b);
    border-top-color: rgba(255,255,255,0.08);
}
</style>
