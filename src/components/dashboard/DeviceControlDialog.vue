<script setup>
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { useWebSocketService } from '@/service/WebsocketService.js';

const props = defineProps({
    visible: { type: Boolean, required: true },
    deviceId: { type: String, default: '' },
});

const emit = defineEmits(['update:visible']);

const toast = useToast();
const { sendCommand } = useWebSocketService();

const availableCommands = ['ping', 'info', 'reboot', 'ota'];
const selectedCmd = ref(null);
const customCmd = ref('');
const cmdArg = ref('');
const commandResponse = ref('');

/** wysyłanie komendy do urządzenia */
async function handleSendCommand() {
    if (!props.deviceId) {
        toast.add({ severity: 'warn', summary: 'No device selected', life: 2000 });
        return;
    }

    const cmdToSend = selectedCmd.value || customCmd.value.trim();
    if (!cmdToSend) {
        toast.add({ severity: 'warn', summary: 'No command specified', life: 2000 });
        return;
    }

    const args = cmdArg.value ? [cmdArg.value] : [];
    commandResponse.value = '⏳ Waiting for response...';

    try {
        const res = await sendCommand(props.deviceId, cmdToSend, args);
        commandResponse.value = `✅ Full response:\n\n${JSON.stringify(res, null, 2)}`;
    } catch (err) {
        console.error('❌ Command failed:', err);
        commandResponse.value = `❌ Failed: ${err.message}`;
    }
}
</script>

<template>
    <Dialog
        v-model:visible="props.visible"
        header="Device Control"
        :modal="true"
        style="width: 40rem"
        @update:visible="val => emit('update:visible', val)"
    >
        <div v-if="props.deviceId">
            <div class="mb-3 text-sm">
                <strong>Device:</strong> {{ props.deviceId }}
            </div>

            <div class="flex gap-2 mb-3">
                <Select
                    v-model="selectedCmd"
                    :options="availableCommands"
                    placeholder="Select Command"
                    class="flex-1"
                />
                <span class="text-gray-400 self-center">or</span>
                <InputText
                    v-model="customCmd"
                    placeholder="Custom command…"
                    class="flex-1"
                />
            </div>

            <InputText
                v-model="cmdArg"
                placeholder="Optional argument…"
                class="w-full mb-3"
            />
            <Button
                label="Send Command"
                icon="pi pi-send"
                severity="info"
                class="w-full"
                @click="handleSendCommand"
            />

            <div class="mt-4">
                <h4 class="text-sm font-semibold mb-2">Response:</h4>
                <pre
                    class="text-xs bg-surface-100 dark:bg-surface-800 p-3 rounded max-h-60 overflow-auto whitespace-pre-wrap"
                >
{{ commandResponse }}
        </pre>
            </div>
        </div>
        <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
            <i class="pi pi-info-circle mr-2 text-lg"></i>
            No device selected.
        </div>
    </Dialog>
</template>

<style scoped>
pre {
    font-family: 'JetBrains Mono', monospace;
}
</style>
