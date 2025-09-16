<script setup>
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { storeToRefs } from 'pinia';
import { FilterMatchMode } from 'primevue/api';
import { useFeeAmountStore } from '~/stores/feeAmountStore';
import axios from 'axios';

const toast = useToast();
const confirm = useConfirm();

const requireConfirmation = (event) => {
    confirm.require({
        target: event.currentTarget,
        group: 'headless',
        message: 'Save New Amount?',
        accept: () => {
            handleFeeAmountUpdate();
        },
        reject: () => {
            toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
        }
    });
};

const isLoading = ref(false);
const config = useRuntimeConfig();
// const $axios = axios().provide.axios;
const { fetchFeeAmountIndex, storeFeeAmount } = useFeeAmountStore();
const { amountIndexData } = storeToRefs(useFeeAmountStore());

onMounted(async () => {
    fetchFeeAmountIndex();
});

const feefilters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'fee_head_id.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'fee_subhead_id.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'fund_id.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'ledger_id.name': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const studentwise_feefilters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    custom_student_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    student_name: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Data for the Class Dropdown

// Selected Class and Group
const selectedClass = ref(null);
const selectedGroup = ref(null);
const selectCategory = ref(null);
const selectedAcademicYear = ref(null);
const searchByAcademicYear = ref(null);
const selectedFeehead = ref(null);

const editingRows = ref([]);
const selectedStudentWiseFeeAmount = ref([]);
const StudentWiseSelectedClass = ref(null);
const StudentWiseSelectedGroup = ref(null);
const StudentWiseSelectCategory = ref(null);
const StudentWiseSelectedAcademicYear = ref(null);
const StudentWiseSelectedFeehead = ref(null);

const new_feeamount = ref();
const new_fineamount = ref();

// Options for the Group Dropdown
const groupOptions = ref([]);

const feeAmountSetup_classwise = ref([]);
const feeAmountDataToEdit = ref([]);

// Method to handle class selection
const handleClassSelection = () => {
    // Find the selected class from the instituteClassMap
    const selectedClassData = amountIndexData.value.instituteClassMaps.find((item) => item.class_id === selectedClass.value.class_id);

    // Extract associated unique groups using a Set and a custom comparison function
    const uniqueGroups = new Set(
        selectedClassData.class_details.map((detail) => {
            const groups = detail.groups;
            return groups ? groups.core_subcategory_name : null;
        })
    );

    // Remove null values and convert the Set back to an array
    const groups = Array.from(uniqueGroups)
        .filter(Boolean)
        .map((core_subcategory_name) => ({
            label: core_subcategory_name,
            value: selectedClassData.class_details.find((detail) => detail.groups && detail.groups.core_subcategory_name === core_subcategory_name).groups
        }));
    groupOptions.value = groups;
};

const handleClassSelectionStudentWise = () => {
    // Find the selected class from the instituteClassMap
    const selectedClassData = amountIndexData.value.instituteClassMaps.find((item) => item.class_id === StudentWiseSelectedClass.value.class_id);

    // Extract associated unique groups using a Set and a custom comparison function
    const uniqueGroups = new Set(
        selectedClassData.class_details.map((detail) => {
            const groups = detail.groups;
            return groups ? groups.core_subcategory_name : null;
        })
    );

    // Remove null values and convert the Set back to an array
    const groups = Array.from(uniqueGroups)
        .filter(Boolean)
        .map((core_subcategory_name) => ({
            label: core_subcategory_name,
            value: selectedClassData.class_details.find((detail) => detail.groups && detail.groups.core_subcategory_name === core_subcategory_name).groups
        }));
    groupOptions.value = groups;
};

const formData_feeamount = reactive({
    class_id: null,
    group_id: null,
    academic_year_id: null,
    student_category_id: null,
    fee_head_id: null,
    fee_amount: null,
    fine_amount: null
});

