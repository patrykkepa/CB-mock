<script setup>
import Button from 'primevue/button';
import Tag from 'primevue/tag';

const props = defineProps({
    lamps: { type: Object, default: () => ({}) }
});
const emit = defineEmits(['show-payload']);
</script>

<template>
    <div class="mt-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table class="min-w-full text-sm border-collapse">
            <thead>
            <tr class="text-left bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <th class="py-2 px-3 w-10"></th>
                <th class="py-2 px-3">Lamp</th>
                <th class="py-2 px-3">State</th>
                <th class="py-2 px-3">Seq</th>
                <th class="py-2 px-3">Control</th>
                <th class="py-2 px-3 text-right">Payload</th>
            </tr>
            </thead>
            <tbody v-if="Object.keys(lamps).length">
            <tr
                v-for="(lamp, id) in lamps"
                :key="id"
                :class="[
            'border-t border-gray-100 dark:border-gray-800',
            lamp.on ? 'bg-green-50 dark:bg-green-900/30' : 'bg-surface-0 dark:bg-surface-900'
          ]"
            >
                <td class="py-2 px-3 text-center">
                    <i :class="['pi pi-lightbulb text-lg', lamp.on ? 'text-green-500' : 'text-gray-400']" />
                </td>
                <td class="py-2 px-3 font-medium">L{{ id }}</td>
                <td class="py-2 px-3">
                    <Tag :value="lamp.on ? 'ON' : 'OFF'" :severity="lamp.on ? 'success' : 'secondary'" rounded />
                </td>
                <td class="py-2 px-3">{{ lamp.seq ?? '-' }}</td>
                <td class="py-2 px-3 text-center">
                    <i :class="lamp.control ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-gray-400'" />
                </td>
                <td class="py-2 px-3 text-right">
                    <Button icon="pi pi-eye" text rounded size="small" severity="info" @click="emit('show-payload', lamp.raw)" />
                </td>
            </tr>
            </tbody>
            <tbody v-else>
            <tr>
                <td colspan="6" class="text-center py-4 text-gray-500 dark:text-gray-400">
                    <i class="pi pi-spin pi-spinner text-xl align-middle mr-2"></i>
                    Awaiting lamp data…
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>
