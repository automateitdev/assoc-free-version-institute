<script setup>
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { usePortalStore } from '~/stores/portal';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
const toast = useToast();

const formatDate = (value) => {
    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true // Set to true if you want 12-hour format
    };
    return new Date(value).toLocaleString('en-US', options);
};

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rule_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    start_date_time: { value: null, matchMode: FilterMatchMode.CONTAINS },
    end_date_time: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const { fetchPortalIndex, storePortalSetup, fetchPortalSettings, updatePortalSetup } = usePortalStore();
const { portalIndexData, open_portal_settings } = storeToRefs(usePortalStore());

const config = useRuntimeConfig();
onMounted(async () => {
    fetchPortalIndex();
    fetchPortalSettings();
});

import useVisibilityChange from '~/composables/useVisibilityChange';
useVisibilityChange(async () => {
    fetchPortalIndex();
    fetchPortalSettings();
});
const durations = ref();
const selectedRule = ref();
const amount = ref();
const rules = ref([
    { name: 'Any ID, Any Amount', code: '1' },
    { name: 'Fixed ID, Fixed Amount', code: '2' },
    { name: 'Any ID, Fixed Amount', code: '3' },
    { name: 'Fixed ID, Any Amount', code: '4' }
]);
const dialogVisible = ref(false);
const rows = ref();
async function demoExcelDownload() {
    const res = await axios.get('/open-portal/excel', { params: { rows: rows.value } });
    if (res.data.payload.data.status == 'success') {
        console.log(res);
        dialogVisible.value = false;
        window.open(`${config.public.BASE_URL}${res.data.payload.data.download_url}`, '_blank');
    } else {
        toast.add({ severity: 'error', summary: 'Something went wrong!', detail: 'Field Must not be empty!', life: 3000 });
    }
}

const portalSetupData = reactive({
    rule_id: null,
    file: null,
    amount: null,
    start_date_time: null,
    end_date_time: null
});
let fd = ref(new FormData());
const file = ref();
function handleExcelFile($event) {
    file.value = $event.target.files ? $event.target.files[0] : null;
}

const isPortalSetting = ref(false);

