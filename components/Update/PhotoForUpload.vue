import type { log } from 'console';

<script setup>
import InputText from 'primevue/inputtext';
import Badge from 'primevue/badge';
import { useToast } from 'primevue/usetoast';
import { postRequest } from '~/utils/request';
import Toast from 'primevue/toast';
import { FilterMatchMode } from 'primevue/api';

import ProgressSpinner from 'primevue/progressspinner';
const toast = useToast();
const showSuccess = (update) => {
    toast.add({ severity: 'success', summary: 'Success', detail: update, life: 3000 });
};
const showError = (toastData) => {
    toast.add({ severity: 'error', summary: 'Error Message', detail: 'Message Content', life: 3000 });
};

let searchData = ref({
    students: []
});
const data = ref();
const isLoading = ref(false);
const selectedProduct = ref([]);
const passedDataForRefresh = ref();
const genders = ref([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Others', value: 'Others' }
]);
const vectorImage = ref('https://www.perfectpassportphotos.com/img/img_placeholder_avatar.jpg');
const editedRowData = ref([]);
const dataOfImages = ref([]);
const dataForUpdate = ref({
    student_id: [],
    academic_year: '',
    custom_student_id: [],
    class_roll: [],
    student_name: [],
    student_gender: []
    // student_religion: [],

    // father_name: [],
    // mother_name: [],
    // father_mobile: [],
    // blood_group: []
});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const refresher = async () => {
    const { data } = await postRequest('student-update/basic-info-search', passedDataForRefresh.value);

    console.log(data);
    searchData.value.students = data.students;
};
const onUpgrade = async () => {
    onRowEditSave();
    isLoading.value = true;

    const { data } = await postRequest('student-update/basic-info-store', dataForUpdate.value);
    if (data.status === 'success') {
        showSuccess(data.message);
    } else {
        showError(data.message);
    }

    refresher();
    selectedProduct.value = [];
    isLoading.value = false;
};

const imgFinder = () => {
    searchData.value.students.forEach((i) => {
        dataOfImages.value.push({ id: i.id, src: i.student_dob === null ? vectorImage.value : i.student_dob });
    });

    console.log(dataOfImages.value);
};

const srcFinder = (id) => {
    const imageProxy = ref('');
    dataOfImages.value.forEach((i) => {
        if (i.id === id) {
            imageProxy.value = i.src;
        }
    });

    return imageProxy.value;
};

// const onRowEditSave = () => {
//     let fullData = dataForUpdate.value;
//     selectedProduct.value.forEach((i) => {

//         fullData.student_id.push(i.student_id);
//         fullData.custom_student_id.push(i.custom_student_id);
//         console.log(i.custom_student_id);
//         fullData.class_roll.push(i.class_roll);
//         fullData.student_name.push(i.student_name);
//         fullData.student_gender.push(i.student_gender);
//         // fullData.student_religion.push(i.student_religion);
//         // fullData.father_name.push(i.father_name);
//         // fullData.mother_name.push(i.mother_name);
//         // fullData.father_mobile.push(i.father_mobile);
//         // if (i.blood_group === null) {
//         //     fullData.blood_group.push('No');
//         // } else {
//         //     i.push(fullEvent.blood_group);
//         // }

//     })

// };

const onUpload = ($event, id) => {
    console.log($event);
    dataOfImages.value.forEach((i, j) => {
        // $event.files[0]
        if (i.id == id) {
            dataOfImages.value[j].src = $event.files[0].objectURL;
        }
    });

    console.log(id);
};

const matchId = (id) => {
    return selectedProduct.value.some((product) => product.id === id);
};

const updateStateLogic = computed(() => (selectedProduct.value.length === 0 ? 0 : selectedProduct.value.length));
const bloodGroupPlaceholder = computed(() => (bloodGroup.value === null ? 'Choose' : bloodGroup.value));
const disableLogic = computed(() => (selectedProduct.value.length === 0 ? true : false));
</script>

