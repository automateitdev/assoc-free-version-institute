<script setup>
import { useToast } from 'primevue/usetoast';
import { storeToRefs } from 'pinia';
import { useWaiverStore } from '~/stores/waiver';
import axios from 'axios';
import { FilterMatchMode } from 'primevue/api';
const { fetchWaiverIndex, searchStudentsForWaiver, searchWaiverList, waiverPerStudent } = useWaiverStore();
const { waiverIndexData } = storeToRefs(useWaiverStore());

const toast = useToast();
const isLoading = ref(false);
const config = useRuntimeConfig();

const formData = reactive({
    student_id: [],
    fee_head_id: [],
    waiver_id: [],
    waiver_amount: [],
    academic_year_id: null
});

const groupOptions = ref([]);
const studentList = ref();
const excelUrl = ref();
const selectedClass = ref(null);
const selectedShiftSection = ref(null);
const selectedGroup = ref(null);
const selectedCategory = ref(null);
const selectedWaiver = ref(null);
const selectedFeehead = ref(null);
const selectedAcademicYear = ref(null);
const editingRows = ref([]);
const shiftAndSections = ref([]);
const shiftAndSectionsAssignedList = ref([]);
const groups = ref([]);
const waiverDataList = ref([]);

const selected_waiverAmount = reactive({
    waiver_amount: null,
    total_amount: null,
    fee_head_id: null,
    student_id: null,
    academic_year_id: null,
    waiver_id: null
});
const onRowEditSave = async (event) => {
    isLoading.value = true;
    let { newData, index } = event;

    selected_waiverAmount.waiver_id = selectedWaiver.value.id;
    selected_waiverAmount.fee_head_id = newData.fee_head_id;
    selected_waiverAmount.waiver_amount = newData.waiver_amount;
    selected_waiverAmount.total_amount = newData.total_amount;
    selected_waiverAmount.student_id = newData.student_id;
    selected_waiverAmount.academic_year_id = selectedAcademicYear.value.id;

    studentList.value[index] = newData;

    try {
        const { status, message, error } = await waiverPerStudent(selected_waiverAmount);
        if (status == 'success') {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message ?? 'Successfully Updated', life: 3000 });
            await fetchWaiverIndex();
            const { success, student_list, url, error } = await searchStudentsForWaiver(formdata_waiverSearch);

            if (success) {
                selected_waiverAmount.waiver_id = null;
                selected_waiverAmount.fee_head_id = null;
                selected_waiverAmount.waiver_amount = null;
                selected_waiverAmount.total_amount = null;
                selected_waiverAmount.student_id = null;
                selected_waiverAmount.academic_year_id = null;
                studentList.value = student_list;
                excelUrl.value = url;
            } else {
                toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
            }
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error!', detail: 'Something went wrong', life: 5000 });
        console.log(error);
    } finally {
        isLoading.value = false;
        selected_waiverAmount.waiver_id = null;
        selected_waiverAmount.fee_head_id = null;
        selected_waiverAmount.waiver_amount = null;
        selected_waiverAmount.total_amount = null;
        selected_waiverAmount.student_id = null;
        selected_waiverAmount.academic_year_id = null;
    }
};

onMounted(async () => {
    fetchWaiverIndex();
});

import useVisibilityChange from '~/composables/useVisibilityChange';
useVisibilityChange(async () => {
    fetchWaiverIndex();
    selected_waiverAmount.waiver_id = null;
    selected_waiverAmount.fee_head_id = null;
    selected_waiverAmount.waiver_amount = null;
    selected_waiverAmount.total_amount = null;
    selected_waiverAmount.student_id = null;
    selected_waiverAmount.academic_year_id = null;
});

