<script setup>
import { ref, onMounted } from 'vue'
import AppMenuItem from './AppMenuItem.vue'
import { initMockServer, mockServer } from '@/service/MockServer'

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
            {
                label: 'History',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/history'
            }
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

onMounted(async () => {
    await initMockServer()
    const buildings = mockServer.getBuildings()

    const mockMenu = model.value[0].items.find(i => i.label === 'Dashboard (mock)')
    if (mockMenu) {
        mockMenu.items = buildings.map(b => ({
            label: b.name,
            icon: 'pi pi-building',
            to: `/dashboard-mock/${b.id}`
        }))
    }
})
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="i">
            <AppMenuItem v-if="!item.separator" :item="item" :index="i" />
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>
