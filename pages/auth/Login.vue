<script setup>
import useVisibilityChange from '~/composables/useVisibilityChange';
import { useLayout } from '../../layouts/composables/layout';
import AppConfig from '../../layouts/AppConfig.vue';

const { layoutConfig } = useLayout();

const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const router = useRouter();
const store = useAuthStore();
const { authenticateUser, authorizedUser } = store;
const { authError, loading, isAuthenticated } = storeToRefs(store);

const user = reactive({
    username: '',
    password: ''
});

async function handleLogin() {
    // Await the authenticateUser action
    const { loginSuccess, error } = await authenticateUser(user);
    if (loginSuccess) {
        router.push('/');
    } else {
        // console.log(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
    }
}

onMounted(async () => {
    if (isAuthenticated) {
        router.push('/');
    }
});

//  visibility hook
useVisibilityChange(async () => {
    if (isAuthenticated) {
        router.push('/');
    }
});

definePageMeta({
    layout: false
});
</script>


<template>
    <Toast position="bottom-right" group="br" />

    <div
        class="surface-ground flex justify-content-center lg:justify-content-end align-items-center min-h-screen min-w-screen overflow-hidden"
        style="background: url('/demo/images/login/institute_portal_bg.jpg'); background-size: cover; background-position: center bottom"
    >
        <div class="rounded px-6 py-8 bg-white lg:mx-8" style="width: 500px; max-width: 500px; border-radius: 5px">
            <h5 class="font-bold text-center m-0">Institute Portal</h5>
            <!-- <img src="@/img/dash-logo.png" alt="Automate" class="block mx-auto w-full" style="max-width: 80px" /> -->
            <br />
            <div>
                <div class="">
                    <label for="emailInput">Username</label>
                    <InputText 
                    id="emailInput" 
                    v-model="user.username" 
                    placeholder="Write Username" 
                    class="w-full mb-2" 
                    required 
                    />
                    <span class="text-danger" v-if="authError.username">{{ authError.username }}</span>
                </div>
                <div class="">
                    <label for="password1">Password</label>
                    <Password id="password1" 
                    v-model="user.password" 
                    placeholder="Enter Your Password" 
                    class="w-full mb-2" 
                    inputClass="w-full"
                    required
                    :feedback="false" 
                    :toggleMask="false" ></Password>
                    <span class="text-danger" v-if="authError.password">{{ authError.password }}</span>
                </div>
                <div class="my-2">
                    <Button label="Sign-in" class="py-0 px-3" icon="pi pi-sign-in" small rounded @click="handleLogin" :loading="loading"></Button>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style lang="scss" scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}
.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
