<script setup>
import Tag from 'primevue/tag';
const props = defineProps({ lamps: Array });
</script>

<template>
    <table class="min-w-full border-collapse text-sm mt-3">
        <thead>
        <tr class="bg-gray-100">
            <th class="p-2">#</th>
            <th class="p-2">Stan</th>
            <th class="p-2">Jasność</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="lamp in lamps"
            :key="lamp.id"
            :class="lamp.state === 'ON' ? 'bg-green-50' : ''"
        >
            <td class="p-2">{{ lamp.id }}</td>
            <td class="p-2">
                <Tag :value="lamp.state" :severity="lamp.state === 'ON' ? 'success' : 'secondary'" />
            </td>
            <td class="p-2">{{ lamp.brightness }}</td>
        </tr>
        </tbody>
    </table>
</template>
