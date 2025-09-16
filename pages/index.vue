<script setup>
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';
import { useAuthStore } from '~/stores/auth';
import useVisibilityChange from '~/composables/useVisibilityChange';
import { useRuntimeConfig } from 'nuxt/app';
const { fetchAllData } = useGlobalStore();
const { authorizedUser } = useAuthStore();
const { isAuthenticated, user } = storeToRefs(useAuthStore());
const config = useRuntimeConfig();
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
</script>

<template>
    <div>
        <div class="card">
            <div class="grid gap-3 justify-content-start align-items-center">
                <div class="md:col-1 align-self-center" v-if="user?.institute_details?.logo">
                    <img :src="`${config.public.BASE_URL}/storage/${user?.institute_details?.logo}`" alt="Logo" class="w-full" max-width="120px" />
                </div>
                <div class="md:col-1 align-self-center" v-else>
                    <img src="@/img/dash-logo.png" alt="Logo" class="w-full" max-width="120px" />
                </div>
                <div class="md:col-8 align-self-center">
                    <h5>Institute ID: {{ user?.institute_details?.institute_id }}</h5>
                    <h3 class="m-0 text-green-500 font-bold">{{ user?.institute_details?.institute_name }}</h3>
                    <h5 class="m-0">{{ user?.institute_details?.institute_address }}</h5>
                </div>
            </div>
        </div>

        <div class="grid">
            <div class="col-12 md:col-4">
                <div class="card">
                    <div class="grid align-items-baseline">
                        <div>
                            <Icon name="formkit:avatarman" color="#ddd" size="80px" />
                        </div>
                        <div class="ml-2">
                            <h4 class="m-0 capitalize">{{ user?.name }}</h4>
                            <p class="m-0">{{ user?.email }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="grid">
                    <div class="col-12 lg:col-6 mb-sm-3">
                        <div class="card text-center box">
                            <div class="flex align-items-center justify-content-center bg-blue-100 border-round mx-auto" style="width: 3rem; height: 3rem"><i class="pi pi-users text-blue-500 text-xl"></i></div>

                            <h5><b>Students</b></h5>
                            <!-- <span>20,000</span> -->
                        </div>
                    </div>

                    <div class="col-12 lg:col-6 mb-sm-3">
                        <div class="card text-center box">
                            <div class="flex align-items-center justify-content-center bg-orange-100 border-round mx-auto" style="width: 3rem; height: 3rem"><i class="pi pi-sort-alt text-orange-500 text-xl"></i></div>
                            <h5><b>Transactions</b></h5>
                            <!-- <span>310</span> -->
                        </div>
                    </div>

                    <div class="col-12 lg:col-6 mb-sm-3">
                        <div class="card text-center box">
                            <div class="flex align-items-center justify-content-center bg-cyan-100 border-round mx-auto" style="width: 3rem; height: 3rem"><i class="pi pi-inbox text-cyan-500 text-xl"></i></div>
                            <h5><b>Total</b></h5>
                            <!-- <span>31,32,651315</span> -->
                        </div>
                    </div>

                    <div class="col-12 lg:col-6 mb-sm-3">
                        <div class="card text-center box">
                            <div class="flex align-items-center justify-content-center bg-purple-100 border-round mx-auto" style="width: 3rem; height: 3rem"><i class="pi pi-th-large text-purple-500 text-xl"></i></div>
                            <h5><b>Institute ID</b></h5>
                            <!-- <span>100</span> -->
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-12 md:col-4">
                <div class="card">
                    <Calendar v-model="date" inline showWeek class="w-full" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