async function submitPortalSetup() {
    // Convert selected date range to timestamps
    if (durations?.value?.length > 1) {
        const startDate = durations.value[0];
        const endDate = durations.value[1];
        const startTimestamp = startDate ? startDate.getTime() : null;
        const endTimestamp = endDate ? endDate.getTime() : null;

        // Format timestamps as MySQL datetime format
        portalSetupData.start_date = startTimestamp ? new Date(startTimestamp).toISOString().slice(0, 19).replace('T', ' ') : null;
        portalSetupData.end_date = endTimestamp ? new Date(endTimestamp).toISOString().slice(0, 19).replace('T', ' ') : null;

        if (file.value) {
            fd.value.append('file', file.value);
        }

        if (portalSetupData.rule_id !== null) fd.value.append('rule_id', portalSetupData.rule_id);
        if (portalSetupData.amount !== null) fd.value.append('amount', portalSetupData.amount);
        if (portalSetupData.start_date !== null) fd.value.append('start_date_time', portalSetupData.start_date);
        if (portalSetupData.end_date !== null) fd.value.append('end_date_time', portalSetupData.end_date);

        try {
            isPortalSetting.value = true;
            const { success, message, error } = await storePortalSetup(fd.value);
            if (success) {
                toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
            }
        } catch (error) {
            console.error(error);
            toast.add({ severity: 'warn', summary: 'Error Message', detail: 'Something went wrong! Try Later', group: 'br', life: 5000 });
        } finally {
            isPortalSetting.value = false;
            // Reset the portal setup data
            portalSetupData.rule_id = null;
            portalSetupData.file = null;
            portalSetupData.amount = null;
            portalSetupData.start_date = null;
            portalSetupData.end_date = null;
            // Reset FormData and file reference
            fd.value = new FormData();
            file.value = null;
            await fetchPortalSettings();
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Error Message', detail: 'Missing Durations!', group: 'br', life: 5000 });
    }
}
const editingRows = ref([]);
const updateRequestData = reactive({
    open_history_id: null,
    start_date_time: null,
    end_date_time: null
});
const onRowEditSave = async (event) => {
    let { newData, index } = event;
    open_portal_settings.value[index] = newData;
    // console.log(open_portal_settings.value[index].start_date_time, newData.start_date_time);
    const startTimestamp = open_portal_settings.value[index].start_date_time ?? null;
    const endTimestamp = open_portal_settings.value[index].end_date_time ?? null;

    // console.log(startTimestamp, endTimestamp);
    updateRequestData.open_history_id = open_portal_settings.value[index].id;

    // { "open_history_id": 7, "start_date_time": "2024-05-18 04:30:09", "end_date_time": "2024-05-17 11:30:09" }
    const convertToBST = (timestamp) => {
        const date = new Date(timestamp);
        date.setHours(date.getHours() + 6); // Adjust to Bangladesh Standard Time (UTC+6)
        return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    if (startTimestamp !== null) updateRequestData.start_date_time = startTimestamp !== null ? convertToBST(startTimestamp) : null;
    if (endTimestamp !== null) updateRequestData.end_date_time = endTimestamp !== null ? convertToBST(endTimestamp) : null;

    try {
        isPortalSetting.value = true;
        const { success, message, error } = await updatePortalSetup(updateRequestData);
        if (success) {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'warn', summary: 'Error Message', detail: 'Something went wrong! Try Later', group: 'br', life: 5000 });
    } finally {
        isPortalSetting.value = false;
        updateRequestData.open_history_id = null;
        updateRequestData.start_date_time = null;
        updateRequestData.end_date_time = null;
        await fetchPortalSettings();
    }
};
</script>

<template>
    <Toast position="bottom-right" group="br" />

    <TabView>
        <TabPanel header="Portal Setup">
            <div class="card grid align-items-end">
                <div class="col-12 md:col-4">
                    <label for="portal_rule" class="font-bold block">Select Rule</label>
                    <Dropdown v-model="portalSetupData.rule_id" :options="rules" optionLabel="name" optionValue="code" placeholder="Select Rule" checkmark :highlightOnSelect="false" class="w-full" />
                </div>
                <div class="col-12 md:col-4">
                    <label for="calendar-12h" class="font-bold block"> Set Duration: Start date time - End date time</label>
                    <Calendar id="calendar-12h" selectionMode="range" class="w-full" v-model="durations" showTime hourFormat="12" placeholder="Select Date Time" dateFormat="dd/mm/yy" />
                </div>
                <div class="col-12 md:col-4" v-if="portalSetupData.rule_id && portalSetupData.rule_id == 3">
                    <label for="amount" class="font-bold block"> Set Amount </label>
                    <InputNumber v-model="portalSetupData.amount" placeholder="Write Amount here" class="w-full" />
                </div>

                <div class="col-12 md:col-4" v-if="portalSetupData.rule_id && portalSetupData.rule_id != 3">
                    <Button icon="pi pi-file-excel" label="Download Sample Excel" size="small" severity="help" @click="demoExcelDownload" />

                    <label for="excelFile" class="p-button p-component p-button-info m-0 ml-2"><i class="pi pi-plus mr-2"></i><small>Add Excel File</small></label>
                    <input id="excelFile" type="file" class="form-control" @change="handleExcelFile($event)" accept=".xlsx, .xls, .csv" style="display: none" />
                </div>

                <div class="col-12 md-col-4">
                    <Button type="submit" icon="pi pi-check-circle" label="Save Setup" size="small" @click="submitPortalSetup" />
                </div>

                <Dialog v-model:visible="dialogVisible" modal header="Demo Excel" :style="{ width: '25rem' }">
                    <div class="mb-3">
                        <label for="rows" class="font-semibold w-6rem">How many Rows ?</label>
                        <InputNumber v-model="rows" id="rows" autocomplete="off" class="w-full" />
                    </div>

                    <div class="flex justify-content-end gap-2">
                        <Button type="button" label="Cancel" severity="secondary" @click="dialogVisible = false"></Button>
                        <Button type="button" label="Save" @click="demoExcelDownload" size="small"></Button>
                    </div>
                </Dialog>
            </div>
        </TabPanel>
        <TabPanel header="Setting Lists">
            <div class="card">
                <DataTable
                    v-model:editingRows="editingRows"
                    editMode="row"
                    dataKey="id"
                    @row-edit-save="onRowEditSave"
                    :pt="{
                        table: { style: 'min-width: 50rem' },
                        column: {
                            bodycell: ({ state }) => ({
                                style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                            })
                        }
                    }"
                    class="p-datatable-sm"
                    showGridlines
                    v-model:filters="filters"
                    :value="open_portal_settings"
                    paginator
                    :rows="10"
                    filterDisplay="row"
                    :loading="loading"
                    :globalFilterFields="['name', 'country.name', 'representative.name', 'status']"
                >
                    <template #header>
                        <!-- <div class="flex justify-content-end">
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                                </IconField>
                            </div> -->
                    </template>
                    <template #empty> No customers found. </template>
                    <template #loading> Loading customers data. Please wait. </template>
                    <Column field="rule_name" header="Rule" style="min-width: 12rem"></Column>
                    <Column field="start_date_time" header="Starts at" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ formatDate(data.start_date_time) }}
                        </template>
                        <template #editor="{ data, field }">
                            <Calendar id="calendar-12h" v-model="data[field]" showTime hourFormat="12" dateFormat="dd/mm/yy" />
                        </template>
                    </Column>
                    <Column field="end_date_time" header="Ends at" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ formatDate(data.end_date_time) }}
                        </template>

                        <template #editor="{ data, field }">
                            <Calendar id="calendar-12h" v-model="data[field]" showTime hourFormat="12" dateFormat="dd/mm/yy" />
                        </template>
                    </Column>
                    <Column field="amount" header="Amount" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.amount ?? 'Any amount' }}
                        </template>
                    </Column>
                    <Column field="file" header="File Uploaded" style="min-width: 12rem"></Column>
                    <Column field="status" header="Status" style="min-width: 12rem"></Column>
                    <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
                </DataTable>
            </div>
        </TabPanel>
    </TabView>
</template>