const formdata_waiverSearch = reactive({
    academic_year_id: null,
    class_id: null,
    group_id: null
    // student_category_id: null
});
function getPivotID() {
    const [shift, section] = selectedShiftSection.value.split('-');
    const classId = selectedClass.value?.class_id;
    const foundClass = waiverIndexData.value.instituteClassMaps.find((item) => item.class_id == classId)?.class_details.find((item) => item.group_id == selectedGroup.value && item.shift_id == shift && item.section_id == section);

    return foundClass ? foundClass.pivot.id : null;
}

function getPivotID_assignedList() {
    const [shift, section] = assignedList_ShiftSection.value.split('-');
    const classId = assignedList_class.value?.class_id;
    const foundClass = waiverIndexData.value.instituteClassMaps.find((item) => item.class_id == classId)?.class_details.find((item) => item.group_id == assignedList_Group.value && item.shift_id == shift && item.section_id == section);

    return foundClass ? foundClass.pivot.id : null;
}

function getShiftAndSectionByClass($e) {
    let clsID = selectedClass.value.class_id;
    let data = waiverIndexData.value?.instituteClassMaps
        .filter((item) => item.class_id == clsID)
        .map((item) => {
            return item.class_details.map((temp) => {
                return {
                    shift: temp.shifts,
                    section: temp.sections
                };
            });
        });
    let temp = waiverIndexData.value?.instituteClassMaps
        .find((item) => item.class_id == clsID)
        ?.class_details.map((item) => {
            return {
                shift: item.shifts,
                section: item.sections
            };
        });
    const getKey = (item) => `${item.shift.id}-${item.section.id}`;
    const distinctData = temp.filter((item, index, self) => {
        return index === self.findIndex((t) => getKey(t) === getKey(item));
    });

    shiftAndSections.value = distinctData;
}

function getShiftAndSectionByClassAssignedList($e) {
    let clsID = assignedList_class.value.class_id;
    let data = waiverIndexData.value?.instituteClassMaps
        .filter((item) => item.class_id == clsID)
        .map((item) => {
            return item.class_details.map((temp) => {
                return {
                    shift: temp.shifts,
                    section: temp.sections
                };
            });
        });
    let temp = waiverIndexData.value?.instituteClassMaps
        .find((item) => item.class_id == clsID)
        ?.class_details.map((item) => {
            return {
                shift: item.shifts,
                section: item.sections
            };
        });
    const getKey = (item) => `${item.shift.id}-${item.section.id}`;
    const distinctData = temp.filter((item, index, self) => {
        return index === self.findIndex((t) => getKey(t) === getKey(item));
    });

    shiftAndSectionsAssignedList.value = distinctData;
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
function formatLabel(item) {
    const label = `${item.shift.core_subcategory_name} - ${item.section.core_subcategory_name}`;
    return capitalizeWords(label);
}
function formatValue(item) {
    return `${item.shift.id}-${item.section.id}`;
}
function getGroupsByShiftAndSection($e) {
    let [shift, section] = selectedShiftSection.value.split('-');

    groups.value = waiverIndexData.value.instituteClassMaps
        .find((item) => item.class_id == selectedClass.value?.class_id)
        ?.class_details.filter((item) => {
            return item.shift_id == shift && item.section_id == section;
        })
        .map((item) => item.groups);
}

const groups_assignedList = ref();
function getGroupsByShiftAndSectionAssignedList($e) {
    let [shift, section] = assignedList_ShiftSection.value.split('-');

    groups_assignedList.value = waiverIndexData.value.instituteClassMaps
        .find((item) => item.class_id == assignedList_class.value?.class_id)
        ?.class_details.filter((item) => {
            return item.shift_id == shift && item.section_id == section;
        })
        .map((item) => item.groups);
}

async function searchForStudents() {
    try {
        studentList.value = null;
        (formdata_waiverSearch.academic_year_id = selectedAcademicYear.value.id),
            (formdata_waiverSearch.class_id = selectedClass.value.class_id),
            (formdata_waiverSearch.group_id = selectedGroup.value),
            (formdata_waiverSearch.combinations_pivot_id = getPivotID()),
            // (formdata_waiverSearch.student_category_id = selectedCategory.value.id);
            (formdata_waiverSearch.waiver_id = selectedWaiver.value.id);
        formdata_waiverSearch.fee_head_id = selectedFeehead.value.map((elem) => elem.id);
        const { success, student_list, url, error } = await searchStudentsForWaiver(formdata_waiverSearch);

        if (success) {
            selected_waiverAmount.waiver_id = null;
            selected_waiverAmount.fee_head_id = null;
            selected_waiverAmount.waiver_amount = null;
            selected_waiverAmount.total_amount = null;
            selected_waiverAmount.student_id = null;
            selected_waiverAmount.academic_year_id = null;
            studentList.value = student_list;
            excelUrl.value = url;
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.log(error);
        toast.add({ severity: 'warn', summary: 'Something went wrong!', detail: 'Missing form value.', group: 'br', life: 3000 });
    }
}

async function downloadWaiverExcel() {
    window.open(`${config.public.BASE_URL}${excelUrl.value}`, '_blank');
}

let fd = ref(new FormData());
const file = ref();
function handleExcelFile($event) {
    file.value = $event.target.files ? $event.target.files[0] : null;
    fd.value.append('excel_file', file.value);
    fd.value.append('academic_year_id', formdata_waiverSearch.academic_year_id);
    fd.value.append('waiver_id', selectedWaiver.value.id);
    formdata_waiverSearch.fee_head_id.forEach(function (id) {
        fd.value.append('fee_head_id[]', id);
    });
}

async function uploadWaiverExcel() {
    const { data } = await axios.post('waiver-setup', fd.value);
    if (data.payload.data.status == 'success') {
        toast.add({ severity: 'success', summary: 'Success Message', detail: 'Waiver assigned successfully', group: 'br', life: 5000 });
    } else {
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'Something went wrong! Try later', group: 'br', life: 5000 });
    }
}

