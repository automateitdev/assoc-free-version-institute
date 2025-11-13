<script setup>
import { useExamStore } from '~/stores/exam';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import debounce from 'lodash-es/debounce';
import { useConfirm } from 'primevue/useconfirm';
const confirm = useConfirm();

const examStore = useExamStore();
const toast = useToast();

// ✅ reactive form object (no .value needed)
const formData = reactive({
    academic_year: null,
    academic_year_id: null,
    class_id: null,
    class_name: null,
    name: null,
    total_mark: null,
    centers: []
});

// ✅ reactive dropdown option arrays
const academicYearOpts = ref([]);
const classOpts = ref([]);
const centerOpts = ref([]);

const dt = ref({});
const lazyParams = ref({});
const totalRecords = ref(0);
const selectedExaminee = ref([]);
const selectAll = ref(false);
const examineeList = ref([]);
const first = ref(0);

// ✅ load data
onMounted(async () => {
    lazyParams.value = {
        first: dt.value.first,
        rows: dt.value.rows,
        sortField: null,
        sortOrder: null,
        filters: filters.value
    };
    await examStore.fetchEssentials();
    await examStore.fetchExamList();
    prepareDropdowns();
});

// ✅ build dropdown options dynamically
function prepareDropdowns() {
    const data = examStore.essentials || [];

    // build unique academic years
    academicYearOpts.value = Array.from(new Map(data.map((i) => [i.academic_year_id, { label: i.academic_year, value: i.academic_year_id }])).values());
}

// ✅ watch academic year change → populate classes
watch(
    () => formData.academic_year_id,
    (yearId) => {
        const data = examStore.essentials?.filter((e) => e.academic_year_id === yearId) ?? [];

        classOpts.value = Array.from(new Map(data.map((i) => [i.class_id, { label: i.class_name, value: i.class_id }])).values());
        formData.class_id = null;
        centerOpts.value = [];
    }
);

// ✅ watch class change → populate centers
watch(
    () => formData.class_id,
    (classId) => {
        // Reset first
        formData.centers = [];
        centerOpts.value = [];

        if (!classId || !formData.academic_year_id) return;

        // Find matching entry from store
        const selected = examStore.essentials?.find((e) => e.academic_year_id === formData.academic_year_id && e.class_id === classId);

        if (!selected) return; // guard if no match found

        // Assign related data safely
        formData.academic_year = selected.academic_year;
        formData.class_name = selected.class_name;

        // Build dropdown options for centers
        centerOpts.value = selected.centers.map((c) => ({
            label: c.name,
            value: { center_id: c.id, center_name: c.name }
        }));
    }
);

const saveExam = async () => {
    try {
        const payload = {
            ...formData,
            centers: formData.centers.map((c) => ({
                center_id: c.center_id,
                center_name: c.center_name
            }))
        };
        const { status, message, error } = await examStore.saveExamSetup(payload);
        if (status === 'success') {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
            await examStore.fetchExamList();
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    }
};

const visibleConfirmation = ref(false);
const examRemoveData = ref(null);
const confirmationMsg = ref(null);
const removalType = ref(null);

const resetRemovalOptions = async () => {
    await examStore.fetchExamList();
    examRemoveData.value = null;
    confirmationMsg.value = null;
    removalType.value = null;
    visibleConfirmation.value = false;
};

const requestRemoval = async () => {
    try {
        if (removalType.value == 'center') {
            const { status, message, error } = await examStore.removeExamCenter(examRemoveData.value.id);
            if (status === 'success') {
                toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
                await resetRemovalOptions();
            } else {
                toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
            }
        }
        if (removalType.value == 'exam') {
            const { status, message, error } = await examStore.removeExam(examRemoveData.value.id);
            if (status === 'success') {
                toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
                await resetRemovalOptions();
            } else {
                toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
            }
        }
    } catch (error) {
        console.error(error);
    }
};

const confimationToRemove = (data, type) => {
    confirmationMsg.value = null;
    removalType.value = type;
    examRemoveData.value = data;
    if (type == 'center') {
        confirmationMsg.value = `This action will remove center: ${data.center_name} permanently !`;
    }

    if (type == 'exam') {
        confirmationMsg.value = `This action will remove exam: ${data.name} permanently !`;
    }

    visibleConfirmation.value = true;
};

const searchForm = ref({
    academic_year_id: null,
    exam_id: null
});

// ✅ Dropdown options
const academicYearOptsForExam = ref([]);
const examOpts = ref([]);

// ✅ Once exams are fetched, prepare the academic year options
watch(
    () => examStore.existingExams,
    (exams) => {
        searchForm.value.exam_id = null;
        searchForm.value.academic_year_id = null;
        if (!exams?.length) return;

        // Unique academic years
        const uniqueYears = [...new Map(exams.map((e) => [e.academic_year_id, e.academic_year])).entries()];

        academicYearOptsForExam.value = uniqueYears.map(([id, label]) => ({
            label,
            value: id
        }));
    },
    { immediate: true }
);

// ✅ Watch for academic_year selection to populate exams
watch(
    () => searchForm.value.academic_year_id,
    (yearId) => {
        if (!yearId) {
            examOpts.value = [];
            searchForm.value.exam_id = null;
            return;
        }

        examOpts.value = examStore.existingExams
            .filter((e) => e.academic_year_id === yearId)
            .map((e) => ({
                label: `${e.name} (${e.class_name})`,
                value: e.id
            }));
    }
);
const filters = ref({});
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        class_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        institute_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        unique_number: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        assigned_roll: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        student_name_english: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
    };
};

