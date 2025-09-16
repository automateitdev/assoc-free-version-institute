<script setup>
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
// import htmlToPdfmake from 'html-to-pdfmake';
// import pdfMake from 'pdfmake/build/pdfmake';
import axios from 'axios';
import InputText from 'primevue/inputtext';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// pdfMake.vfs = pdfFonts.pdfMake.vfs

const toast = useToast();
const { fetchStudentListData, updateStudentBasicInfo } = useGlobalStore();
const { classShiftSectionData } = storeToRefs(useGlobalStore());

const bloodGroups = ref([
    { name: 'O positive', code: 'O+' },
    { name: 'O negative', code: 'O-' },
    { name: 'A positive', code: 'A+' },
    { name: 'A negative', code: 'A-' },
    { name: 'B positive', code: 'B+' },
    { name: 'B negative', code: 'B-' },
    { name: 'AB positive', code: 'AB+' },
    { name: 'AB negative', code: 'AB-' },
    { name: 'Not Given', code: 'No' }
]);
const genders = ref([
    { name: 'Male', code: 'Male' },
    { name: 'Female', code: 'Female' },
    { name: 'Others', code: 'Others' }
]);

const religions = ref([
    { name: 'Islam', code: 'Islam' },
    { name: 'Hinduism', code: 'Hinduism' },
    { name: 'Buddhism', code: 'Buddhism' },
    { name: 'Christianity', code: 'Christianity' }
]);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    custom_student_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    class_roll: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'student_details.student_name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'student_details.student_gender': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'student_details.student_religion': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'student_details.student_religion': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'academicsession.coresubcategories.core_subcategory_name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'categories.coresubcategories.core_subcategory_name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'guardian_details.gurdian_mobile': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'combination.class_details': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const searchForm = reactive({});
let studentSearch = ref({
    years: null,
    instituteClassMap: null,
    section_id: null,
    academic_year_id: null,
    shift_id: null,
    instituteClassMapId: null
});
onMounted(async () => {
    let { data } = await axios.get('student-enrollment');
    studentSearch.value.years = data.payload.data.academicYears;
    studentSearch.value.instituteClassMap = data.payload.data.instituteClassMap;
    fetchStudentListData();
});
//  visibility hook
useVisibilityChange(async () => {
    let { data } = await axios.get('student-enrollment');
    studentSearch.value.years = data.payload.data.academicYears;
    studentSearch.value.instituteClassMap = data.payload.data.instituteClassMap;
    fetchStudentListData();
});

function getCombinationID($event) {
    let { id, shift, section } = $event.value;
    studentSearch.value.instituteClassMapId = id;

    // Find the relevant class_details object
    let relevantClassDetails = studentSearch.value.instituteClassMap.find((i) => i.id == id).class_details.find((cls) => cls.shifts.id == shift && cls.sections.id == section);

    // Set the section_id and shift_id based on the relevant class_details
    if (relevantClassDetails) {
        studentSearch.value.section_id = relevantClassDetails.sections.id;
        studentSearch.value.shift_id = relevantClassDetails.shift_id;
    } else {
        // Handle the case when relevantClassDetails is not found
        console.log('Class details not found for the given criteria.');
    }
}

let searchData = reactive({
    students: []
});
let isSearching = ref(false);
const selectedStudents = ref();
const selectedAttributes = ref();
const formatDate = (value) => {
    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour12: false // Set to true if you want 12-hour format
    };
    return new Date(value).toLocaleString('en-US', options);
};
const attributes = ref([
    { name: 'Admission Date', code: 'admission_date' },
    { name: 'Roll', code: 'class_roll' },
    { name: 'Student Name', code: 'student_name' },
    { name: 'Gender', code: 'student_gender' },
    { name: 'Religion', code: 'student_religion' },
    { name: 'Date of Birth', code: 'student_dob' },
    { name: 'Blood Group', code: 'blood_group' },
    { name: 'Father Name', code: 'father_name' },
    { name: 'Mother Name', code: 'mother_name' },
    { name: 'Gurdian Mobile', code: 'gurdian_mobile' }
]);

const formDataExcel = reactive({
    academic_year_id: null,
    student_id: null,
    field_name: null
});
const config = useRuntimeConfig();
async function exportStudentExcel() {
    formDataExcel.academic_year_id = searchForm.year.id;
    formDataExcel.field_name = selectedAttributes.value.map((attr) => attr.code);
    formDataExcel.student_id = selectedStudents.value.map((student) => student.student_id);
    const res = await axios.post('/student-update/basic-excel-generate', formDataExcel);
    if (res.data.payload.data.status == 'success') {
        window.open(`${config.public.BASE_URL}${res.data.payload.data.url}`, '_blank');
    } else {
        toast.add({ severity: 'error', summary: 'Something went wrong!', detail: 'Field Must not be empty!', life: 3000 });
    }
}

