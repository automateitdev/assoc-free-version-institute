<script>
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
export default {
    setup() {
        const toast = useToast();
        const indexData = ref({
            instituteClassMap: [],
            academicYears: [],
            feeHead: []
        });
        const isLoading = ref(false);
        useSeoMeta({
            title: 'Date Setup'
        });

        // for Assign
        const feeSubheads = ref(null);
        const selectedAcademicYear = ref(null);
        const selectedFeehead = ref(null);
        const selectedClasses = ref(null);
        const selectedDates = ref([]);

        // for update
        const searchFeehead = ref('');
        const searchClass = ref([]);
        const searchAcademicYear = ref(null);
        const feeSubheadsToUpdate = ref([]);
        const searchedDates = ref([]);
        const filteredFormData = ref({
            date_setup_id: [],
            fee_payable_date: [],
            fine_active_date: [],
            fee_expire_date: []
        });

        let formData = reactive({
            academic_year_id: '',
            class_id: '',
            fee_head_id: '',
            fee_subhead_id: [],
            fee_payable_date: [],
            fine_active_date: [],
            fee_expire_date: []
        });

        onMounted(() => {
            getDateSetupIndex();
        });

        watch(selectedAcademicYear, () => {
            selectedFeehead.value = null;
            feeSubheads.value = [];
        });

        watch(selectedClasses, () => {
            selectedFeehead.value = null;
            feeSubheads.value = [];
        });

        watch(searchAcademicYear, () => {
            searchFeehead.value = null;
            feeSubheadsToUpdate.value = [];
        });

        watch(searchClass, () => {
            searchFeehead.value = null;
            feeSubheadsToUpdate.value = [];
        });

        async function getDateSetupIndex() {
            selectedDates.value = [];
            feeSubheads.value = [];
            formData.value = [];
            try {
                const { data } = await axios.get(`fees-management/date-setup`);
                indexData.value.instituteClassMap = data.payload.data.instituteClassMap;
                indexData.value.academicYears = data.payload.data.academicYears;
                indexData.value.feeHead = data.payload.data.feeHead;

                // console.log(indexData);
            } catch (error) {
                console.log(error);
            }
        }

        async function assignDateSetup() {
            // [ { "id": 1, "payableDate": "2023-12-11", "fineActiveDate": "2023-12-13", "expiredAt": "2023-12-13" } ]
            isLoading.value = true;
            if (selectedDates.value.length > 0) {
                formData.class_id = selectedClasses.value.map((elem) => elem.class_id ?? '');
                formData.fee_head_id = selectedFeehead.value.id;
                formData.academic_year_id = selectedAcademicYear.value.id;
                formData.fee_subhead_id = selectedDates.value.map((elem) => elem.fee_subhead_id.id ?? '');
                formData.fee_payable_date = selectedDates.value.map((elem) => elem.payableDate ?? '');
                formData.fine_active_date = selectedDates.value.map((elem) => elem.fineActiveDate ?? '');
                formData.fee_expire_date = selectedDates.value.map((elem) => elem.expiredAt ?? '');

                let isPayableDatesEmpty = formData.fee_payable_date.some((payableDate) => payableDate === '');

                // Format dates in ISO 8601 format
                formData.fee_payable_date = formatMultipleDates(formData.fee_payable_date);
                formData.fine_active_date = formatMultipleDates(formData.fine_active_date);
                formData.fee_expire_date = formatMultipleDates(formData.fee_expire_date);

                console.log(formData);
                if (!isPayableDatesEmpty && formData.fee_subhead_id.length > 0 && formData.class_id.length > 0) {
                    try {
                        const { data } = await axios.post('fees-management/date-setup/store', formData);
                        if (data.payload.data.status === 'success') {
                            toast.add({ severity: 'success', summary: 'Success', detail: data.payload.data.message, life: 3000 });
                            selectedDates.value = [];
                            feeSubheads.value = [];
                            formData.value = [];
                            fetchfeeSubheads();
                        } else {
                            toast.add({ severity: 'error', summary: 'Error!', detail: 'Something went wrong!', life: 3000 });
                        }
                        isLoading.value = false;
                    } catch (error) {
                        isLoading.value = false;
                        console.log(error);
                        if (error.response.data.status === 'error') {
                            toast.add({ severity: 'error', summary: 'Error!', detail: 'Duplicate Entry', life: 3000 });
                        }
                    }
                } else {
                    isLoading.value = false;
                    toast.add({ severity: 'warn', summary: 'Missing necessary inputs !!', detail: 'Missing form value.', life: 3000 });
                }
            } else {
                isLoading.value = false;
                toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
            }
        }

        async function updateDateSetup() {
            if (searchedDates?.value.length > 0 && feeSubheadsToUpdate) {
                const formattedData = searchedDates.value.map((subhead) => ({
                    ...subhead,
                    fee_payable_date: formatSingleDate(subhead.fee_payable_date),
                    fine_active_date: formatSingleDate(subhead.fine_active_date),
                    fee_expire_date: formatSingleDate(subhead.fee_expire_date)
                }));

                filteredFormData.value.date_setup_id = formattedData.map((datesetup) => datesetup.id);
                filteredFormData.value.fee_payable_date = formattedData.map((datesetup) => datesetup.fee_payable_date ?? '');
                filteredFormData.value.fine_active_date = formattedData.map((datesetup) => datesetup.fine_active_date ?? '');
                filteredFormData.value.fee_expire_date = formattedData.map((datesetup) => datesetup.fee_expire_date ?? '');

                console.log(filteredFormData.value);
                let isPayableDatesEmpty = filteredFormData.value.fee_payable_date.some((payableDate) => payableDate === '');

                if (isPayableDatesEmpty) {
                    toast.add({ severity: 'warn', summary: 'Payable Date(s) can not be empty!', detail: 'Unexpected Exception.', life: 3000 });
                    isLoading.value = false;
                } else {
                    const { data } = await postRequest(`fees-management/date-setup/update`, {
                        date_setup_id: filteredFormData.value.date_setup_id,
                        fee_payable_date: filteredFormData.value.fee_payable_date,
                        fine_active_date: filteredFormData.value.fine_active_date,
                        fee_expire_date: filteredFormData.value.fee_expire_date
                    });
                    if (data.status == 'success') {
                        toast.add({ severity: 'success', summary: data.message, detail: data.message, life: 3000 });
                        filteredFormData.value = [];
                        searchedDates.value = [];
                        feeSubheadsToUpdate.value = [];
                        fetchfeeSubheadsToUpdate();
                    }
                    isLoading.value = false;
                }
            } else {
                isLoading.value = false;
                toast.add({ severity: 'warn', summary: 'Sorry! try again later', detail: 'Unexpected Exception.', life: 3000 });
            }
        }

        async function fetchfeeSubheads() {
            isLoading.value = true;
            let feeheadId = selectedFeehead.value.id;
            selectedDates.value = [];
            if (feeheadId) {
                try {
                    const { data } = await axios.post(`fees-management/date-setup/show`, {
                        fee_head_id: feeheadId
                    });
                    feeSubheads.value = data.payload.data.feeSubhead;
                    isLoading.value = false;
                } catch (error) {
                    isLoading.value = false;

                    console.log(error);
                }
            } else {
                isLoading.value = false;

                toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
            }
        }

        function isSelected(gridData) {
            return this.selectedDates.some((date) => date.id === gridData.data.id);
        }

        function isSerchedRowSelected(fetchedData) {
            return this.searchedDates.some((date) => date.id === fetchedData.data.id);
        }

        function updateSelectedDates(gridData) {
            const index = this.selectedDates.findIndex((date) => date.id === gridData.data.id);
            if (index !== -1) {
                this.selectedDates[index] = {
                    id: gridData.data.id,
                    fee_subhead_id: gridData.data.fee_subhead_id,
                    payableDate: gridData.data.payableDate,
                    fineActiveDate: gridData.data.fineActiveDate,
                    expiredAt: gridData.data.expiredAt
                };
            } else {
                this.selectedDates.push({
                    id: gridData.data.id,
                    fee_subhead_id: gridData.data.fee_subhead_id,
                    payableDate: gridData.data.payableDate,
                    fineActiveDate: gridData.data.fineActiveDate,
                    expiredAt: gridData.data.expiredAt
                });
            }
        }

        function selectedDatesetups(fetchedData) {
            const index = this.searchedDates.findIndex((date) => date.id === fetchedData.data.id);
            if (index !== -1) {
                this.searchedDates[index] = {
                    id: fetchedData.data.id,
                    fee_payable_date: fetchedData.data.fee_payable_date,
                    fine_active_date: fetchedData.data.fine_active_date,
                    fee_expire_date: fetchedData.data.fee_expire_date
                };
            } else {
                this.searchedDates.push({
                    id: fetchedData.data.id,
                    fee_payable_date: fetchedData.data.fee_payable_date,
                    fine_active_date: fetchedData.data.fine_active_date,
                    fee_expire_date: fetchedData.data.fee_expire_date
                });
            }
        }

        async function fetchfeeSubheadsToUpdate() {
            isLoading.value = true;
            searchedDates.value = [];
            if (searchAcademicYear.value && searchClass.value && searchFeehead.value) {
                try {
                    const { data } = await axios.post(`fees-management/date-setup/search`, {
                        class_id: searchClass.value.class_id,
                        academic_year_id: searchAcademicYear.value.id,
                        fee_head_id: searchFeehead.value.id
                    });
                    feeSubheadsToUpdate.value = data.payload.data.DateSetup;

                    if (feeSubheadsToUpdate.value.length > 0) {
                        // Parse all the dates in the feeSubheadsToUpdate array
                        // console.log(feeSubheadsToUpdate.value);
                        const parsedDates = feeSubheadsToUpdate.value.map((subhead) => ({
                            ...subhead,
                            fee_payable_date: subhead.fee_payable_date !== null ? new Date(subhead.fee_payable_date) : '',
                            fine_active_date: subhead.fine_active_date !== null ? new Date(subhead.fine_active_date) : '',
                            fee_expire_date: subhead.fee_expire_date !== null ? new Date(subhead.fee_expire_date) : ''
                        }));

                        feeSubheadsToUpdate.value = parsedDates;
                        // Now, parsedDates is an array of objects with parsed date properties
                        // console.log(feeSubheadsToUpdate);
                    }

                    isLoading.value = false;
                } catch (error) {
                    isLoading.value = false;
                    console.log(error);
                }
            } else {
                isLoading.value = false;
                toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
            }
        }

        // Expose indexData to the template
        return {
            isLoading,
            indexData,
            selectedAcademicYear,
            selectedFeehead,
            selectedClasses,
            fetchfeeSubheads,
            feeSubheads,
            selectedDates,
            isSelected,
            updateSelectedDates,
            formData,
            assignDateSetup,
            filteredFormData,
            feeSubheadsToUpdate,
            searchAcademicYear,
            searchFeehead,
            searchClass,
            searchedDates,
            selectedDatesetups,
            isSerchedRowSelected,
            updateDateSetup,
            fetchfeeSubheadsToUpdate
        };
    }
};
</script>

