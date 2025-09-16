<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from './composables/layout';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';
import useVisibilityChange from '~/composables/useVisibilityChange';
import { useRuntimeConfig } from 'nuxt/app';

const { layoutConfig, onMenuToggle } = useLayout();
const config = useRuntimeConfig();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const { fetchAllData } = useGlobalStore();
const { authorizedUser } = useAuthStore();
const { isAuthenticated, user } = storeToRefs(useAuthStore());
// Mounted hook
onMounted(async () => {
    if (!isAuthenticated) {
        // console.log(isAuthenticated);
        router.push('/auth/login');
    }
});

//  visibility hook
useVisibilityChange(async () => {
    if (!isAuthenticated) {
        router.push('/auth/login');
    }
});
const { authLogout } = useAuthStore();

const showDropDown = ref(false);
onMounted(() => {
    bindOutsideClickListener();
});
onBeforeUnmount(() => {
    unbindOutsideClickListener();
});
const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};

// Example usage of authLogout()
async function handleLogout() {
    await authLogout();
    // Perform additional actions after logout
}
const onSettingsClick = () => {
    showDropDown.value = !showDropDown.value;
    // topbarMenuActive.value = false;
    // router.push('/utilities/documentation');
};

const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };

        document.addEventListener('click', outsideClickListener.value);
    }
};

const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};

const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;
    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
</script>

<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <div v-if="user?.institute_details?.logo" class="mx-auto">
                <img :src="`${config.public.BASE_URL}/storage/${user?.institute_details?.logo}`" alt="Logo" max-width="80px"/>
            </div>
            <div v-else>
                <img src="@/img/dash-logo.png" alt="" max-width="80px"/>
            </div>
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
                <i class="pi pi-calendar"></i>
                <span>Calendar</span>
            </button>
            <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
                <i class="pi pi-user"></i>
                <span>Profile</span>
            </button>
            <button @click="handleLogout()" class="p-link layout-topbar-button">
                <i class="pi pi-sign-out"></i>
                <span>Sign-out</span>
            </button>
        </div>

        <!-- <div class="dropdown_items" v-if="showDropDown">
             <button @click="logout()" class="p-link dropdown_item">
                    <i class="pi pi-sign-out"></i>
                    <span class="mx-2">Logout</span>
            </button>
        </div> -->
    </div>
</template>

<style lang="scss" scoped></style>