async function handleFeeheadAmountSubmit() {
    if (selectedAcademicYear.value && selectedClass.value && selectedGroup.value && new_feeamount.value && selectedFeehead.value) {
        (formData_feeamount.class_id = selectedClass.value.class_id),
            (formData_feeamount.group_id = selectedGroup.value.value.id),
            (formData_feeamount.academic_year_id = selectedAcademicYear.value.id),
            (formData_feeamount.student_category_id = selectCategory.value.id),
            (formData_feeamount.fee_head_id = selectedFeehead.value.id),
            (formData_feeamount.fee_amount = new_feeamount.value),
            (formData_feeamount.fine_amount = new_fineamount.value);
        const {success, message, error} = await storeFeeAmount(formData_feeamount);
        if (success) {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 3000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
    }
}

async function SearchForSettings() {
    try {
        const { data } = await axios.post(`fees-management/amount-setting/class-wise-feeamount/view`, {
            academic_year_id: searchByAcademicYear.value.id
        });
        feeAmountSetup_classwise.value = data.payload.data.classwiseFeeAmountSetup;
    } catch (error) {
        console.log(error);
    }
}

const studentWiseFeeAmounts = ref();

async function StudentWiseFeeheadSearch() {
    isLoading.value = true;
    try {
        const { data } = await axios.post(`fees-management/amount-setting/student-wise/search`, {
            academic_year_id: StudentWiseSelectedAcademicYear.value.id,
            class_id: StudentWiseSelectedClass.value.class_id,
            group_id: StudentWiseSelectedGroup.value.value.id,
            student_category_id: StudentWiseSelectCategory.value.id,
            fee_head_id: StudentWiseSelectedFeehead.value.id
        });
        studentWiseFeeAmounts.value = data.payload.data.studentaWiseAmounts;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false;
    }
}

const isApplyChange = ref(false);
const onRowEditSave = (event) => {
    let { newData, index } = event;
    isApplyChange.value = true;
    studentWiseFeeAmounts.value[index] = newData;
};

async function applyRowEditSave() {
    isLoading.value = true;
    const student_ids = [];
    const fee_amounts = [];
    const fine_amounts = [];
    studentWiseFeeAmounts.value.map((item, i) => {
        student_ids.push(item.student_id);
        fee_amounts.push(item.fee_amount ?? 0);
        fine_amounts.push(item.fine_amount ?? 0);
    });
    try {
        const { data } = await axios.post(`fees-management/amount-setting/student-wise/store`, {
            academic_year_id: StudentWiseSelectedAcademicYear.value.id,
            class_id: StudentWiseSelectedClass.value.class_id,
            group_id: StudentWiseSelectedGroup.value.value.id,
            student_category_id: StudentWiseSelectCategory.value.id,
            fee_head_id: StudentWiseSelectedFeehead.value.id,
            student_id: student_ids,
            fee_amount: fee_amounts,
            fine_amount: fine_amounts
        });
        if (data.payload.data.status == 'success') {
            toast.add({ severity: 'success', summary: data.message, detail: data.payload.data.message ?? 'Successfully Updated', life: 3000 });
            await StudentWiseFeeheadSearch();
        }
    } catch (error) {
        if (error.data.payload.data.status == 'error') {
            toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Entry', life: 3000 });
        }
        console.log(error);
    } finally {
        isLoading.value = false;
    }
}

let fd = ref(new FormData());
const excelFile = ref();
async function handleExcelFile($event) {
    excelFile.value = $event.target.files ? $event.target.files[0] : null;
    fd.value.append('excel_file', excelFile.value);
}

async function uploadEditedExcel() {
    isLoading.value = true;
    fd.value.append('academic_year_id', StudentWiseSelectedAcademicYear.value.id);
    fd.value.append('class_id', StudentWiseSelectedClass.value.class_id);
    fd.value.append('group_id', StudentWiseSelectedGroup.value.value.id);
    fd.value.append('student_category_id', StudentWiseSelectCategory.value.id);
    fd.value.append('fee_head_id', StudentWiseSelectedFeehead.value.id);
    try {
        const { data } = await axios.post(`fees-management/amount-setting/student-wise/store`, fd.value);
        if (data.payload.data.status == 'success') {
            toast.add({ severity: 'success', summary: data.message, detail: data.payload.data.message ?? 'Successfully Updated from Excel', life: 3000 });
            await StudentWiseFeeheadSearch();
        }
    } catch (error) {
        if (error.data.payload.data.status == 'error') {
            toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Entry', life: 3000 });
        }
        console.log(error);
    } finally {
        isLoading.value = false;
    }
}

async function downloadGeneratedExcel() {
    const custom_student_id = [];
    const student_name = [];
    const fee_amount = [];
    const fine_amount = [];

    // Assuming selectedStudentWiseFeeAmount.value is an array
    await Promise.all(
        selectedStudentWiseFeeAmount.value.map(async (item) => {
            custom_student_id.push(item.custom_student_id ?? null);
            student_name.push(item.student_name ?? null);
            fee_amount.push(item.fee_amount ?? null);
            fine_amount.push(item.fine_amount ?? null);
        })
    );

    const { data } = await axios.post(`fees-management/amount-setting/student-wise/excel-generate`, {
        custom_student_id: custom_student_id,
        student_name: student_name,
        fee_amount: fee_amount,
        fine_amount: fine_amount
    });

    if (data.payload.data.status == 'success') {
        window.open(`${config.public.BASE_URL}${data.payload.data.url}`, '_blank');
    } else {
        toast.add({ severity: 'error', summary: 'Something went wrong!', detail: 'Something Went Wrong! Try later.', life: 3000 });
    }

    // Once all data is prepared, proceed with downloading Excel
    // Example: You can use a library like exceljs to generate Excel file
}

async function searchClasswiseFeeamount(feeamount_id) {
    try {
        const { data } = await axios.get(`fees-management/amount-setting/class-wise-feeamount/edit/${feeamount_id}`);
        console.log(data);
        feeAmountDataToEdit.value = data.payload.data.feeamounts;
    } catch (error) {
        console.log(error);
    }
}

let visible = ref(false);
let editVisible = ref(false);
let selectedToDelete = ref();
let selectedToEdit = ref();
let deleteFrom = ref();
function showConfirmation(data, type) {
    // console.log(data, type);
    // deleteFrom.value = type;
    visible.value = true;
    selectedToDelete.value = data;
}

async function handleFeeAmountUpdate() {
    if (feeAmountDataToEdit.value.length > 0) {
        isLoading.value = true;

        try {
            const { data } = await axios.post(`fees-management/amount-setting/class-wise-feeamount/update`, {
                class_id: feeAmountDataToEdit.value[0].class_id,
                group_id: feeAmountDataToEdit.value[0].group_id,
                academic_year_id: feeAmountDataToEdit.value[0].academic_year_id,
                student_category_id: feeAmountDataToEdit.value[0].student_category_id,
                fee_head_id: feeAmountDataToEdit.value[0].fee_head_id,
                fee_amount: feeAmountDataToEdit.value[0].fee_amount,
                fine_amount: feeAmountDataToEdit.value[0].fine_amount
            });

            if (data.payload.data.status === 'success') {
                toast.add({ severity: 'success', summary: data.message, detail: data.payload.data.message, life: 3000 });
            }
            SearchForSettings();
        } catch (error) {
            console.log(error);
            toast.add({ severity: 'warn', summary: data.message != null ? data.message : 'Sorry, Try Later', detail: 'Missing form value.', life: 3000 });
        } finally {
            isLoading.value = false;
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
    }
}

function showEditModal(data) {
    searchClasswiseFeeamount(data.id);
    editVisible.value = true;
    selectedToEdit.value = data;
}

async function deleteItem() {
    const endpointMap = {
        feehead: 'fees-management/startup/feehead/delete/',
        feesubhead: 'fees-management/startup/feesubhead/delete/',
        waiver: 'fees-management/startup/feesubhead/delete/',
        fund: 'fees-management/startup/fund/delete/',
        ledger: 'fees-management/startup/ledger/delete/'
    };

    const deleteUrl = `${endpointMap[deleteFrom.value]}${selectedToDelete.value.id}`;
    try {
        const { data } = await axios.delete(deleteUrl, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });

        if (data.status === 'success') {
            toast.add({ severity: 'success', summary: data.message, detail: data.payload.data.message, life: 3000 });
            await fetchFeeStartups();
            new_ledgerName.value = null;
            selected_accountCategory.value = null;
            accountGroupData.value = null;
        }
    } catch (error) {
        if (error.response.data.status === 'error') {
            toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
        }
    }
    visible.value = false;
}
</script>
<template>
    <Toast position="bottom-right" group="br" />

    <TabView class="card">
        <TabPanel header="Classwise Amount">
            <div class="grid align-items-end">
                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Academic Year</label>
                    <Dropdown v-model="selectedAcademicYear" :options="amountIndexData.academicYears" filter optionLabel="core_subcategory_name" placeholder="Academic Year" class="w-full">
                        <template #option="slotProps">
                            <div class="flex align-items-center">
                                <div>{{ slotProps.option.core_subcategory_name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Class</label>
                    <Dropdown v-model="selectedClass" :disabled="!selectedAcademicYear" :options="amountIndexData.instituteClassMaps" @change="handleClassSelection" filter optionLabel="class_name" placeholder="Select Class" class="w-full">
                        <template #option="slotProps">
                            <div class="flex align-items-center">
                                <div>{{ slotProps.option.class_name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Group</label>
                    <Dropdown v-model="selectedGroup" :disabled="!selectedClass" :options="groupOptions" filter optionLabel="label" placeholder="Select Group" class="w-full"> </Dropdown>
                </div>

                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Student Category</label>
                    <Dropdown :disabled="!selectedGroup" v-model="selectCategory" :options="amountIndexData.category" filter optionLabel="core_subcategory_name" placeholder="Category" class="w-full">
                        <template #option="slotProps">
                            <div class="flex align-items-center">
                                <div>{{ slotProps.option.core_subcategory_name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Fee head</label>
                    <Dropdown v-model="selectedFeehead" :disabled="!selectCategory" :options="amountIndexData.feeHead" filter optionLabel="name" placeholder="Fee Head" class="w-full">
                        <template #option="slotProps">
                            <div class="flex align-items-center">
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Fee Amount</label>
                    <InputNumber v-model="new_feeamount" class="w-full" placeholder="Fee Amount" inputId="locale-user" :minFractionDigits="2" />
                </div>

                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Fine Amount</label>
                    <InputNumber v-model="new_fineamount" class="w-full" placeholder="Fine Amount" inputId="locale-user" :minFractionDigits="2" />
                </div>
                <div class="md:col-4 mb-3">
                    <Button class="" :disabled="!selectedFeehead || !new_feeamount" label="Apply" size="small" icon="pi pi-check" @click="handleFeeheadAmountSubmit" />
                </div>

                <h4 class="col-12">Search By Academic Year</h4>

                <div class="md:col-3">
                    <Dropdown v-model="searchByAcademicYear" :options="amountIndexData.academicYears" filter optionLabel="core_subcategory_name" placeholder="Academic Year" class="w-full">
                        <template #option="slotProps">
                            <div class="flex align-items-center">
                                <div>{{ slotProps.option.core_subcategory_name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                </div>
                <div class="md:col-3">
                    <Button label="Search" icon="pi pi-search" class="p-button-primary p-mr-2" size="small" @click="SearchForSettings" />
                </div>

                <div class="md:col-12 my-3">
                    <DataTable
                        v-if="feeAmountSetup_classwise"
                        v-model:filters="feefilters"
                        :value="feeAmountSetup_classwise"
                        paginator
                        :rows="5"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        dataKey="id"
                        filterDisplay="grid"
                        stripedRows
                        show-gridlines
                        :loading="isLoading"
                        class="p-datatable-sm"
                    >
                        <template #header>
                            <div class="flex justify-content-end">
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText v-model="feefilters['global'].value" placeholder="Keyword Search" />
                                </span>
                            </div>
                        </template>
                        <template #empty> No settings found. </template>
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

                        <Column header="Class" filterField="class_id">
                            <template #body="{ data }">
                                <div class="flex justify-content-left gap-2">
                                    <span class="text-center">{{ data.class_id }}</span>
                                </div>
                            </template>
                            <!-- <template #filter="{ filterModel, filterCallback }">
                                <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fee Head" />
                            </template> -->
                        </Column>

                        <Column header="Group" filterField="group_id">
                            <template #body="{ data }">
                                <div class="flex justify-content-left gap-2">
                                    <span class="text-center">{{ data.group_id }}</span>
                                </div>
                            </template>
                            <!-- <template #filter="{ filterModel, filterCallback }">
                                <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fee Head" />
                            </template> -->
                        </Column>

                        <Column header="Category" filterField="student_category_id">
                            <template #body="{ data }">
                                <div class="flex justify-content-left gap-2">
                                    <span class="text-center">{{ data.student_category_id }}</span>
                                </div>
                            </template>
                            <!-- <template #filter="{ filterModel, filterCallback }">
                                <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fee Head" />
                            </template> -->
                        </Column>

                        <Column header="Fee Head" filterField="fee_head_id">
                            <template #body="{ data }">
                                <div class="flex justify-content-left gap-2">
                                    <span class="text-center">{{ data.fee_head_id }}</span>
                                </div>
                            </template>
                            <!-- <template #filter="{ filterModel, filterCallback }">
                                <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fee Head" />
                            </template> -->
                        </Column>

                        <Column header="Fee Amount" filterField="fee_amount">
                            <template #body="{ data }">
                                <div class="flex justify-content-left gap-2">
                                    <span class="text-center">{{ data.fee_amount }}</span>
                                </div>
                            </template>
                            <!-- <template #filter="{ filterModel, filterCallback }">
                                <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fee Head" />
                            </template> -->
                        </Column>

                        <Column header="Fine Amount" filterField="fine_amount">
                            <template #body="{ data }">
                                <div class="flex justify-content-left gap-2">
                                    <span class="text-center">{{ data.fine_amount }}</span>
                                </div>
                            </template>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fee Head" />
                            </template>
                        </Column>

                        <!-- <Column header="Fund Distribution" filterField="funds">
                                <template #body="{ data }">
                                    <div class="flex-1 justify-content-left gap-2">
                                        <div class="text-capitalize" v-for="fund in data.funds" :key="fund.fund_id">{{ fund.fund_name }} : {{ fund.fund_amount }}</div>
                                    </div>
                                </template> -->
                        <!-- <template #filter="{ filterModel, filterCallback }">
                                <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fee Head" />
                            </template> -->
                        <!-- </Column> -->
                        <Column header="Actions" filterField="id">
                            <template #body="{ data }">
                                <div class="flex align-items-center gap-2">
                                    <span role="button" @click="showEditModal(data)"><i class="pi pi-pencil text-primary link" /></span>
                                    <span role="button" @click="showConfirmation(data)"><i class="pi pi-times-circle text-red-400 link" /></span>
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <Dialog v-model:visible="editVisible" :closable="true" modal header="Edit Amount Setting" :style="{ width: '55rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
                    <div class="grid" v-for="editData in feeAmountDataToEdit" :key="editData.id">
                        <div class="md:col-4 mb-3">
                            <label for="formGroupExampleInput" class="font-bold block">Academic Year</label>
                            <InputText type="text" v-model="searchByAcademicYear.core_subcategory_name" class="w-full capitalize" disabled="true" />
                        </div>

                        <div class="md:col-4 mb-3">
                            <label for="formGroupExampleInput" class="font-bold block">Class</label>
                            <InputText type="text" v-model="editData.class" class="w-full capitalize" disabled="true" />
                        </div>
                        <div class="md:col-4 mb-3">
                            <label for="formGroupExampleInput" class="font-bold block">Group</label>
                            <InputText type="text" v-model="editData.group" class="w-full capitalize" disabled="true" />
                        </div>

                        <div class="md:col-4 mb-3">
                            <label for="formGroupExampleInput" class="font-bold block">Fee Head</label>
                            <InputText type="text" v-model="selectedToEdit.fee_head_id" class="w-full capitalize" disabled="true" />
                        </div>

                        <div class="md:col-4 mb-3">
                            <label for="formGroupExampleInput" class="font-bold block">Fee Amount</label>
                            <InputNumber v-model="editData.fee_amount" class="w-full" placeholder="Fee Amount" inputId="locale-user" :minFractionDigits="2" />
                        </div>

                        <div class="md:col-4 mb-3">
                            <label for="formGroupExampleInput" class="font-bold">Fine Amount</label>
                            <InputNumber v-model="editData.fine_amount" class="w-full" placeholder="Fee Amount" inputId="locale-user" :minFractionDigits="2" />
                        </div>
                        <hr />

                        <ConfirmPopup group="headless">
                            <template #container="{ message, acceptCallback, rejectCallback }">
                                <div class="border-round p-3">
                                    <span>{{ message.message }}</span>
                                    <div class="flex align-items-center gap-2 mt-3">
                                        <Button label="Save" @click="acceptCallback" size="small"></Button>
                                        <Button label="Cancel" outlined @click="rejectCallback" severity="secondary" size="small" text></Button>
                                    </div>
                                </div>
                            </template>
                        </ConfirmPopup>
                        <Button @click="requireConfirmation($event)" label="Apply" :loading="isLoading"></Button>
                    </div>
                </Dialog>

                <Dialog v-model:visible="visible" :closable="true" modal header="Confirmation" :style="{ width: '35rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
                    <p>
                        Are you sure you want to delete <b>{{ selectedToDelete.name }}</b
                        >?
                    </p>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" @click="visible = false" text size="small" />
                        <Button label="Yes" icon="pi pi-check" @click="deleteItem" autofocus severity="danger" size="small" />
                    </template>
                </Dialog>
            </div>
        </TabPanel>

        <TabPanel header="Studentwise Amount">
            <div class="grid align-items-end">
                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Academic Year</label>
                    <Dropdown v-model="StudentWiseSelectedAcademicYear" :options="amountIndexData.academicYears" filter optionLabel="core_subcategory_name" placeholder="Academic Year" class="w-full">
                        <template #option="slotProps">
                            <div class="flex align-items-center">
                                <div>{{ slotProps.option.core_subcategory_name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Class</label>
                    <Dropdown
                        v-model="StudentWiseSelectedClass"
                        :disabled="!StudentWiseSelectedAcademicYear"
                        :options="amountIndexData.instituteClassMaps"
                        @change="handleClassSelectionStudentWise"
                        filter
                        optionLabel="class_name"
                        placeholder="Select Class"
                        class="w-full capitalize"
                    >
                        <template #option="slotProps">
                            <div class="flex align-items-center">
                                <div>{{ slotProps.option.class_name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Group</label>
                    <Dropdown v-model="StudentWiseSelectedGroup" :disabled="!StudentWiseSelectedClass" :options="groupOptions" filter optionLabel="label" placeholder="Select Group" class="w-full capitalize"> </Dropdown>
                </div>

                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Student Category</label>
                    <Dropdown :disabled="!StudentWiseSelectedGroup" v-model="StudentWiseSelectCategory" :options="amountIndexData.category" filter optionLabel="core_subcategory_name" placeholder="Category" class="w-full capitalize">
                        <template #option="slotProps">
                            <div class="flex align-items-center capitalize">
                                <div>{{ slotProps.option.core_subcategory_name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <!-- <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Fee Amount</label>
                    <InputNumber v-model="new_feeamount" class="w-full" placeholder="Fee Amount" inputId="locale-user" :minFractionDigits="2" />
                </div> -->

                <div class="md:col-4 mb-3">
                    <label for="formGroupExampleInput" class="font-bold">Fee head</label>
                    <Dropdown v-model="StudentWiseSelectedFeehead" :disabled="!StudentWiseSelectCategory" :options="amountIndexData.feeHead" filter optionLabel="name" placeholder="Fee Head" class="w-full">
                        <template #option="slotProps">
                            <div class="flex align-items-center capitalize">
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="col">
                    <Button class="mb-3" :disabled="!StudentWiseSelectedFeehead" label="Search" size="small" icon="pi pi-search" @click="StudentWiseFeeheadSearch" />
                </div>
            </div>

            <div class="my-2">
                <label v-if="studentWiseFeeAmounts" for="excel" class="p-button p-component p-button-info m-0"><i class="pi pi-plus mr-2"></i><small>Add Excel File</small></label>
                <input id="excel" type="file" class="form-control" @change="handleExcelFile($event)" accept=".xlsx, .xls, .csv" style="display: none" :disabled="!StudentWiseSelectedFeehead" />
                <Button v-if="studentWiseFeeAmounts" icon="pi pi-upload" label="Upload Excel" size="small" class="ml-2" :disabled="!excelFile || !StudentWiseSelectedFeehead" @click="uploadEditedExcel" />
            </div>

            <hr />
            <Button v-if="studentWiseFeeAmounts" label="Download Excel" icon="pi pi-file-excel" :disabled="!selectedStudentWiseFeeAmount.length > 0" size="small" @click="downloadGeneratedExcel" class="mb-2" />

            <Button label="Apply Changes" severity="warning" icon="pi pi-check" v-if="isApplyChange" size="small" @click="applyRowEditSave" class="mb-2" style="float: right" :loading="isLoading" />

            <DataTable
                class="p-datatable-sm"
                showGridlines
                v-model:editingRows="editingRows"
                v-model:selection="selectedStudentWiseFeeAmount"
                v-model:filters="studentwise_feefilters"
                paginator
                :rows="15"
                :rowsPerPageOptions="[15, 25, 50, 100]"
                tableStyle="min-width: 50rem"
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords}"
                :value="studentWiseFeeAmounts"
                editMode="row"
                dataKey="student_id"
                @row-edit-save="onRowEditSave"
                :loading="isLoading"
                :pt="{
                    table: { style: 'min-width: 50rem' },
                    column: {
                        bodycell: ({ state }) => ({
                            style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                        })
                    }
                }"
            >
                <template #header>
                    <div class="flex justify-content-end">
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="studentwise_feefilters['global'].value" placeholder="Student ID / Name" />
                        </span>
                    </div>
                </template>
                <template #empty> No settings found. </template>
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
                <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                <Column field="custom_student_id" header="Student Id" style="width: 20%"></Column>
                <Column field="student_name" header="Name" style="width: 20%"></Column>

                <Column field="fee_amount" header="Fee Amount" style="width: 20%">
                    <template #editor="{ data, field }">
                        <InputNumber v-model="data[field]" />
                    </template>
                </Column>

                <Column field="fine_amount" header="Fine Amount" style="width: 20%">
                    <template #editor="{ data, field }">
                        <InputNumber v-model="data[field]" />
                    </template>
                </Column>

                <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
            </DataTable>
        </TabPanel>

        <!-- <TabPanel header="Absent Fine Amount">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </TabPanel> -->
    </TabView>
</template>
