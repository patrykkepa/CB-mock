<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const { layoutState, setActiveMenuItem, toggleMenu } = useLayout();

const props = defineProps({
    item: {
        type: Object,
        default: () => ({})
    },
    index: {
        type: Number,
        default: 0
    },
    root: {
        type: Boolean,
        default: true
    },
    parentItemKey: {
        type: String,
        default: null
    }
});

const isActiveMenu = ref(false);
const itemKey = ref(null);

onBeforeMount(() => {
    itemKey.value = props.parentItemKey
        ? props.parentItemKey + '-' + props.index
        : String(props.index);

    const activePath = route.path;

    const matchesSelf =
        props.item.to && activePath.startsWith(props.item.to);

    const matchesChild = props.item.items?.some(child =>
        child.to && activePath.startsWith(child.to)
    );

    isActiveMenu.value = matchesSelf || matchesChild;
});

watch(
    () => layoutState.activeMenuItem,
    (newVal) => {
        if (!newVal) {
            isActiveMenu.value = false;
            return;
        }

        isActiveMenu.value =
            newVal === itemKey.value ||
            newVal.startsWith(itemKey.value + '-');
    }
);

function itemClick(event, item) {
    if (item.disabled) {
        event.preventDefault();
        return;
    }

    // ⭐ RĘCZNE ROZWIJANIE/ZWIJANIE SUBMENU
    if (item.items?.length) {
        item.expanded = !item.expanded;
    }

    // Zamknij menu w trybie mobile/overlay po kliknięciu linku
    if ((item.to || item.url) && (layoutState.staticMenuMobileActive || layoutState.overlayMenuActive)) {
        toggleMenu();
    }

    if (item.command) {
        item.command({ originalEvent: event, item: item });
    }

    const foundItemKey = item.items
        ? (isActiveMenu.value ? props.parentItemKey : itemKey.value)
        : itemKey.value;

    setActiveMenuItem(foundItemKey);
}

function checkActiveRoute(item) {
    if (!item.to) return false;
    return route.path === item.to;
}
</script>

<template>
    <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActiveMenu }">
        <div
            v-if="root && item.visible !== false"
            class="layout-menuitem-root-text"
        >
            {{ item.label }}
        </div>

        <!-- Element klikalny dla pozycji z dziećmi lub bez 'to' -->
        <a
            v-if="(!item.to || item.items) && item.visible !== false"
            :href="item.url"
            @click="itemClick($event, item)"
            :class="item.class"
            :target="item.target"
            tabindex="0"
        >
            <i :class="item.icon" class="layout-menuitem-icon"></i>
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i
                class="pi pi-fw pi-angle-down layout-submenu-toggler"
                v-if="item.items"
            ></i>
        </a>

        <!-- Leaf z router-link -->
        <router-link
            v-if="item.to && !item.items && item.visible !== false"
            @click="itemClick($event, item)"
            :class="[item.class, { 'active-route': checkActiveRoute(item) }]"
            tabindex="0"
            :to="item.to"
        >
            <i :class="item.icon" class="layout-menuitem-icon"></i>
            <span class="layout-menuitem-text">{{ item.label }}</span>
        </router-link>

        <!-- Submenu -->
        <Transition
            v-if="item.items && item.visible !== false"
            name="layout-submenu"
        >
            <!-- root → zawsze widoczne; child → zależy od expanded -->
            <ul v-show="root ? true : item.expanded" class="layout-submenu">
                <app-menu-item
                    v-for="(child, i) in item.items"
                    :key="child.to || i"
                    :index="i"
                    :item="child"
                    :parentItemKey="itemKey"
                    :root="false"
                ></app-menu-item>
            </ul>
        </Transition>
    </li>
</template>

<style lang="scss" scoped></style>
