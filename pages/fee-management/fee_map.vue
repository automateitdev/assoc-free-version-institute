<script setup>
import { useToast } from 'primevue/usetoast';
const toast = useToast();
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';
const { feeStartupData, feemaps } = storeToRefs(useGlobalStore());
const { fetchFeeStartups, fetchFeeMaps } = useGlobalStore();
import { FilterMatchMode } from 'primevue/api';
import axios from 'axios';
onMounted(async () => {
    fetchFeeStartups();
    fetchFeeMaps();
    // fetchBankInfo();
});

//  visibility hook
useVisibilityChange(async () => {
    fetchFeeStartups();
    fetchFeeMaps();
    // fetchBankInfo();
});

const feefilters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'fee_head_id.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'fee_subhead_id.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'fund_id.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'ledger_id.name': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const finefilters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'fee_head_id.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'fund_id.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'ledger_id.name': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const selected_ledger = ref(null);
const selected_feehead = ref(null);
const selected_feeSubHead = ref([]);
const selected_fund = ref([]);
const bankInfos = ref([]);
async function handleFeeMapSubmit() {
    if (selected_feehead.value && selected_feeSubHead.value) {
        try {
            // let ledger_id = selected_ledger.value.id;
            let feehead_id = selected_feehead.value.id;
            let subheads = selected_feeSubHead.value.map((element) => element.id);
            // let funds = selected_fund.value.map((element) => element.id);

            const { data } = await axios.post('fees-management/mapping/fee/store', {
                fee_head_id: feehead_id,
                fee_subhead_id: subheads
            });

            if (data.payload.data.status == 'success') {
                toast.add({ severity: 'success', summary: data.message, detail: data.message, life: 3000 });
                await fetchFeeStartups();
                await fetchFeeMaps();
                selected_feehead.value = null;
                selected_feeSubHead.value = [];
                // selected_ledger.value = null;
                // selected_fund.value = [];
            }
        } catch (error) {
            if (error.response.data.payload.data.status === 'error') {
                toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
            }
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
    }
}

// async function fetchBankInfo() {
//     try {
//         const { data } = await getRequest(`fees-management/mapping/bank-info`);
//         bankInfos.value = data.bankInfo;
//     } catch (error) {
//         console.log(error);
//     }
// }

const fine_ledger = ref(null);
const fine_feehead = ref(null);
const fine_fund = ref(null);
async function handleFineMapSubmit() {
    if (fine_feehead.value && fine_ledger.value && fine_fund.value) {
        try {
            let ledger_id = fine_ledger.value.id;
            let fee_head_id = fine_feehead.value.id;
            let fund_id = fine_fund.value.id;
            const { data } = await axios.post('fees-management/mapping/fine/store', {
                ledger_id: ledger_id,
                fee_head_id: fee_head_id,
                fund_id: fund_id
            });

            if (data.payload.data.status === 'success') {
                toast.add({ severity: 'success', summary: data.message, detail: data.message, life: 3000 });
                await fetchFeeStartups();
                await fetchFeeMaps();
                fine_ledger.value = null;
                fine_feehead.value = null;
                fine_fund.value = null;
            }
        } catch (error) {
            if (error.response.data.payload.data.status === 'error') {
                toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
            }
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
    }
}

const ops_feehead = ref(null);
const ops_account = ref(null);
async function handleOpsMapSubmit() {
    if (ops_feehead.value && ops_account.value) {
        // console.log(ops_account.value, ops_feehead.value.id);
        try {
            let ops_fee_head_id = ops_feehead.value.map((elem) => elem.id);
            let ops_bank_account = ops_account.value.id;

            const { data } = await axios.post('fees-management/mapping/ops/store', {
                fee_head_id: ops_fee_head_id,
                bank_account: ops_bank_account
            });

            if (data.payload.data.status === 'success') {
                toast.add({ severity: 'success', summary: data.message, detail: data.message, life: 3000 });
                await fetchFeeStartups();
                await fetchFeeMaps();
                ops_feehead.value = null;
                ops_account.value = null;
            }
        } catch (error) {
            console.log(error);
            // if (error.response.data.payload.data.status === 'error') {
            //     toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
            // }
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
    }
}

let visible = ref(false);
let selectedToDelete = ref();
let deleteFrom = ref();
function showConfirmation(data, type) {
    // console.log(data, type);
    // deleteFrom.value = type;
    visible.value = true;
    selectedToDelete.value = data;
}
async function deleteItem() {
    console.log(deleteFrom.value);
    const endpointMap = {
        feehead: 'fees-management/startup/feehead/delete/',
        feesubhead: 'fees-management/startup/feesubhead/delete/',
        waiver: 'fees-management/startup/feesubhead/delete/',
        fund: 'fees-management/startup/fund/delete/',
        ledger: 'fees-management/startup/ledger/delete/'
    };

    const deleteUrl = `${endpointMap[deleteFrom.value]}${selectedToDelete.value.id}`;
    try {
        const { data } = await axios.delete(deleteUrl);

        if (data.payload.data.status === 'success') {
            toast.add({ severity: 'success', summary: data.message, detail: data.message, life: 3000 });
            await fetchFeeStartups();
            new_ledgerName.value = null;
            selected_accountCategory.value = null;
            accountGroupData.value = null;
        }
    } catch (error) {
        if (error.response.data.payload.data.status === 'error') {
            toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
        }
    }
    visible.value = false;
}
</script>
<template>
    <TabView class="card">
        <TabPanel header="Fee Mapping">
            <div class="container-fluid m-0">
                <div class="grid">
                    <div class="md:col-12">
                        <form action="" class="grid">
                            <div class="md:col-6 mb-3">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Select Fee Head</label>
                                <Dropdown v-model="selected_feehead" :options="feeStartupData.feeHead" filter optionLabel="name" placeholder="Fee Head" class="w-full">
                                    <template #option="slotProps">
                                        <div class="flex align-items-center">
                                            <div>{{ slotProps.option.name }}</div>
                                        </div>
                                    </template>
                                </Dropdown>
                            </div>
                            <div class="md:col-6 mb-3">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Select Fee Subhead</label>
                                <MultiSelect display="chip" :disabled="!selected_feehead" v-model="selected_feeSubHead" :options="feeStartupData.feeSubHead" filter optionLabel="name" placeholder="Fee Subhead(s)" class="w-full" />
                            </div>

                            <!-- <div class="md:col-6 mb-3">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Select Ledger</label>
                                <Dropdown v-model="selected_ledger" :disabled="!selected_feeSubHead" :options="feeStartupData.ledger" filter optionLabel="name" placeholder="Ledger" class="w-full">
                                    <template #option="slotProps">
                                        <div class="flex align-items-center">
                                            <div>{{ slotProps.option.name }}</div>
                                        </div>
                                    </template>
                                </Dropdown>
                            </div> -->

                            <!-- <div class="md:col-6 mb-3" :disabled="!selected_ledger">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Select Fund</label>
                                <MultiSelect display="chip" v-model="selected_fund" :options="feeStartupData.fund" filter optionLabel="name" placeholder="Fund(s)" class="w-full" />
                            </div> -->

                            <div v-if="selected_feeSubHead.length && selected_feehead">
                                <Button label="Submit" icon="pi pi-check" size="small" @click="handleFeeMapSubmit" />
                            </div>
                        </form>
                    </div>
                    <div class="md:col-12 my-5">
                        <div class="card">
                            
                            <DataTable
                                v-model:filters="feefilters"
                                :value="feemaps.feeMapping"
                                paginator
                                :rows="5"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                dataKey="id"
                                filterDisplay="grid"
                                stripedRows
                                show-gridlines
                                :loading="loading"
                                :globalFilterFields="['fee_head_id.name', 'fee_subhead_id.name']"
                                class="p-datatable-sm"
                            >
                                <template #header>
                                    <div class="flex justify-content-end">
                                        <span class="p-input-icon-left">
                                            <i class="pi pi-search" />
                                            <InputText v-model="feefilters['global'].value" placeholder="Keyword Search" />
                                        </span>
                                    </div>
                                </template>
                                <template #empty> No mapping found. </template>
                                <template #loading> Loading mapping data. Please wait. </template>

                                <Column header="Fee Head" filterField="fee_head_id.name" style="min-width: 12rem">
                                    <template #body="{ data }">
                                        <div class="flex justify-content-left gap-2">
                                            <span class="text-center">{{ data.fee_head_id.name }}</span>
                                        </div>
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fee Head" />
                                    </template>
                                </Column>

                                <Column header="Fee Subhead" filterField="fee_subhead_id.name" style="min-width: 12rem">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <span>{{ data.fee_subhead_id.name }}</span>
                                        </div>
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fee Subhead" />
                                    </template>
                                </Column>

                                <!-- <Column field="name" header="Ledger Name" filterField="ledger_id.name" style="min-width: 12rem">
                                    <template #body="{ data }">
                                        {{ data.ledger_id.name }}
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Ledger" />
                                    </template>
                                </Column> -->

                                <!-- <Column header="Fund" filterField="fund_id.name" style="min-width: 12rem">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <span>{{ data.fund_id.name }}</span>
                                        </div>
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fund" />
                                    </template>
                                </Column> -->

                                <!-- <Column field="account_group_id.nature" header="Nature" :showFilterMenu="true" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                                    <template #body="{ data }">
                                        <Tag :value="data.account_group_id.nature" :severity="getSeverity(data.account_group_id.nature)" />
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="nature" placeholder="Select One" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                                            <template #option="slotProps">
                                                <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)" />
                                            </template>
                                        </Dropdown>
                                    </template>
                                </Column> -->

                                <!-- <Column header="Actions" filterField="id" style="min-width: 12rem">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <a href="#" @click="showConfirmation(data, 'ledger')"><i class="pi pi-times-circle text-red-400 link" /></a>
                                        </div>
                                    </template>
                                </Column> -->
                            </DataTable>
                        </div>
                    </div>

                    <Dialog v-model:visible="visible" :closable="true" modal header="Confirmation" :style="{ width: '35rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
                        <p>
                            Are you sure you want to delete <b>{{ selectedToDelete.name }}</b
                            >?
                        </p>
                        <template #footer>
                            <Button label="No" icon="pi pi-times" @click="visible = false" text size="small" />
                            <Button label="Yes" icon="pi pi-check" @click="deleteItem" autofocus severity="danger" size="small" />
                        </template>
                    </Dialog>
                </div>
            </div>
        </TabPanel>

        <!-- <TabPanel header="Fine Mapping">
            <div class="container-fluid m-0">
                <div class="grid">
                    <div class="md:col-12">
                        <form action="" class="grid">
                            <div class="col mb-3">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Select Fee Head</label>
                                <Dropdown v-model="fine_feehead" :options="feeStartupData.feeHead" filter optionLabel="name" placeholder="Fee Head" class="w-full">
                                    <template #option="slotProps">
                                        <div class="flex align-items-center">
                                            <div>{{ slotProps.option.name }}</div>
                                        </div>
                                    </template>
                                </Dropdown>
                            </div>

                            <div class="col mb-3">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Select Ledger</label>
                                <Dropdown v-model="fine_ledger" :options="feeStartupData.ledger" filter optionLabel="name" placeholder="Ledger" class="w-full">
                                    <template #option="slotProps">
                                        <div class="flex align-items-center">
                                            <div>{{ slotProps.option.name }}</div>
                                        </div>
                                    </template>
                                </Dropdown>
                            </div>

                            <div class="col mb-3" v-if="fine_ledger && fine_feehead">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Select Fund</label>

                                <Dropdown v-model="fine_fund" :options="feeStartupData.fund" filter optionLabel="name" placeholder="Fee Head" class="w-full">
                                    <template #option="slotProps">
                                        <div class="flex align-items-center">
                                            <div>{{ slotProps.option.name }}</div>
                                        </div>
                                    </template>
                                </Dropdown>

                            </div>

                            <div v-if="fine_ledger && fine_feehead && fine_fund">
                                <Button label="Submit" icon="pi pi-check" size="small" @click="handleFineMapSubmit" />
                            </div>
                        </form>
                    </div>
                    <div class="md:col-12 my-5">
                        <div class="card">
                            <DataTable
                                v-model:filters="finefilters"
                                :value="feemaps.fineMapping"
                                paginator
                                :rows="5"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                dataKey="id"
                                filterDisplay="grid"
                                stripedRows
                                show-gridlines
                                :loading="loading"
                                :globalFilterFields="['fee_head_id.name', 'fund_id.name', 'ledger_id.name']"
                                class="p-datatable-sm"
                            >
                                <template #header>
                                    <div class="flex justify-content-end">
                                        <span class="p-input-icon-left">
                                            <i class="pi pi-search" />
                                            <InputText v-model="finefilters['global'].value" placeholder="Keyword Search" />
                                        </span>
                                    </div>
                                </template>
                                <template #empty> No Ledgers found. </template>
                                <template #loading> Loading Ledgers data. Please wait. </template>

                                <Column header="Fee Head" filterField="fee_head_id.name" style="min-width: 12rem">
                                    <template #body="{ data }">
                                        <div class="flex justify-content-left gap-2">
                                            <span class="text-center">{{ data.fee_head_id.name }}</span>
                                        </div>
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fee Head" />
                                    </template>
                                </Column>

                                <Column header="Ledger Name" filterField="ledger_id.name" style="min-width: 12rem">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <span>{{ data.ledger_id.name }}</span>
                                        </div>
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Ledger" />
                                    </template>
                                </Column>

                                <Column header="Fund" filterField="fund_id.name" style="min-width: 12rem">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <span>{{ data.fund_id.name }}</span>
                                        </div>
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Fund" />
                                    </template>
                                </Column>


                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        </TabPanel> -->

        <!-- <TabPanel header="OPS Mapping">
            <div class="container-fluid m-0">
                <div class="grid">
                    <div class="md:col-5">
                        <form action="" class="grid">
                            <div class="md:col-12 mb-3">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Select Fee Head</label>

                                <MultiSelect display="chip" v-model="ops_feehead" :options="feeStartupData.feeHead" optionLabel="name" placeholder="Select Feehead" class="w-full" />
                            </div>

                            <div class="col mb-3" v-if="ops_feehead">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Enter Account ID</label>
                                <Dropdown v-model="ops_account" :options="bankInfos" optionLabel="account_no" placeholder="Select Account" class="w-full" />
                            </div>

                            <div v-if="ops_feehead && ops_account">
                                <Button label="Submit" icon="pi pi-check" size="small" @click="handleOpsMapSubmit" />
                            </div>
                        </form>
                    </div>
                    <div class="md:col-7">
                        <div class="card">
                            <DataTable :value="feemaps.opsMapping" resizableColumns columnResizeMode="fit" stripedRows showGridlines class="p-datatable-sm">
                                <Column field="fee_head_id.name" header="Fee Head"></Column>
                                <Column field="bank_account.account_no" header="Account"></Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        </TabPanel> -->
    </TabView>
</template>
~/plugins/axios
