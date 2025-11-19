<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    activeSubView: { type: String, required: true },
    building: { type: Object, default: null }
})

const emit = defineEmits(['set-subview'])

const collapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')

watch(collapsed, v => {
    localStorage.setItem('sidebar-collapsed', v ? 'true' : 'false')
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
        class="sidebar-modern h-full flex flex-col overflow-x-hidden transition-all duration-300"
        :class="collapsed ? 'w-20 collapsed' : 'w-72'"
    >

        <!-- BUILDING INFO -->
        <div class="building-header" v-if="props.building">

            <!-- GÓRNY WIERSZ: nazwa + collapse button -->
            <div class="bh-row">
                <h2 class="bh-title" v-if="!collapsed">
                    {{ props.building.name }}
                </h2>

                <button class="sm-collapse-btn" @click="collapsed = !collapsed">
                    <i class="pi" :class="collapsed ? 'pi-angle-right' : 'pi-angle-left'"></i>
                </button>
            </div>

            <!-- ID budynku (znika przy collapse) -->
            <div v-if="!collapsed" class="bh-id">
                <i class="pi pi-hashtag"></i>
                {{ props.building.id }}
            </div>
        </div>

        <!-- MENU -->
        <div class="flex-1 flex flex-col gap-2 px-3 pb-4 overflow-y-auto">
            <div v-for="section in sections" :key="section.key" class="relative group">

                <div v-if="props.activeSubView === section.key" class="sm-active-bar"></div>

                <button
                    class="sm-item"
                    :class="[
                        props.activeSubView === section.key ? 'active' : '',
                        collapsed ? 'collapsed justify-center' : 'justify-start gap-3'
                    ]"
                    @click="$emit('set-subview', section.key)"
                >
                    <i :class="section.icon" class="sm-icon" />
                    <span v-if="!collapsed" class="sm-label">{{ section.label }}</span>
                </button>

                <div v-if="collapsed" class="sm-tooltip">{{ section.label }}</div>
            </div>
        </div>

        <div class="sm-bottom"></div>
    </aside>
</template>

<style scoped>

/* MAIN BG — with rounded corners */
.sidebar-modern {
    background: #181e28;
    border-right: 1px solid #1f242b;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* BUILDING PANEL */
.building-header {
    padding: 18px;
    border-bottom: 1px solid #202833;
}

.bh-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.bh-title {
    color: #e8f0ff;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
}

/* COLLAPSE BUTTON SECTION */
.sm-top {
    padding: 14px;
    display: flex;
    justify-content: flex-end;
}

.sm-collapse-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #1a1f25;
    border: 1px solid #2a3037;
    color: #b5c3cf;
    transition: 0.2s;
}

.sm-collapse-btn:hover {
    background: #232a31;
    border-color: #3c4753;
    color: white;
}

/* MENU ITEMS */
.sm-item {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 12px;
    background: transparent;
    border: 1px solid transparent;
    transition: all 0.15s ease;
}

.sm-item:hover {
    background: #1a1f25;
    border-color: #2c323a;
}

.sm-icon {
    font-size: 18px;
    color: #8d9aa8;
}

.sm-label {
    font-size: 15px;
    color: #cbd5df;
}

/* ACTIVE ITEM */
.sm-item.active {
    background: rgba(127,162,191,0.15); /* powder blue soft */
    border-color: rgba(127,162,191,0.35);
    box-shadow: 0 2px 4px rgba(127,162,191,0.18);
}

.sm-item.active .sm-icon {
    color: #38bdf8;
}
.sm-item.active .sm-label {
    color: #e3f6ff;
}

/* ACTIVE BAR (pastel, subtle) */
.sm-active-bar {
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 3px;
    background: #7fa2bf; /* pastel petrol blue */
    border-radius: 4px;
    opacity: 0.85;
}

/* COLLAPSED MODE */
.sidebar-modern.collapsed .bh-title {
    display: none;
}

.sidebar-modern.collapsed .sm-item {
    padding: 12px 10px;
}

.sidebar-modern.collapsed .sm-label {
    display: none;
}

.sidebar-modern.collapsed .sm-icon {
    margin: 0;
}

/* TOOLTIP */
.sm-tooltip {
    position: absolute;
    left: calc(100% + 12px);
    top: 50%;
    transform: translateY(-50%);
    padding: 6px 10px;
    font-size: 12px;
    color: white;
    background: #11151a;
    border: 1px solid #2a3037;
    border-radius: 8px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
}

.group:hover .sm-tooltip {
    opacity: 1;
}

/* BOTTOM SPACER */
.sm-bottom {
    height: 20px;
}
</style>
