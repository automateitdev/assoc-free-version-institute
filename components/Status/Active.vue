<script setup>
import DataTable from 'primevue/datatable';
import SearchForDataTablesVue from '../SearchForDataTables.vue';

import { FilterMatchMode } from 'primevue/api';
import { getRequest, postRequest } from '~/utils/request';
import { useToast } from 'primevue/usetoast';
import ProgressSpinner from 'primevue/progressspinner';
const toast = useToast();
const showSuccess = (update) => {
    toast.add({ severity: 'success', summary: 'Success', detail: update, life: 3000 });
};
const showError = (toastData) => {
    toast.add({ severity: 'error', summary: 'Error Message', detail: 'Message Content', life: 3000 });
};

const searchData = ref({
    students: [],
})

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },


});
const isLoading = ref(false)
const yearId = ref('')
const passedDataForRefresh = ref('')
const selectedId = ref({
    student_id: []
})


const selectedProduct = ref([])
const productLength = computed(() => selectedProduct.value.length === 0 ? true : false)
const idFinder = () => {

    selectedProduct.value.forEach(i => {
        selectedId.value.student_id.push(i.student_details.student_id)
    })


}

const refresher = async () => {
    const { data } = await postRequest('student-list', passedDataForRefresh.value);

    console.log(data);
    searchData.value.students = data.students;
};
const setStaus = async () => {
    idFinder()
    console.log(selectedId.value.student_id)
    isLoading.value = true;
    const { data } = await postRequest('students/change-status', selectedId.value)
    if (data.status === 'success') {
        showSuccess(data.message);
    } else {
        showError(data.message);
    }

    refresher();
    selectedProduct.value = []
    isLoading.value = false;
};

const categorical = { categories: [{ coresubcategories: { core_subcategory_name: 'general' } }] }
console.log(categorical.categories[0].coresubcategories.core_subcategory_name)

</script>

<template>
    <Toast position="bottom-right" group="br" />
    <h6 class="text-primary">Active <i class="pi pi-arrow-right"></i> Inactive</h6>
    <SearchForDataTables @coustomChange="(event) => {
        console.log(event)
        searchData.students = event.students.data;

    }
        " @getYear="(event) => {
        console.log(event);
        yearId = event.id;
    }
        " @dataForRefresh="(event) => {
        console.log(event);
        passedDataForRefresh = event;
    }
        " getMethodUrl="without-merit-promotion/index" postMethodUrl="student-list">
    </SearchForDataTables>
    <div class="flex justify-content-center flex-wrap" v-if="isLoading">
        <ProgressSpinner class="flex align-items-center justify-content-center" />
    </div>
    <div class="card" v-if="isLoading === false">

        <DataTable class="p-datatable-sm"
            :globalFilterFields="['student_details.student_id', 'student_details.student_name', 'student_details.class_roll', 'student_details.student_gender']"
            v-model:filters="filters" paginator :rows="10" filterDisplay="row" v-model:selection="selectedProduct"
            :value="searchData.students">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <template #header>
                <div class="flex justify-content-end">
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    </span>
                </div>
            </template>

            <Column field="student_details.student_id" header="Student Id"></Column>
            <Column field="student_details.student_name" header="Name"></Column>
            <Column field="class_roll" header="Roll"></Column>
            <Column field="student_details.student_gender" header="Gender"></Column>
            <Column field="academicsession.coresubcategories.core_subcategory_name" header="Session"></Column>
            <Column field="categories.coresubcategories.core_subcategory_name" header="Category">
            </Column>
            <Column header="Status">
                <template #body>
                    <Badge value="Active" severity="success"></Badge>

                </template>
            </Column>


            <template #footer>
                <div class="w-full ">
                    <div class="flex justify-content-end flex-wrap">
                        <Button :disabled="productLength"
                            class="flex align-items-center justify-content-center btn bg-primary mt-4" size="small"
                            @click="setStaus"><span class="font-bold">Inactivate</span>
                            <Badge :value="selectedProduct.length" severity="warning"></Badge>
                        </Button>
                    </div>
                </div>


            </template>
        </DataTable>

    </div>
</template>
~/utils/request