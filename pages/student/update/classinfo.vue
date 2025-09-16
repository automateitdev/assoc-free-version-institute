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
import { useClassInfoUpdateStore } from '../../../stores/classinfoupdate';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// pdfMake.vfs = pdfFonts.pdfMake.vfs

const toast = useToast();
const { fetchClassInfoIndex, classInfoUpdate } = useClassInfoUpdateStore();
const { fetchStudentListData } = useGlobalStore();
const { classShiftSectionData } = storeToRefs(useGlobalStore());
const { classInfoIndex } = storeToRefs(useClassInfoUpdateStore());

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    custom_student_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'group_detail.core_subcategory_name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    class_roll: { value: null, matchMode: FilterMatchMode.CONTAINS },
    student_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    father_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    mother_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    student_gender: { value: null, matchMode: FilterMatchMode.CONTAINS },
    student_religion: { value: null, matchMode: FilterMatchMode.CONTAINS },
    gurdian_mobile: { value: null, matchMode: FilterMatchMode.CONTAINS },
    admission_date: { value: null, matchMode: FilterMatchMode.CONTAINS },
    student_dob: { value: null, matchMode: FilterMatchMode.CONTAINS },
    blood_group: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const formatDate = (value) => {
    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour12: false // Set to true if you want 12-hour format
    };
    return new Date(value).toLocaleString('en-US', options);
};
const searchForm = reactive({
    year: null,
    class: null,
});
let studentSearch = ref({
    years: null,
    instituteClassMap: null,
    section_id: null,
    academic_year_id: null,
    shift_id: null,
    instituteClassMapId: null,
    categories: null
});

let studentUpdateCombination = ref({
    years: null,
    instituteClassMap: null,
    section_id: null,
    academic_year_id: null,
    shift_id: null,
    instituteClassMapId: null,
    combinations_pivot_id: null
});
onMounted(async () => {
    let { data } = await axios.get('student-enrollment');
    studentSearch.value.years = data.payload.data.academicYears;
    studentSearch.value.instituteClassMap = data.payload.data.instituteClassMap;
    studentSearch.value.categories = data.payload.data.category;

    studentUpdateCombination.value.years = data.payload.data.academicYears;
    studentUpdateCombination.value.instituteClassMap = data.payload.data.instituteClassMap;
    studentUpdateCombination.value.categories = data.payload.data.category;
    fetchStudentListData();
    fetchClassInfoIndex()
});
//  visibility hook
useVisibilityChange(async () => {
    let { data } = await axios.get('student-enrollment');
    studentSearch.value.years = data.payload.data.academicYears;
    studentSearch.value.instituteClassMap = data.payload.data.instituteClassMap;
    studentSearch.value.categories = data.payload.data.category;

    studentUpdateCombination.value.years = data.payload.data.academicYears;
    studentUpdateCombination.value.instituteClassMap = data.payload.data.instituteClassMap;
    studentUpdateCombination.value.categories = data.payload.data.category;
    fetchStudentListData();
    // fetchClassInfoIndex();
});

function getCombinationID($event) {
    let { id, shift, section } = $event.value;
    studentSearch.value.instituteClassMapId = id;
    let relevantClassDetails = studentSearch.value.instituteClassMap.find((i) => i.id == id).class_details.find((cls) => cls.shifts.id == shift && cls.sections.id == section);

    // Set the section_id and shift_id based on the relevant class_details
    if (relevantClassDetails) {
        studentSearch.value.combinations_pivot_id = relevantClassDetails.pivot.id;
        studentSearch.value.section_id = relevantClassDetails.sections.id;
        studentSearch.value.shift_id = relevantClassDetails.shift_id;
    } else {
        // Handle the case when relevantClassDetails is not found
        console.log('Class details not found for the given criteria.');
    }
}

function getCombinationIDForUpdate($event) {
    let { id, shift, section } = $event.value;
    studentUpdateCombination.value.instituteClassMapId = id;

    // Find the relevant class_details object
    let relevantClassDetails = studentUpdateCombination.value.instituteClassMap.find((i) => i.id == id).class_details.find((cls) => cls.shifts.id == shift && cls.sections.id == section);

    // Set the section_id and shift_id based on the relevant class_details
    if (relevantClassDetails) {
        studentUpdateCombination.value.section_id = relevantClassDetails.sections.id;
        studentUpdateCombination.value.shift_id = relevantClassDetails.shift_id;
    } else {
        // Handle the case when relevantClassDetails is not found
        console.log('Class details not found for the given criteria.');
    }
}

