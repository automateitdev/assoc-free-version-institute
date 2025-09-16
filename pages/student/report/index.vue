<script setup>
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import axios from 'axios';


const toast = useToast();
const { fetchStudentListData } = useGlobalStore();
const { classShiftSectionData } = storeToRefs(useGlobalStore());

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
async function handleSearchForm() {
    try {
        try {
            if (studentSearch.value.shift_id && searchForm.year) {
                isSearching.value = true;

                let { data } = await axios.post('student-list', {
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
</script>

<template>
    <div>
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
            <!-- <DataTable class="p-datatable-sm" ref="dtf" id="divToPrint" v-model:filters="filters" filterDisplay="menu" dataKey="id" :value="searchData.students.data" paginator :rows="50" :rowsPerPageOptions="[20, 50, 70, 90]"> -->

            <DataTable
                class="p-datatable-sm"
                ref="dtf"
                id="divToPrint"
                v-model:filters="filters"
                :value="searchData?.students?.data"
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
                <!-- <template #header>
                    <div>
                        <Button size="small" style="margin-right: 5px" @click="printDocument()">PDF</Button>
                        <Button size="small" @click="exportCSV($event)">CSV</Button>
                    </div>
                    <div class="flex justify-content-end">
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        </span>
                    </div>
                </template> -->

                <Column style="min-width: 200px" field="custom_student_id" header="Student Id" class="text-capitalize">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Student ID" />
                    </template>
                </Column>

                <Column style="min-width: 200px" field="student_details.student_name" header="Name">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Name" />
                    </template>
                </Column>

                <Column style="min-width: 200px" field="class_roll" header="Roll">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Roll" />
                    </template>
                </Column>

                <Column style="min-width: 200px" field="student_details.student_gender" header="Gender">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Gender" />
                    </template>
                </Column>
                <Column style="min-width: 200px" field="student_details.student_religion" header="Religion">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Religion" />
                    </template>
                </Column>
                <Column style="min-width: 200px" field="academicsession.coresubcategories.core_subcategory_name" header="Session">
                    <template #body="{ data }">
                        <span class="capitalize">
                            {{ data.academicsession.coresubcategories.core_subcategory_name }}
                        </span>
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Session" />
                    </template>
                </Column>
                <Column style="min-width: 200px" field="categories.coresubcategories.core_subcategory_name" header="Category">
                    <template #body="{ data }">
                        <span class="capitalize">
                            {{ data.categories.coresubcategories.core_subcategory_name }}
                        </span>
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Category" />
                    </template>
                </Column>
                <Column style="min-width: 200px" field="combination.class_details" header="Group">
                    <template #body="{ data }">
                        <span class="capitalize">
                            {{ data.combination.class_details[0].groups.core_subcategory_name }}
                        </span>
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Group" />
                    </template>
                </Column>
                <Column style="min-width: 200px" field="guardian_details.gurdian_mobile" header="Guardian Contact">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Category" />
                    </template>
                </Column>
            </DataTable>
        </div>
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
