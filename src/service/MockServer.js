// src/service/MockServer.js
import { reactive } from 'vue'

const db = reactive({ buildings: [] })

let timer = null
let currentRole = null

/* ------------------------------------------------------
   WYMUSZENIE: Minimum 50% kanałów w każdej stacji ON
------------------------------------------------------ */
function enforceLampRules(buildings) {
    buildings.forEach(building => {
        building.stations.forEach(station => {
            if (!station.controllers || station.controllers.length === 0) return

            const totalControllers = station.controllers.length
            const requiredFullOn = Math.ceil(totalControllers / 2)

            const fullOnNow = station.controllers.filter(
                ctrl =>
                    ctrl.lamps.length > 0 &&
                    ctrl.lamps.every(l => l.state === 'ON')
            )

            if (fullOnNow.length >= requiredFullOn) return

            let missing = requiredFullOn - fullOnNow.length

            for (const ctrl of station.controllers) {
                if (missing <= 0) break
                if (ctrl.lamps.length === 0) continue

                ctrl.lamps.forEach(l => (l.state = 'ON'))
                missing--
            }
        })
    })

    return buildings
}

/* ------------------------------------------------------
   Wewnętrzny reset stanu
------------------------------------------------------ */
function internalReset() {
    // wyczyść tablicę reaktywnie
    db.buildings.splice(0, db.buildings.length)

    if (timer) {
        clearInterval(timer)
        timer = null
    }
}

/* ------------------------------------------------------
   INIT MOCK SERVER  —  z obsługą roli
------------------------------------------------------ */
export async function initMockServer() {
    const role = localStorage.getItem('role') || 'admin'

    // Jeśli mock był już załadowany dla INNEJ roli → wyczyść i ładuj od nowa
    if (currentRole && currentRole !== role) {
        internalReset()
    }
    if (db.buildings.length > 0) return

    currentRole = role

    let mockData

    if (role === 'client') {
        const response = await fetch('/demo/data/mock-backend-szpital.json')
        const singleBuilding = await response.json()

        mockData = { buildings: [singleBuilding] }
        console.log('MockServer: rola client → mock-backend-szpital.json')
    } else {
        const response = await fetch('/demo/data/mock-backend-v2.json')
        mockData = await response.json()
        console.log('MockServer: rola admin → mock-backend-v2.json')
    }

    mockData.buildings = enforceLampRules(mockData.buildings)

    db.buildings.splice(0, db.buildings.length, ...mockData.buildings)

    // symulacja pracy systemu
    if (!timer) {
        timer = setInterval(simulateActivity, 1000)
    }
}


export function reset() {
    internalReset()
    currentRole = null
}

/* ------------------------------------------------------
   SYMULACJA ŻYCIA SYSTEMU (działa co sekundę)
------------------------------------------------------ */
function simulateActivity() {
    db.buildings.forEach(b => {
        b.stations.forEach(station => {
            station.heartbeats += 1
            station.uptime += 1

            station.controllers?.forEach(ctrl => {
                ctrl.uptime += 1

                if (Math.random() < 0.3) {
                    ctrl.free_heap = Math.max(
                        8192,
                        ctrl.free_heap - Math.floor(Math.random() * 20)
                    )
                } else if (Math.random() < 0.1) {
                    ctrl.free_heap += Math.floor(Math.random() * 50)
                }

                ctrl.lamps?.forEach(lamp => {
                    if (Math.random() < 0.001) {
                        lamp.state = lamp.state === 'ON' ? 'OFF' : 'ON'
                    }
                })
            })
        })
    })

    if (Math.random() < 0.02) saveMockState()
}

/* ------------------------------------------------------
   SYMULACJA ZAPISU
------------------------------------------------------ */
function saveMockState() {
    try {
        JSON.stringify({ buildings: db.buildings }, null, 2)
    } catch (err) {
        console.error('❌ Błąd zapisu mocka:', err)
    }
}

/* ------------------------------------------------------
   API MOCK SERVERA
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
