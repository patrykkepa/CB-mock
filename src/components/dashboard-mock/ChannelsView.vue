<script setup>
import RackLCC from '@/components/dashboard-mock/RackLCC.vue'

const props = defineProps({
    station: { type: Object, required: true },
    channels: { type: Array, required: true },
    formatUptime: { type: Function, required: true },
    timeAgo: { type: Function, required: true },
    activeChannelId: { type: [String, Number], required: false }
})

const emit = defineEmits(['back'])
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
                        {{ channels.length }} controllers
                    </span>
                </div>
            </div>

            <Button icon="pi pi-arrow-left" label="Back" text @click="emit('back')" />
        </header>

        <!-- LCC GRID -->
        <section class="ui-panel channels-panel">
            <div class="channels-grid">
                <RackLCC
                    v-for="controller in channels"
                    :key="controller.id"
                    :controller="controller"
                    :formatUptime="formatUptime"
                    :timeAgo="timeAgo"
                    :autoExpand="activeChannelId === controller.id"
                />
            </div>
        </section>
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


</style>
