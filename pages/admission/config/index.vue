<script setup>
import { storeToRefs } from 'pinia';
import { useAdmissionStore } from '~/stores/admission';
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const { classSetupIndex, existingConfigs, enrollment_list, loading, all_enrollment_list } = storeToRefs(useAdmissionStore());
const { fetchClassSetupIndex, add_admissionConfig, update_admissionConfig, demoExcelDownload, fetchAdmissionSetup, fetchEnlistmentList, fetchAllEnlistmentList } = useAdmissionStore();
const admissionSetupData = ref();
onMounted(async () => {
    await fetchClassSetupIndex();
    admissionSetupData.value = classSetupIndex.value.admissionClassSetup;
    await addFieldsToClasses(admissionSetupData.value);
    await fetchAdmissionSetup();
    destructureStartup();
});
//  visibility hook
useVisibilityChange(async () => {
    await fetchClassSetupIndex();
    admissionSetupData.value = classSetupIndex.value.admissionClassSetup;
    await addFieldsToClasses(admissionSetupData.value);
    await fetchAdmissionSetup();
    destructureStartup();
});
function addFieldsToClasses(data) {
    for (let key in data) {
        if (data.hasOwnProperty(key) && !isNaN(key)) {
            data[key] = {
                ...data[key],
                file: '',
                amount: '',
                startDate: '',
                endDate: '',
                isExamRequired: false,
                examDate: '',
                rollStart: ''
            };
        }
    }
    return data;
}

const selectedForAdmission = ref([]);

const filters = ref({
    academic_year: { value: '', matchMode: 'contains' },
    class: { value: '', matchMode: 'contains' },
    shift: { value: '', matchMode: 'contains' },
    group: { value: '', matchMode: 'contains' },
    amount: { value: '', matchMode: 'contains' },
    roll_start: { value: '', matchMode: 'contains' },
    start_date_time: { value: '', matchMode: 'contains' },
    end_date_time: { value: '', matchMode: 'contains' },
    exam_enabled: { value: '', matchMode: 'contains' },
    exam_date_time: { value: '', matchMode: 'contains' },
    roll_start: { value: '', matchMode: 'contains' }
});

function onFileSelect($event, data) {
    data.file = $event.files[0];
}

const isSelected = (data) => {
    return selectedForAdmission.value.includes(data);
};

const selectedClass = ref();
const selectedGroups = ref();
const admissionFor = reactive({
    academic_year: null,
    section: null,
    shift: []
});