let selectedStudents = ref();
let searchData = reactive({
    institute_class_map_id: null,
    section_id: null,
    shift_id: null,
    academic_year_id: null
});
let isSearching = ref(false);
const visible = ref(false);
const dialogData = ref();
const updateType = ref();
const updateValue = ref();

const showUpdateDropdown = (type, data) => {
    (updateValue.value = null), (updateType.value = type);
    dialogData.value = data;
    visible.value = true;
};

const formData = reactive({
    update_type: null,
    student_id: null,
    academic_year_id: null,
    group_id: null,
    combination_id: null,
    present_combination_id: null,
    student_category_id: null
});
const student_class_details = ref([]);
const updateSelectedStudents = async () => {
    try {
        formData.update_type = null;
        formData.present_combination_id = null;
        formData.combination_id = null;

        formData.update_type = updateType.value;
        formData.academic_year_id = searchForm.year.id;
        formData.student_id = formData.student_id = selectedStudents.value.map((elem) => elem.student_id) ?? [];
        formData.present_combination_id = selectedStudents.value.map((elem) => elem.current_combination_id) ?? [];

        formData.group_id = updateType.value == 'group' ? updateValue.value : null;
        formData.student_category_id = updateType.value == 'category' ? updateValue.value : null;

        if (updateType.value == 'section') {
            student_class_details.value = selectedStudents.value.map((elem) => elem.class_details) ?? [];

            let instituteClassMap = studentUpdateCombination.value.instituteClassMap[0];
            let classDetailsArray = instituteClassMap.class_details;
            let allCombinationIds = [];

            student_class_details.value.forEach((element) => {
                // Find and collect the matching pivot IDs
                let matchingIds = classDetailsArray
                    .filter((cls) => cls.group_id === element[0].group_id && cls.shift_id === studentUpdateCombination.value.shift_id && cls.section_id === studentUpdateCombination.value.section_id)
                    .map((cls) => cls.pivot.id);

                // Append the matching IDs to the allCombinationIds array
                allCombinationIds = allCombinationIds.concat(matchingIds);
            });
            formData.combination_id = allCombinationIds;
        }

        const { status, message, error } = await classInfoUpdate(formData);

        if (status == 'success') {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message ?? 'Successfully Updated', life: 3000 });
            
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.log(error);
    } finally {
        visible.value = false;
        selectedStudents.value = null,
        await handleSearchForm();
    }
};