const editingRows = ref([]);
const updateRequestData = reactive({
    open_history_id: null,
    start_date_time: null,
    end_date_time: null
});
const currenStudentEdit = ref();
const onRowEditSave = async (event) => {
    let { newData, index } = event;
    newData.academic_year = searchForm.year.id;

    const convertToBST = (timestamp) => {
        const date = new Date(timestamp);
        date.setHours(date.getHours() + 6); // Adjust to Bangladesh Standard Time (UTC+6)
        return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    newData.student_dob !== null ? (newData.student_dob = convertToBST(newData.student_dob)) : (newData.student_dob = null);
    newData.admission_date !== null ? (newData.admission_date = convertToBST(newData.admission_date)) : (newData.admission_date = null);

    currenStudentEdit.value = newData;
    console.log(currenStudentEdit);
    try {
        isSearching.value = true;
        const { success, message, error } = await updateStudentBasicInfo(currenStudentEdit.value);
        searchData.students[index] = newData;
        await handleSearchForm();
        if (success) {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'warn', summary: 'Error Message', detail: 'Something went wrong! Try Later', group: 'br', life: 5000 });
    } finally {
        isSearching.value = false;
    }
};
async function handleSearchForm() {
    try {
        try {
            if (studentSearch.value.shift_id && searchForm.year) {
                isSearching.value = true;

                let { data } = await axios.post('/student-update/basic-info-search', {
                    institute_class_map_id: studentSearch.value.instituteClassMapId,
                    section_id: studentSearch.value.section_id,
                    shift_id: studentSearch.value.shift_id,
                    academic_year_id: searchForm.year.id
                });

                searchData.students = data.payload.data.students;
                searchData.status = true;
                isSearching.value = false;
            } else {
                isSearching.value = false;

                toast.add({ severity: 'error', summary: 'Error!', detail: 'Field Must not be empty!', life: 3000 });
            }
        } catch (error) {
            isSearching.value = false;
            searchData.status = false;

            toast.add({ severity: 'error', summary: 'Error!', detail: 'Something went wrong!', life: 3000 });
        }
    } catch (error) {
        isSearching.value = false;
        searchData.status = false;
        toast.add({ severity: 'error', summary: 'Error!', detail: 'Something went wrong!', life: 3000 });
    }
}

let fd = ref(new FormData());
const file = ref();
function handleExcelFile($event) {
    file.value = $event.target.files ? $event.target.files[0] : null;
}

