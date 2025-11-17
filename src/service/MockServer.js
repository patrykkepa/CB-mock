// src/service/MockServer.js
import { reactive } from 'vue'

// 🔹 Lokalny stan reaktywny
const db = reactive({ buildings: [] })

let timer = null

/* ------------------------------------------------------
   🔥 WYMUSZENIE: Minimum 50% kanałów w każdej stacji ON
------------------------------------------------------ */
function enforceLampRules(buildings) {
    buildings.forEach(building => {
        building.stations.forEach(station => {
            if (!station.controllers || station.controllers.length === 0) return;

            const totalControllers = station.controllers.length;
            const requiredFullOn = Math.ceil(totalControllers / 2);

            // znajdź kontrolery które są FULL-ON
            const fullOnNow = station.controllers.filter(ctrl =>
                ctrl.lamps.length > 0 &&
                ctrl.lamps.every(l => l.state === "ON")
            );

            if (fullOnNow.length >= requiredFullOn) return; // już spełnia

            let missing = requiredFullOn - fullOnNow.length;

            // uzupełnij brakujące kanały do FULL ON
            for (const ctrl of station.controllers) {
                if (missing <= 0) break;
                if (ctrl.lamps.length === 0) continue;

                // ustaw wszystkie lampy na ON
                ctrl.lamps.forEach(l => (l.state = "ON"));
                missing--;
            }
        });
    });

    return buildings;
}

/* ------------------------------------------------------
   🔧 INIT MOCK SERVER
------------------------------------------------------ */
export async function initMockServer() {
    if (db.buildings.length > 0) return; // nie ładuj drugi raz

    const response = await fetch('/demo/data/mock-backend-v2.json')
    const mockData = await response.json()

    // 🟢 Wymuszenie logiki: min. 50% kanałów pełne ON
    mockData.buildings = enforceLampRules(mockData.buildings)

    db.buildings = mockData.buildings

    // 🔄 realizm działania
    timer = setInterval(simulateActivity, 1000)
}

/* ------------------------------------------------------
   🔄 SYMULACJA ŻYCIA SYSTEMU (działa co sekundę)
------------------------------------------------------ */
function simulateActivity() {
    db.buildings.forEach(b => {
        b.stations.forEach(station => {

            // tick
            station.heartbeats += 1
            station.uptime += 1

            // kontrolery
            station.controllers?.forEach(ctrl => {
                ctrl.uptime += 1

                // memory drift
                if (Math.random() < 0.3) {
                    ctrl.free_heap = Math.max(8192, ctrl.free_heap - Math.floor(Math.random() * 20))
                } else if (Math.random() < 0.1) {
                    ctrl.free_heap += Math.floor(Math.random() * 50)
                }

                // 0.1% szansy na losowy ON/OFF lampy (bardzo rzadkie)
                ctrl.lamps?.forEach(lamp => {
                    if (Math.random() < 0.001) {
                        lamp.state = lamp.state === 'ON' ? 'OFF' : 'ON'
                    }
                })
            })
        })
    })

    // okazjonalny zapis mocka
    if (Math.random() < 0.02) saveMockState()
}

/* ------------------------------------------------------
   💾 SYMULACJA ZAPISU (opcjonalne)
------------------------------------------------------ */
function saveMockState() {
    try {
        const json = JSON.stringify({ buildings: db.buildings }, null, 2)

        if (window.showSaveFilePicker) {
            // opcjonalnie można dodać realny zapis
        } else {
            console.debug('💾 Symulacja zapisu stanu mocka')
        }
    } catch (err) {
        console.error('❌ Błąd zapisu mocka:', err)
    }
}

/* ------------------------------------------------------
   🌐 API MOCK SERVERA
------------------------------------------------------ */
export const mockServer = {
    getBuildings() {
        return db.buildings
    },

    getBuildingById(id) {
        return db.buildings.find(b => b.id === id)
    },

    getStation(deviceId) {
        for (const b of db.buildings) {
            const station = b.stations.find(s => s.device_id === deviceId)
            if (station) return station
        }
        return null
    },

    toggleLamp(deviceId, controllerId, lampId) {
        const station = this.getStation(deviceId)
        if (!station) return null

        const ctrl = station.controllers.find(c => c.id === controllerId)
        const lamp = ctrl?.lamps.find(l => l.lamp_id === lampId)
        if (!lamp) return null

        lamp.state = lamp.state === 'ON' ? 'OFF' : 'ON'
        saveMockState()
        return lamp
    },

    updateFirmware(deviceId, newVersion) {
        const station = this.getStation(deviceId)
        if (station) {
            station.firmware = newVersion
            saveMockState()
            return { success: true, firmware: newVersion }
        }
        return { success: false }
    },

    resetHeartbeats(deviceId) {
        const station = this.getStation(deviceId)
        if (station) {
            station.heartbeats = 0
            saveMockState()
            return { success: true }
        }
        return { success: false }
    }
}
