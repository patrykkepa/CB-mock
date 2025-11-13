<script setup>
import { ref } from 'vue';
import Tag from 'primevue/tag';

const props = defineProps({
    buildings: { type: Array, required: true },
});

const emit = defineEmits(['select-building', 'map-click']);

const hoveredBuilding = ref(null);
const mapImage = ref(null);
const tempMarker = ref(null);

// kliknięcie na mapę
function handleMapClick(event) {
    const rect = mapImage.value.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    tempMarker.value = { x: `${x.toFixed(2)}%`, y: `${y.toFixed(2)}%` };
    emit('map-click', { x, y });
}
</script>

<template>
    <div class="flex flex-col items-center justify-center h-full text-gray-400 text-lg space-y-4">
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <i class="pi pi-map-marker text-xl text-primary-500"></i>
            <span>Select a location to view</span>
        </div>

        <div class="relative max-w-4xl w-full" @click="handleMapClick">
            <img
                src="/demo/images/intelight/world_map.png"
                alt="World map mock"
                class="w-full h-auto object-contain select-none"
                ref="mapImage"
            />

            <!-- Markery -->
            <div
                v-for="bld in buildings"
                :key="bld.id"
                class="absolute group"
                :style="{
          top: bld.map_position?.y || '50%',
          left: bld.map_position?.x || '50%',
          transform: 'translate(-50%, -50%)'
        }"
            >
                <button
                    class="w-4 h-4 bg-primary-500 hover:bg-primary-600 rounded-full border border-white/70 shadow-md transition"
                    @click.stop="$emit('select-building', bld)"
                    @mouseenter="hoveredBuilding = bld"
                    @mouseleave="hoveredBuilding = null"
                ></button>

                <div
                    v-if="hoveredBuilding === bld"
                    class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-surface-800 text-gray-800 dark:text-gray-100 text-xs px-3 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 whitespace-nowrap z-10"
                >
                    <strong>{{ bld.name }}</strong><br />
                    <span class="text-gray-500 text-[11px]">{{ bld.address || '—' }}</span>
                </div>
            </div>

            <div
                v-if="tempMarker"
                class="absolute w-4 h-4 bg-red-400 rounded-full border border-white/80 shadow-md"
                :style="{ top: tempMarker.y, left: tempMarker.x, transform: 'translate(-50%, -50%)' }"
            ></div>
        </div>
    </div>
</template>
