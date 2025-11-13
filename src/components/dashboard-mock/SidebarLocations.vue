<script setup>
import { computed, ref } from 'vue';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    buildings: { type: Array, required: true },
    selectedBuilding: { type: Object, default: null },
    activeSubView: { type: String, required: true },
});

const emit = defineEmits(['select-building', 'set-subview']);

// 📊 Statystyki
function buildingStats(building) {
    if (!building?.stations) return { stations: 0, channels: 0, lampsOn: 0, lampsTotal: 0 };
    let stations = building.stations.length;
    let channels = 0,
        lampsOn = 0,
        lampsTotal = 0;
    building.stations.forEach(st => {
        st.controllers?.forEach(ctrl => {
            channels++;
            ctrl.lamps?.forEach(l => {
                lampsTotal++;
                if (l.state === 'ON') lampsOn++;
            });
        });
    });
    return { stations, channels, lampsOn, lampsTotal };
}

// 🧭 Dostępne sekcje
const sections = ref([
    { key: 'overview', label: 'Overview', icon: 'pi pi-chart-bar' },
    { key: 'stations', label: 'Stations', icon: 'pi pi-server' },
    { key: 'tests', label: 'Tests', icon: 'pi pi-check-circle' },
    { key: 'power', label: 'Power', icon: 'pi pi-bolt' },
    { key: 'history', label: 'History', icon: 'pi pi-clock' },
    { key: 'diagram', label: 'Diagram', icon: 'pi pi-map' }
]);
</script>

<template>
    <aside
        class="col-span-3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-800 p-4 flex flex-col"
    >
        <!-- 🔹 Nagłówek -->
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <i class="pi pi-building text-primary-500"></i>
                {{ t('dashboard.locations') }}
            </h3>
            <Button
                icon="pi pi-plus"
                text
                size="small"
                class="text-gray-400 hover:text-primary-500"
                v-tooltip.bottom="'Add new location'"
            />
        </div>

        <!-- 📍 Lista budynków -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-1">
            <div
                v-for="bld in buildings"
                :key="bld.id"
                class="rounded-xl border transition-all cursor-pointer group shadow-sm"
                :class="[
          selectedBuilding?.id === bld.id
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-md'
            : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50/80 dark:hover:bg-surface-700'
        ]"
            >
                <!-- 🏢 Główna karta -->
                <div
                    class="p-3 flex justify-between items-start"
                    @click="$emit('select-building', bld)"
                >
                    <div>
                        <div class="font-semibold text-gray-800 dark:text-gray-100">
                            {{ bld.name }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <i class="pi pi-lightbulb text-yellow-500 mr-1"></i>
                            {{ buildingStats(bld).lampsOn }}/{{ buildingStats(bld).lampsTotal }} lamps
                        </div>
                    </div>

                    <Tag
                        :value="buildingStats(bld).lampsOn === buildingStats(bld).lampsTotal ? 'OK' : '⚠️'"
                        :severity="buildingStats(bld).lampsOn === buildingStats(bld).lampsTotal ? 'success' : 'warn'"
                        class="text-xs"
                    />
                </div>

                <!-- 📑 Lista sekcji -->
                <transition name="fade">
                    <div
                        v-if="selectedBuilding?.id === bld.id"
                        class="border-t border-gray-200 dark:border-gray-700 px-2 py-2 flex flex-col gap-1"
                    >
                        <button
                            v-for="section in sections"
                            :key="section.key"
                            class="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700"
                            :class="{
                'bg-primary-500 text-white shadow-sm': activeSubView === section.key,
              }"
                            @click.stop="$emit('set-subview', section.key)"
                        >
                            <i :class="section.icon"></i>
                            {{ section.label }}
                        </button>

                    </div>
                </transition>
            </div>
        </div>
    </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(6px);
}

/* Scrollbar ładniejszy */
aside::-webkit-scrollbar {
    width: 8px;
}
aside::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 9999px;
}
aside::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.25);
}
</style>
