<script setup>
import { storeToRefs } from 'pinia';
import { FilterMatchMode } from 'primevue/api';
import { useAdmissionStore } from '~/stores/admission';
import { useToast } from 'primevue/usetoast';
import { CustomerService } from '~/service/CustomerService';
import { useRuntimeConfig } from 'nuxt/app';
const config = useRuntimeConfig();
const toast = useToast();
const { classSetupIndex, subjectSetupIndex, esifList, loading } = storeToRefs(useAdmissionStore());
const { fetchClassSetupIndex, fetchSubjectSetupIndex, fetchesifList, fetchSubjectChoice, fetchAdmissionDetails } = useAdmissionStore();
const admissionAcademicYears = ref();
const classSelection = ref();
const groupOptions = ref([]);
const searchWith = reactive({
    academic_year: null,
    class: null,
    group: null
});

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
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
const esif = ref([]);
const selectedApplicants = ref();
const selectAll = ref(false);
const first = ref(0);
const filters = ref({
    unique_number: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    student_name_english: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    father_name_english: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    mother_name_english: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    approval_status: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    date_of_birth: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    gender: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    religion: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    assigned_roll: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    nationality: { value: '', matchMode: FilterMatchMode.STARTS_WITH }
});
const lazyParams = ref({});

const loadLazyData = (event) => {
    loading.value = true;
    lazyParams.value = { ...lazyParams.value, first: event?.first || first.value };
    setTimeout(() => {
        fetchesifList(searchWith, lazyParams.value)
            .then(() => {
                esif.value = esifList.value.esifList.data;
                totalRecords.value = esifList.value.esifList.total;
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
const onSelectAllChange = (event) => {
    selectAll.value = event.checked;

    if (selectAll) {
        CustomerService.getCustomers().then((data) => {
            selectAll.value = true;
            selectedApplicants.value = data.applicants;
        });
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

const exportSubjectChoice = async () => {
    try {
        const { status, error, file_url } = await fetchSubjectChoice(searchWith);
        if (status === 'success') {
            window.open(config.public.BASE_URL + file_url, '_blank');
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    }
};

const exportAdmissionDetails = async () => {
    try {
        const { status, error, message, pdf } = await fetchAdmissionDetails(searchWith);
        if (status === 'success') {
            if (pdf) {
                const timestamp = new Date().getTime();
                window.open(`${config.public.BASE_URL}${pdf}?t=${timestamp}`, '_blank');
                toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
            } else {
                toast.add({ severity: 'info', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
            }
            console.log(message);
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    }
};
</script>

<template>
    <Toast position="bottom-right" group="br" />
    
    <div class="card">
        <h4 class="text-primary font-bold">Subjects, eSIF List</h4>
        <div class="grid justify-content-start align-items-end">
            <div class="md:col-2">
                <Dropdown class="w-full capitalize" v-model="searchWith.academic_year" :options="admissionAcademicYears" optionLabel="subcategory_name" optionValue="subcategory_name" placeholder="Select Academic Year">
                    <template #option="slotProps">
                        <div class="flex align-items-center capitalize">
                            <div>{{ slotProps.option.subcategory_name }}</div>
                        </div>
                    </template>
                </Dropdown>
            </div>

            <div class="md:col-2">
                <Dropdown v-model="classSelection" :options="subjectSetupIndex.admissionClassSetup" optionLabel="class_name" placeholder="Select Class" checkmark :highlightOnSelect="false" class="w-full capitalize">
                    <template #option="slotProps">
                        <div class="capitalize">
                            <div>{{ slotProps.option.class_name }}</div>
                        </div>
                    </template>
                </Dropdown>
            </div>

            <div class="md:col-2">
                <Dropdown
                    v-model="searchWith.group"
                    :options="groupOptions"
                    optionLabel="group_name"
                    optionValue="group_name"
                    placeholder="Select Group"
                    checkmark
                    :highlightOnSelect="false"
                    class="w-full capitalize"
                    :disabled="!searchWith.class && !searchWith.group"
                >
                    <template #option="slotProps">
                        <div class="capitalize">
                            <div>{{ slotProps.option.group_name }}</div>
                        </div>
                    </template>
                </Dropdown>
            </div>

            <div class="md:col-2">
                <Button label="Search" icon="pi pi-search" :disabled="!searchWith.class" :loading="loading" @click="loadLazyData" />
            </div>
        </div>
    </div>
    <div class="card">
        <DataTable
            :value="esif"
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
            scrollable
            scrollHeight="500"
        >
            <!-- <Column style="min-width: 200px" selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
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
                    <Button class="mr-2" text icon="pi pi-file-excel" label="Subjects" severity="success" @click="exportSubjectChoice()" size="small" :disabled="esif.length <= 0" />
                    <Button class="mr-2" text icon="pi pi-file-pdf" label="eSIF" severity="danger" @click="exportAdmissionDetails()" size="small" :disabled="esif.length <= 0" />
                </div>
            </template>

            <template #empty>
                <div>No student data found.</div>
            </template>

            <Column field="student_pic" header="Photo" class="text-capitalize">
                <template #body="{ data }">
                    <div v-if="data.student_pic">
                        <img :src="`${config.public.BASE_URL}/storage/${data.student_pic}`" alt="Student Photo" width="40px" />
                    </div>
                    <div v-else>N/A</div>
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="unique_number" header="Unique Number" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>
            <Column style="min-width: 200px" class="capitalize" field="assigned_roll" header="Roll Assigned" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="approval_status" header="Approval Status" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="student_name_english" header="Student Name" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="father_name_english" header="Father's Name" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="mother_name_english" header="Mother's Name" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="date_of_birth" header="Date of Birth" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="gender" header="Gender" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>

            <Column style="min-width: 200px" class="capitalize" field="religion" header="Religion" filterMatchMode="startsWith" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
