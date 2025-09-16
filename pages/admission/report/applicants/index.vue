<script setup>
import { storeToRefs } from 'pinia';
import { useAdmissionStore } from '~/stores/admission';
import { useToast } from 'primevue/usetoast';
import { useRuntimeConfig } from 'nuxt/app';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const config = useRuntimeConfig();
const toast = useToast();
const { classSetupIndex, applicantList, AllApplicantsList, loading } = storeToRefs(useAdmissionStore());
const { fetchClassSetupIndex, fetchAppliedListByYear, fetchAllApplicantList } = useAdmissionStore();
const admissionAcademicYears = ref();
const academicYearSearch = ref();
const admissionSetupData = ref();

onMounted(async () => {
    await fetchClassSetupIndex();
    admissionSetupData.value = classSetupIndex.value.admissionClassSetup;
    destructureStartup();
});
//  visibility hook
useVisibilityChange(async () => {
    await fetchClassSetupIndex();
    admissionSetupData.value = classSetupIndex.value.admissionClassSetup;
    destructureStartup();
});

function destructureStartup() {
    admissionAcademicYears.value = classSetupIndex.value.admission_startup.filter((item) => item.category_name === 'Academic Year').flatMap((item) => item.subcategories);
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

const dt = ref();
const totalRecords = ref(0);
const applicants = ref();
const selectedApplicants = ref([]);
const selectAll = ref(false);
const first = ref(0);
const filters = ref({
    unique_number: { value: '', matchMode: 'contains' },
    assigned_roll: { value: '', matchMode: 'contains' },
    edu_information: { value: '', matchMode: 'contains' },
    student_name_bangla: { value: '', matchMode: 'contains' },
    student_name_english: { value: '', matchMode: 'contains' },
    class: { value: '', matchMode: 'contains' },
    shift: { value: '', matchMode: 'contains' },
    group: { value: '', matchMode: 'contains' },
    approval_status: { value: '', matchMode: 'contains' }
});


const exportExcel = () => {
    // Define the columns to export
    const columns = [
        { header: 'Unique Number', key: 'unique_number' },
        { header: 'Assigned Roll', key: 'assigned_roll' },
        { header: 'SSC Roll', key: 'edu_information' },
        { header: 'Name', key: 'student_name_english' },
        { header: 'Class', key: 'class' },
        { header: 'Shift', key: 'shift' },
        { header: 'Group', key: 'group' },
        { header: 'Payment State', key: 'approval_status' }
    ];

    // Map the selected data to include only the specified columns
    const data = selectedApplicants.value.map((item) => {
        const row = {};
        columns.forEach((col) => {
            if (col.key === 'edu_information') {
                const eduInfo = JSON.parse(item[col.key]);
                row[col.header] = eduInfo[0]?.roll ? eduInfo[0].roll : 'N/A';
            } else {
                row[col.header] = item[col.key];
            }
        });
        return row;
    });

    // Create the worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, { header: columns.map((col) => col.header) });

    // Create and save the workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Collection');
    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `applicant_report_${currentDate}.xlsx`);
};

const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
        head: [['Unique Number', 'Assigned Roll', 'SSC Roll', 'Name', 'Class', 'Shift', 'Group', 'Payment State']],
        body: selectedApplicants.value.map((item) => {
            const eduInfo = JSON.parse(item.edu_information);
            const sscRoll = eduInfo[0]?.roll ? eduInfo[0].roll : 'N/A';
            return [
                item.unique_number,
                item.assigned_roll,
                sscRoll,
                item.student_name_english,
                item.class,
                item.shift,
                item.group,
                item.approval_status
            ];
        })
    });
    const currentDate = new Date().toISOString().split('T')[0];
    doc.save(`applicant_report_${currentDate}.pdf`);
};

const lazyParams = ref({});

