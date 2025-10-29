<script setup>
import { ref, computed } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import AppConfigurator from './AppConfigurator.vue';
import { useWebSocketService } from '@/service/WebsocketService.js';
import Tag from 'primevue/tag';

// 🧩 layout + router
const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const router = useRouter();

// 🔌 dane z WebSocketService
const { devices } = useWebSocketService();

// 🔔 Dropdown (Messages)
const showMessages = ref(false);

// 📊 urządzenia z nieaktywnymi lampami
const errorDevices = computed(() => {
    return Object.values(devices)
        .map(dev => {
            const offLamps = Object.entries(dev.lamps || {})
                .filter(([_, lamp]) => lamp.on === false || lamp.raw?.turn === 0 || lamp.raw?.turn === '0')
                .map(([id, lamp]) => ({
                    id,
                    ...lamp
                }));
            return offLamps.length ? { ...dev, offLamps } : null;
        })
        .filter(Boolean);
});

// 🚪 Wylogowanie
const logout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/auth/login');
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img
                    src="/demo/images/intelight/logo-en.svg"
                    alt="Intelight Logo"
                    class="h-14 object-contain"
                />
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">

                    <!-- 📩 Messages Dropdown -->
                    <div class="relative inline-block">
                        <button
                            type="button"
                            class="layout-topbar-action"
                            @click="messagesOpen = !messagesOpen"
                            v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        >
                            <i class="pi pi-inbox"></i>
                            <span>Messages</span>
                        </button>

                        <!-- 🔴 Wykrzyknik jako osobny element, POZA buttonem -->
                        <span
                            v-if="errorDevices.length > 0"
                            class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-lg z-50 flex items-center justify-center select-none"
                            aria-label="Inactive lamps"
                        >
    !
  </span>

                        <!-- 📬 Dropdown Panel -->
                        <div
                            class="hidden absolute right-0 mt-2 w-96 max-h-[24rem] overflow-y-auto bg-surface-0 dark:bg-surface-900 border border-surface rounded-md shadow-lg z-50 p-3"
                        >
                            <h4 class="text-md font-semibold mb-2 text-primary-600">Inactive Lamps</h4>

                            <div v-if="errorDevices.length">
                                <div
                                    v-for="dev in errorDevices"
                                    :key="dev.device_id"
                                    class="mb-3 p-3 border border-surface-200 dark:border-surface-700 rounded-md"
                                >
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="font-semibold">{{ dev.device_id }}</span>
                                        <Tag severity="danger" :value="`${dev.offLamps.length} OFF`" rounded />
                                    </div>
                                    <ul class="text-sm text-gray-700 dark:text-gray-300 pl-1">
                                        <li
                                            v-for="lamp in dev.offLamps"
                                            :key="lamp.id"
                                            class="flex items-center gap-2 py-0.5"
                                        >
                                            <i class="pi pi-lightbulb text-red-500"></i>
                                            <span>Lamp {{ lamp.id }} (seq: {{ lamp.seq ?? '-' }})</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div v-else class="text-center py-3 text-gray-500 dark:text-gray-400">
                                <i class="pi pi-check-circle text-green-500 mr-2"></i>
                                All lamps are active
                            </div>
                        </div>
                    </div>



                    <!-- 👤 Profile Dropdown -->
                    <div class="relative">
                        <button
                            type="button"
                            class="layout-topbar-action"
                            v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        >
                            <i class="pi pi-user"></i>
                            <span>Profile</span>
                        </button>
                        <div
                            class="hidden absolute right-0 mt-2 w-48 bg-surface-0 dark:bg-surface-900 border border-surface rounded-md shadow-lg z-50"
                        >
                            <ul class="py-2 text-sm text-surface-700 dark:text-surface-0">
                                <li>
                                    <router-link
                                        to="/profile"
                                        class="block px-4 py-2 hover:bg-surface-100 dark:hover:bg-surface-800"
                                    >
                                        My Account
                                    </router-link>
                                </li>
                                <li>
                                    <button
                                        @click="logout"
                                        class="w-full text-left px-4 py-2 hover:bg-surface-100 dark:hover:bg-surface-800"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.layout-topbar-action {
    position: relative;
}

.animate-fadein {
    animation: fadeIn 0.15s ease-in forwards;
}
.animate-fadeout {
    animation: fadeOut 0.15s ease-out forwards;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-5px); }
}
.layout-topbar,
.layout-topbar-action {
    overflow: visible !important;
    z-index: 9999 !important;
}
</style>
