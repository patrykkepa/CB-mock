import { reactive } from 'vue'

// Lokalny stan reaktywny
const db = reactive({ buildings: [] })

let timer = null

export async function initMockServer() {
    if (db.buildings.length > 0) return

    const response = await fetch('/demo/data/mock-backend-v2.json')
    const mockData = await response.json()
    db.buildings = mockData.buildings

    timer = setInterval(simulateActivity, 1000)
}

function simulateActivity() {
    db.buildings.forEach(b => {
        b.stations.forEach(station => {
            // 1 heartbeat = 1 sekunda działania
            station.heartbeats += 1
            station.uptime += 1

            // kontrolery aktualizują uptime równolegle ze stacją
            station.controllers?.forEach(ctrl => {
                ctrl.uptime += 1

                // symulacja zużycia pamięci
                if (Math.random() < 0.3) {
                    ctrl.free_heap = Math.max(8192, ctrl.free_heap - Math.floor(Math.random() * 20))
                } else if (Math.random() < 0.1) {
                    ctrl.free_heap += Math.floor(Math.random() * 50)
                }

                // % szansy na zmianę stanu lampy
                ctrl.lamps?.forEach(lamp => {
                    if (Math.random() < 0.001) {
                        lamp.state = lamp.state === 'ON' ? 'OFF' : 'ON'
                    }
                })
            })
        })
    })

    // co minutę zapisujemy stan
    if (Math.random() < 0.02) saveMockState()
}

// Zapisuje stan do pliku
function saveMockState() {
    try {
        const json = JSON.stringify({ buildings: db.buildings }, null, 2)
        if (window.showSaveFilePicker) {
        } else {
            console.debug('Symulacja zapisu stanu mocka')
        }
    } catch (err) {
        console.error('❌ Błąd zapisu mocka:', err)
    }
}

// API
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