initFilters();
const clearFilter = () => {
    initFilters();
    loadLazyData();
};

const loadLazyData = async (event) => {
    lazyParams.value = { ...lazyParams.value, first: event?.first || first.value };
    const payload = {
        exam: searchForm.value.exam_id,
        academic_year: searchForm.value.academic_year_id
    };
    try {
        await examStore.fetchExaminee(payload, lazyParams.value);
        // examineeList should be the array of examinees
        examineeList.value = examStore.examinee.data;

        // totalRecords should be the total number of examinees
        totalRecords.value = examStore.examinee?.total ?? 0;

        if (selectAll.value) {
            selectedExaminee.value = examineeList.value;
        } else {
            selectedExaminee.value = [];
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error!', detail: 'Something went wrong!', life: 3000, group: 'br' });
    }
};

const debouncedLoadLazyData = debounce(() => {
    loadLazyData();
}, 800);

const globalFilterSearch = () => {
    debouncedLoadLazyData();
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
        selectedExaminee.value = examineeList.value;
    } else {
        selectAll.value = false;
        selectedExaminee.value = [];
    }
};
const onRowSelect = () => {
    selectAll.value = selectedExaminee.value.length === totalRecords.value;
};
const onRowUnselect = () => {
    selectAll.value = false;
};

const generateSeatCard = () => {
    const customParams = { ...lazyParams.value };
    customParams.rows = -1;
    examStore.startExport({
        type: formData.type,
        exam: searchForm.value.exam_id,
        academic_year: searchForm.value.academic_year_id,
        dt_params: customParams
    });
};

const cancelExport = () => {
    confirm.require({
        message: 'Are you sure you want to cancel the export process?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        severity: 'warning',
        accept: () => {
            examStore.cancelExport();
        }
    });
};
</script>

