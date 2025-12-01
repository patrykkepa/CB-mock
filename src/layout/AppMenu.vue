<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppMenuItem from './AppMenuItem.vue'
import { initMockServer, mockServer } from '@/service/MockServer'

const route = useRoute()

const buildingSections = [
    { key: 'overview', label: 'Overview', icon: 'pi pi-chart-bar' },
    { key: 'rack',     label: 'Stations',     icon: 'pi pi-server' },
    { key: 'tests',    label: 'Tests',    icon: 'pi pi-check-circle' },
    { key: 'power',    label: 'Power',    icon: 'pi pi-bolt' },
    { key: 'history',  label: 'History',  icon: 'pi pi-clock' },
    { key: 'diagram',  label: 'Diagram',  icon: 'pi pi-map' }
]

const model = ref([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-desktop', to: '/' },
            {
                label: 'Dashboard (mock)',
                icon: 'pi pi-fw pi-desktop',
                to: '/dashboard-mock',
                items: []
            }
        ]
    },
    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            { label: 'History', icon: 'pi pi-fw pi-circle-off', to: '/pages/history' }
        ]
    },
    {
        label: 'For devs',
        items: [
            { label: 'Documentation', icon: 'pi pi-fw pi-book', to: '/documentation' },
            { label: 'View Source', icon: 'pi pi-fw pi-github', url: '/', target: '_blank' }
        ]
    }
])

const buildings = computed(() => mockServer.getBuildings())

function updateMenu(buildingsList) {
    const mockMenu = model.value[0].items.find(i => i.label === 'Dashboard (mock)')
    if (!mockMenu) return

    mockMenu.items = (buildingsList || []).map(b => ({
        label: b.name,
        icon: 'pi pi-building',
        to: `/dashboard-mock/${b.id}`,
        items: buildingSections.map(s => ({
            label: s.label,
            icon: s.icon,
            to: `/dashboard-mock/${b.id}/${s.key}`
        }))
    }))
}

onMounted(async () => {
    await initMockServer()
    updateMenu(buildings.value)
})

watch(buildings, (val) => {
    updateMenu(val)
})

// podświetlanie aktywnego elementu na podstawie route
watch(
    () => route.fullPath,
    () => {
        const mockMenu = model.value?.[0]?.items?.find(i => i.label === 'Dashboard (mock)')
        if (!mockMenu || !Array.isArray(mockMenu.items)) return

        const buildingId = route.params.buildingId
        mockMenu.expanded = route.path.startsWith('/dashboard-mock')

        mockMenu.items.forEach(bld => {
            bld.expanded = bld.to === `/dashboard-mock/${buildingId}`

            bld.items?.forEach(section => {
                section.active = section.to === route.fullPath
            })
        })
    },
    { immediate: true }
)


</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="i">
            <AppMenuItem :item="item" :index="i" />
        </template>
    </ul>
</template>

