<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const messages = ref([]);
const limit = ref(20);
const loading = ref(false);
let cancelTokenSource = null;

const showDialog = ref(false);
const selectedPayload = ref(null);

const fetchMessages = async () => {
    // Anuluj poprzedni request, jeśli wciąż trwa
    if (cancelTokenSource) {
        cancelTokenSource.cancel('Request cancelled by new fetch');
    }

    cancelTokenSource = axios.CancelToken.source();
    loading.value = true;

    try {
        // 🔥 natychmiast wyczyść starą listę, żeby Vue nie łączył danych
        messages.value = [];

        const response = await axios.get(`/api/messages?limit=${limit.value}`, {
            cancelToken: cancelTokenSource.token,
            headers: { 'Cache-Control': 'no-cache' }
        });

        // 🔥 upewnij się, że nadpisujesz dane (nie dopisujesz)
        messages.value = Array.isArray(response.data)
            ? [...response.data]
            : [];
    } catch (err) {
        if (!axios.isCancel(err)) {
            console.error(err);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch messages',
                life: 3000
            });
        }
    } finally {
        loading.value = false;
        cancelTokenSource = null;
    }
};

function parsePayload(payload) {
    if (payload == null) return {};
    if (typeof payload === 'object') return payload;
    try {
        return JSON.parse(payload);
    } catch {
        try {
            const unquoted = payload.replace(/^"(.+)"$/, '$1').replace(/\\"/g, '"');
            return JSON.parse(unquoted);
        } catch {
            return { raw: String(payload) };
        }
    }
}

function formatDate(value) {
    if (value == null) return '';

    const asNumber = typeof value === 'number' ? value : Number(value);
    let date;

    if (!Number.isNaN(asNumber)) {
        date = new Date(asNumber < 1e12 ? asNumber * 1000 : asNumber);
    } else {
        date = new Date(value);
    }

    if (isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat(undefined, {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
}

// typ wiadomości
function getType(payloadRaw) {
    const p = parsePayload(payloadRaw);

    if (p.ad === 'heartbeat' || (typeof p.res === 'object' && p.res.firmware)) return 'heartbeat';
    if (p.lamp !== undefined || p.turn !== undefined) return 'message';
    if (p.cmd === 'ping' || p.res === 'pong') return 'ping-pong';

    return 'other';
}

// device label
function getDeviceLabel(payloadRaw) {
    const p = parsePayload(payloadRaw);
    if (p.lamp != null) return `L:${p.lamp}`;
    if (p.device != null) return `D:${p.device}`;
    if (p.ad === 'heartbeat') return '-';
    if (p.cmd === 'ping') return '-';
    if (p.res === 'pong') return '-';
    return '-';
}

function getTurnState(payloadRaw) {
    const p = parsePayload(payloadRaw);
    const turn = p.turn;
    if (turn === 1 || turn === '1') return 'ON';
    if (turn === 0 || turn === '0') return 'OFF';
    return '-';
}

function getHeartbeatInfo(payloadRaw) {
    const p = parsePayload(payloadRaw);
    const res = p.res ?? (p.payload && p.payload.res ? p.payload.res : null);
    const firmware = res?.firmware ?? p.firmware ?? null;
    const uptime = res?.uptime ?? p.uptime ?? null;
    const uptimeStr = typeof uptime === 'number' ? `${Math.round(uptime)} s` : uptime ? String(uptime) : null;
    if (firmware || uptimeStr) return { firmware: firmware ?? '-', uptime: uptimeStr ?? '-' };
    return null;
}

function viewPayload(row) {
    selectedPayload.value = parsePayload(row.payload);
    showDialog.value = true;
}

onMounted(fetchMessages);
</script>

<template>
    <div class="card shadow-md p-4 bg-surface-0 dark:bg-surface-900">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div class="flex items-center gap-2">
                <Button
                    label="Refresh"
                    icon="pi pi-refresh"
                    severity="info"
                    outlined
                    @click="fetchMessages"
                    :loading="loading"
                />
                <div class="flex items-center gap-2">
                    <InputNumber
                        v-model="limit"
                        inputId="limit"
                        mode="decimal"
                        showButtons
                        min="1"
                        max="200"
                        class="w-24"
                    />
                    <Button label="Filter" severity="secondary" @click="fetchMessages" />
                </div>
            </div>
        </div>

        <DataTable
            :value="messages"
            :key="messages.length + (messages[0]?.id || '')"
            dataKey="id"
            :loading="loading"
            scrollable
            scrollHeight="70vh"
            responsiveLayout="scroll"
            stripedRows
        >

        <!-- Received at -->
            <Column field="received_at" header="Received at" style="min-width: 100px">
                <template #body="{ data }">
                    {{ formatDate(data.received_at) }}
                </template>
            </Column>

            <!-- Direction (incoming/outgoing) -->
            <Column header="" style="width: 70px; text-align: center;">
                <template #body="{ data }">
                    <i
                        v-if="data.incoming"
                        class="pi pi-arrow-right text-green-500"
                        title="Incoming"
                    ></i>
                    <i
                        v-else
                        class="pi pi-arrow-left text-blue-500"
                        title="Outgoing"
                    ></i>
                </template>
            </Column>

            <!-- Device ID -->
            <Column field="device_id" header="Device id" style="min-width: 140px" />

            <!-- Device label (L:1 etc.) -->
            <Column header="Device" style="min-width: 100px">
                <template #body="{ data }">
                    {{ getDeviceLabel(data.payload) }}
                </template>
            </Column>

            <!-- Type -->
            <Column header="Type" style="min-width: 120px">
                <template #body="{ data }">
          <span
              :class="[
              'inline-block px-2 py-1 rounded text-xs font-medium',
              getType(data.payload) === 'heartbeat'
                ? 'bg-blue-100 text-blue-800'
                : getType(data.payload) === 'message'
                ? 'bg-green-100 text-green-800'
                : getType(data.payload) === 'ping-pong'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-700'
            ]"
          >
            {{ getType(data.payload) }}
          </span>
                </template>
            </Column>

            <!-- State -->
            <Column header="State" style="min-width: 90px">
                <template #body="{ data }">
          <span
              :class="[
              'inline-block px-2 py-1 rounded text-xs font-medium',
              getTurnState(data.payload) === 'ON'
                ? 'bg-green-100 text-green-800'
                : getTurnState(data.payload) === 'OFF'
                ? 'bg-red-100 text-red-700'
                : 'bg-surface-100 text-surface-800'
            ]"
          >
            {{ getTurnState(data.payload) }}
          </span>
                </template>
            </Column>

            <!-- Info -->
            <Column header="Info" style="min-width: 200px">
                <template #body="{ data }">
                    <div v-if="getType(data.payload) === 'heartbeat'">
                        <template v-if="getHeartbeatInfo(data.payload)">
                            <div class="text-sm">
                                <strong>fw:</strong> {{ getHeartbeatInfo(data.payload).firmware }}
                                <span class="mx-2">•</span>
                                <strong>upt:</strong> {{ getHeartbeatInfo(data.payload).uptime }}
                            </div>
                        </template>
                    </div>
                    <div v-else-if="getType(data.payload) === 'ping-pong'">
                        <div class="text-sm italic text-yellow-700">
                            {{ parsePayload(data.payload).cmd === 'ping' ? 'ping sent' : 'pong received' }}
                        </div>
                    </div>
                    <div v-else>-</div>
                </template>
            </Column>

            <!-- Payload preview -->
            <Column header="Payload" style="min-width: 120px">
                <template #body="{ data }">
                    <Button label="View" size="small" class="p-button-text" @click="() => viewPayload(data)" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="showDialog" header="Payload" :modal="true" style="width:60rem;">
            <pre class="text-xs whitespace-pre-wrap">{{ JSON.stringify(selectedPayload, null, 2) }}</pre>
        </Dialog>
    </div>
</template>

<style scoped>
.card {
    border-radius: 1rem;
}
pre {
    font-family: 'JetBrains Mono', monospace;
    background: var(--surface-ground);
    padding: 0.5rem;
    border-radius: 6px;
    white-space: pre-wrap;
    max-height: 60vh;
    overflow: auto;
}
</style>