<template>
    <TabView>
        <TabPanel header="Settings">
            <div class="flex flex-wrap justify-content-start align-items-end gap-2 mb-2">
                <Dropdown class="flex-1" v-model="formData.academic_year_id" :options="academicYearOpts" optionLabel="label" optionValue="value" placeholder="Academic Year" />
                <Dropdown class="flex-1" v-model="formData.class_id" :options="classOpts" optionLabel="label" optionValue="value" placeholder="Select Class" />
                <MultiSelect class="flex-1" display="chip" v-model="formData.centers" :options="centerOpts" optionLabel="label" optionValue="value" placeholder="Center(s)" />
                <InputText class="flex-1" v-model="formData.name" placeholder="Exam title" />
                <InputNumber class="flex-1" v-model="formData.total_mark" placeholder="Total Mark" min="5" :useGrouping="false" :maxFractionDigits="2" />
                <Button label="Save" icon="pi pi-save" :loading="examStore.loading" @click="saveExam()" :disabled="!formData.academic_year_id || !formData.class_id || !formData.centers.length" />
            </div>
            <DataTable :value="examStore?.existingExams" size="small" stripedRows showGridlines resizableColumns columnResizeMode="fit" dataKey="id" paginator :rows="15" :rowsPerPageOptions="[15, 25, 50, 100]" :loading="examStore.loading">
                <template #empty> No Exam. </template>
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
                <Column header="Academic Year" field="academic_year"></Column>
                <Column header="Class" field="class_name"></Column>
                <Column header="Title" field="name"></Column>
                <Column header="Total Mark" field="total_marks"></Column>
                <Column header="Centers" field="center_exams">
                    <template #body="{ data }">
                        <div class="flex flex-wrap justify-content-start align-items-center gap-1">
                            <span v-for="(detail, index) in data.center_exams" :key="index" class="px-2 rounded flex align-items-center" style="background-color: lightcyan; border-radius: 10px">
                                {{ detail.center_name }}
                                <i class="pl-2 pi pi-times-circle" style="color: #fbc02d; cursor: pointer" @click="confimationToRemove(detail, 'center')" />
                            </span>
                        </div>
                    </template>
                </Column>
                <Column header="Action">
                    <template #body="{ data }">
                        <Button rounded text severity="warning" icon="pi pi-trash" size="small" @click="confimationToRemove(data, 'exam')" />
                    </template>
                </Column>
            </DataTable>
            <Dialog v-model:visible="visibleConfirmation" modal header="Confirmation" :style="{ minWidth: '25rem', maxWidth: '45rem' }">
                <Message :closable="false" severity="warn">{{ confirmationMsg }}</Message>
                <div class="flex justify-content-end">
                    <Button label="Yes" rounded text icon="pi pi-trash" severity="danger" @click="requestRemoval" />
                </div>
            </Dialog>
        </TabPanel>
        <TabPanel header="Seat Card">
            <div v-if="examStore.existingExams.length">
                <div class="flex flex-wrap justify-content-start align-items-center gap-2 mb-2">
                    <Dropdown class="flex-1" v-model="searchForm.academic_year_id" :options="academicYearOptsForExam" optionLabel="label" optionValue="value" placeholder="Academic Year" />
                    <Dropdown class="flex-1" v-model="searchForm.exam_id" :options="examOpts" optionLabel="label" optionValue="value" placeholder="Select Exam" />
                    <Button label="Search" icon="pi pi-search" :loading="examStore.loading" @click="loadLazyData" :disabled="!searchForm.academic_year_id || !searchForm.exam_id" />
                </div>
                <div>
                    <DataTable
                        lazy
                        ref="dt"
                        dataKey="id"
                        paginator
                        :first="first"
                        :rows="15"
                        :rowsPerPageOptions="[15, 25, 50, 100]"
                        :totalRecords="totalRecords"
                        :loading="examStore.loading"
                        :value="examineeList"
                        :selectAll="selectAll"
                        :globalFilterFields="['class_name', 'institute_name', 'unique_number', 'assigned_roll', 'student_name_english']"
                        v-model:selection="selectedExaminee"
                        v-model:filters="filters"
                        @page="onPage($event)"
                        @sort="onSort($event)"
                        @filter="onFilter($event)"
                        @rowSelect="onRowSelect($event)"
                        @rowUnselect="onRowUnselect($event)"
                        @select-all-change="onSelectAllChange($event)"
                        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                        currentPageReportTemplate="Records: {totalRecords}"
                        size="small"
                        stripedRows
                        showGridlines
                        resizableColumns
                        columnResizeMode="fit"
                        sortable
                        scrollable
                        scrollHeight="500px"
                        filterDisplay="menu"
                    >
                        <template #empty> No examinee. </template>

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
                            <div class="flex justify-content-between">
                                <div class="flex flex-wrap gap-2">
                                <Button rounded text label="Generate" icon="pi pi-file-pdf" severity="danger" :disabled="selectedExaminee.length <= 0 || examStore.exportInProgress" @click="generateSeatCard" />
                                <div style="width: 200px; margin: auto" v-if="examStore.exportInProgress">
                                    <ProgressBar mode="indeterminate" style="height: 10px" v-if="examStore.exportProgress === 0" />
                                    <ProgressBar :value="examStore.exportProgress" :showValue="true" v-else />
                                </div>
                                <Button rounded severity="warning" text @click="cancelExport" icon="pi pi-times-circle" style="margin: auto" v-if="examStore.exportInProgress" />
                                <ConfirmDialog />
                                </div>
                                <div>
                                    <Button type="button" icon="pi pi-filter-slash" label="Clear" text @click="clearFilter()" />
                                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" @keyup.enter="globalFilterSearch()" />
                                </div>
                            </div>
                        </template>

                        <Column selectionMode="multiple"></Column>

                        <Column header="Applicant ID" field="unique_number">
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                        </Column>

                        <Column header="Name" field="student_name_english">
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                        </Column>

                        <Column header="Class" field="class_name">
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                        </Column>

                        <Column header="Institute" field="institute_name">
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                        </Column>

                        <Column header="Assigned Roll" field="assigned_roll">
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
            <div v-else>
                <Message :closable="false"> No exam setup found to search for seat card </Message>
            </div>
        </TabPanel>
    </TabView>
</template>
