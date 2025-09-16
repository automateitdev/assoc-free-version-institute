<script setup>
import InputText from 'primevue/inputtext';
import Badge from 'primevue/badge';
import { useToast } from 'primevue/usetoast';


import ProgressSpinner from 'primevue/progressspinner';
const toast = useToast();
const showSuccess = (update) => {
    toast.add({ severity: 'success', summary: 'Success', detail: update, life: 3000 });
};
const showError = (toastData) => {
    toast.add({ severity: 'error', summary: 'Error Message', detail: 'Message Content', life: 3000 });
};

import axios from 'axios';
import Toast from 'primevue/toast';
import { FilterMatchMode } from 'primevue/api';

let searchData = ref({
    students: []
});
const data = ref();
const isLoading = ref(false);
const selectedProduct = ref([]);
const passedDataForRefresh = ref();

const editedRowData = ref([]);
const dataForUpdate = ref({
    student_id: [],
    academic_year: '',
    custom_student_id: [],
    class_roll: [],
    student_name: [],
    student_gender: [],
    student_religion: [],

    father_name: [],
    mother_name: [],
    father_mobile: [],
    blood_group: []
});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },


});
const refresher = async () => {
    const { data } = await axios.post('student-update/basic-info-search', passedDataForRefresh.value);

    searchData.value.students = data.payload.data.students;
};
const onUpgrade = async () => {
    onRowEditSave()
    isLoading.value = true;

    const { data } = await axios.post('student-update/basic-info-store', dataForUpdate.value);
    if (data.status === 'success') {
        showSuccess(data.message);
    } else {
        showError(data.message);
    }

    refresher();
    selectedProduct.value = []
    isLoading.value = false;
};
const onRowEditSave = () => {
    let fullData = dataForUpdate.value;
    selectedProduct.value.forEach((i) => {



        fullData.student_id.push(i.student_id);
        fullData.custom_student_id.push(i.custom_student_id);
        console.log(i.custom_student_id);
        fullData.class_roll.push(i.class_roll);
        fullData.student_name.push(i.student_name);
        fullData.student_gender.push(i.student_gender);
        fullData.student_religion.push(i.student_religion);
        fullData.father_name.push(i.father_name);
        fullData.mother_name.push(i.mother_name);
        fullData.father_mobile.push(i.father_mobile);
        if (i.blood_group === null) {
            fullData.blood_group.push('No');
        } else {
            i.push(fullEvent.blood_group);
        }

    })


};


const religeon = ref([
    // Religions
    { label: 'Islam', value: 'Islam' },
    { label: 'Hinduism', value: 'Hinduism' },
    { label: 'Buddhism', value: 'Buddhism' },
    { label: 'Christianity', value: 'Chirstianity' }
]);

const bloodTypes = ref([
    { label: 'No Entry', value: 'No' },
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' }
]);

const genders = ref([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Others', value: 'Others' }
]);

const matchId = (id) => {
    return selectedProduct.value.some(product => product.id === id);
}

const updateStateLogic = computed(() => (selectedProduct.value.length === 0 ? 0 : selectedProduct.value.length));
const bloodGroupPlaceholder = computed(() => (bloodGroup.value === null ? 'Choose' : bloodGroup.value));
const disableLogic = computed(() => (selectedProduct.value.length === 0 ? true : false));
</script>