const loadLazyData = (event) => {
    loading.value = true;
    lazyParams.value = { ...lazyParams.value, first: event?.first || first.value };
    setTimeout(() => {
        fetchAppliedListByYear(academicYearSearch.value, lazyParams.value)
            .then(() => {
                applicants.value = applicantList.value.admission_applied.data;
                totalRecords.value = applicantList.value.admission_applied.total;
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
    lazyParams.value.filters = filters.value;
    loadLazyData(event);
};
const onSelectAllChange = async (event) => {
    selectAll.value = event.checked;
    if (selectAll.value) {
        loading.value = true;
        try {
            lazyParams.value = { ...lazyParams.value, first: 0, rows: -1 };
            await fetchAllApplicantList(academicYearSearch.value, lazyParams.value);
            selectedApplicants.value = AllApplicantsList.value.admission_applied.data;
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            loading.value = false;
        }
    } else {
        selectAll.value = false;
        selectedApplicants.value = [];
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
    <div class="card">
        <h4 class="text-primary font-bold">Applicant List</h4>
        <div class="flex flex-wrap align-items-end">
            <div class="md:col-3">
                <Dropdown class="w-full capitalize" v-model="academicYearSearch" :options="admissionAcademicYears" optionLabel="subcategory_name" optionValue="subcategory_name" placeholder="Search By Academic Year" @change="loadLazyData">
                    <template #option="slotProps">
                        <div class="flex align-items-center capitalize">
                            <div>{{ slotProps.option.subcategory_name }}</div>
                        </div>
                    </template>
                </Dropdown>
            </div>
        </div>
    </div>
    <div class="card">
        <DataTable
            :value="applicants"
            lazy
            paginator
            :first="first"
            :rows="25"
            :rowsPerPageOptions="[25, 50, 100]"
            v-model:filters="filters"
            ref="dt"
            dataKey="id"
            :totalRecords="totalRecords"
            :loading="loading"
            @page="onPage($event)"
            @sort="onSort($event)"
            @filter="onFilter($event)"
            filterDisplay="row"
            v-model:selection="selectedApplicants"
            :selectAll="selectAll"
            @select-all-change="onSelectAllChange"
            @row-select="onRowSelect"
            @row-unselect="onRowUnselect"
            tableStyle="min-width: 75rem"
            class="p-datatable-sm"
            showGridlines
            stripedRows
            scrollable scrollHeight="500"
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

            <template #header>
                <div style="text-align: left">
                    <Button class="mr-2" label='Excel' icon="pi pi-file-excel" severity="success" text @click="exportExcel()" size="small" :disabled="selectedApplicants.length <= 0" />
                    <Button class="mr-2" label='PDF' icon="pi pi-file-pdf" severity="danger" text @click="exportPDF()" size="small" :disabled="selectedApplicants.length <= 0" />
                </div>
            </template>

            <template #empty>
              <div>No Applicants found.</div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>


            <Column field="student_pic" header="Photo" class="text-capitalize">
                <template #body="{ data }">
                    <div v-if="data.student_pic">
                        <img :src="`${config.public.BASE_URL}/storage/${data.student_pic}`" alt="Student Photo" width="40px" />
                    </div>
                    <div v-else>N/A</div>
                </template>
            </Column>

            <Column field="Preview" header="Preview" class="text-capitalize">
                <template #body="{ data }">
                    <div>
                        <a :href="`${config.public.FRONTEND_URL}/application/preview/${data.unique_number}`" target="_blank">
                            <Button class="mx-auto" label="Preview" icon="pi pi-eye" link/>
                        </a>
                    </div>
                </template>
            </Column>

            <Column style="min-width: 280px" class="capitalize" field="approval_status" header="Payment State" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
                <template #body="{ data }">
                    <i class="pi" :class="{ 'pi-check-circle text-green-500': data.approval_status == 'Success', 'pi-times-circle text-red-400': data.approval_status != 'Success' }"></i>
                    <span class="mx-1">{{ data.approval_status }}</span>
                </template>
            </Column>

            <Column style="min-width: 280px" class="capitalize" field="assigned_roll" header="assigned_roll" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
                <template #body="{data}">
                    {{ data.assigned_roll ?? "N/A" }}
                </template>
            </Column>

            <Column style="min-width: 280px" class="capitalize" field="unique_number" header="unique_number" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 280px" class="capitalize" field="edu_information" header="SSC Roll" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
                <template #body="{data}">
                    {{ JSON.parse(data.edu_information)[0]?.roll ?  `SSC: ${JSON.parse(data.edu_information)[0].roll}` : "N/A" }}
                </template>
            </Column>

            <Column style="min-width: 280px" class="capitalize" field="student_name_english" header="Name(English)" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 280px" class="capitalize" field="student_name_bangla" header="Name(Bangla)" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>
            
            <Column style="min-width: 280px" class="capitalize" field="class" header="Class" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>
            <Column style="min-width: 280px" class="capitalize" field="shift" header="Shift" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>
            <Column style="min-width: 280px" class="capitalize" field="group" header="Group" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
