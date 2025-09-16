<script setup>
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';
import { FilterMatchMode } from 'primevue/api';
import { useFeeAmountStore } from '~/stores/feeAmountStore';
const { feesubheadReassign, studentWiseRemovedFeeheads } = useFeeAmountStore();

import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
const toast = useToast();
const confirm = useConfirm();

import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import axios from 'axios';

// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// pdfMake.vfs = pdfFonts.pdfMake.vfs
const selectedData = ref();
const feesubheadDialogVisible = ref(false);
const selectedFeeheads = ref();

const { fetchStudentListData } = useGlobalStore();
const { classShiftSectionData } = storeToRefs(useGlobalStore());
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    custom_student_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    roll: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Gender: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Religion: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Category: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

let select_all = ref(false);
const searchForm = reactive({});
const formData = reactive({
    students: []
});

function clearFilter() {
    filters.value['global'].value = null;
}

let studentSearch = ref({
    years: null,
    instituteClassMap: null,
    section_id: null,
    academic_year_id: null,
    shift_id: null,
    instituteClassMapId: null,
    combinations_pivot_id: null,
    feeheads: null,
    feesubheads: null,
    feemaps: null
});
onMounted(async () => {
    let { data } = await axios.get('remove-setup');
    studentSearch.value.years = data.payload.data.academicYears;
    studentSearch.value.instituteClassMap = data.payload.data.instituteClassMap;
    studentSearch.value.feeheads = data.payload.data.feeHead;
    studentSearch.value.feesubheads = data.payload.data.feeSubhead;
    studentSearch.value.feemaps = data.payload.data.feeMapping;
    fetchStudentListData();
});
//  visibility hook
useVisibilityChange(async () => {
    let { data } = await axios.get('remove-setup');
    studentSearch.value.years = data.payload.data.academicYears;
    studentSearch.value.instituteClassMap = data.payload.data.instituteClassMap;
    studentSearch.value.feeheads = data.payload.data.feeHead;
    studentSearch.value.feesubheads = data.payload.data.feeSubhead;
    fetchStudentListData();
});