async function handleSearchForm() {
    try {
        isSearching.value = true;
        (searchData.institute_class_map_id = studentSearch.value.instituteClassMapId), (searchData.section_id = studentSearch.value.section_id), (searchData.shift_id = studentSearch.value.shift_id), (searchData.academic_year_id = searchForm.year.id);

        const { success, message, error } = await fetchClassInfoIndex(searchData);
        if (success) {
            console.log('ok');
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (errors) {
        toast.add({ severity: 'error', summary: 'Error!', detail: 'Missing required field', group: 'br', life: 3000 });
    } finally {
        isSearching.value = false;
    }
}
</script>

<template>
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

    <!-- Datatable start from here -->
    <div class="card" style="margin-top: -15px">
        <DataTable
            v-model:selection="selectedStudents"
            class="p-datatable-sm"
            ref="dtf"
            id="divToPrint"
            v-model:filters="filters"
            :value="classInfoIndex?.students"
            dataKey="id"
            filterDisplay="row"
            :loading="loading"
            stripedRows
            showGridlines
            scrollable
            paginator
            :rows="50"
            :rowsPerPageOptions="[20, 50, 70, 90]"
            :globalFilterFields="['custom_student_id', 'name', 'class_roll']"
        >
            <template #empty> No Data Found. </template>
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
                <div class="flex justify-content-end">
                    <Button class="mx-1" @click="showUpdateDropdown('group', classInfoIndex.groups)" label="Update Group" size="small" severity="" :disabled="!selectedStudents || !selectedStudents?.length" />
                    <Button class="mx-1" @click="showUpdateDropdown('section', classShiftSectionData.classes)" label="Update Section" size="small" severity="" :disabled="!selectedStudents || !selectedStudents?.length" />
                    <Button class="mx-1" @click="showUpdateDropdown('category', studentSearch.categories)" label="Update Category" size="small" severity="" :disabled="!selectedStudents || !selectedStudents?.length" />

                    <Dialog v-model:visible="visible" modal header="Edit Profile" :style="{ width: '25rem' }">
                        <template #header>
                            <div class="inline-flex align-items-center justify-content-center gap-2">
                                <span class="white-space-nowrap font-bold">Update {{ updateType }}</span>
                            </div>
                        </template>
                        <div v-if="updateType == 'group'">
                            <label for="" class="mb-1">Select Group</label>
                            <Dropdown v-model="updateValue" :options="dialogData" class="w-full capitalize" filter optionLabel="group_name" option_value="group_id" placeholder="Select Group">
                                <template #option="slotProps">
                                    <div class="flex align-items-center capitalize">
                                        <div>{{ slotProps.option.group_name }}</div>
                                    </div>
                                </template>
                            </Dropdown>
                        </div>

                        <div v-if="updateType == 'section'">
                            <label for="" class="mb-1">Select Class-Shift-Section</label>
                            <Dropdown v-model="updateValue" :options="dialogData" class="w-full capitalize" filter optionLabel="combination" placeholder="Select a Combination" @change="getCombinationIDForUpdate($event)">
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

                        <div v-if="updateType == 'category'">
                            <label for="" class="mb-1">Select Category</label>
                            <Dropdown v-model="updateValue" :options="dialogData" class="w-full capitalize" filter optionLabel="core_subcategory_name" optionValue="id" placeholder="Select a Category">
                                <template #option="slotProps">
                                    <span class="m-0 p-0 capitalize">
                                        {{ slotProps.option.core_subcategory_name }}
                                    </span>
                                </template>
                            </Dropdown>
                        </div>

                        <template #footer>
                            <Button label="Cancel" text severity="secondary" @click="visible = false" autofocus size="small" />
                            <Button label="Save" outlined severity="secondary" @click="updateSelectedStudents" autofocus size="small" />
                        </template>
                    </Dialog>
                </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 3rem" frozen></Column>
            <Column style="min-width: 200px" field="custom_student_id" header="Student Id">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Student ID" />
                </template>
            </Column>

            <Column style="min-width: 200px" field="student_name" header="Name">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Name" />
                </template>
            </Column>

            <Column style="min-width: 200px" field="group_detail.core_subcategory_name" header="Group">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Name" />
                </template>
            </Column>

            <Column style="min-width: 200px" field="class_roll" header="Roll">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Roll" />
                </template>
            </Column>

            <Column style="min-width: 200px" field="student_gender" header="Gender">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Gender" />
                </template>
            </Column>
            <Column style="min-width: 200px" field="student_religion" header="Religion">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Religion" />
                </template>
            </Column>

            <Column style="min-width: 200px" field="father_name" header="Father Name">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Father Name" />
                </template>
            </Column>

            <Column style="min-width: 200px" field="mother_name" header="Mother Name">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Mother Name" />
                </template>
            </Column>

            <Column style="min-width: 200px" field="student_dob" header="Date of Birth">
                <template #body="{ data }">
                    {{ data.student_dob ? formatDate(data.student_dob) : 'N/A' }}
                </template>
                <!-- <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Birth Date" />
                    </template> -->
            </Column>

            <Column style="min-width: 200px" field="blood_group" header="Blood Group">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Blood Group" />
                </template>
            </Column>

            <Column style="min-width: 200px" field="admission_date" header="Admission Date">
                <template #body="{ data }">
                    {{ data.admission_date ? formatDate(data.admission_date) : 'N/A' }}
                </template>
                <!-- <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Admission Date" />
                    </template> -->
            </Column>

            <Column style="min-width: 200px" field="gurdian_mobile" header="Guardian Contact">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Category" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style lang="scss" scoped>
th {
    background: #466784;
    color: #fff;
}

.card {
    padding: 15px;
}
</style>