<template>
    <div class="card">
        <TabView>
            <TabPanel header="Assign">
                <div class="grid">
                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Academic Year</label>
                        <Dropdown v-model="selectedAcademicYear" :options="indexData.academicYears" filter optionLabel="core_subcategory_name" placeholder="Academic Year" class="w-full">
                            <template #option="slotProps">
                                <div class="flex align-items-center">
                                    <div>{{ slotProps.option.core_subcategory_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Select Classes</label>
                        <MultiSelect display="chip" :disabled="!selectedAcademicYear" v-model="selectedClasses" :options="indexData.instituteClassMap" optionLabel="class_name" placeholder="Select Classes" class="w-full" />
                    </div>

                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Fee Head</label>
                        <Dropdown v-model="selectedFeehead" :disabled="!selectedClasses || !selectedAcademicYear" :options="indexData.feeHead" filter optionLabel="name" placeholder="Fee Head" class="w-full" @change="fetchfeeSubheads">
                            <template #option="slotProps">
                                <div class="flex align-items-center">
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-12">
                        <div class="card">
                            <DataTable showGridlines resizableColumns columnResizeMode="fit" :loading="isLoading" v-model:selection="selectedDates" :value="feeSubheads" dataKey="id" tableStyle="min-width: 50rem" class="p-datatable-sm">
                                <template #header>
                                    <div class="flex justify-content-end">
                                        <Button
                                            label="Assign"
                                            icon="pi pi-check"
                                            size="small"
                                            class="my-2 float-right"
                                            v-if="feeSubheads && feeSubheads.length > 0"
                                            :loading="isLoading"
                                            :disabled="selectedDates.length <= 0"
                                            @click="assignDateSetup"
                                        ></Button>
                                    </div>
                                </template>
                                <template #empty>Nothing to setup here!</template>
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
                                <Column field="fee_subhead_id.name" header="Code"></Column>
                                <Column header="Fee Payable Date">
                                    <template #body="gridData">
                                        <Calendar
                                            v-model="gridData.data.payableDate"
                                            dateFormat="dd-M-yy"
                                            @input="updateSelectedDates(gridData)"
                                            :disabled="!isSelected(gridData)"
                                            :max-date="gridData.data.fineActiveDate ?? null"
                                            placeholder="Fee Payable Date"
                                            showIcon
                                            iconDisplay="input"
                                            inputId="icondisplay"
                                        />
                                    </template>
                                </Column>
                                <Column header="Fine Active Date">
                                    <template #body="gridData">
                                        <Calendar
                                            v-model="gridData.data.fineActiveDate"
                                            dateFormat="dd-M-yy"
                                            @input="updateSelectedDates(gridData)"
                                            :disabled="!isSelected(gridData)"
                                            :min-date="gridData.data.payableDate ?? null"
                                            :max-date="gridData.data.expiredAt ?? null"
                                            placeholder="Fine Payable Date"
                                            showIcon
                                            iconDisplay="input"
                                            inputId="icondisplay"
                                        />
                                    </template>
                                </Column>
                                <Column header="Expired At">
                                    <template #body="gridData">
                                        <Calendar
                                            v-model="gridData.data.expiredAt"
                                            dateFormat="dd-M-yy"
                                            @input="updateSelectedDates(gridData)"
                                            :disabled="!isSelected(gridData)"
                                            :min-date="gridData.data.fineActiveDate ?? null"
                                            placeholder="Expired At"
                                            showIcon
                                            iconDisplay="input"
                                            inputId="icondisplay"
                                        />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>

            <TabPanel header="Update">
                <div class="grid">
                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Academic Year</label>
                        <Dropdown v-model="searchAcademicYear" :options="indexData.academicYears" filter optionLabel="core_subcategory_name" placeholder="Academic Year" class="w-full">
                            <template #option="slotProps">
                                <div class="flex align-items-center">
                                    <div>{{ slotProps.option.core_subcategory_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Select Class</label>
                        <!-- <MultiSelect display="chip" :disabled="!searchAcademicYear" v-model="searchClasses" :options="indexData.instituteClassMap" optionLabel="class_name" placeholder="Select Funds" class="w-full" /> -->

                        <Dropdown v-model="searchClass" :disabled="!searchAcademicYear" :options="indexData.instituteClassMap" filter optionLabel="class_name" placeholder="Select Class" class="w-full" />
                    </div>

                    <div class="md:col-4">
                        <label for="formGroupExampleInput" class="form-label font-bold">Fee Head</label>
                        <Dropdown v-model="searchFeehead" :disabled="!searchClass || !searchAcademicYear" :options="indexData.feeHead" filter optionLabel="name" @change="fetchfeeSubheadsToUpdate" placeholder="Fee Head" class="w-full">
                            <template #option="slotProps">
                                <div class="flex align-items-center">
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-12">
                        <div class="card">
                            <DataTable resizableColumns columnResizeMode="fit" :loading="isLoading" v-model:selection="searchedDates" :value="feeSubheadsToUpdate" dataKey="id" tableStyle="min-width: 50rem" class="p-datatable-sm">
                                <template #header>
                                    <Button
                                        v-if="feeSubheadsToUpdate && feeSubheadsToUpdate.length > 0"
                                        label="Update"
                                        icon="pi pi-chevron-circle-up"
                                        size="small"
                                        class="my-2 float-right"
                                        :loading="isLoading"
                                        :disabled="searchedDates.length <= 0"
                                        @click="updateDateSetup"
                                    ></Button>
                                </template>
                                <template #empty>Nothing to setup here!</template>
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
                                <Column field="fee_subhead_id.name" header="Fee Subhead"></Column>
                                <Column field="fee_head_id.name" header="Fee Head"></Column>
                                <Column header="Fee Payable Date">
                                    <template #body="fetchedData">
                                        <Calendar
                                            v-model="fetchedData.data.fee_payable_date"
                                            date-format="dd-M-yy"
                                            placeholder="Fee Payable Date"
                                            :disabled="!isSerchedRowSelected(fetchedData)"
                                            @input="selectedDatesetups(fetchedData)"
                                            :max-date="fetchedData.data.fine_active_date ?? null"
                                            showIcon
                                            iconDisplay="input"
                                            inputId="icondisplay"
                                        />
                                    </template>
                                </Column>
                                <Column header="Fine Active Date">
                                    <template #body="fetchedData">
                                        <Calendar
                                            v-model="fetchedData.data.fine_active_date"
                                            dateFormat="dd-M-yy"
                                            :disabled="!isSerchedRowSelected(fetchedData)"
                                            :min-date="fetchedData.data.fee_payable_date ?? null"
                                            :max-date="fetchedData.data.fee_expire_date ?? null"
                                            placeholder="Fine Payable Date"
                                            @input="selectedDatesetups(fetchedData)"
                                            showIcon
                                            iconDisplay="input"
                                            inputId="icondisplay"
                                            :value="fetchedData.data.fine_active_date ? null : new Date()"
                                        />
                                    </template>
                                </Column>
                                <Column header="Expired At">
                                    <template #body="fetchedData">
                                        <Calendar
                                            v-model="fetchedData.data.fee_expire_date"
                                            dateFormat="dd-M-yy"
                                            :disabled="!isSerchedRowSelected(fetchedData)"
                                            :min-date="fetchedData.data.fine_active_date ?? null"
                                            @input="selectedDatesetups(fetchedData)"
                                            placeholder="Expired At"
                                            showIcon
                                            iconDisplay="input"
                                            inputId="icondisplay"
                                        />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>
