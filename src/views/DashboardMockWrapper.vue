<script setup>
import { computed } from 'vue';
import DashboardAdminMock from '@/views/DashboardAdminMock.vue';
import DashboardClientMock from '@/views/DashboardClientMock.vue';

const role = localStorage.getItem('role') || 'client';

const component = computed(() =>
    role === 'admin' ? DashboardAdminMock : DashboardClientMock
);
</script>

<template>
    <component :is="component" />
</template>
