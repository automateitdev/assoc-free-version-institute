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
const { classSetupIndex, collectionList, loading, AllCollectionList } = storeToRefs(useAdmissionStore());
const { fetchClassSetupIndex, fetchSubjectSetupIndex, fetchCollectionList, fetchAllCollectionList } = useAdmissionStore();
const admissionAcademicYears = ref();
const classSelection = ref();
const groupOptions = ref([]);
const searchWith = reactive({
    start_date: null,
    end_date: null
});

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};

const exportExcel = () => {
    // Define the columns to export
    const columns = [
        { header: 'Unique Number', key: 'unique_number' },
        { header: 'Applicant Name', key: 'applicant_name' },
        { header: 'Assigned Roll', key: 'admission_applied.assigned_roll' },
        { header: 'Payment Date', key: 'transaction_date' },
        { header: 'Transaction ID', key: 'transaction_id' },
        { header: 'Invoice', key: 'invoice_no' },
        { header: 'Amount (BDT.)', key: 'total_amount' }
    ];

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const data = selectedCollections.value.map((item) => {
        const row = {};
        columns.forEach((col) => {
            const value = getNestedValue(item, col.key);
            row[col.header] = col.key === 'transaction_date' ? formatDateTimeTo12Hour(value) : value;
        });
        return row;
    });

    // Create the worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, { header: columns.map((col) => col.header) });

    // Create and save the workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Collection');
    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `collection_report_${currentDate}.xlsx`);
};

const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
        head: [['Unique Number', 'Applicant Name', 'Assigned Roll', 'Payment Date', 'Transaction ID', 'Invoice', 'Amount (BDT.)']],
        body: selectedCollections.value.map((item) => [item.unique_number, item.applicant_name, item.admission_applied?.assigned_roll ?? '-', formatDateTimeTo12Hour(item.transaction_date), item.transaction_id, item.invoice_no, item.total_amount])
    });
    const currentDate = new Date().toISOString().split('T')[0];
    doc.save(`collection_report_${currentDate}.pdf`);
};

watch(classSelection, (newVal) => {
    searchWith.class = newVal.class_name ?? null;
    // Update the group options when a class is selected
    groupOptions.value = newVal.groups ?? [];
});

const admissionSetupData = ref();

onMounted(async () => {
    await fetchClassSetupIndex();
    await fetchSubjectSetupIndex();
    admissionSetupData.value = classSetupIndex.value.admissionClassSetup;
    destructureStartup();
});
//  visibility hook
useVisibilityChange(async () => {
    await fetchClassSetupIndex();
    await fetchSubjectSetupIndex();
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
    // loadLazyData();
});

const totalRecords = ref(0);
const collection = ref([]);
const selectedCollections = ref([]);
const selectAll = ref(false);
const first = ref(0);
const filters = ref({
    id: { value: '', matchMode: 'contains' },
    unique_number: { value: '', matchMode: 'contains' },
    applicant_name: { value: '', matchMode: 'contains' },
    'admission_applied.assigned_roll': { value: '', matchMode: 'contains' },
    transaction_date: { value: '', matchMode: 'contains' },
    transaction_id: { value: '', matchMode: 'contains' },
    invoice_no: { value: '', matchMode: 'contains' },
    total_amount: { value: '', matchMode: 'contains' }
});
const lazyParams = ref({});

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
const start_date = ref(null);
const end_date = ref(null);

watch([start_date, end_date], ([newStartDate, newEndDate]) => {
    searchWith.start_date = newStartDate ? formatDateToSQL(newStartDate) : null;
    searchWith.end_date = newEndDate ? formatDateToSQL(newEndDate) : null;
});

const loadLazyData = (event) => {
    loading.value = true;
    lazyParams.value = { ...lazyParams.value, first: event?.first || first.value };
    setTimeout(() => {
        fetchCollectionList(searchWith, lazyParams.value)
            .then(() => {
                collection.value = collectionList.value.admission_ops.data;
                totalRecords.value = collectionList.value.admission_ops.total;
            })
            .catch((error) => {
                console.error('Error loading data:', error);
            });
    }, Math.random() * 1000 + 250);
};

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
            await fetchAllCollectionList(searchWith, lazyParams.value);
            selectedCollections.value = AllCollectionList.value.admission_ops.data;
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            loading.value = false;
        }
    } else {
        selectAll.value = false;
        selectedCollections.value = [];
    }
};

const onRowSelect = () => {
    selectAll.value = selectedCollections.value.length === totalRecords.value;
};
const onRowUnselect = () => {
    selectAll.value = false;
};
</script>

<template>
    <div class="card">
        <h4 class="text-primary font-bold">Collection List</h4>
        <div class="grid justify-content-start align-items-end">
            <div class="md:col-2">
                <label>Date Starts From</label>
                <Calendar class="w-full" placeholder="Start Date" v-model="start_date" :readonlyInput="true" selectionEnd="start_date" dateFormat="MM dd, yy" />
            </div>

            <div class="md:col-2">
                <label>Date Ends At</label>
                <Calendar class="w-full" placeholder="End Date" v-model="end_date" :readonlyInput="true" selectionEnd="end_date" dateFormat="MM dd, yy" :minDate="start_date" :disabled="!searchWith.start_date" />
            </div>
            <div class="md:col-2">
                <Button label="Search" icon="pi pi-search" :disabled="!searchWith.start_date || !searchWith.end_date" :loading="loading" @click="loadLazyData" />
            </div>
        </div>
    </div>
    <div class="card">
        <DataTable
            :value="collection"
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
            v-model:selection="selectedCollections"
            :selectAll="selectAll"
            @select-all-change="onSelectAllChange"
            @row-select="onRowSelect"
            @row-unselect="onRowUnselect"
            tableStyle="min-width: 75rem"
            class="p-datatable-sm"
            showGridlines
            stripedRows
            scrollable
            scrollHeight="500"
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
            <template #header>
                <div style="text-align: left">
                    <Button class="mr-2" label="Excel" icon="pi pi-file-excel" severity="success" text @click="exportExcel()" size="small" :disabled="selectedCollections.length <= 0" />
                    <Button class="mr-2" label="PDF" icon="pi pi-file-pdf" severity="danger" text @click="exportPDF()" size="small" :disabled="selectedCollections.length <= 0" />
                </div>
            </template>

            <template #empty>
                <div>No Collection found.</div>
            </template>

            <Column class="capitalize" field="unique_number" header="Unique Number" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="applicant_name" header="Applicant Name" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="admission_applied.assigned_roll" header="Assigned Roll" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="transaction_date" header="Payment Date" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
                <template #body="{ data }">
                    {{ formatDateTimeTo12Hour(data.transaction_date) }}
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="transaction_id" header="Transaction ID" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="invoice_no" header="Invoice" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="total_amount" header="Amount (BDT.)" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
