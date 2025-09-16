<script setup>
const filters = ref();
import { FilterMatchMode, FilterOperator } from 'primevue/api';
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        'coresubcategory_details.corecategory.core_category_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'coresubcategory_details.core_subcategory_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
    };
};

initFilters();
import request from '~/utils/request';

// const $axios = axios().provide.axios;

import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useGlobalStore } from '~/stores';

import { useToast } from 'primevue/usetoast';
import axios from 'axios';
const toast = useToast();

const { fetchCoreCategories, getSubcategoryByCategory } = useGlobalStore();

const visible = ref(false);
const isUpdating = ref(false);
let coreCategoriesDisplay = ref([]);
let coreCategoriesForStore = ref([]);
let formData = reactive({
    core_category_id: null,
    details: []
});

let modalFormData = reactive({
    core_category_id: null,
    core_subcategory_name: null
});

let modalFormError = reactive({
    core_category_id: null,
    core_subcategory_name: null
});

onMounted(async () => {
    fetchCoreCategories();
    loadCategories();
});

//  visibility hook
useVisibilityChange(async () => {
    fetchCoreCategories();
    loadCategories();
});

const { coreCategories, coreSubCategories } = storeToRefs(useGlobalStore());

async function loadCategories() {
    try {
        const response = await axios.get('/core-institute'); // Make sure the URL is correct
        const data = response.data.payload.data;
        coreCategoriesForStore.value = data.corecategories;
        coreCategoriesDisplay.value = data.coreInstituteConfig;
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}
async function handleForm() {
    if (formData.details.length > 0) {
        let ids = formData.details.map((item) => item.id);
        try {
            isUpdating.value = true;
            const { data } = await axios.post('core-institute/store', {
                coresubcategory_details_id: ids
            });

            if (data.payload.data.status == 'success') {
                toast.add({ severity: 'success', summary: data.message, detail: data.message, life: 3000 });
                formData.core_category_id = null;
                formData.details = [];
                fetchCoreCategories();
                loadCategories();
            }
        } catch (error) {
            if (error.response.data.payload.data.status === 'error') {
                toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
            }
        } finally {
            fetchCoreCategories();
            loadCategories();
            isUpdating.value = false;
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
    }
}
async function submitCoreCategory() {
    if (modalFormData.core_category_id && modalFormData.core_subcategory_name) {
        try {
            isUpdating.value = true;
            const response = await axios.post('core-subcategories/store', {
                core_category_id: modalFormData.core_category_id.id,
                core_subcategory_name: modalFormData.core_subcategory_name
            });

            if (response?.data?.payload.data.status == 'success') {
                toast.add({ severity: 'success', summary: response.data.message, detail: response.data.message, life: 3000 });
                visible.value = false;
                modalFormData = {};

                fetchCoreCategories();
                loadCategories();
            }
        } catch (error) {
            if (error?.response?.data?.status === 'error') {
                toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
            }
        } finally {
            fetchCoreCategories();
            loadCategories();
            isUpdating.value = false;
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
    }
}
</script>

<template>
    <Toast position="bottom-right" group="br" />

    <div>
        <div class="card">
            <form action="" @submit.prevent="handleForm">
                <div class="grid">
                    <div class="md:col-4">
                        <label for="" class="mb-2"><b>Category Type : </b></label> <br />
                        <Dropdown class="w-full" filter :options="coreCategoriesForStore" optionLabel="core_category_name" placeholder="Select a Category" v-model="formData.core_category_id" @change="getSubcategoryByCategory" />
                    </div>
                    <div class="md:col-4">
                        <label for="" class="mb-2"><b>Select Subcategory:</b> </label> <br />
                        <MultiSelect class="w-full" filter v-model="formData.details" display="chip" :options="coreSubCategories" optionLabel="core_subcategory_name" placeholder="Select Subcategories" />
                    </div>
                    <div class="md:col-4 align-self-left mt-5">
                        <Button label="Submit" type="submit" size="small" />
                    </div>
                </div>
            </form>
        </div>
        <div class="card mt-3">
            <DataTable
                v-model:filters="filters"
                dataKey="id"
                filterDisplay="menu"
                :globalFilterFields="['core_category_name', 'core_subcategory_name']"
                :value="coreCategoriesDisplay"
                showGridlines
                paginator
                :rows="5"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                let-i="rowIndex"
            >
                <template #empty> No Data found. </template>
                <template #loading>
                    <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                        <g fill="none" stroke="rgb(237, 251, 251)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <path d="M3 12a9 9 0 0 0 9 9a9 9 0 0 0 9-9a9 9 0 0 0-9-9" stroke-dasharray="18 18" stroke-dashoffset="18">
                                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" fill="freeze" />
                            </path>

                            <path d="M17 12a5 5 0 1 0-5 5" stroke-dasharray="10 10" stroke-dashoffset="10">
                                <animateTransform attributeName="transform" type="rotate" from="360 12 12" to="0 12 12" dur="1s" repeatCount="indefinite" fill="freeze" />
                            </path>
                        </g>
                    </svg>
                </template>
                <template #header>
                    <div class="flex justify-content-between">
                        <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        </span>
                    </div>
                </template>
                <Column sortable field="core_category_name" header="Category" class="text-capitalize"></Column>
                <Column sortable field="core_subcategory_name" header="Sub Category" class="text-capitalize"></Column>
            </DataTable>
        </div>
    </div>

    <Dialog v-model:visible="visible" modal header="Add new option in Startup">
        <form action="" @submit.prevent="submitCoreCategory">
            <div class="grid">
                <div class="md:col-5">
                    <label for="" class="mb-2"><b>Startup Category : </b></label> <br />
                    <Dropdown class="w-full" :options="coreCategories" optionLabel="core_category_name" placeholder="Select a Category" v-model="modalFormData.core_category_id" />
                </div>
                <div class="md:col-5">
                    <label for="" class="mb-2"><b>Startup Subcategory :</b> </label> <br />
                    <InputText class="w-full" type="text" v-model="modalFormData.core_subcategory_name" />
                </div>
                <div class="md:col-2 align-self-end">
                    <Button label="Submit" type="submit" size="small" />
                </div>
            </div>
        </form>
    </Dialog>
</template>

<style lang="scss" scoped></style>