<template>
    <h1>Basic Info</h1>
    <Toast position="bottom-right" group="br" />
    <SearchForDataTables @coustomChange="(event) => {
        searchData.students = event.students;
    }
        " @getYear="(event) => {
        console.log(event);
        dataForUpdate.academic_year = event.id;
    }
        " @dataForRefresh="(event) => {
        console.log(event);
        passedDataForRefresh = event;
    }
        " getMethodUrl="without-merit-promotion/index" postMethodUrl="student-update/basic-info-search">
    </SearchForDataTables>

    <!-- Datatable start from here -->
    <div class="flex justify-content-center flex-wrap">
        <ProgressSpinner class="flex align-items-center justify-content-center" v-if="isLoading" />
    </div>
    <div class="card p-fluid" v-if="isLoading === false">

        <DataTable v-model:filters="filters"
            :globalFilterFields="['custom_student_id', 'student_name', 'student_gender', 'father_mobile']"
            class="p-datatable-sm" v-model:editingRows="editedRowData" v-model:selection="selectedProduct"
            @row-edit-save="onRowEditSave" :value="searchData.students" showGridlines tableStyle="min-width: 50rem" :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                    bodycell: ({ state }) => ({
                        style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                    })
                }
            }">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <template #header>
                <div class="flex">
                    <div class="w-8"></div>
                    <div class="flex  justify-content-end flex-wrap ">
                        <span class="p-input-icon-left justify-content-end">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        </span>
                    </div>
                </div>
            </template>

            <Column field="custom_student_id" header="Student Id" style="width: 20%">
                <template #body="{ data, field }">
                    <InputText :disabled="!matchId(data.id)" :value="data[field]" v-model="data[field]" />
                </template>
            </Column>
            <Column field="class_roll" header="Roll" style="width: 20%">
                <template #body="{ data, field }">
                    <InputText :disabled="!matchId(data.id)" :value="data[field]" v-model="data[field]" />
                </template>
            </Column>
            <Column field="custom_student_id" header="Student Id" style="width: 20%">
                <template #body="{ data, field }">
                    <InputText :disabled="!matchId(data.id)" :value="data[field]" v-model="data[field]" />
                </template>
            </Column>
            <Column field="student_name" header="Name" style="width: 20%">
                <template #body="{ data, field }">
                    <InputText :disabled="!matchId(data.id)" :value="data[field]" v-model="data[field]" />
                </template>
            </Column>
            <Column field="student_gender" header="Gender">
                <template #body="{ data, field }">
                    <Dropdown v-model="data[field]" :disabled="!matchId(data.id)" :options="genders" optionLabel="label"
                        optionValue="value" placeholder="Select a Gender">
                        <template #option="slotProps">
                            <Tag :value="slotProps.option.value" />
                        </template>
                    </Dropdown>
                </template>

            </Column>
            <Column field="student_religion" header="Religion">
                <template #body="{ data, field }">
                    <Dropdown v-model="data[field]" :disabled="!matchId(data.id)" :options="religeon" optionLabel="label"
                        optionValue="value" placeholder="Select a Religeon">
                        <template #option="slotProps">
                            <Tag :value="slotProps.option.value" />
                        </template>
                    </Dropdown>
                </template>

            </Column>

            <Column field="blood_group" header="Blood">
                <template #body="{ data, field }">
                    <Dropdown v-model="data[field]" :disabled="!matchId(data.id)" :options="bloodTypes" optionLabel="label"
                        optionValue="value" placeholder="Select Blood Type">
                        <template #option="slotProps">
                            <Tag :value="slotProps.option.value === null ? 'No' : slotProps.option.value" />
                        </template>
                    </Dropdown>
                </template>

            </Column>
            <Column field="father_name" header="Father Name" style="width: 20%">
                <template #body="{ data, field }">
                    <InputText :disabled="!matchId(data.id)" :value="data[field]" v-model="data[field]" />
                </template>
            </Column>
            <Column field="mother_name" header="Mother Name" style="width: 20%">
                <template #body="{ data, field }">
                    <InputText :disabled="!matchId(data.id)" :value="data[field]" v-model="data[field]" />
                </template>
            </Column>
            <Column field="father_mobile" header="Mobile No." style="width: 20%">
                <template #body="{ data, field }">
                    <InputText :disabled="!matchId(data.id)" :value="data[field]" v-model="data[field]"
                        inputId="integeronly" placeholder="Enter Number" />
                </template>
            </Column>
            <template #footer>
                <div class="flex justify-content-between ">
                    <Button :disabled="disableLogic" @click="onUpgrade" label="Update"
                        class="align-items-center justify-content-center btn bg-primary mt-4" type="submit" size="small"
                        style="max-width: 30%">Update <Badge :value="updateStateLogic" severity="warning"></Badge></Button>
                </div>
            </template>



        </DataTable>
    </div>
</template>
