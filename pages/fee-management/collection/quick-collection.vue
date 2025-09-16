<script>
import { useToast } from 'primevue/usetoast';
import { getRequest, postRequest } from '~/utils/request';
import { classShiftSection } from '~/utils/helper';

export default {
    setup() {
        const isLoading = ref(false);
        const toast = useToast();
        const responseBySection = ref([]);
        const responseByStudent = ref([]);
        const selectedAcademicYear = ref(null);
        const selectedClassCombination = ref(null);
        const sectionData = ref([]);
        const collectionData = ref();
        const selectedPayapplies = ref([]);

        const collectionDialog = ref(false);
        const collectionDialogData = ref(null);
        const processDate = ref();
        const selected_student_id = ref(null);

        async function getCollectionDialog(qc_student_data) {
            isLoading.value = true;
            collectionDialog.value = true;
            selected_student_id.value = qc_student_data.student_id;
            try {
                const { data } = await postRequest(`fees-management/fee-collection/quick-collection/show`, {
                    academic_year_id: selectedAcademicYear.value.id,
                    student_id: qc_student_data.student_id
                });

                data.payApplies.forEach((item) => {
                    item.payment_of = item.due_amount ?? item.total_amount;
                });

                // Assign the modified data to collectionData.value
                collectionData.value = data;
                isLoading.value = false;
            } catch (e) {
                isLoading.value = false;
            }
        }

        const indexData = ref({
            classMaps: [],
            academicYears: [],
            academicSessions: [],
            waivers: []
        });

        // serverside datatable data start
        const dt = ref();
        const loading = ref(false);
        const totalRecords = ref(0);
        const students = ref();
        const selectedStudents = ref();
        const selectAll = ref(false);
        const first = ref(0);
        const filters = ref({
            class_roll: { value: '', matchMode: 'contains' },
            'student_details.student_name': { value: '', matchMode: 'contains' },
            custom_student_id: { value: '', matchMode: 'contains' },
            'categories.coresubcategories.core_subcategory_name': { value: '', matchMode: 'contains' }
        });
        const lazyParams = ref({});
        const columns = ref([
            { field: 'class_roll', header: 'Class Roll' },
            { field: 'student_details.student_name', header: 'Name' },
            { field: 'custom_student_id', header: 'Student ID' },
            { field: 'categories.coresubcategories.core_subcategory_name', header: 'Category' }
        ]);

        const sectionWiseStudents = async () => {
            loading.value = true;
            // Update lazyParams.value.first based on event or first.value
            // lazyParams.value = { ...lazyParams.value, first: event?.first || first.value };

            try {
                const res = await postRequest('student-list', {
                    params: {
                        dt_params: JSON.stringify(lazyParams.value),
                        searchable_columns: JSON.stringify(['class_roll', 'student_details.student_name', 'custom_student_id', 'categories.coresubcategories.core_subcategory_name'])
                    },
                    institute_class_map_id: selectedClassCombination.value?.id,
                    section_id: selectedClassCombination.value?.section,
                    shift_id: selectedClassCombination.value?.shift,
                    academic_year_id: selectedAcademicYear.value?.id
                });

                students.value = res.data.students.data;
                totalRecords.value = res.data.students.total;
                loading.value = false;
            } catch (e) {
                students.value = [];
                totalRecords.value = 0;
                loading.value = false;

                // Log the error for debugging
                console.error('Error in sectionWiseStudents:', e);
            }
        };

        const onPage = (event) => {
            lazyParams.value = event;
            sectionWiseStudents();
        };

        const onSort = (event) => {
            lazyParams.value = event;
            sectionWiseStudents(event);
        };
        const onFilter = (event) => {
            lazyParams.value.filters = filters.value;
            sectionWiseStudents(event);
        };
        const onSelectAllChange = async (event) => {
            selectAll.value = event.checked;

            if (selectAll.value) {
                lazyParams.value.rows = -1;
                const res = await postRequest('student-list', {
                    params: {
                        dt_params: JSON.stringify(lazyParams.value),
                        searchable_columns: JSON.stringify(['class_roll', 'student_details.student_name', 'custom_student_id', 'categories.coresubcategories.core_subcategory_name'])
                    },
                    institute_class_map_id: selectedClassCombination.value.id,
                    section_id: selectedClassCombination.value.section,
                    shift_id: selectedClassCombination.value.shift,
                    academic_year_id: selectedAcademicYear.value.id
                });

                selectedStudents.value = res.data.students.data;
                totalRecords.value = res.data.students.total;
                loading.value = false;
            } else {
                selectAll.value = false;
                selectedStudents.value = [];
            }
        };
        const onRowSelect = () => {
            selectAll.value = selectedStudents.value.length === totalRecords.value;
        };
        const onRowUnselect = () => {
            selectAll.value = false;
        };

        // serverside datatable data end

        async function getIndexData() {
            try {
                const { data } = await getRequest(`fees-management/fee-collection`);

                if (data) {
                    indexData.value.classMaps = data.instituteClassMap;
                    indexData.value.academicYears = data.academicYears;
                    indexData.value.waivers = data.waivers;
                    indexData.value.academicSessions = data.academicSession;

                    const classShiftSectionsCombination = classShiftSection(data.instituteClassMap);
                    sectionData.value = classShiftSectionsCombination.reduce((accumulator, currentObj) => {
                        const existingCombination = accumulator.find((obj) => obj.combination === currentObj.combination);

                        if (!existingCombination) {
                            accumulator.push(currentObj);
                        } else {
                            // If the combination already exists, update other properties if needed
                            // In this example, no additional properties are updated
                        }

                        return accumulator;
                    }, []);
                }
            } catch (error) {
                // Handle the error, e.g., log it or show a message to the user
                console.error('Error fetching index data:', error);
            }
        }

        function isSelected(rowData) {
            return this.selectedPayapplies.some((row) => row.id === rowData.id);
        }

        async function updateCollection() {
            isLoading.value = true;
            const payapply_ids = selectedPayapplies.value.map((elem) => elem.id);
            const payments_of = selectedPayapplies.value.map((elem) => elem.payment_of);
            const collection_date = formatSingleDate(processDate.value);
            const hr_id = collectionData.value.user.hr_id;
            if (processDate.value && payapply_ids.length > 0 && payments_of.length > 0 && collection_date) {
                console.log(hr_id);
                try {
                    const { data } = await postRequest(`fees-management/fee-collection/quick-collection/store`, {
                        payapplies_id: payapply_ids,
                        payment_of: payments_of,
                        date: collection_date,
                        hr_id: hr_id
                    });
                    if (data.status == 'success') {
                        toast.add({ severity: 'success', summary: data.message, detail: data.message, life: 3000 });
                    }
                    selectedPayapplies.value = [];

                    try {
                        const { data } = await postRequest(`fees-management/fee-collection/quick-collection/show`, {
                            academic_year_id: selectedAcademicYear.value.id,
                            student_id: selected_student_id.value
                        });

                        data.payApplies.forEach((item) => {
                            item.payment_of = item.due_amount ?? item.total_amount;
                        });

                        // Assign the modified data to collectionData.value
                        collectionData.value = data;
                        isLoading.value = false;
                    } catch (e) {
                        collectionDialog.value = false;
                        console.log(e);
                        isLoading.value = false;
                    }

                    isLoading.value = false;
                } catch (error) {
                    toast.add({ severity: 'danger', summary: data.message ?? 'Sorry! Try Again later.', detail: 'Unexpected Execution', life: 3000 });
                    isLoading.value = false;
                }
            } else {
                toast.add({ severity: 'warn', summary: 'Missing necessary inputs !!', detail: 'Missing form value.', life: 3000 });
                isLoading.value = false;
            }
        }

        async function updateWaiver(data) {
            isLoading.value = true;
            let payapplies_id = data.id;
            let waiver_id = data.waiver_id;
            let waiver_amount = data.waiver_amount;
            console.log(payapplies_id, waiver_id, waiver_amount);

            if (payapplies_id && waiver_id && waiver_amount) {
                if (data.waiver_amount > data.total_amount) {
                    toast.add({ severity: 'warn', summary: 'Waiver Can not exceed total amount!!', detail: 'Unexpected Input', life: 3000 });
                    isLoading.value = false;
                } else if (data.waiver_amount == 0 || data.waiver_amount == null || data.waiver_amount == '') {
                    toast.add({ severity: 'warn', summary: 'Invalid Request!!', detail: 'Unexpected Input', life: 3000 });
                    isLoading.value = false;
                } else {
                    try {
                        const { data } = await postRequest(`fees-management/fee-collection/waiver-add`, {
                            payapplies_id: payapplies_id,
                            waiver_id: waiver_id,
                            waiver_amount: waiver_amount
                        });
                        if (data.status == 'success') {
                            toast.add({ severity: 'success', summary: data.message, detail: data.message, life: 3000 });

                            try {
                                const { data } = await postRequest(`fees-management/fee-collection/quick-collection/show`, {
                                    academic_year_id: selectedAcademicYear.value.id,
                                    student_id: selected_student_id.value
                                });

                                data.payApplies.forEach((item) => {
                                    item.payment_of = item.due_amount ?? item.total_amount;
                                });

                                // Assign the modified data to collectionData.value
                                collectionData.value = data;
                                isLoading.value = false;
                            } catch (e) {
                                collectionDialog.value = false;
                                console.log(e);
                                isLoading.value = false;
                            }

                            isLoading.value = false;
                        }
                    } catch (error) {
                        toast.add({ severity: 'danger', summary: 'Sorry! Try again later', detail: 'Unexpected Execution', life: 3000 });
                        isLoading.value = false;
                        console.log(error);
                    }
                }
            } else {
                toast.add({ severity: 'warn', summary: 'Missing necessary inputs !!', detail: 'Missing form value.', life: 3000 });
                isLoading.value = false;
            }
        }

        onMounted(() => {
            getIndexData();
            loading.value = true;

            lazyParams.value = {
                first: dt.value.first,
                rows: dt.value.rows,
                sortField: null,
                sortOrder: null,
                filters: filters.value
            };

            sectionWiseStudents();
        });

        return {
            isLoading,
            sectionData,
            responseBySection,
            responseByStudent,
            selectedAcademicYear,
            selectedClassCombination,
            indexData,

            //datatable essentials
            dt,
            loading,
            totalRecords,
            students,
            filters,
            lazyParams,
            onPage,
            onSort,
            onFilter,
            onSelectAllChange,
            onRowSelect,
            onRowUnselect,
            columns,
            first,
            selectAll,
            sectionWiseStudents,
            selectedStudents,

            collectionDialogData,
            collectionDialog,
            getCollectionDialog,
            collectionData,

            isSelected,
            processDate,
            selectedPayapplies,
            updateWaiver,
            updateCollection
        };
    }
};
</script>
<template>
    <div class="card">
        <TabView>
            <TabPanel header="Section Wise">
                <div class="row">
                    <div class="col-md mb-3">
                        <label for="formGroupExampleInput" class="form-label fw-bold">Academic Year</label>
                        <Dropdown v-model="selectedAcademicYear" :options="indexData.academicYears" filter optionLabel="core_subcategory_name" placeholder="Academic Year" class="w-full"> </Dropdown>
                    </div>
                    <div class="col-md mb-3">
                        <label for="formGroupExampleInput" class="form-label fw-bold">Class-Shift-Section</label>
                        <Dropdown v-model="selectedClassCombination" :options="sectionData" filter optionLabel="combination" placeholder="Class-Shift-Section" class="w-full text-capitalize"> </Dropdown>
                    </div>
                    <div class="col-md mb-3">
                        <Button @click="sectionWiseStudents" :loading="isLoading" :disabled="!selectedAcademicYear || !selectedClassCombination" label="Search" icon="pi pi-search" size="small" class="mt-5" />
                    </div>
                </div>

                <div class="card">
                    <DataTable
                        :value="students"
                        lazy
                        paginator
                        :first="first"
                        :rows="10"
                        :rowsPerPageOptions="[10, 25, 50, 100]"
                        v-model:filters="filters"
                        ref="dt"
                        dataKey="id"
                        :totalRecords="totalRecords"
                        :loading="loading"
                        @page="onPage($event)"
                        @sort="onSort($event)"
                        @filter="onFilter($event)"
                        filterDisplay="row"
                        :globalFilterFields="['student_details.student_name']"
                        v-model:selection="selectedStudents"
                        :selectAll="selectAll"
                        @select-all-change="onSelectAllChange"
                        @row-select="onRowSelect"
                        @row-unselect="onRowUnselect"
                        show-gridlines
                        striped-rows
                        resizableColumns
                        columnResizeMode="fit"
                        class="p-datatable-sm"
                    >
                        <template #empty> No Data Found. </template>
                        <template #loading> <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                        <g fill="none" stroke="rgb(237, 251, 251)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <path d="M3 12a9 9 0 0 0 9 9a9 9 0 0 0 9-9a9 9 0 0 0-9-9" stroke-dasharray="18 18" stroke-dashoffset="18">
                                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" fill="freeze" />
                            </path>

                            <path d="M17 12a5 5 0 1 0-5 5" stroke-dasharray="10 10" stroke-dashoffset="10">
                                <animateTransform attributeName="transform" type="rotate" from="360 12 12" to="0 12 12" dur="1s" repeatCount="indefinite" fill="freeze" />
                            </path>
                        </g>
                    </svg> </template>
                        <!-- <Column selectionMode="multiple" headerStyle="width: 2rem"></Column> -->
                        <Column field="class_roll" header="Class Roll" filterMatchMode="contains" sortable>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                        </Column>

                        <Column field="student_details.student_name" header="Name" filterMatchMode="contains" sortable>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                        </Column>

                        <Column field="custom_student_id" header="Student ID" filterMatchMode="contains" sortable>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                        </Column>

                        <Column field="categories.coresubcategories.core_subcategory_name" header="Category" filterMatchMode="contains" sortable>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                        </Column>

                        <Column style="flex: 0 0 4rem">
                            <template #body="{ data }">
                                <Button type="button" severity="success" icon="pi pi-inbox" title="collect" @click="getCollectionDialog(data)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel header="Student Wise">
                <icon class="pi pi-spin"></icon>
            </TabPanel>
        </TabView>
        <Dialog v-model:visible="collectionDialog" maximizable modal :header="collectionData ? collectionData.studentDetail.student_name : 'No Data Found!'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <TabView>
                <TabPanel header="Quick Collection">
                    <div class="row justify-content-start align-items-start" v-if="collectionData">
                        <div class="col-md-12">
                            <div class="d-flex justify-content-start align-items-center">
                                <img src="/img/avatar.png" alt="" style="max-width: 200px" />
                                <ul class="list-group" style="list-style: none">
                                    <li class="text-capitalize mb-2"><b class="text-primary">Group : </b> {{ collectionData.studentDetail.group }}</li>
                                    <li class="text-capitalize mb-2"><b class="text-primary">Category : </b> {{ collectionData.studentDetail.category }}</li>
                                    <li class="text-capitalize mb-2"><b class="text-primary">Student Roll : </b> {{ collectionData.studentDetail.class_roll }}</li>
                                    <li class="text-capitalize mb-2"><b class="text-primary">Student ID: </b> {{ collectionData.studentDetail.custom_student_id }}</li>
                                    <li class="text-capitalize mb-2"><b class="text-primary">Contact : </b> {{ collectionData.studentDetail.mobile }}</li>
                                    <li class="text-capitalize mb-2">
                                        <b class="text-primary">Class-Shift-Section : </b> {{ collectionData.studentDetail.class_name }}-{{ collectionData.studentDetail.shift }}-{{ collectionData.studentDetail.section }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="card">
                            <div class="d-flex">
                                <span class="p-float-label">
                                    <Calendar id="process_date" v-model="processDate" dateFormat="dd-M-yy" class="mr-2" />
                                    <label for="process_date">Collection Date</label>
                                </span>
                                <Button :disabled="selectedPayapplies.length <= 0 || !processDate" label="Collect" size="small" icon="pi pi-check-circle" severity="primary" @click="updateCollection" />
                            </div>
                            <p class="fw-bold text-secondary">
                                <small>Collection By: {{ collectionData.user.hr_name }}</small>
                            </p>

                            <DataTable
                                resizableColumns
                                columnResizeMode="fit"
                                show-gridlines
                                striped-rows
                                v-model:selection="selectedPayapplies"
                                :value="collectionData.payApplies"
                                dataKey="id"
                                scrollable
                                scrollHeight="400px"
                                class="mt-4 p-datatable-sm"
                                tableStyle="min-width: 50rem"
                            >
                                <Column selectionMode="multiple" headerStyle="width: 3rem" frozen style="z-index: 100"> </Column>
                                <Column field="academic_year_id" header="Academic Year"></Column>
                                <Column field="fee_head_name" header="Fee Head"></Column>
                                <Column field="fee_subhead_name" header="Fee Subhead"></Column>
                                <Column field="payable" header="Payable"></Column>
                                <!-- <Column field="fine" header="Fine">
                                    <template #body="{ data }">
                                        {{ data.fine ?? 'No fine' }}
                                    </template>
                                </Column>
                                <Column field="waiver_amount" header="Waiver">
                                    <template #body="{ data }">
                                        <span class="text-primary">
                                            <Dropdown :disabled="!isSelected(data)" v-model="data.waiver_id"
                                                :options="indexData.waivers" filter optionLabel="name" option-value="id"
                                                size="small" placeholder="Select Waiver" class="w-full mr-2 md:w-14rem">
                                            </Dropdown>

                                            <inputNumber :disabled="!isSelected(data)" v-model="data.waiver_amount"
                                                size="small" inputId="locale-user" :minFractionDigits="2"
                                                placeholder="Waiver Amount" />

                                            <Button :loading="isLoading"
                                                :disabled="!isSelected(data) || (data.waiver_amount ? data.waiver_amount > data.total_amount : true)"
                                                size="small" severity="success" icon="pi pi-check"
                                                @click="updateWaiver(data)" />
                                        </span>
                                    </template>
                                </Column> -->
                                <Column field="total_amount" header="Total Amount"></Column>
                                <Column field="total_amount" header="Payment of">
                                    <template #body="{ data }">
                                        <inputNumber :disabled="!isSelected(data)" v-model="data.payment_of" inputId="locale-user" :minFractionDigits="2" />
                                    </template>
                                </Column>
                                <Column field="Due_amount" header="Due">
                                    <template #body="{ data }">
                                        {{ data.due_amount ?? 'No Due' }}
                                    </template>
                                </Column>

                                <Column field="fine" header="Fine">
                                    <template #body="{ data }">
                                        {{ data.fine ?? 'No fine' }}
                                    </template>
                                </Column>
                                <Column field="waiver_amount" header="Waiver">
                                    <template #body="{ data }">
                                        <span class="text-primary">
                                            <Dropdown
                                                :disabled="!isSelected(data)"
                                                v-model="data.waiver_id"
                                                :options="indexData.waivers"
                                                filter
                                                optionLabel="name"
                                                option-value="id"
                                                size="small"
                                                placeholder="Select Waiver"
                                                class="w-full mr-2 md:w-14rem"
                                            >
                                            </Dropdown>

                                            <inputNumber :disabled="!isSelected(data)" v-model="data.waiver_amount" size="small" inputId="locale-user" :minFractionDigits="2" placeholder="Waiver Amount" />

                                            <Button
                                                class="ml-2"
                                                severity="success"
                                                :loading="isLoading"
                                                :disabled="!isSelected(data) || !data.waiver_id || (data.waiver_amount ? data.waiver_amount > data.total_amount : true)"
                                                size="small"
                                                icon="pi pi-save"
                                                @click="updateWaiver(data)"
                                            />
                                        </span>
                                    </template>
                                </Column>

                                <Column field="fee_payable_date" header="Payable Date">
                                    <template #body="{ data }">
                                        {{ data.fee_payable_date ? formatDateToDdMYY(data.fee_payable_date) : 'Not Set' }}
                                    </template>
                                </Column>

                                <Column field="fine_active_date" header="Fine Active">
                                    <template #body="{ data }">
                                        {{ data.fine_active_date ? formatDateToDdMYY(data.fine_active_date) : 'Not Set' }}
                                    </template>
                                </Column>

                                <Column field="fee_expire_date" header="Expires At">
                                    <template #body="{ data }">
                                        {{ data.fee_expire_date ? dateFormate(data.fee_expire_date) : 'Not Set' }}
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Collection Invoices">
                    
                    <QuickCollection v-if="collectionData" :studentIdProps="collectionData.studentDetail.student_id" :academicYearIdProps="selectedAcademicYear.id"></QuickCollection>
                    <div v-else class="alert alert-info">
                        <p>No Payment Invoice Found!</p>
                    </div>
                </TabPanel>
            </TabView>
        </Dialog>
    </div>
</template>
~/utils/request