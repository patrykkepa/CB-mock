<script setup>
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { useWebSocketService } from '@/service/WebsocketService.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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

/** 📤 Wysyłanie komendy do urządzenia */
async function handleSendCommand() {
    if (!props.deviceId) {
        toast.add({ severity: 'warn', summary: t('device_control.no_device'), life: 2000 });
        return;
    }

    const cmdToSend = selectedCmd.value || customCmd.value.trim();
    if (!cmdToSend) {
        toast.add({ severity: 'warn', summary: t('device_control.no_command'), life: 2000 });
        return;
    }

    const args = cmdArg.value ? [cmdArg.value] : [];
    commandResponse.value = `⏳ ${t('device_control.waiting')}`;

    try {
        const res = await sendCommand(props.deviceId, cmdToSend, args);
        commandResponse.value = `✅ ${t('device_control.full_response')}:\n\n${JSON.stringify(res, null, 2)}`;
    } catch (err) {
        console.error('Command failed:', err);
        commandResponse.value = `${t('device_control.failed')}: ${err.message}`;
    }
}
</script>

<template>
    <Dialog
        v-model:visible="props.visible"
        :header="t('device_control.header')"
        :modal="true"
        style="width: 40rem"
        @update:visible="val => emit('update:visible', val)"
    >
        <div v-if="props.deviceId">
            <div class="mb-3 text-sm">
                <strong>{{ t('device_control.device') }}:</strong> {{ props.deviceId }}
            </div>

            <!-- 🔧 Wybór komendy -->
            <div class="flex gap-2 mb-3">
                <Select
                    v-model="selectedCmd"
                    :options="availableCommands"
                    :placeholder="t('device_control.select_command')"
                    class="flex-1"
                />
                <span class="text-gray-400 self-center">{{ t('device_control.or') }}</span>
                <InputText
                    v-model="customCmd"
                    :placeholder="t('device_control.custom_command')"
                    class="flex-1"
                />
            </div>

            <InputText
                v-model="cmdArg"
                :placeholder="t('device_control.optional_argument')"
                class="w-full mb-3"
            />

            <Button
                :label="t('device_control.send_command')"
                icon="pi pi-send"
                severity="info"
                class="w-full"
                @click="handleSendCommand"
            />

            <!-- 📬 Odpowiedź -->
            <div class="mt-4">
                <h4 class="text-sm font-semibold mb-2">{{ t('device_control.response') }}:</h4>
                <pre
                    class="text-xs bg-surface-100 dark:bg-surface-800 p-3 rounded max-h-60 overflow-auto whitespace-pre-wrap"
                >{{ commandResponse }}</pre>
            </div>
        </div>

        <!-- 🚫 Brak urządzenia -->
        <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
            <i class="pi pi-info-circle mr-2 text-lg"></i>
            {{ t('device_control.no_device_selected') }}
        </div>
    </Dialog>
</template>

<style scoped>
pre {
    font-family: 'JetBrains Mono', monospace;
}
</style>