function getCombinationID($event) {
    let { id, shift, section } = $event.value;
    studentSearch.value.instituteClassMapId = id;
    // Find the relevant class_details object
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

async function handleFeesubheadRemove() {
    try {
        isSearching.value = true;
        let { data } = await axios.post('remove/feeSubHead', {
            student_id: selectedData.value.map((elem) => elem.student_id),
            fee_subhead_id: searchForm.feesubheads,
            academic_year_id: searchForm.year.id
        });
        if (data.payload.data.status == 'success') {
            toast.add({ severity: 'success', summary: 'Success', detail: 'Feehead Removed Successfully', life: 5000, group: 'br' });
        }
    } catch (err) {
            toast.add({ severity: 'error', summary: 'Error Message', detail: 'Something Went Wrong! try later.', life: 5000, group: 'br' });
    } finally {
        isSearching.value = false;
        searchForm.feehead.value = null
        searchForm.feesubheads.value = null
    }
}

import { computed } from 'vue';

const filteredFeeSubheads = computed(() => {
    if (!searchForm.feehead || !studentSearch.value.feemaps) return [];

    const selectedFeehead = studentSearch.value.feemaps.find((item) => item.fee_head_id === searchForm.feehead);

    return selectedFeehead
        ? selectedFeehead.fee_subheads.map((subhead) => ({
              fee_subhead_id: subhead.fee_subhead_id,
              fee_subhead_name: subhead.fee_subhead_name
          }))
        : [];
});
let searchData = reactive({
    students: []
});
let isSearching = ref(false);
async function handleSearchForm() {
    try {
        try {
            if (studentSearch.value.shift_id && searchForm.year) {
                isSearching.value = true;

                let { data } = await axios.post('remove/search', {
                    institute_class_map_id: studentSearch.value.instituteClassMapId,
                    section_id: studentSearch.value.section_id,
                    shift_id: studentSearch.value.shift_id,
                    // combinations_pivot_id: studentSearch.value.combinations_pivot_id,
                    academic_year_id: searchForm.year.id
                });

                searchData.students = data.payload.data.student_list;
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

function selectAll() {
    formData.students = [];
    if (!select_all.value) {
        for (let i in searchData.students) {
            formData.students.push(searchData.students[i].id);
        }
    }
}

const confirm2 = (event) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Do you want to delete this record?',
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
        acceptClass: 'p-button-danger p-button-sm',
        rejectLabel: 'Cancel',
        acceptLabel: 'Confirm',
        accept: () => {
            handleFeesubheadRemove();
        },
        reject: () => {
            toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
        }
    });
};

const ReassignDialogVisible = ref(false);
const selectedStudent = ref(null);
const reassign = reactive({ student_id: null, academic_year_id: null, fee_subhead_id: null });
function handleReassign(data) {
    (selectedStudent.value = null), (selectedStudent.value = data);
    reassign.student_id = data.student_id;
    reassign.academic_year_id = searchForm.year.id;
    ReassignDialogVisible.value = true;
}

const studentWiseRemovedDialog = ref(false);
const showFeesubheadFormData = reactive({ student_id: '', academic_year_id: '' });
const removedFeesubheadList = ref([]);

async function handleFeesubheadView(data) {
    (selectedStudent.value = null), (selectedStudent.value = data);
    showFeesubheadFormData.student_id = data.student_id;
    showFeesubheadFormData.academic_year_id = searchForm.year.id;
    studentWiseRemovedDialog.value = true;

    const { success, feeheads } = await studentWiseRemovedFeeheads(showFeesubheadFormData);
    if (success) {
        removedFeesubheadList.value = feeheads;
    } else {
        toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
    }
}

async function reassignFeesubheadsToStudent() {
    try {
        reassign.fee_subhead_id = searchForm.feesubheads;
        const { success, error } = await feesubheadReassign(reassign);

        if (success) {
            toast.add({ severity: 'success', summary: 'Success Message', detail: 'Successfully Assigned', group: 'br', life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        if (error.response) {
            const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
            const formattedErrors = errors.map((err) => `${err.message}`).join('\n');
            return { success: false, error: formattedErrors };
        } else {
            return { success: false, error: 'An error occurred during login.' };
        }
    }
}

// pdf functionalities
const pdfSection = (ref < HTMLElement) | (null > null);
const dtf = ref([]);
const exportCSV = () => {
    dtf.value.exportCSV();
    console.log(dtf);
};
const printDocument = async () => {
    // date area
    const newdate = new Date();

    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };

    const formattedDate = newdate.toLocaleDateString('en-us', options);
    // grabber
    const pdfTable = document.getElementById('divToPrint');
    const pdfTableHeader = pdfTable.querySelector('.p-datatable-header');
    const pdfTablePaginator = pdfTable.querySelector('.p-paginator-bottom');

    //html to pdf format
    pdfTableHeader.style.display = 'none';

    pdfTablePaginator.style.display = 'none';
    var html = htmlToPdfmake(pdfTable.innerHTML);

    //font creation
    pdfMake.fonts = {
        globalFont: { normal: 'https://fonts.cdnfonts.com/s/109/DejaVuSerif.woff', bold: 'https://fonts.cdnfonts.com/s/109/DejaVuSerif.woff' }
    };

    const documentDefinition = {
        content: [
            {
                columns: [
                    { image: 'snow', width: 100 },
                    [
                        { text: 'Automate IT Limited', margin: [0, 20, 0, 0], fontSize: 20, color: '#a2a9b0' },
                        { text: 'Banasree,Dhaka', fontSize: 12, bold: true, color: '#a2a9b0' }
                    ]
                ]
            },

            html
        ],
        images: {
            snow: 'https://media.istockphoto.com/id/1352770685/vector/feather-pen-and-planet-logo-combination.jpg?s=2048x2048&w=is&k=20&c=0Xex5aQO42fkXME9Io39JKDpKMGMqe68x0ZKRpGvwQc='
        },
        defaultStyle: {
            font: 'globalFont',
            fontSize: 7
        },
        footer: function (currentPage, pageCount) {
            return [
                { canvas: [{ type: 'line', x1: 25, y1: 5, x2: 575, y2: 5, lineWidth: 1 }] },
                {
                    columns: [
                        { text: 'Powered by: Academy-Institute Management System', alignment: 'left', width: 'auto', margin: 16, fontSize: 8 },
                        { text: currentPage.toString() + ' of ' + pageCount, alignment: 'center', margin: 16, fontSize: 8 },
                        { text: `${formattedDate}`, alignment: 'right', margin: 16, fontSize: 8 }
                    ]
                }
            ];
        },
        pageMargins: [40, 60, 40, 60]
    };
    // pdfMake.vfs = pdfFonts.pdfMake.vfs;
    pdfMake.createPdf(documentDefinition).open();

    pdfTableHeader.style.display = 'block';
    pdfTablePaginator.style.display = 'block';
};
</script>

<template>
    <Toast position="bottom-right" group="br" />
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
                    <Button label="Search" icon="pi pi-search" :loading="isSearching" type="submit" size="small" :disabled="!searchForm.class || !searchForm.year" />
                </div>
            </form>
        </div>

        <!-- Datatable start from here -->
        <div class="card" style="margin-top: -15px" ref="pdfSection">
            <DataTable
                class="p-datatable-sm"
                ref="dtf"
                id="divToPrint"
                v-model:filters="filters"
                v-model:selection="selectedData"
                :value="searchData.students"
                dataKey="id"
                filterDisplay="row"
                :loading="isSearching"
                stripedRows
                showGridlines
                tableStyle="min-width: 50rem"
                paginator
                :rows="50"
                :rowsPerPageOptions="[20, 50, 70, 90]"
            >
                <template #header>
                    <Button :disabled="!selectedData?.length" label="Bulk Remove" icon="pi pi-trash" size="small" severity="warning" @click="feesubheadDialogVisible = true" />
                </template>
                <template #empty>No data to show</template>
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
                <Column style="min-width: 200px" field="custom_student_id" header="Student ID">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Student ID" />
                    </template>
                </Column>
                <Column style="min-width: 200px" field="name" header="Name">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Name" />
                    </template>
                </Column>
                <Column style="min-width: 200px" field="roll" header="Class Roll">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Class Roll" />
                    </template>
                </Column>
                <Column style="min-width: 200px" field="Gender" header="Gender">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Gender" />
                    </template>
                </Column>
                <Column style="min-width: 200px" field="Religion" header="Religion">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Religion" />
                    </template>
                </Column>
                <Column style="min-width: 200px" field="Category" header="Category">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Category" />
                    </template>
                </Column>
                <Column style="min-width: 200px" header="Action">
                    <template #body="{ data }">
                        <div class="flex align-items-center gap-2">
                            <Button label="Reassign" size="small" icon="pi pi-refresh" @click="handleReassign(data)" />
                            <Button label="Removed" size="small" icon="pi pi-eye" severity="info" @click="handleFeesubheadView(data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>

    <!-- bulk remove dialog -->
    <Dialog v-model:visible="feesubheadDialogVisible" modal header="Remove Feehead" :style="{ width: '25rem' }">
        <div class="">
            <div>
                <label class="font-bold" for="feeheads">Select Feehead</label>
                <Dropdown id="feeheads" v-model="searchForm.feehead" :options="studentSearch.feemaps" class="w-full" filter optionLabel="fee_head_name" optionValue="fee_head_id" placeholder="Select Feehead"></Dropdown>
            </div>
            <div>
                <label class="font-bold" for="feeheads">Select Feesubhead(s)</label>
                <MultiSelect
                    v-model="searchForm.feesubheads"
                    display="chip"
                    :disabled="!searchForm.feehead"
                    :options="filteredFeeSubheads"
                    optionLabel="fee_subhead_name"
                    optionValue="fee_subhead_id"
                    placeholder="Select Feesubheads"
                    :maxSelectedLabels="3"
                    class="w-full"
                />
            </div>
        </div>

        <template #footer>
            <ConfirmPopup></ConfirmPopup>
            <Button label="Cancel" size="small" text severity="secondary" @click="feesubheadDialogVisible = false" autofocus />
            <Button :disabled="!searchForm?.feesubheads?.length > 0" label="Remove" size="small" severity="danger" autofocus @click="confirm2($event)" />
        </template>
    </Dialog>

    <!-- Feesubhead reassign dialog -->
    <Dialog v-model:visible="ReassignDialogVisible" modal header="Reassign Feehead" :style="{ width: '25rem' }">
        <div class="justify-content-center">
            <div class="mb-2">
                <p class="m-0 capitalize"><b>Name:</b> {{ selectedStudent.name }}</p>
                <p class="m-0 capitalize"><b>Student ID:</b> {{ selectedStudent.custom_student_id }}</p>
                <p class="m-0 capitalize"><b>Roll:</b> {{ selectedStudent.roll }}</p>
                <p class="m-0 capitalize"><b>Category:</b> {{ selectedStudent.Category }}</p>
            </div>

            <Dropdown id="feeheads" v-model="searchForm.feehead" :options="studentSearch.feemaps" class="w-full" filter optionLabel="fee_head_name" optionValue="fee_head_id" placeholder="Select Feehead"></Dropdown>

            <label class="font-bold" for="feeheads">Select Feesubhead(s)</label>
            <MultiSelect
                v-model="searchForm.feesubheads"
                display="chip"
                :disabled="!searchForm.feehead"
                :options="filteredFeeSubheads"
                optionLabel="fee_subhead_name"
                optionValue="fee_subhead_id"
                placeholder="Select subheads"
                :maxSelectedLabels="3"
                class="w-full"
            />
        </div>

        <template #footer>
            <ConfirmPopup></ConfirmPopup>
            <Button label="Cancel" size="small" text severity="secondary" @click="feesubheadDialogVisible = false" autofocus />
            <Button :disabled="!searchForm.feesubheads?.length" label="Assign" size="small" severity="success" autofocus @click="reassignFeesubheadsToStudent" />
        </template>
    </Dialog>

    <!-- Studentwise removed Feesubhead Show dialog -->
    <Dialog v-model:visible="studentWiseRemovedDialog" modal header="Removed Feesubheads" :style="{ width: '25rem' }">
        <div v-if="removedFeesubheadList.length > 0">
            <p class="m-0 capitalize"><b>Name:</b> {{ selectedStudent.name }}</p>
            <p class="m-0 capitalize"><b>Student ID:</b> {{ selectedStudent.custom_student_id }}</p>
            <p class="m-0 capitalize"><b>Roll:</b> {{ selectedStudent.roll }}</p>
            <p class="m-0 capitalize"><b>Category:</b> {{ selectedStudent.Category }}</p>
            <p class="m-0"><b>Feehead Removed:</b></p>
            <ul class="m-0">
                <li v-for="feehead in removedFeesubheadList" :key="feehead.id">{{ feehead.name }}</li>
            </ul>
        </div>
        <div v-else>
            <p>No feehead removed</p>
        </div>
    </Dialog>
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
