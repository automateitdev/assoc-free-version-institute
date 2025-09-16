<script setup>
import { useToast } from 'primevue/usetoast';
const toast = useToast();
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';
const { feeStartupData } = storeToRefs(useGlobalStore());
const { fetchFeeStartups } = useGlobalStore();
import { FilterMatchMode } from 'primevue/api';
import axios from 'axios';
onMounted(async () => {
    fetchFeeStartups();

    watch(selected_accountGroup, (newValue) => {
        // Find the selected account group in the accountGroup array
        accountGroupData.value = feeStartupData.value.accountGroup.find((group) => group.account_group === newValue.account_group);
    });
});

//  visibility hook
useVisibilityChange(async () => {
    fetchFeeStartups();

    watch(selected_accountGroup, (newValue) => {
        // Find the selected account group in the accountGroup array
        accountGroupData.value = feeStartupData.value.accountGroup.find((group) => group.account_group === newValue.account_group);
    });
});

const new_feeHead = ref(null);
const new_feeSubHead = ref(null);
const new_waiver = ref(null);
const new_fund = ref(null);
const new_ledgerName = ref(null);
const selected_accountCategory = ref(null);
const selected_accountGroup = ref(null);
const accountGroupData = ref(null);

const nature = ref(['debit', 'credit']);
const getSeverity = (nature) => {
    switch (nature) {
        case 'debit':
            return 'info';

        case 'credit':
            return null;
    }
};
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'account_category_id.account_category': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'account_group_id.account_group': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'account_group_id.nature': { value: null, matchMode: FilterMatchMode.EQUALS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

async function handleFeeheadSubmit() {
    if (new_feeHead.value) {
        try {
            const { data } = await axios.post('fees-management/startup/feehead/store', {
                name: new_feeHead.value
            });

            if (data.payload.data.status == 'success') {
                toast.add({ severity: 'success', summary: data.message, detail: data.payload.data.message, life: 3000 });
                await fetchFeeStartups();
                new_feeHead.value = null;
            }
        } catch (error) {
            console.log(error);
            if (error.response.payload.data.status === 'error') {
                toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
            }
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
    }
}

async function handleFeeSubheadSubmit() {
    if (new_feeSubHead.value) {
        try {
            const { data } = await axios.post('fees-management/startup/feesubhead/store', {
                name: new_feeSubHead.value
            });

            if (data.payload.data.status == 'success') {
                toast.add({ severity: 'success', summary: data.message, detail: data.payload.data.message, life: 3000 });
                await fetchFeeStartups();
                new_feeSubHead.value = null;
            }
        } catch (error) {
            if (error.response.data.status === 'error') {
                toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
            }
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
    }
}

async function handleWaiverSubmit() {
    if (new_waiver.value) {
        try {
            const { data } = await axios.post('fees-management/startup/waiver/store', {
                name: new_waiver.value
            });

            if (data.payload.data.status == 'success') {
                toast.add({ severity: 'success', summary: data.message, detail: data.payload.data.message, life: 3000 });
                await fetchFeeStartups();
                new_waiver.value = null;
            }
        } catch (error) {
            if (error.response.data.status === 'error') {
                toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
            }
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
    }
}

// async function handleFundSubmit() {
//     if (new_fund.value) {
//         try {
//             const { data } = await axios.post('fees-management/startup/fund/store', {
//                 name: new_fund.value
//             });

//             if (data.payload.data.status == 'success') {
//                 toast.add({ severity: 'success', summary: data.payload.data.message, detail: data.message, life: 3000 });
//                 await fetchFeeStartups();
//                 new_fund.value = null;
//             }
//         } catch (error) {
//             if (error.response.data.status === 'error') {
//                 toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
//             }
//         }
//     } else {
//         toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
//     }
// }

// async function handleLedgerSubmit() {
//     if (accountGroupData && new_ledgerName.value) {
//         try {
//             const { data } = await axios.post('fees-management/startup/ledger/store', {
//                 account_category_id: selected_accountCategory.value.id,
//                 account_group_id: selected_accountGroup.value.id,
//                 name: new_ledgerName.value
//             });

//             if (data.payload.data.status == 'success') {
//                 toast.add({ severity: 'success', summary: data.payload.data.message, detail: data.message, life: 3000 });
//                 await fetchFeeStartups();
//                 new_ledgerName.value = null;
//                 selected_accountCategory.value = null;
//                 accountGroupData.value = null;
//             }
//         } catch (error) {
//             if (error.response.data.status === 'error') {
//                 toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
//             }
//         }
//     } else {
//         toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
//     }
// }

let visible = ref(false);
let selectedToDelete = ref();
let deleteFrom = ref();
function showConfirmation(data, type) {
    console.log(data, type);
    deleteFrom.value = type;
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

        if (data.payload.data.status == 'success') {
            toast.add({ severity: 'success', summary: data.payload.data.message, detail: data.message, life: 3000 });
            await fetchFeeStartups();
            new_ledgerName.value = null;
            selected_accountCategory.value = null;
            accountGroupData.value = null;
        }
    } catch (error) {
        if (error.response.data.status === 'error') {
            toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Name', life: 3000 });
        }
    }
    visible.value = false;
}
</script>
<template>
    <TabView class="card">
        <TabPanel header="1. Fee Head">
            <div class="container-fluid m-0">
                <div class="grid">
                    <div class="md:col-5">
                        <form action="">
                            <div class="mb-3">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Add Fee head</label>
                                <!-- <input v-model="new_feeHead" type="text" class="form-control" placeholder="Create Feehead" /> -->
                                <InputText v-model="new_feeHead" class="w-full" placeholder="Feehead Name"></InputText>
                            </div>
                            <Button label="Submit" icon="pi pi-check" size="small" @click="handleFeeheadSubmit" />
                        </form>
                    </div>
                    <div class="md:col-7">
                        <div class="card">
                            <DataTable :value="feeStartupData.feeHead" resizableColumns columnResizeMode="fit" stripedRows showGridlines class="p-datatable-sm">
                                <Column field="name" header="Name"></Column>
                                <Column header="Actions" filterField="id">
                                    <template #body="{ data }">
                                        <div class="flex justify-content-start gap-2">
                                            <a href="#" @click="showConfirmation(data, 'feehead')"><i class="pi pi-times-circle text-red-400 link" /></a>
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        </TabPanel>
        <TabPanel header="2. Fee Subhead">
            <div class="container-fluid m-0">
                <div class="grid">
                    <div class="md:col-5">
                        <form action="">
                            <div class="mb-3">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Add Fee Subhead</label>
                                <!-- <input v-model="new_feeSubHead" type="text" class="form-control" placeholder="Create Fee Subhead" /> -->
                                <InputText v-model="new_feeSubHead" class="w-full" placeholder="Feesubhead Name" />
                            </div>
                            <Button label="Submit" icon="pi pi-check" size="small" @click="handleFeeSubheadSubmit" />
                        </form>
                    </div>
                    <div class="md:col-7">
                        <div class="card">
                            <DataTable :value="feeStartupData.feeSubHead" resizableColumns columnResizeMode="fit" stripedRows showGridlines class="p-datatable-sm">
                                <Column field="name" header="Name"></Column>
                                <Column header="Actions" filterField="id">
                                    <template #body="{ data }">
                                        <div class="flex justify-content-start gap-2">
                                            <a href="#" @click="showConfirmation(data, 'feesubhead')"><i class="pi pi-times-circle text-red-400 link" /></a>
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        </TabPanel>
        <TabPanel header="3. Fee Waiver">
            <div class="container-fluid m-0">
                <div class="grid">
                    <div class="md:col-5">
                        <form action="">
                            <div class="mb-3">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Add Fee Waiver</label>
                                <!-- <input v-model="new_waiver" type="text" class="form-control" placeholder="Create Fee Waiver" /> -->
                                <InputText v-model="new_waiver" class="w-full" placeholder="Waiver Name" />
                            </div>
                            <Button label="Submit" icon="pi pi-check" size="small" @click="handleWaiverSubmit" />
                        </form>
                    </div>
                    <div class="md:col-7">
                        <div class="card">
                            <DataTable :value="feeStartupData.waiver" resizableColumns columnResizeMode="fit" stripedRows showGridlines class="p-datatable-sm">
                                <Column field="name" header="Name"></Column>
                                <!-- <Column header="Actions" filterField="id" >
                                    <template #body="{ data }">
                                        <div class="flex justify-content-start gap-2">
                                            <Button icon="pi pi-times" severity="danger" text rounded aria-label="Cancel" size="small" @click="showConfirmation(data, 'waiver')" />
                                        </div>
                                    </template>
                                </Column> -->
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        </TabPanel>
        <!-- <TabPanel header="4. Create Fund">
            <div class="container-fluid m-0">
                <div class="grid">
                    <div class="md:col-5">
                        <form action="">
                            <div class="mb-3">
                                <label for="formGroupExampleInput" class="form-label fw-bold">Add Fund</label>
                                <input v-model="new_fund" type="text" class="form-control" placeholder="Create Fund" />
                            </div>
                            <Button label="Submit" icon="pi pi-check" size="small" @click="handleFundSubmit" />
                        </form>
                    </div>
                    <div class="md:col-7">
                        <div class="card">
                            <DataTable :value="feeStartupData.fund" resizableColumns columnResizeMode="fit" stripedRows showGridlines class="p-datatable-sm">
                                <Column field="name" header="Name"></Column>
                                <Column header="Actions" filterField="id">
                                    <template #body="{ data }">
                                        <div class="flex justify-content-start gap-2">
                                            <a href="#" @click="showConfirmation(data, 'fund')"><i class="pi pi-times-circle text-red-400 link" /></a>
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        </TabPanel>
        <TabPanel header="5. Create Ledger">
            <div class="container-fluid m-0">
                <div class="grid">
                    <div class="col-md-12">
                        <form action="">
                            <div class="grid">
                                <div class="mb-3 md:col-6">
                                    <label for="formGroupExampleInput" class="form-label fw-bold">Account Category</label>
                                    <Dropdown v-model="selected_accountCategory" size="small" :options="feeStartupData.accountCategory" optionLabel="account_category" placeholder="Select Account Category" class="w-full p-0 m-0" :filter="true" />
                                </div>
                                <div class="mb-3 md:col-6">
                                    <label for="formGroupExampleInput" class="form-label fw-bold">Account Group</label>
                                    <Dropdown v-model="selected_accountGroup" size="small" :options="feeStartupData.accountGroup" optionLabel="account_group" placeholder="Select Account Group" class="w-full p-0 m-0" :filter="true" :disabled="!selected_accountCategory"/>

                                    <div v-if="accountGroupData" class="alert bg-light text-primary" style="border-top-left-radius: 0; border-top-right-radius: 0">
                                        <p><strong>Nature:</strong> {{ accountGroupData.nature }}</p>
                                        <p><strong>Note:</strong> {{ accountGroupData.note }}</p>
                                    </div>
                                </div>

                                <div class="mb-3 md:col-6">
                                    <label for="formGroupExampleInput" class="form-label fw-bold">Ledger Name</label>
                                    <input v-model="new_ledgerName" type="text" class="form-control" placeholder="Enter Ledger Name" :disabled="!selected_accountGroup"/>
                                </div>
                            </div>
                            <Button v-if="accountGroupData" label="Submit" icon="pi pi-check" size="small" @click="handleLedgerSubmit" class="mb-3" />
                        </form>
                    </div>
                    <div class="col-md-12 mt-3">
                        <div class="card">
                            <DataTable
                                v-model:filters="filters"
                                :value="feeStartupData.ledger"
                                paginator
                                :rows="5"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                dataKey="id"
                                filterDisplay="row"
                                stripedRows
                                show-gridlines
                                :loading="loading"
                                :globalFilterFields="['name', 'account_category_id.account_category', 'account_group_id.account_group']"
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
                                <template #empty> No Ledgers found. </template>
                                <template #loading> Loading Ledgers data. Please wait. </template>

                                <Column field="name" header="Ledger Name">
                                    <template #body="{ data }">
                                        {{ data.name }}
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Ledger" />
                                    </template>
                                </Column>

                                <Column header="Category" filterField="account_category_id.account_category">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <span>{{ data.account_category_id.account_category }}</span>
                                        </div>
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Category" />
                                    </template>
                                </Column>

                                <Column header="Group" filterField="account_group_id.account_group">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <span>{{ data.account_group_id.account_group }}</span>
                                        </div>
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Category" />
                                    </template>
                                </Column>

                                <Column field="account_group_id.nature" header="Nature" :showFilterMenu="true" :filterMenuStyle="{ width: '14rem' }">
                                    <template #body="{ data }">
                                        <Tag :value="data.account_group_id.nature" :severity="getSeverity(data.account_group_id.nature)" />
                                    </template>
                                    <template #filter="{ filterModel, filterCallback }">
                                        <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="nature" placeholder="Choose" class="p-column-filter" :showClear="true">
                                            <template #option="slotProps">
                                                <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)" />
                                            </template>
                                        </Dropdown>
                                    </template>
                                </Column>

                                <Column header="ID" filterField="id" style="min-width: 8rem">
                                    <template #body="{ data }">
                                        <div class="flex justify-content-start">
                                            <span class="text-center">{{ data.id }}</span>
                                        </div>
                                    </template>
                                </Column>

                                <Column header="Actions" filterField="id">
                                    <template #body="{ data }">
                                        <div class="flex align-items-center gap-2">
                                            <a href="#" @click="showConfirmation(data, 'ledger')"><i class="pi pi-times-circle text-red-400 link" /></a>
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>

                    </div>
                </div>
            </div>
        </TabPanel> -->
    </TabView>
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
</template>
~/plugins/axios
