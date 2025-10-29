// src/service/WebsocketService.js
import { reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

let instance = null; // singleton

export function useWebSocketService() {
    if (instance) return instance;

    const toast = useToast();
    const ws = ref(null);
    const isConnected = ref(false);
    const reconnectTimer = ref(null);

    const devices = reactive({});
    const pendingCommands = reactive({});

    /** 🔌 Połączenie WebSocket */
    const connectWebSocket = () => {
        const isDev = import.meta.env.DEV;
        const protocol = isDev ? 'wss' : window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = isDev ? 'hoststation.local' : window.location.host;
        const socketUrl = `${protocol}://${host}/ws`;

        console.log('🔌 Connecting to', socketUrl);
        ws.value = new WebSocket(socketUrl);

        ws.value.onopen = () => {
            isConnected.value = true;
            toast.add({ severity: 'success', summary: 'Connected', life: 1500 });
        };

        ws.value.onclose = () => {
            isConnected.value = false;
            toast.add({
                severity: 'warn',
                summary: 'Disconnected',
                detail: 'Reconnecting...',
                life: 1500
            });
            reconnect();
        };

        ws.value.onerror = (err) => {
            console.error('WebSocket error', err);
            ws.value.close();
        };

        ws.value.onmessage = (event) => {
            try {
                let raw = event.data;
                let msg =
                    typeof raw === 'string' && raw.startsWith('"')
                        ? JSON.parse(JSON.parse(raw))
                        : JSON.parse(raw);
                handleMessage(msg);
            } catch (e) {
                console.warn('⚠️ Invalid WS message:', event.data, e);
            }
        };
    };

    const reconnect = () => {
        clearTimeout(reconnectTimer.value);
        reconnectTimer.value = setTimeout(connectWebSocket, 5000);
    };

    /** 🧠 Obsługa przychodzących wiadomości */
    const handleMessage = (msg) => {
        // 📦 Lista urządzeń (np. po info, reboot, ota)
        if (msg.devices) {
            msg.devices.forEach((dev) => {
                if (!devices[dev.device_id]) {
                    devices[dev.device_id] = { ...dev, lamps: {} };
                } else {
                    Object.assign(devices[dev.device_id], dev);
                }
            });

            // 🔁 Dopasowanie do oczekujących komend (reboot / ota)
            for (const [id, cmd] of Object.entries(pendingCommands)) {
                if (!cmd?.device_id || !cmd?.cmd) continue;
                if (!['reboot', 'ota'].includes(cmd.cmd)) continue;

                const matched = msg.devices.find(d => d.device_id === cmd.device_id);
                if (matched) {
                    cmd.resolve({
                        device: matched,
                        devices: msg.devices,
                    });
                    delete pendingCommands[id];
                    console.log(`✅ Device update matched pending ${cmd.cmd} for ${cmd.device_id}`);
                }
            }

            return;
        }

        // ⚙️ Odpowiedź kontrolna (ping/info)
        if (msg.incoming && (msg.incoming.control === true || msg.incoming.control === 'true')) {
            const incomingId = String(msg.incoming.id);
            const session = pendingCommands[incomingId];
            if (session) {
                session.resolve(msg.incoming);
                delete pendingCommands[incomingId];
                console.log(`✅ Control response matched for ${incomingId}`);
            }
            return;
        }

        // 💡 Wiadomość lampy (control=false)
        if (msg.incoming && (msg.incoming.control === false || msg.incoming.control === 'false')) {
            const inc = msg.incoming;
            const dev =
                devices[inc.device_id] ??
                (devices[inc.device_id] = { device_id: inc.device_id, lamps: {} });
            if (inc.lamp !== undefined) {
                dev.lamps[inc.lamp] = {
                    on: inc.turn === 1,
                    control: inc.control ?? false,
                    seq: inc.seq ?? null,
                    raw: inc,
                };
            }
            dev.last_seen = Date.now() / 1000;
            return;
        }

        // 💬 Fallback: prosta odpowiedź (bez control/devices)
        if (msg.id && pendingCommands[msg.id]) {
            pendingCommands[msg.id].resolve(msg);
            delete pendingCommands[msg.id];
            console.log(`✅ Simple WS response matched for ${msg.id}`);
            return;
        }
    };

    /** 🚀 Wysyłanie komend z oczekiwaniem na odpowiedź */
    const sendCommand = async (deviceId, cmd, args = []) => {
        const id = uuidv4();
        const payload = {
            id,
            seq: 0,
            device_id: deviceId,
            cmd,
            arg: args,
        };

        return new Promise(async (resolve, reject) => {
            pendingCommands[id] = {
                resolve,
                reject,
                sentAt: Date.now(),
                device_id: deviceId,
                cmd,
            };

            try {
                await axios.post('/api/control', payload);
                console.log('📤 Command sent:', payload);
            } catch (err) {
                delete pendingCommands[id];
                reject(err);
            }

            // ⏳ timeout: reboot (20s), ota (60s), inne (10s)
            const timeoutMs =
                cmd === 'ota' ? 20000 : cmd === 'reboot' ? 20000 : 10000;

            setTimeout(() => {
                if (pendingCommands[id]) {
                    reject(new Error('Timeout waiting for device response'));
                    delete pendingCommands[id];
                }
            }, timeoutMs);
        });
    };

    // ✅ Publiczne API
    instance = {
        ws,
        isConnected,
        devices,
        pendingCommands,
        connectWebSocket,
        sendCommand,
    };

    connectWebSocket(); // automatyczne połączenie przy pierwszym użyciu
    return instance;
}