<template>
    <h1>Photo Upload</h1>
    <Toast position="bottom-right" group="br" />

    <SearchForDataTables
        @coustomChange="
            (event) => {
                searchData.students = event.students;
                imgFinder();
            }
        "
        @getYear="
            (event) => {
                console.log(event);
                dataForUpdate.academic_year = event.id;
            }
        "
        @dataForRefresh="
            (event) => {
                console.log(event);

                passedDataForRefresh = event;
            }
        "
        getMethodUrl="without-merit-promotion/index"
        postMethodUrl="student-update/basic-info-search"
    >
    </SearchForDataTables>

    <!-- Datatable start from here -->
    <div class="flex justify-content-center">
        <ProgressSpinner class="flex align-items-center justify-content-center" v-if="isLoading" />
    </div>
    <div class="card p-fluid" v-if="isLoading === false">
        <DataTable
            v-model:filters="filters"
            :globalFilterFields="['custom_student_id', 'student_name', 'student_gender', 'father_mobile']"
            class="p-datatable-sm"
            v-model:editingRows="editedRowData"
            v-model:selection="selectedProduct"
            @row-edit-save="onRowEditSave"
            :value="searchData.students"
            showGridlines
            tableStyle="min-width: 50rem"
            :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                    bodycell: ({ state }) => ({
                        style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                    })
                }
            }"
        >
            <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
            <template #header>
                <div class="flex">
                    <div class="w-8"></div>
                    <div class="flex justify-content-end flex-wrap">
                        <span class="p-input-icon-left justify-content-end">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        </span>
                    </div>
                </div>
            </template>
            <Column header="Upload Photo">
                <template #body="{ data }">
                    <div class="flex gap-0 justify-content-evenly">
                        <div class="flex justify-content-between">
                            <div class="sizeSet flex align-items-center p-0 m-0 justify-content-center">
                                <Image :src="srcFinder(data.id)" alt="Image" width="75" height="75" />
                            </div>
                        </div>
                        <div class="flex justify-content-center">
                            <div class="flex flex-column justify-content-center">
                                <FileUpload v-model="data.imageUpload" mode="basic" class="btn bg-primary btn-sm" name="demo[]" :auto="true" chooseLabel="Upload" accept="image/*" :maxFileSize="1000000" @upload="onUpload($event, data.id)">
                                </FileUpload>
                            </div>
                        </div>
                    </div>
                </template>
            </Column>

            <Column field="custom_student_id" header="Student Id" style="width: 20%">
                <!-- <template #body="{ data, field }">
                    <InputText :disabled="!matchId(data.id)" :value="data[field]" v-model="data[field]" />
                </template> -->
            </Column>
            <Column field="class_roll" header="Roll" style="width: 20%">
                <!-- <template #body="{ data, field }">
                    <InputText :disabled="!matchId(data.id)" :value="data[field]" v-model="data[field]" />
                </template> -->
            </Column>

            <Column field="student_name" header="Name" style="width: 20%">
                <!-- <template #body="{ data, field }">
                    <InputText :disabled="!matchId(data.id)" :value="data[field]" v-model="data[field]" />
                </template> -->
            </Column>
            <Column field="student_gender" header="Gender">
                <!-- <template #body="{ data, field }">
                    <Dropdown v-model="data[field]" :disabled="!matchId(data.id)" :options="genders" optionLabel="label"
                        optionValue="value" placeholder="Select a Gender">
                        <template #option="slotProps">
                            <Tag :value="slotProps.option.value" />
                        </template>
                    </Dropdown>
                </template> -->
            </Column>

            <template #footer>
                <div class="flex justify-content-between">
                    <Button :disabled="disableLogic" @click="onUpgrade" label="Update" class="align-items-center justify-content-center btn bg-primary mt-4" type="submit" size="small" style="max-width: 30%"
                        >Update <Badge :value="updateStateLogic" severity="warning"></Badge
                    ></Button>
                </div>
            </template>
        </DataTable>
    </div>
</template>
~/utils/request
