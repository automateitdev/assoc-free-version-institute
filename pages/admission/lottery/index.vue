<script setup>
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { parseWithOptions } from 'date-fns/fp';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
const toast = useToast();
import { useRuntimeConfig } from 'nuxt/app';
const config = useRuntimeConfig();

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { useAdmissionStore } from '~/stores/admission';
const { classSetupIndex, lotteryList, loading } = storeToRefs(useAdmissionStore());
const { fetchClassSetupIndex, makeLottery, getLotteryList } = useAdmissionStore();
const options = reactive({
    academicYearOpts: null,
    classOpts: null,
    shiftOpts: null,
    groupOpts: null
});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    unique_number: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'admission_applied.assigned_roll': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'admission_applied.student_name_english': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'admission_applied.father_name_english': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'admission_applied.mother_name_english': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    class: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    shift: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    group: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    lottery_number: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    academic_year: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    lottery_status: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
});

onMounted(async () => {
    await fetchClassSetupIndex();
    classSetupIndex.value?.admission_startup.forEach((category) => {
        const key = `${category.category_name.replace(/\s+/g, '').toLowerCase()}Opts`;
        options[key] = category.subcategories.map((subcategory) => ({
            label: subcategory.subcategory_name,
            value: subcategory.subcategory_id
        }));
    });
});

const selectedApplicants = ref([]);

const formData = reactive({
    academic_year: null,
    class: null,
    shift: null,
    group: null,
    seat_quantity: 0,
    waiting_list_quantity: 0
});

const searchformData = reactive({
    academic_year: null,
    class: null,
    shift: null,
    group: null
});

const statuses = ref(['Rejected', 'Merit', 'Waiting']);

const getSeverity = (status) => {
    switch (status) {
        case 'Rejected':
            return 'danger';

        case 'Merit':
            return 'success';

        case 'Waiting':
            return 'warning';
    }
};

