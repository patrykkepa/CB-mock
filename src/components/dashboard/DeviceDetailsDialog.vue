<script setup>
import Dialog from 'primevue/dialog';

const props = defineProps({
    visible: { type: Boolean, required: true },
    payload: { type: Object, default: null },
});

const emit = defineEmits(['update:visible']);
</script>

<template>
    <Dialog
        v-model:visible="props.visible"
        header="Payload Details"
        :modal="true"
        style="width: 60rem"
        @update:visible="val => emit('update:visible', val)"
    >
        <div v-if="props.payload">
      <pre class="text-xs whitespace-pre-wrap bg-surface-100 dark:bg-surface-800 p-3 rounded">
{{ JSON.stringify(props.payload, null, 2) }}
      </pre>
        </div>
        <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
            <i class="pi pi-info-circle mr-2 text-lg"></i>
            No payload selected.
        </div>
    </Dialog>
</template>

<style scoped>
pre {
    font-family: 'JetBrains Mono', monospace;
}
</style>