// assigned list
const assignedWaiverListLoading = ref(false);
const assignedList_AcademicYear = ref();
const assignedList_class = ref();
const assignedList_ShiftSection = ref();
const assignedList_Group = ref();
const assigned_list_search = reactive({
    academic_year_id: null,
    combinations_pivot_id: null
});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    custom_student_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    roll: { value: null, matchMode: FilterMatchMode.CONTAINS },
    fee_head_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    total_amount: { value: null, matchMode: FilterMatchMode.CONTAINS },
    waiver_name: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const waiver_list = ref();
async function searchForAssignedList() {
    try {
        assigned_list_search.academic_year_id = assignedList_AcademicYear.value.id;
        assigned_list_search.combinations_pivot_id = getPivotID_assignedList();
        assignedWaiverListLoading.value = true;
        const { success, waiverHistory, error } = await searchWaiverList(assigned_list_search);
        if (success) {
            waiver_list.value = waiverHistory;
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        toast.add({ severity: 'warn', summary: 'Error Message', detail: 'Something went wrong! Try Later', group: 'br', life: 5000 });
    } finally {
        assignedWaiverListLoading.value = false;
    }
}
</script>
<template>
    <Toast position="bottom-right" group="br" />

    <TabView>
        <TabPanel header="Assign Waiver">
            <div class="card">
                <div class="grid align-items-end">
                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Academic Year</label>
                        <Dropdown v-model="selectedAcademicYear" :options="waiverIndexData.academicYears" filter optionLabel="core_subcategory_name" placeholder="Academic Year" class="w-full">
                            <template #option="slotProps">
                                <div class="flex align-items-center">
                                    <div>{{ slotProps.option.core_subcategory_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Class</label>
                        <Dropdown
                            v-model="selectedClass"
                            :disabled="!selectedAcademicYear"
                            :options="waiverIndexData.instituteClassMaps"
                            @change="getShiftAndSectionByClass"
                            filter
                            optionLabel="class_name"
                            placeholder="Select Class"
                            class="w-full capitalize"
                        >
                            <template #option="slotProps">
                                <div class="flex align-items-center capitalize">
                                    <div>{{ slotProps.option.class_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label class="form-label font-bold">Shift-Section</label>
                        <Dropdown
                            :disabled="!selectedClass"
                            v-model="selectedShiftSection"
                            filter
                            class="w-full capitalize"
                            placeholder="Shift-Section"
                            :options="shiftAndSections"
                            :option-label="formatLabel"
                            :option-value="formatValue"
                            @change="getGroupsByShiftAndSection"
                        >
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label class="form-label font-bold">Group</label>
                        <Dropdown :disabled="!selectedShiftSection" v-model="selectedGroup" filter class="w-full capitalize" placeholder="Select Group" :options="groups" option-label="core_subcategory_name" option-value="id">
                            <template #option="slotProps">
                                <div class="flex align-items-center capitalize">
                                    <div>{{ slotProps.option.core_subcategory_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Select Waiver</label>
                        <Dropdown :disabled="!selectedGroup" v-model="selectedWaiver" :options="waiverIndexData.waivers" filter optionLabel="name" placeholder="Waiver" class="w-full">
                            <template #option="slotProps">
                                <div class="flex align-items-center">
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Select Feeheads</label>

                        <MultiSelect :disabled="!selectedGroup" v-model="selectedFeehead" display="chip" :options="waiverIndexData.feeHead" optionLabel="name" placeholder="Select Feeheads" :maxSelectedLabels="3" class="w-full">
                            <template #option="slotProps">
                                <div class="flex align-items-center">
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </MultiSelect>
                    </div>

                    <div class="col">
                        <Button class="" :disabled="!selectedFeehead || !selectedWaiver || !selectedFeehead" label="Search" size="small" icon="pi pi-search" @click="searchForStudents" />
                    </div>
                </div>
            </div>

            <div class="card">
                <DataTable
                    v-model:editingRows="editingRows"
                    v-model:filters="filters"
                    editMode="row"
                    dataKey="serial_index"
                    @row-edit-save="onRowEditSave"
                    :pt="{
                        table: { style: 'min-width: 50rem' },
                        column: {
                            bodycell: ({ state }) => ({
                                style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                            })
                        }
                    }"
                    :value="studentList"
                    paginator
                    :rows="5"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    filterDisplay="row"
                    stripedRows
                    showGridlines
                    :loading="isLoading"
                    class="p-datatable-sm"
                    sortMode="multiple"
                >
                    <template #header>
                        <Button label="Download Excel" severity="help" icon="pi pi-download" size="small" @click="downloadWaiverExcel" :disabled="!excelUrl"  v-if="studentList"/>
                        <label v-if="excelUrl" for="excelFile" class="p-button p-component p-button-info p-button-sm ml-2" type="submit" aria-label="Upload Excel" data-pc-name="button" data-pc-section="root" data-pd-ripple="true"
                            ><span class="p-button-icon p-button-icon-left pi pi-plus" data-pc-section="icon"></span><span class="p-button-label" data-pc-section="label">Add Excel</span
                            ><span
                                role="presentation"
                                aria-hidden="true"
                                data-p-ink="true"
                                data-p-ink-active="false"
                                class="p-ink"
                                data-pc-name="ripple"
                                data-pc-section="root"
                                style="height: 117px; width: 117px; top: -35.1333px; left: -39.6333px"
                            ></span
                        ></label>

                        <input v-if="excelUrl" id="excelFile" type="file" class="form-control" @change="handleExcelFile($event)" accept=".xlsx, .xls, .csv" style="display: none" />
                        <Button v-if="excelUrl" @click="uploadWaiverExcel" icon="pi pi-upload" label="Upload Excel" size="small" class="ml-2" :disabled="!file" />
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

                    <Column header="Student ID" field="custom_student_id">
                        <template #body="{ data }">
                            <div class="flex justify-content-left gap-2">
                                <span class="text-center">{{ data.custom_student_id }}</span>
                            </div>
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="ID" />
                        </template>
                    </Column>

                    <Column field="name" header="Name" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Name" />
                        </template>
                    </Column>
                    <Column field="roll" header="Roll" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Roll" />
                        </template>
                    </Column>
                    <Column field="fee_head_name" header="Feehead" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Feehead" />
                        </template>
                    </Column>
                    <Column field="total_amount" header="Fee Amount" style="width: 20%" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Total Amount" />
                        </template>
                    </Column>
                    <Column field="waiver_amount" header="Waiver Amount" style="width: 20%">
                        <template #editor="{ data, field }">
                            <InputNumber v-model="data[field]" :max="data['total_amount']" />
                        </template>
                    </Column>
                    <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
                </DataTable>
            </div>
        </TabPanel>
        <TabPanel header="Assigned List">
            <div class="card">
                <div class="grid align-items-end">
                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Academic Year</label>
                        <Dropdown v-model="assignedList_AcademicYear" :options="waiverIndexData.academicYears" filter optionLabel="core_subcategory_name" placeholder="Academic Year" class="w-full">
                            <template #option="slotProps">
                                <div class="flex align-items-center capitalize">
                                    <div>{{ slotProps.option.core_subcategory_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Class</label>
                        <Dropdown
                            v-model="assignedList_class"
                            :disabled="!assignedList_AcademicYear"
                            :options="waiverIndexData.instituteClassMaps"
                            @change="getShiftAndSectionByClassAssignedList"
                            filter
                            optionLabel="class_name"
                            placeholder="Select Class"
                            class="w-full capitalize"
                        >
                            <template #option="slotProps">
                                <div class="flex align-items-center capitalize">
                                    <div>{{ slotProps.option.class_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label class="form-label font-bold">Shift-Section</label>

                        <Dropdown
                            :disabled="!assignedList_class"
                            v-model="assignedList_ShiftSection"
                            filter
                            class="w-full capitalize"
                            placeholder="Shift-Section"
                            :options="shiftAndSectionsAssignedList"
                            :option-label="formatLabel"
                            :option-value="formatValue"
                            @change="getGroupsByShiftAndSectionAssignedList"
                        />
                    </div>

                    <div class="md:col-4">
                        <label class="form-label font-bold">Group</label>
                        <Dropdown :disabled="!assignedList_ShiftSection" v-model="assignedList_Group" filter class="w-full capitalize" placeholder="Select Group" :options="groups_assignedList" option-label="core_subcategory_name" option-value="id">
                            <template #option="slotProps">
                                <div class="flex align-items-center capitalize">
                                    <div>{{ slotProps.option.core_subcategory_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="col">
                        <Button class="" :loading="assignedWaiverListLoading" :disabled="!assignedList_ShiftSection || !assignedList_Group" label="Search" size="small" icon="pi pi-search" @click="searchForAssignedList" />
                    </div>
                </div>
            </div>

            <div class="card">
                <DataTable
                    v-model:editingRows="editingRows"
                    v-model:filters="filters"
                    :globalFilterFields="['name', 'feehead_name', 'waiver_name', 'waiver_amount']"
                    :value="waiver_list"
                    paginator
                    :rows="5"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    filterDisplay="grid"
                    stripedRows
                    showGridlines
                    :loading="assignedWaiverListLoading"
                    class="p-datatable-sm"
                >
                    <template #header>
                        <div class="flex justify-content-end">
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
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

                    <Column field="name" header="Student Name"></Column>
                    <Column field="feehead_name" header="Feehead"></Column>
                    <Column field="waiver_name" header="Waiver"></Column>
                    <Column field="waiver_amount" header="Waiver Amount"> </Column>
                </DataTable>
            </div>
        </TabPanel>
    </TabView>
</template>