const requestLottery = async () => {
    loading.value = true;
    setTimeout(async () => {
        try {
            const { status, message, error } = await makeLottery(formData);
            if (status === 'success') {
                toast.add({ severity: 'success', summary: 'Success Message', detail: message, life: 5000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error Message', detail: error, life: 5000 });
            }
        } catch (error) {
            console.log(error);
            toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', life: 5000 });
        } finally {
            await getLotteryList(formData);
        }
    }, 4000);
};

const exportExcel = () => {
    // Define the columns to export
    const columns = [
        { header: 'Applicant Name', key: 'student_name_english' },
        { header: 'Father Name', key: 'father_name_english' },
        { header: 'Mother Name', key: 'mother_name_english' },
        { header: 'Unique Number', key: 'unique_number' },
        { header: 'Assigned Roll', key: 'assigned_roll' },
        { header: 'Academic Year', key: 'academic_year' },
        { header: 'Class', key: 'class' },
        { header: 'Shift', key: 'shift' },
        { header: 'Group', key: 'group' },
        { header: 'Position', key: 'lottery_number' },
        { header: 'Criteria', key: 'lottery_status' }
    ];

    // Map the selected data to include only the specified columns
    const data = selectedApplicants.value.map((item) => {
        const row = {};
        columns.forEach((col) => {
            if (col.key === 'photo') {
                row[col.header] = `${config.public.BASE_URL}/storage/${item.admission_applied?.student_pic || ''}`;
            } else {
                row[col.header] = item.admission_applied?.[col.key] || item[col.key] || 'N/A';
            }
        });
        return row;
    });

    // Create the worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, { header: columns.map((col) => col.header) });

    // Create and save the workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applicants');
    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `applicant_report_${currentDate}.xlsx`);
};

const exportPDF = () => {
    const doc = new jsPDF();

    // Define table headers
    const headers = ['Applicant Name', 'Father Name', 'Mother Name', 'Unique Number', 'Assigned Roll', 'Academic Year', 'Class', 'Shift', 'Group', 'Position', 'Criteria'];

    // Map the selected data to align with headers
    const data = selectedApplicants.value.map((item) => {
        const photoUrl = `${config.public.BASE_URL}/storage/${item.admission_applied?.student_pic || ''}`;
        return [
            photoUrl,
            item.admission_applied?.student_name_english || 'N/A',
            item.admission_applied?.father_name_english || 'N/A',
            item.admission_applied?.mother_name_english || 'N/A',
            item.unique_number || 'N/A',
            item.admission_applied?.assigned_roll || 'N/A',
            item.academic_year || 'N/A',
            item.class || 'N/A',
            item.shift || 'N/A',
            item.group || 'N/A',
            item.lottery_number || 'N/A',
            item.lottery_status || 'N/A'
        ];
    });

    // Add table to PDF
    doc.autoTable({
        head: [headers],
        body: data
    });

    const currentDate = new Date().toISOString().split('T')[0];
    doc.save(`applicant_report_${currentDate}.pdf`);
};
</script>
<template>
    <Toast />
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Make Lottery</h5>
            <div class="grid justify-content-start align-items-end">
                <div class="col">
                    <label for="academicYear">Academic Year</label>
                    <Dropdown v-model="formData.academic_year" placeholder="Select Academic Year" :options="options.academicyearOpts" optionLabel="label" optionValue="label" class="w-full capitalize">
                        <template #option="data">
                            <div class="capitalize">{{ data.option.label }}</div>
                        </template>
                    </Dropdown>
                </div>

                <div class="col">
                    <label for="class">Class</label>
                    <Dropdown v-model="formData.class" placeholder="Select Class" class="w-full capitalize" :options="options.classOpts" optionLabel="label" optionValue="label">
                        <template #option="data">
                            <div class="capitalize">{{ data.option.label }}</div>
                        </template>
                    </Dropdown>
                </div>

                <div class="col">
                    <label for="shift">Shift</label>
                    <Dropdown v-model="formData.shift" placeholder="Select Shift" class="w-full capitalize" :options="options.shiftOpts" optionLabel="label" optionValue="label">
                        <template #option="data">
                            <div class="capitalize">{{ data.option.label }}</div>
                        </template>
                    </Dropdown>
                </div>

                <div class="col">
                    <label for="group">Group</label>
                    <Dropdown v-model="formData.group" placeholder="Select Group" class="w-full capitalize" :options="options.groupOpts" optionLabel="label" optionValue="label">
                        <template #option="data">
                            <div class="capitalize">{{ data.option.label }}</div>
                        </template>
                    </Dropdown>
                </div>

                <div class="col">
                    <label for="seatCount">Seat Quantity</label>
                    <InputNumber v-model="formData.seat_quantity" placeholder="Seat Quantity" class="w-full capitalize" :min="2" />
                </div>

                <div class="col">
                    <label for="seatCount">Waiting list Quantity</label>
                    <InputNumber v-model="formData.waiting_list_quantity" placeholder="Seat Quantity" class="w-full capitalize" :min="1" :max="formData.seat_quantity / 2" />
                </div>

                <div class="col">
                    <Button label="Generate" icon="pi pi-sync" :loading="loading" :disabled="!formData.seat_quantity || !formData.group || !formData.shift || !formData.class" @click="requestLottery()"></Button>
                </div>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <div class="grid justify-content-start align-items-end">
                <div class="col">
                    <label for="academicYear">Academic Year</label>
                    <Dropdown v-model="searchformData.academic_year" placeholder="Select Academic Year" :options="options.academicyearOpts" optionLabel="label" optionValue="label" class="w-full capitalize">
                        <template #option="data">
                            <div class="capitalize">{{ data.option.label }}</div>
                        </template>
                    </Dropdown>
                </div>

                <div class="col">
                    <label for="class">Class</label>
                    <Dropdown v-model="searchformData.class" placeholder="Select Class" class="w-full capitalize" :options="options.classOpts" optionLabel="label" optionValue="label">
                        <template #option="data">
                            <div class="capitalize">{{ data.option.label }}</div>
                        </template>
                    </Dropdown>
                </div>

                <div class="col">
                    <label for="shift">Shift</label>
                    <Dropdown v-model="searchformData.shift" placeholder="Select Shift" class="w-full capitalize" :options="options.shiftOpts" optionLabel="label" optionValue="label">
                        <template #option="data">
                            <div class="capitalize">{{ data.option.label }}</div>
                        </template>
                    </Dropdown>
                </div>

                <div class="col">
                    <label for="group">Group</label>
                    <Dropdown v-model="searchformData.group" placeholder="Select Group" class="w-full capitalize" :options="options.groupOpts" optionLabel="label" optionValue="label">
                        <template #option="data">
                            <div class="capitalize">{{ data.option.label }}</div>
                        </template>
                    </Dropdown>
                </div>

                <div class="col">
                    <Button severity="info" label="Search" id="search" @click="getLotteryList(searchformData)" icon="pi pi-search"></Button>
                </div>
            </div>

            <DataTable
                v-model:selection="selectedApplicants"
                v-model:filters="filters"
                filterDisplay="menu"
                class="p-datatable-sm"
                showGridlines
                stripedRows
                :value="lotteryList"
                :loading="loading"
                scrollable
                scrollHeight="400px"
                :globalFilterFields="[
                    'unique_number',
                    'academic_year',
                    'class',
                    'shift',
                    'group',
                    'lottery_number',
                    'lottery_status',
                    'admission_applied.assigned_roll',
                    'admission_applied.student_name_english',
                    'admission_applied.father_name_english',
                    'admission_applied.mother_name_english'
                ]"
            >
                <template #loading
                    ><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                        <rect width="10" height="10" x="1" y="1" fill="#c0fcdd" rx="2">
                            <animate id="svgSpinnersBlocksShuffle30" fill="freeze" attributeName="x" begin="0;svgSpinnersBlocksShuffle3b.end" dur="0.2s" values="1;13" />
                            <animate id="svgSpinnersBlocksShuffle31" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle38.end" dur="0.2s" values="1;13" />
                            <animate id="svgSpinnersBlocksShuffle32" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle39.end" dur="0.2s" values="13;1" />
                            <animate id="svgSpinnersBlocksShuffle33" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle3a.end" dur="0.2s" values="13;1" />
                        </rect>
                        <rect width="10" height="10" x="1" y="13" fill="#c0fcdd" rx="2">
                            <animate id="svgSpinnersBlocksShuffle34" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle30.end" dur="0.2s" values="13;1" />
                            <animate id="svgSpinnersBlocksShuffle35" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle31.end" dur="0.2s" values="1;13" />
                            <animate id="svgSpinnersBlocksShuffle36" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle32.end" dur="0.2s" values="1;13" />
                            <animate id="svgSpinnersBlocksShuffle37" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle33.end" dur="0.2s" values="13;1" />
                        </rect>
                        <rect width="10" height="10" x="13" y="13" fill="#c0fcdd" rx="2">
                            <animate id="svgSpinnersBlocksShuffle38" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle34.end" dur="0.2s" values="13;1" />
                            <animate id="svgSpinnersBlocksShuffle39" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle35.end" dur="0.2s" values="13;1" />
                            <animate id="svgSpinnersBlocksShuffle3a" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle36.end" dur="0.2s" values="1;13" />
                            <animate id="svgSpinnersBlocksShuffle3b" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle37.end" dur="0.2s" values="1;13" />
                        </rect></svg
                ></template>

                <template #empty><Message severity="warn" :closable="false" class="text-center">No Results!</Message></template>

                <template #header>
                    <div class="grid justify-content-end align-items-center">
                        <div style="text-align: left">
                            <Button class="mr-2" label="Excel" icon="pi pi-file-excel" severity="success" text @click="exportExcel()" size="small" :disabled="selectedApplicants.length <= 0" />
                            <Button class="mr-2" label="PDF" icon="pi pi-file-pdf" severity="danger" text @click="exportPDF()" size="small" :disabled="selectedApplicants.length <= 0" />
                        </div>
                        <div class="flex justify-content-end">
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        </div>
                    </div>
                </template>

                <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                <!-- <Column field="admission_applied.student_pic" header="Photo">
                    <template #body="slotProps">
                        <img :src="`${config.public.BASE_URL}/storage/${slotProps.data.admission_applied.student_pic}`" alt="profile photo" />
                    </template>
                </Column> -->

                <Column field="unique_number" header="Unique number" style="min-width: 200px">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Unique Number" />
                    </template>
                </Column>

                <Column field="admission_applied.student_name_english" header="Applicant Name" style="min-width: 200px">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Applicant Name" />
                    </template>
                </Column>

                <Column field="academic_year" header="Academic Year" style="min-width: 200px">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Academic Year" />
                    </template>
                </Column>

                <Column field="lottery_status" header="Criteria" style="min-width: 200px">
                    <template #body="{ data }">
                        <Tag :value="data.lottery_status" :severity="getSeverity(data.lottery_status)" />
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="statuses" placeholder="Criteria" class="p-column-filter" :showClear="true">
                            <template #option="slotProps">
                                <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)" />
                            </template>
                        </Dropdown>
                    </template>
                </Column>

                <Column field="admission_applied.assigned_roll" header="Assigned Roll" style="min-width: 180px">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Assigned Roll" />
                    </template>
                </Column>

                <Column field="admission_applied.father_name_english" header="Father Name" style="min-width: 180px">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Father Name" />
                    </template>
                </Column>

                <Column field="admission_applied.mother_name_english" header="Mother Name" style="min-width: 180px">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Mother Name" />
                    </template>
                </Column>

                <Column field="class" header="Class">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Class" />
                    </template>
                </Column>

                <Column field="shift" header="Shift">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Shift" /> </template
                ></Column>

                <Column field="group" header="Group"
                    ><template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Group" /> </template
                ></Column>

                <Column field="lottery_number" header="Position">
                    <template #body="{ data }">
                        {{ data.lottery_number ?? 'N/A' }}
                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Position" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