async function submitStudentExcelUpdate() {
    if (file.value) {
        fd.value.append('file', file.value);
        fd.value.append('academic_year', searchForm.year.id);
    }
    try {
        isSearching.value = true;
        const { success, message, error } = await updateStudentBasicInfo(fd.value);
        if (success) {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'warn', summary: 'Error Message', detail: 'Something went wrong! Try Later', group: 'br', life: 5000 });
    } finally {
        isSearching.value = false;
        await handleSearchForm();
    }
}
</script>
<template>
    <TabView>
        <TabPanel header="Student Info">
            <!-- <UpdateInfo></UpdateInfo> -->
            <Toast position="bottom-right" group="br" />

            <div class="card">
                <form action="" @submit.prevent="handleSearchForm" class="grid grid-flow-row">
                    <div class="col-12 md:col-3">
                        <label for="" class="mb-1"><b>Academic Year</b></label>
                        <Dropdown v-model="searchForm.year" :options="studentSearch.years" filter optionLabel="core_subcategory_name" placeholder="Select Academic Year" class="w-full text-capitalize" />
                    </div>

                    <div class="col-12 md:col-4">
                        <label for="" class="mb-1"><b>Class Shift Section</b></label>
                        <Dropdown v-model="searchForm.class" :options="classShiftSectionData.classes" class="w-full capitalize" filter optionLabel="combination" placeholder="Select a Combination" @change="getCombinationID($event)">
                            <template #value="slotProps">
                                {{ slotProps.value ? slotProps.value.combination : slotProps.placeholder }}
                            </template>
                            <template #option="slotProps">
                                <span class="m-0 p-0 capitalize">
                                    {{ slotProps.option.combination }}
                                </span>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="col-2 align-self-end">
                        <Button label="Search" icon="pi pi-search" :loading="isSearching" type="submit" size="small" />
                    </div>
                </form>
            </div>

            <div class="card">
                <DataTable
                    v-model:editingRows="editingRows"
                    editMode="row"
                    dataKey="id"
                    @row-edit-save="onRowEditSave"
                    :pt="{
                        table: { style: 'min-width: 50rem' },
                        column: {
                            bodycell: ({ state }) => ({
                                style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                            })
                        }
                    }"
                    paginator
                    :loading="isSearching"
                    :rows="5"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    tableStyle="min-width: 50rem"
                    showGridlines
                    stripedRows
                    v-model:selection="selectedStudents"
                    :value="searchData?.students"
                    scrollable
                    scrollHeight="400px"
                    class="p-datatable-sm"
                >
                    <template #header v-if="searchData?.students?.length > 0">
                        <div style="text-align: left">
                            <MultiSelect v-model="selectedAttributes" display="chip" :options="attributes" optionLabel="name" placeholder="Select attributes to export as excel" class="w-full" />
                        </div>
                        <div class="my-2">
                            <Button
                                icon="pi pi-file-excel"
                                label="Export"
                                @click="exportStudentExcel($event)"
                                size="small"
                                class="ml-2"
                                :disabled="!selectedAttributes || selectedAttributes.length <= 0 || !selectedStudents || selectedStudents.length <= 0"
                            />
                            <label for="excelFile" class="p-button p-component p-button-info ml-2"><i class="pi pi-plus mr-2"></i><small>Add Excel File</small></label>
                            <input id="excelFile" type="file" class="form-control" @change="handleExcelFile($event)" accept=".xlsx, .xls, .csv" style="display: none" />
                            <Button @click="submitStudentExcelUpdate" icon="pi pi-upload" label="Upload Excel" size="small" class="ml-2" :disabled="!file" />
                        </div>
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
                    <Column selectionMode="multiple" headerStyle="width: 3rem" style="min-width: 100px"></Column>
                    <Column field="custom_student_id" header="Student ID" style="min-width: 100px"></Column>
                    <Column field="student_name" header="Student Name" style="min-width: 100px">
                        <template #editor="{ data, field }">
                            <InputText placeholder="Student Name" v-model="data[field]" class="w-full md:w-14rem" />
                        </template>
                    </Column>

                    <!-- class roll -->
                    <Column field="class_roll" header="Class Roll" style="min-width: 100px">
                        <template #editor="{ data, field }">
                            <InputNumber v-model="data[field]" :min="0" :max="1000" />
                        </template>
                    </Column>

                    <!-- gender -->
                    <Column field="student_gender" header="Gender" style="min-width: 100px">
                        <template #editor="{ data, field }">
                            <Dropdown v-model="data[field]" :options="genders" optionLabel="name" optionValue="code" placeholder="Select Gender" checkmark :highlightOnSelect="false" class="w-full md:w-10rem" />
                        </template>
                    </Column>

                    <!-- Religion -->
                    <Column field="student_religion" header="Religion" style="min-width: 100px">
                        <template #editor="{ data, field }">
                            <Dropdown v-model="data[field]" :options="religions" optionLabel="name" optionValue="code" placeholder="Select Religion" checkmark :highlightOnSelect="false" class="w-full md:w-10rem" />
                        </template>
                    </Column>

                    <!-- Date of Birth -->
                    <Column field="student_dob" header="Birth Date" style="min-width: 100px">
                        <template #body="{ data }">
                            {{ data.student_dob ? formatDate(data.student_dob) : 'N/A' }}
                        </template>
                        <template #editor="{ data, field }">
                            <Calendar placeholder="Birth Date" v-model="data[field]" dateFormat="dd/mm/yy" class="w-full md:w-10rem" />
                        </template>
                    </Column>

                    <!-- Blood Group -->
                    <Column field="blood_group" header="Blood Group" style="min-width: 100px">
                        <template #editor="{ data, field }">
                            <Dropdown v-model="data[field]" :options="bloodGroups" optionLabel="name" optionValue="code" placeholder="Select Blood Group" checkmark :highlightOnSelect="false" class="w-full md:w-10rem" />
                        </template>
                    </Column>

                    <!-- Father Name -->
                    <Column field="father_name" header="Father Name" style="min-width: 100px">
                        <template #editor="{ data, field }">
                            <InputText placeholder="Father Name" v-model="data[field]" class="w-full md:w-14rem" />
                        </template>
                    </Column>

                    <!-- Mother Name -->
                    <Column field="mother_name" header="Mother Name" style="min-width: 100px">
                        <template #editor="{ data, field }">
                            <InputText placeholder="Mother Name" v-model="data[field]" class="w-full md:w-14rem" />
                        </template>
                    </Column>

                    <!-- Guardian Contact -->
                    <Column field="gurdian_mobile" header="Guardian Contact" style="min-width: 100px">
                        <template #editor="{ data, field }">
                            <InputText placeholder="Guardian Contact" v-model="data[field]" class="w-full md:w-14rem" />
                        </template>
                    </Column>

                    <!-- Admission Date -->
                    <Column field="admission_date" header="Admission Date" style="min-width: 100px">
                        <template #body="{ data }">
                            {{ data.admission_date ? formatDate(data.admission_date) : 'N/A' }}
                        </template>
                        <template #editor="{ data, field }">
                            <Calendar placeholder="Admission Date" v-model="data[field]" dateFormat="dd/mm/yy" class="w-full md:w-10rem" />
                        </template>
                    </Column>

                    <Column :rowEditor="true" style="min-width: 100px" bodyStyle="text-align:center"></Column>
                </DataTable>
            </div>
        </TabPanel>
    </TabView>
</template>
