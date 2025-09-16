<script setup>
import { storeToRefs } from 'pinia';
import { usePromotionStore } from '~/stores/promotion';
const { fetchPromotionIndex, fetchStudentList, promotionRequest } = usePromotionStore();
const { instituteClassMap, academicYears, academicSession, studentList } = storeToRefs(usePromotionStore());
const { fetchStudentListData } = useGlobalStore();
const { classShiftSectionData } = storeToRefs(useGlobalStore());
const isSearching = ref(false);
const searchForm = reactive({});
let studentSearch = ref({
    years: null,
    instituteClassMap: null,
    section_id: null,
    academic_year_id: null,
    shift_id: null,
    instituteClassMapId: null
});
const formData = reactive({
    institute_class_map_id: null,
    section_id: null,
    shift_id: null,
    academic_year_id: null
});
async function handleSearchForm() {
    try {
        isSearching.value = true;
        selectedStudents.value = null;
        if (studentSearch.value.shift_id && searchForm.year) {
            (formData.institute_class_map_id = studentSearch.value.instituteClassMapId), (formData.section_id = studentSearch.value.section_id), (formData.shift_id = studentSearch.value.shift_id), (formData.academic_year_id = searchForm.year.id);
            await fetchStudentList(formData);
        } else {
            toast.add({ severity: 'error', summary: 'Error!', detail: 'Field Must not be empty!', life: 3000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error!', detail: 'Something went wrong!', life: 3000 });
    } finally {
        isSearching.value = false;
    }
}

const classShiftSection = ref();
const promotionFormData = reactive({
    present_academic_year_id: searchForm?.year?.id ?? null,
    combinations_pivot_id: null,
    academic_year_id: null,
    academic_session_id: null,
    student_id: null,
    new_roll: null,
    class_id: null,
    group_id: null
});

function getCombinationID($event) {
    let { id, shift, section } = $event.value;
    studentSearch.value.instituteClassMapId = id;

    // Find the relevant class_details object
    let relevantClassDetails = instituteClassMap.value.find((i) => i.id == id).class_details.find((cls) => cls.shifts.id == shift && cls.sections.id == section);

    // Set the section_id and shift_id based on the relevant class_details
    if (relevantClassDetails) {
        studentSearch.value.section_id = relevantClassDetails.sections.id;
        studentSearch.value.shift_id = relevantClassDetails.shift_id;
    } else {
        // Handle the case when relevantClassDetails is not found
        console.log('Class details not found for the given criteria.');
    }
}

const groups = ref();
const matchedClassMap = ref();
function getGroupList($event) {
    let { id, shift, section } = $event.value;
    // Find the relevant class object
    let classObject = instituteClassMap.value.find((i) => i.id == id);

    if (classObject) {
        // Find the relevant class_details object
        matchedClassMap.value = classObject;
        // Set the section_id and shift_id based on the relevant class_details
        promotionFormData.class_id = classObject.class_id;

        groups.value = instituteClassMap.value
            .find((item) => item.class_id == promotionFormData.class_id)
            ?.class_details.filter((item) => {
                return item.shift_id == shift && item.section_id == section;
            })
            .map((item) => item.groups);
        // console.log(groups);
    } else {
        // Handle the case when the class object is not found
        console.log('Class not found for the given id.');
    }
}

function findPromotionPivot() {
    let relevantClassDetails = instituteClassMap.value
        .find((i) => i.id == classShiftSection.value.id)
        .class_details.find((cls) => cls.shifts.id == classShiftSection.value.shift && cls.sections.id == classShiftSection.value.section && cls.groups.id == promotionFormData.group_id);
    if (relevantClassDetails) {
        promotionFormData.combinations_pivot_id = relevantClassDetails.pivot.id;
        promotionFormData.present_academic_year_id = searchForm?.year?.id ?? null;
    }
}
async function handleMigrationRequest() {
    try {
        promotionFormData.student_id = formData.student_id = selectedStudents.value.map((elem) => elem.student_id) ?? [];
        promotionFormData.new_roll = formData.student_id = selectedStudents.value.map((elem) => elem.class_roll) ?? [];
        promotionFormData.present_combination_id = selectedStudents.value.map((elem) => elem.combinations_pivot_id) ?? [];
        const { status, message, error } = await promotionRequest(promotionFormData);
        if (status == 'success') {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message ?? 'Successfully Updated', life: 3000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error!', detail: 'Something went wrong!', life: 3000 });
    } finally {
        await fetchStudentList(formData);
        isSearching.value = false;
    }
}

import { FilterMatchMode, FilterOperator } from 'primevue/api';
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
    'guardian_details.father_mobile': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'combination.class_details': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onMounted(async () => {
    fetchPromotionIndex();
    studentSearch.value.years = academicYears;
    studentSearch.value.instituteClassMap = instituteClassMap;
    fetchStudentListData();
});
//  visibility hook
useVisibilityChange(async () => {
    fetchPromotionIndex();
    studentSearch.value.years = academicYears;
    studentSearch.value.instituteClassMap = instituteClassMap;
    fetchStudentListData();
});

import { useToast } from 'primevue/usetoast';
const toast = useToast();
const visible = ref(false);

let selectedStudents = ref();

const onCellEditComplete = (event) => {
    // console.log(event)
    let { newData, index  } = event;
    studentList.value.data[index] = newData;
};
</script>
<template>
    <Toast position="bottom-right" group="br" />
    <section class="card">
        <h4 class="bold">Migration: Promotion</h4>
        <form action="" @submit.prevent="handleSearchForm" class="grid grid-flow-row">
            <div class="col-12 md:col-3">
                <label for="" class="mb-1"><b>Academic Year</b></label>
                <Dropdown v-model="searchForm.year" :options="academicYears" filter optionLabel="core_subcategory_name" placeholder="Select Academic Year" class="w-full text-capitalize" />
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
    </section>

    <section class="card">
        <DataTable
            class="p-datatable-sm"
            ref="dtf"
            id="divToPrint"
            v-model:selection="selectedStudents"
            v-model:filters="filters"
            :value="studentList?.data"
            dataKey="id"
            filterDisplay="row"
            :loading="isSearching"
            stripedRows
            showGridlines
            scrollable
            paginator
            :rows="50"
            :rowsPerPageOptions="[20, 50, 70, 90]"
            :globalFilterFields="['custom_student_id', 'name', 'class_roll']"
            editMode="cell" 
            @cell-edit-complete="onCellEditComplete"
            :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                    bodycell: ({ state }) => ({
                        class: [{ 'pt-0 pb-0': state['d_editing'] }]
                    })
                }
            }"
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
                <!-- Button to show promotion form -->
                <Button label="Migrate" @click="visible = true" icon="pi pi-arrow-right-arrow-left" size="small" v-if="studentList" :disabled="!selectedStudents?.length" />
                <!-- Dialog form for promotion -->
                <Dialog v-model:visible="visible" modal header="Migration Information" style="max-width: 600px">
                    <form action="" class="grid">
                        <div class="col-12 md:col-6">
                            <label for=""><b>Academic Year</b></label>
                            <Dropdown v-model="promotionFormData.academic_year_id" :options="academicYears" filter optionLabel="core_subcategory_name" optionValue="id" placeholder="Select Academic Year" class="w-full text-capitalize" />
                        </div>

                        <div class="col-12 md:col-6">
                            <label for=""><b>Academic Session</b></label>
                            <Dropdown
                                v-model="promotionFormData.academic_session_id"
                                :options="academicSession"
                                filter
                                optionLabel="core_subcategory_name"
                                optionValue="id"
                                placeholder="Select Academic Session"
                                class="w-full text-capitalize"
                                :disabled="!promotionFormData.academic_year_id"
                            />
                        </div>

                        <div class="col-12 md:col-6">
                            <label for=""><b>Class Shift Section</b></label>
                            <Dropdown
                                v-model="classShiftSection"
                                :options="classShiftSectionData.classes"
                                class="w-full capitalize"
                                filter
                                optionLabel="combination"
                                placeholder="Select a Combination"
                                @change="getGroupList($event)"
                                :disabled="!promotionFormData.academic_session_id"
                            >
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

                        <div class="col-12 md:col-6">
                            <label for=""><b>Group</b></label>
                            <Dropdown
                                :disabled="!promotionFormData.class_id"
                                v-model="promotionFormData.group_id"
                                filter
                                class="w-full capitalize"
                                placeholder="Select Group"
                                :options="groups"
                                option-label="core_subcategory_name"
                                option-value="id"
                                @change="findPromotionPivot($event)"
                            >
                                <template #option="slotProps">
                                    <div class="flex align-items-center capitalize">
                                        <div>{{ slotProps.option.core_subcategory_name }}</div>
                                    </div>
                                </template>
                            </Dropdown>
                        </div>

                        <div class="col-12 flex justify-content-end gap-2">
                            <Button type="button" label="Cancel" severity="secondary" @click="visible = false" size="small"></Button>
                            <Button type="button" label="Promote" @click="handleMigrationRequest" size="small" :disabled="!promotionFormData.combinations_pivot_id || !promotionFormData.present_academic_year_id"></Button>
                        </div>
                    </form>
                </Dialog>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem" frozen></Column>
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

            <Column style="min-width: 200px" field="class_roll" header="Roll (Editable)">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Roll" />
                </template>
                <template #editor="{ data, field }">
                    <template v-if="field !== 'price'">
                        <InputText v-model="data[field]" autofocus />
                    </template>
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
            <Column style="min-width: 200px" field="guardian_details.father_mobile" header="Guardian Contact">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Category" />
                </template>
            </Column>
        </DataTable>
    </section>
</template>