// Function to format date to 'YYYY-MM-DD HH:MM:SS'
function formatDateToSQL(date) {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
async function submitAdmissionConfig() {
    try {
        const formData = new FormData();
        formData.append('class', selectedClass.value.subcategory_name);
        formData.append('academic_year', admissionFor.academic_year);
        const shifts = admissionFor.shift;

        shifts.forEach((shift, index) => {
            formData.append(`shift[${index}]`, shift);
        });

        // For the groups
        selectedForAdmission.value.forEach((elem, index) => {
            formData.append(`group[${index}]`, elem.group_name);
        });

        // For the files
        selectedForAdmission.value.forEach((elem, index) => {
            if (elem.file) {
                formData.append(`file[${index}]`, elem.file);
            }
        });

        // For the amounts
        selectedForAdmission.value.forEach((elem, index) => {
            formData.append(`amount[${index}]`, elem.amount);
        });

        // For the start dates
        selectedForAdmission.value.forEach((elem, index) => {
            const startDate = elem.startDate ? formatDateToSQL(elem.startDate) : '';
            formData.append(`start_date_time[${index}]`, startDate);
        });

        // For the end dates
        selectedForAdmission.value.forEach((elem, index) => {
            const endDate = elem.endDate ? formatDateToSQL(elem.endDate) : '';
            formData.append(`end_date_time[${index}]`, endDate);
        });

        // For the exam dates
        selectedForAdmission.value.forEach((elem, index) => {
            const examDate = elem.examDate ? formatDateToSQL(elem.examDate) : '';
            formData.append(`exam_date_time[${index}]`, examDate);
        });

        // For the exam enabled status
        selectedForAdmission.value.forEach((elem, index) => {
            formData.append(`exam_enabled[${index}]`, elem.isExamRequired ? 'YES' : 'NO');
        });

        // For the roll starts
        selectedForAdmission.value.forEach((elem, index) => {
            formData.append(`roll_start[${index}]`, elem.rollStart);
        });

        if (formData) {
            const { status, message, error } = await add_admissionConfig(formData);
            if (status === 'success') {
                toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
            }
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    } finally {
        await fetchClassSetupIndex();
        await fetchAdmissionSetup();
        destructureStartup();
    }
}

const admissionClasses = ref();
const admissionAcademicYears = ref();
const admissionShift = ref();

function destructureStartup() {
    admissionClasses.value = classSetupIndex.value.admission_startup.filter((item) => item.category_name === 'Class').flatMap((item) => item.subcategories);

    admissionAcademicYears.value = classSetupIndex.value.admission_startup.filter((item) => item.category_name === 'Academic Year').flatMap((item) => item.subcategories);

    admissionShift.value = classSetupIndex.value.admission_startup.filter((item) => item.category_name === 'Shift').flatMap((item) => item.subcategories);
}

async function getClassData() {
    try {
        selectedForAdmission.value = [];
        selectedGroups.value = classSetupIndex.value.admissionClassSetup.find((elem) => elem.class_id == selectedClass.value.subcategory_id).groups;
        addFieldsToClasses(selectedGroups.value);
    } catch (error) {
        // console.log(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    }
}
const editVisible = ref(false);
let selectedToEdit = ref(null);
const isExamRequiredOnEdit = ref(false);
function editAdmissionConfig(data) {
    selectedToEdit.value = JSON.parse(JSON.stringify(data));
    isExamRequiredOnEdit.value = data.exam_enabled == 'YES' ?? 'NO';
    editVisible.value = true;
}
watch(isExamRequiredOnEdit, (newVal) => {
    if (newVal) {
        selectedToEdit.value.exam_enabled = 'YES';
    } else {
        selectedToEdit.value.exam_enabled = 'NO';
    }
});

async function submitEditedConfig() {
    try {
        if (selectedToEdit) {
            selectedToEdit.value.start_date_time = selectedToEdit.value.start_date_time ? formatDateToSQL(selectedToEdit.value.start_date_time) : '';
            selectedToEdit.value.end_date_time = selectedToEdit.value.end_date_time ? formatDateToSQL(selectedToEdit.value.end_date_time) : '';
            selectedToEdit.value.exam_date_time = selectedToEdit.value.exam_date_time ? formatDateToSQL(selectedToEdit.value.exam_date_time) : '';

            const { status, message, error } = await update_admissionConfig(selectedToEdit);
            if (status === 'success') {
                toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
            }
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    } finally {
        await fetchClassSetupIndex();
        admissionSetupData.value = classSetupIndex.value.admissionClassSetup;
        await addFieldsToClasses(admissionSetupData.value);
        await fetchAdmissionSetup();
        destructureStartup();
        selectedToEdit.value = null;
        editVisible.value = false;
    }
}

function formatDateTimeTo12Hour(dateStr) {
    const date = new Date(dateStr);

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };

    return date.toLocaleString('en-US', options);
}
const dt = ref();
const totalRecords = ref(0);
const enlistmentData = ref([]);
const selectedEnlistment = ref([]);
const selectAll = ref(false);
const first = ref(0);
const enlistmentFilters = ref({
    name: { value: '', matchMode: 'contains' },
    roll: { value: '', matchMode: 'contains' },
    board: { value: '', matchMode: 'contains' },
    passing_year: { value: '', matchMode: 'contains' }
});
const lazyParams = ref({});

const enlistmentFor = reactive({
    class: null,
    academic_year: null
});
async function searchEnlistment() {
    try {
        const { status, message, error } = await fetchEnlistmentList(enlistmentFor, lazyParams.value);
        if (status === 'success') {
            // console.log(enrollment_list.value);
            enlistmentData.value = enrollment_list.value.enlistment_list.data;
            totalRecords.value = enrollment_list.value.enlistment_list.total;
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        // console.log(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    }
}

onMounted(() => {
    lazyParams.value = {
        first: 0,
        rows: 25,
        sortField: null,
        sortOrder: null,
        filters: filters.value
    };
});
const loadLazyData = (event) => {
    loading.value = true;
    lazyParams.value = { ...lazyParams.value, first: event?.first || first.value };
    setTimeout(() => {
        fetchEnlistmentList(enlistmentFor, lazyParams.value)
            .then(() => {
                enlistmentData.value = enrollment_list.value.enlistment_list.data;
                totalRecords.value = enrollment_list.value.enlistment_list.total;
            })
            .catch((error) => {
                console.error('Error loading data:', error);
            });
    }, Math.random() * 1000 + 250);
};
const onPage = (event) => {
    lazyParams.value = event;
    loadLazyData(event);
};
const onSort = (event) => {
    lazyParams.value = event;
    loadLazyData(event);
};
const onFilter = (event) => {
    lazyParams.value.filters = enlistmentFilters.value;
    loadLazyData(event);
};
const onSelectAllChange = async (event) => {
    selectAll.value = event.checked;
    if (selectAll.value) {
        loading.value = true;
        try {
            lazyParams.value = { ...lazyParams.value, first: 0, rows: -1 };
            await fetchAllEnlistmentList(enlistmentFor, lazyParams.value);
            console.log(all_enrollment_list.value);
            selectedEnlistment.value = all_enrollment_list.value.enlistment_list.data;
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            loading.value = false;
        }
    } else {
        selectAll.value = false;
        selectedEnlistment.value = [];
    }
};
const onRowSelect = () => {
    selectAll.value = selectedApplicants.value.length === totalRecords.value;
};
const onRowUnselect = () => {
    selectAll.value = false;
};
</script>

<template>
    <Toast position="bottom-right" group="br" />
    <div class="card">
        <TabView>
            <TabPanel header="Admission Config">
                <div class="m-2">
                    <Dropdown v-model="selectedClass" :options="admissionClasses" optionLabel="subcategory_name" placeholder="Select a class" @change="getClassData" class="capitalize">
                        <template #option="slotProps">
                            <div class="capitalize">
                                {{ slotProps.option.subcategory_name }}
                            </div>
                        </template>
                    </Dropdown>
                </div>
                <div class="grid gap-2 m-2">
                    <Dropdown class="capitalize" v-model="admissionFor.academic_year" :options="admissionAcademicYears" optionLabel="subcategory_name" optionValue="subcategory_name" placeholder="Academic Year">
                        <template #option="slotProps">
                            <div class="flex align-items-center capitalize">
                                <div>{{ slotProps.option.subcategory_name }}</div>
                            </div>
                        </template>
                    </Dropdown>

                    <MultiSelect v-model="admissionFor.shift" display="chip" :options="admissionShift" optionLabel="subcategory_name" placeholder="Select Shifts" optionValue="subcategory_name" class="capitalize">
                        <template #option="slotProps">
                            <div class="flex align-items-center capitalize">
                                <div>{{ slotProps.option.subcategory_name }}</div>
                            </div>
                        </template>
                    </MultiSelect>

                    <Button label="Save" size="small" icon="pi pi-save" :loading="loading" :disabled="!selectedForAdmission.length || !admissionFor.academic_year || !admissionFor.shift" @click="submitAdmissionConfig" />
                </div>

                <DataTable showGridlines stripedRows v-model:selection="selectedForAdmission" dataKey="group_id" class="p-datatable-sm" v-model:filters="filters" :value="selectedGroups" paginator :rows="10" filterDisplay="row" :loading="loading">
                    <template #header>
                        <Button label="Template File" icon="pi pi-file-excel" severity="help" size="small" @click="demoExcelDownload" />
                    </template>
                    <template #empty> No results found. </template>
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

                    <Column field="group_name" header="Group" style="min-width: 12rem">
                        <template #body="{ data }">
                            <div class="capitalize">
                                {{ data.group_name }}
                            </div>
                        </template>
                    </Column>

                    <Column field="file" header="Attach File" style="min-width: 12rem">
                        <template #body="{ data }">
                            <FileUpload mode="basic" v-model="data.file" accept=".xlsx" :maxFileSize="1000000" class="p-button-sm" @select="onFileSelect($event, data)" :disabled="!isSelected(data)" @click="data.file = null" />
                        </template>
                    </Column>

                    <Column field="amount" header="Amount" style="min-width: 12rem">
                        <template #body="{ data }">
                            <InputNumber min="1" v-model="data.amount" placeholder="Admission Fee" :disabled="!isSelected(data)" />
                        </template>
                    </Column>

                    <Column field="startDate" header="Start Datetime" style="min-width: 12rem">
                        <template #body="{ data }">
                            <Calendar :id="'start-date-' + data.class_id" v-model="data.startDate" showTime hourFormat="12" placeholder="Start Date" :disabled="!isSelected(data)" />
                        </template>
                    </Column>

                    <Column field="endDate" header="End Datetime" style="min-width: 12rem">
                        <template #body="{ data }">
                            <Calendar v-model="data.endDate" showTime hourFormat="12" placeholder="End Date" :disabled="!isSelected(data)" />
                        </template>
                    </Column>

                    <Column field="rollStart" header="Roll Start" style="min-width: 12rem">
                        <template #body="{ data }">
                            <InputText v-model="data.rollStart" placeholder="Starting Roll Number" :disabled="!isSelected(data)" />
                        </template>
                    </Column>

                    <Column field="isExamRequired" header="Exam">
                        <template #body="{ data }">
                            <InputSwitch v-model="data.isExamRequired" class="p-button-sm" :disabled="!isSelected(data)" />
                        </template>
                    </Column>

                    <Column field="examTime" header="Exam/Lottery Datetime" style="min-width: 12rem">
                        <template #body="{ data }">
                            <Calendar v-model="data.examDate" showTime hourFormat="12" placeholder="Exam Datetime" v-if="data.isExamRequired" :disabled="!isSelected(data)" />
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>
            <TabPanel header="Configured">
                <DataTable
                    v-model:filters="filters"
                    :value="existingConfigs"
                    paginator
                    :rows="5"
                    :rowsPerPageOptions="[5, 25, 50, 100]"
                    tableStyle="min-width: 75rem"
                    class="p-datatable-sm"
                    showGridlines
                    stripedRows
                    scrollable
                    scrollHeight="600px"
                    dataKey="id"
                    filterDisplay="row"
                    :loading="loading"
                >
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

                    <template #empty>
                        <div class="text-center">No Configurations found.</div>
                    </template>

                    <Column frozen header="Edit">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-text" @click="editAdmissionConfig(data)" />
                        </template>
                    </Column>

                    <Column style="min-width: 200px" class="capitalize" field="academic_year" header="Academic Year">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by name" />
                        </template>
                    </Column>

                    <Column style="min-width: 200px" class="capitalize" field="class" header="Class">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by name" />
                        </template>
                    </Column>

                    <Column style="min-width: 200px" class="capitalize" field="shift" header="Shift">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by name" />
                        </template>
                    </Column>
                    <Column style="min-width: 200px" class="capitalize" field="group" header="Group">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by name" />
                        </template>
                    </Column>

                    <Column style="min-width: 200px" class="capitalize" field="amount" header="Fee">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by name" />
                        </template>
                        <template #body="{ data }">{{ data.amount ?? 'N/A' }}</template>
                    </Column>

                    <Column style="min-width: 200px" class="capitalize" field="start_date_time" header="Start Date Time">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by name" />
                        </template>
                        <template #body="{ data }">{{ data.start_date_time ? formatDateTimeTo12Hour(data.start_date_time) : 'N/A' }}</template>
                    </Column>

                    <Column style="min-width: 200px" class="capitalize" field="end_date_time" header="End Date Time">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by name" />
                        </template>
                        <template #body="{ data }">{{ data.end_date_time ? formatDateTimeTo12Hour(data.end_date_time) : 'N/A' }}</template>
                    </Column>

                    <Column style="min-width: 200px" class="capitalize" field="roll_start" header="Roll Start at">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by name" />
                        </template>
                        <template #body="{ data }">{{ data.roll_start ?? 'N/A' }}</template>
                    </Column>

                    <Column style="min-width: 200px" class="capitalize" field="exam_enabled" header="Exam">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by name" />
                        </template>
                        <template #body="{ data }">{{ data.exam_enabled ?? 'N/A' }}</template>
                    </Column>

                    <Column style="min-width: 200px" class="capitalize" field="exam_date_time" header="Exam Date Time">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by name" />
                        </template>
                        <template #body="{ data }">{{ data.exam_date_time ? formatDateTimeTo12Hour(data.exam_date_time) : 'N/A' }}</template>
                    </Column>
                </DataTable>
            </TabPanel>

            <TabPanel header="Enlistment">
                <div class="grid gap-2 m-2">
                    <Dropdown v-model="enlistmentFor.class" :options="admissionClasses" optionLabel="subcategory_name" optionValue="subcategory_name" placeholder="Select a class" class="capitalize">
                        <template #option="slotProps">
                            <div class="capitalize">
                                {{ slotProps.option.subcategory_name }}
                            </div>
                        </template>
                    </Dropdown>
                    <Dropdown class="capitalize" v-model="enlistmentFor.academic_year" :options="admissionAcademicYears" optionLabel="subcategory_name" optionValue="subcategory_name" placeholder="Academic Year">
                        <template #option="slotProps">
                            <div class="flex align-items-center capitalize">
                                <div>{{ slotProps.option.subcategory_name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                    <Button label="Search" size="small" icon="pi pi-search" severity="info" :loading="loading" @click="searchEnlistment" />
                </div>

                <DataTable
                    :value="enlistmentData"
                    lazy
                    paginator
                    :first="first"
                    :rows="10"
                    v-model:filters="enlistmentFilters"
                    ref="dt"
                    dataKey="id"
                    :totalRecords="totalRecords"
                    :loading="loading"
                    @page="onPage($event)"
                    @sort="onSort($event)"
                    @filter="onFilter($event)"
                    filterDisplay="row"
                    v-model:selection="selectedEnlistment"
                    :selectAll="selectAll"
                    @select-all-change="onSelectAllChange"
                    @row-select="onRowSelect"
                    @row-unselect="onRowUnselect"
                    tableStyle="min-width: 75rem"
                    class="p-datatable-sm"
                    showGridlines
                    stripedRows
                    scrollable
                    scrollHeight="600px"
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                    currentPageReportTemplate="Records: {totalRecords}"
                >
                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

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

                    <Column field="name" header="Name" filterMatchMode="contains" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                        </template>
                        <template #body="{ data }">
                            <div class="capitalize">
                                {{ data.name }}
                            </div>
                        </template>
                    </Column>

                    <Column field="roll" header="Roll" filterMatchMode="contains" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                        </template>
                        <template #body="{ data }">
                            <div class="capitalize">
                                {{ data.roll }}
                            </div>
                        </template>
                    </Column>
                    <Column field="name" header="Name" filterMatchMode="contains" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                        </template>
                        <template #body="{ data }">
                            <div class="capitalize">
                                {{ data.name }}
                            </div>
                        </template>
                    </Column>
                    <Column field="board" header="Board" filterMatchMode="contains" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                        </template>
                        <template #body="{ data }">
                            <div class="capitalize">
                                {{ data.board }}
                            </div>
                        </template>
                    </Column>
                    <Column field="passing_year" header="Passing Year" filterMatchMode="contains" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                        </template>
                        <template #body="{ data }">
                            <div class="capitalize">
                                {{ data.passing_year }}
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>
        </TabView>

        <Dialog v-model:visible="editVisible" modal header="Edit Configuration" :style="{ width: '30rem', maxWidth: '30rem' }">
            <span class="text-primary block mb-3 capitalize">Updating For: {{ selectedToEdit.class }}-{{ selectedToEdit.group }}-{{ selectedToEdit.shift }} ({{ selectedToEdit.academic_year }})</span>
            <div class="mb-3">
                <label class="w-full" for="amountEdit">Amount</label>
                <InputText v-model="selectedToEdit.amount" id="amountEdit" class="w-full" autocomplete="off" />
            </div>
            <div class="mb-2">
                <label class="w-full" for="stDateTime">Start Date Time</label>
                <Calendar class="w-full" for="stDateTime" v-model="selectedToEdit.start_date_time" showTime hourFormat="12" placeholder="Start Date Time" />
            </div>

            <div class="mb-2">
                <label class="w-full" for="enDateTime">End Date Time</label>
                <Calendar class="w-full" id="enDateTime" v-model="selectedToEdit.end_date_time" showTime hourFormat="12" placeholder="End Date Time" />
            </div>

            <!-- <div class="mb-2">
                <label class="w-full" for="editRollStart">Roll Start</label>
                <InputText v-model="selectedToEdit.roll_start" id="editRollStart" class="w-full" autocomplete="off" />
            </div> -->

            <div class="mb-2">
                <label class="w-full" for="exam">Is Exam Required ?</label>
                <div class="w-full">
                    <InputSwitch v-model="isExamRequiredOnEdit" class="p-button-sm" />
                </div>
            </div>

            <div class="mb-2" v-if="isExamRequiredOnEdit">
                <label class="w-full" for="exDateTime">Exam Date Time</label>
                <Calendar class="w-full" id="exDateTime" v-model="selectedToEdit.exam_date_time" showTime hourFormat="12" placeholder="Exam Date Time" />
            </div>

            <template #footer>
                <Button label="Cancel" text severity="secondary" @click="visible = false" autofocus />
                <Button label="Save" severity="info" @click="submitEditedConfig()" autofocus :loading="loading" />
            </template>
        </Dialog>
    </div>
</template>
