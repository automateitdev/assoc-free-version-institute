<script setup>
import useVisibilityChange from '~/composables/useVisibilityChange';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// Pinia store
import { storeToRefs } from 'pinia';
import { useAdmissionStore } from '~/stores/admission';
const { classSetupIndex, subjectSetupIndex, loading } = storeToRefs(useAdmissionStore());

//
const { fetchClassSetupIndex, fetchSubjectSetupIndex, saveClassSetup, saveSubjectSetup, updateSubjectSetup } = useAdmissionStore();

const toast = useToast();
const confirm = useConfirm();
const classList = ref();
const centerList = ref();
const instituteList = ref();
const selectedClass = ref();
const selectedCenter = ref();
const selectedInstitutes = ref([]);

const classForSubjects = ref();
const groupForSubjects = ref();
const groupOptions = ref();

const compulsorySubjects = ref([]);
const groupSubjects = ref([]);
const optionalSubjects = ref([]);
const visible = ref(false);

const selectedClassData = ref();
const updateCompulsorySubjects = ref([]);
const updateGroupSubjects = ref([]);

// Function to find subjects in `subjectSetupIndex`
function findSubjects(subjectNames, subjectSetupIndex) {
    return subjectNames.map((subjectName) => subjectSetupIndex.value?.subjectList.find((subject) => subject.subject_name === subjectName)).filter(Boolean); // Filter out any subjects that were not found
}
const getSelectedSubjects = (data) => {
    selectedClassData.value = data;
    updateCompulsorySubjects.value = findSubjects(JSON.parse(data.compulsory.replace(/'/g, '"')), subjectSetupIndex);
    updateGroupSubjects.value = findSubjects(JSON.parse(data.group.replace(/'/g, '"')), subjectSetupIndex);
    visible.value = true;
};
const updateSubjectSetupData = reactive({
    class_id: null,
    group_id: null,
    class_name: null,
    group_name: null,
    compulsory: [],
    group: [],
    optional: []
});
const subjectUpdateRequest = async () => {
    try {
        updateSubjectSetupData.id = selectedClassData.value.id;
        updateSubjectSetupData.class_id = selectedClassData.value.class_id;
        updateSubjectSetupData.class_name = selectedClassData.value.class_name;
        updateSubjectSetupData.group_id = selectedClassData.value.group_id;
        updateSubjectSetupData.group_name = selectedClassData.value.group_name;
        updateSubjectSetupData.compulsory = updateCompulsorySubjects.value.map((elem) => elem.subject_name);
        updateSubjectSetupData.group = updateGroupSubjects.value.map((elem) => elem.subject_name);

        const { status, message, error } = await updateSubjectSetup(updateSubjectSetupData);
        if (status === 'success') {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    } finally {
        (selectedClassData.value = null), (updateCompulsorySubjects.value = []), (updateGroupSubjects.value = []);
        (updateSubjectSetupData.class_id = null),
            (updateSubjectSetupData.group_id = null),
            (updateSubjectSetupData.class_name = null),
            (updateSubjectSetupData.group_name = null),
            (updateSubjectSetupData.compulsory = []),
            (updateSubjectSetupData.group = []),
            (updateSubjectSetupData.optional = []);
        await fetchSubjectSetupIndex();
        visible.value = false;
    }
};

const classSetupData = reactive({
    class_id: null,
    class_name: null,
    group_id: [],
    group_name: []
});
const classSetupRequest = async () => {
    try {
        classSetupData.class_id = selectedClass.value.subcategory_id;
        classSetupData.class_name = selectedClass.value.subcategory_name;
        classSetupData.group_id = selectedInstitutes.value.map((elem) => elem.subcategory_id);
        classSetupData.group_name = selectedInstitutes.value.map((elem) => elem.subcategory_name);

        const { status, message, error } = await saveClassSetup(classSetupData);
        if (status === 'success') {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    } finally {
        (selectedClass.value = null), (selectedInstitutes.value = []), (classSetupData.class_id = null), (classSetupData.class_name = null), (classSetupData.group_id = []), (classSetupData.group_name = []);
        await fetchClassSetupIndex();
        await fetchSubjectSetupIndex();
    }
};

const subjectSetupData = reactive({
    class_id: null,
    group_id: null,
    class_name: null,
    group_name: null,
    compulsory: [],
    group: [],
    optional: []
});
const subjectSetupRequest = async () => {
    try {
        subjectSetupData.class_id = classForSubjects.value.class_id;
        subjectSetupData.class_name = classForSubjects.value.class_name;
        subjectSetupData.group_id = groupForSubjects.value.group_id;
        subjectSetupData.group_name = groupForSubjects.value.group_name;
        subjectSetupData.compulsory = compulsorySubjects.value.map((elem) => elem.subject_name);
        subjectSetupData.group = groupSubjects.value.map((elem) => elem.subject_name);
        subjectSetupData.optional = optionalSubjects.value.map((elem) => elem.subject_name);

        const { status, message, error } = await saveSubjectSetup(subjectSetupData);
        if (status === 'success') {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    } finally {
        (selectedClass.value = null), (selectedInstitutes.value = []), (classSetupData.class_id = null), (classSetupData.class_name = null), (classSetupData.group_id = []), (classSetupData.group_name = []);
        (subjectSetupData.class_id = null),
            (subjectSetupData.group_id = null),
            (subjectSetupData.class_name = null),
            (subjectSetupData.group_name = null),
            (subjectSetupData.compulsory = []),
            (subjectSetupData.group = []),
            (subjectSetupData.optional = []);
        await fetchSubjectSetupIndex();
    }
};

watch(classForSubjects, (newVal) => {
    // Update the group options when a class is selected
    groupOptions.value = newVal.groups;
});

const filteredCompulsorySubjects = computed(() => {
    if (!subjectSetupIndex.value?.subjectList) return [];
    return subjectSetupIndex.value.subjectList.filter((subject) => !groupSubjects.value.includes(subject));
});

const filteredGroupSubjects = computed(() => {
    if (!subjectSetupIndex.value?.subjectList) return [];
    return subjectSetupIndex.value.subjectList.filter((subject) => !compulsorySubjects.value.includes(subject));
});
const filteredCompulsorySubjectsForUpdate = computed(() => {
    if (!subjectSetupIndex.value?.subjectList) return [];
    return subjectSetupIndex.value.subjectList.filter((subject) => !updateGroupSubjects.value.includes(subject));
});

const filteredGroupSubjectsForUpdate = computed(() => {
    if (!subjectSetupIndex.value?.subjectList) return [];
    return subjectSetupIndex.value.subjectList.filter((subject) => !updateCompulsorySubjects.value.includes(subject));
});

const parseAndJoin = (compulsory) => {
    try {
        // Parse the string into an array
        let parsedArray = JSON.parse(compulsory.replace(/'/g, '"'));
        // Join the array elements into a comma-separated string
        return parsedArray.join(', ');
    } catch (e) {
        console.error('Failed to parse compulsory string:', e);
        return compulsory; // Return the original string in case of error
    }
};

const resetGroupSubjects = () => {
    compulsorySubjects.value = [];
    groupSubjects.value = [];
};

// Mounted hook
onMounted(async () => {
    await fetchClassSetupIndex();
    await fetchSubjectSetupIndex();
    const classCategory = classSetupIndex.value.admission_startup.find((category) => category.category_name == 'Class');
    if (classCategory) {
        classList.value = classCategory.subcategories;
    }

    const centerCategory = classSetupIndex.value.admission_startup.find((category) => category.category_name == 'Center');
    if (centerCategory) {
        centerList.value = centerCategory.subcategories;
    }

    const instCategory = classSetupIndex.value.admission_startup.find((category) => category.category_name == 'Institute');

    if (instCategory) {
        instituteList.value = instCategory.subcategories;
    }
});

//  visibility hook
useVisibilityChange(async () => {
    await fetchClassSetupIndex();
    await fetchSubjectSetupIndex();
});
</script>
<template>
    <Toast position="bottom-right" group="br" />
    <TabView>
        <TabPanel header="Class Setup">
            <div class="card">
                <div class="grid align-items-end">
                    <div class="col-12 md:col-4 mb-3">
                        <label for="className">Select Class</label>
                        <Dropdown v-model="selectedClass" :options="classList" optionLabel="subcategory_name" placeholder="Select Class" checkmark :highlightOnSelect="false" class="w-full capitalize">
                            <template #option="slotProps">
                                <div class="capitalize">
                                    <div>{{ slotProps.option.subcategory_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="col-12 md:col-4 mb-3">
                        <label for="className">Select Center</label>
                        <Dropdown v-model="selectedCenter" :options="centerList" optionLabel="subcategory_name" placeholder="Select center" checkmark :highlightOnSelect="false" class="w-full capitalize">
                            <template #option="slotProps">
                                <div class="capitalize">
                                    <div>{{ slotProps.option.subcategory_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="col-12 md:col-4 mb-3">
                        <label for="className">Select Institutes</label>
                        <MultiSelect v-model="selectedInstitutes" display="chip" :options="instituteList" optionLabel="subcategory_name" placeholder="Select Institutes" :maxSelectedLabels="3" class="w-full">
                            <template #option="slotProps">
                                <div class="capitalize">
                                    <div>{{ slotProps.option.subcategory_name }}</div>
                                </div>
                            </template>
                        </MultiSelect>
                    </div>

                    <div class="col-12 md:col-4 mb-3">
                        <Button label="Save" @click="classSetupRequest" size="small" icon="pi pi-check-circle" :loading="loading" :disabled="!selectedClass || !selectedInstitutes.length" />
                    </div>
                </div>
            </div>

            <div class="card">
                <DataTable class="p-datatable-sm" showGridlines :value="classSetupIndex?.admissionClassSetup" tableStyle="min-width: 50rem" :loading="loading">
                    <template #empty>No class setup found</template>
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
                    <Column field="class_name" header="class" class="capitalize"></Column>
                    <Column field="groups" header="Groups">
                        <template #body="slotProps">
                            <span class="capitalize">
                                {{ slotProps.data.groups.map((group) => group.group_name).join(', ') }}
                            </span>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </TabPanel>
        <!-- <TabPanel header="Subject Setup">
            <div class="card">
                <div class="grid align-items-end">
                    <div class="col-12 md:col-3 mb-3">
                        <label for="className">Select Class</label>
                        <Dropdown
                            v-model="classForSubjects"
                            :options="subjectSetupIndex.admissionClassSetup"
                            optionLabel="class_name"
                            placeholder="Select Class"
                            checkmark
                            :highlightOnSelect="false"
                            class="w-full capitalize"
                            @change="resetGroupSubjects"
                        >
                            <template #option="slotProps">
                                <div class="capitalize">
                                    <div>{{ slotProps.option.class_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>
                    <div class="col-12 md:col-3 mb-3">
                        <label for="className">Select Group</label>
                        <Dropdown v-model="groupForSubjects" :options="groupOptions" optionLabel="group_name" placeholder="Select Group" checkmark :highlightOnSelect="false" class="w-full capitalize">
                            <template #option="slotProps">
                                <div class="capitalize">
                                    <div>{{ slotProps.option.group_name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>
                </div>

                <div class="grid align-items-end">
                    <div class="col-12 md:col-4 mb-3">
                        <label for="className">Select Compulsory Subjects</label>
                        <MultiSelect
                            display="chip"
                            v-model="compulsorySubjects"
                            :options="filteredCompulsorySubjects"
                            optionLabel="subject_name"
                            placeholder="Compulsory Subjects"
                            checkmark
                            :highlightOnSelect="false"
                            class="w-full capitalize"
                            :disabled="!classForSubjects || !groupForSubjects"
                        >
                            <template #option="slotProps">
                                <div class="capitalize">
                                    <div>{{ slotProps.option.subject_name }}</div>
                                </div>
                            </template>
                        </MultiSelect>
                    </div>

                    <div class="col-12 md:col-4 mb-3">
                        <label for="className">Select Group Subjects</label>
                        <MultiSelect
                            display="chip"
                            v-model="groupSubjects"
                            :options="filteredGroupSubjects"
                            optionLabel="subject_name"
                            placeholder="Group Subjects"
                            checkmark
                            :highlightOnSelect="false"
                            class="w-full capitalize"
                            :disabled="!classForSubjects || !groupForSubjects"
                        >
                            <template #option="slotProps">
                                <div class="capitalize">
                                    <div>{{ slotProps.option.subject_name }}</div>
                                </div>
                            </template>
                        </MultiSelect>
                    </div>

                    <div class="col-12 md:col-4 mb-3">
                        <Button label="Assign Subjects" @click="subjectSetupRequest" size="small" icon="pi pi-check-circle" :loading="loading" :disabled="!compulsorySubjects.length" />
                    </div>
                </div>
            </div>
            <div class="card">
                <DataTable class="p-datatable-sm" showGridlines :value="subjectSetupIndex?.admissionSubjectSetup" tableStyle="min-width: 50rem" :loading="loading">
                    <template #empty>No class setup found</template>
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
                    <Column field="class_name" header="Class" class="capitalize"></Column>
                    <Column field="group_name" header="Group" class="capitalize"></Column>
                    <Column field="compulsory" header="Compulsory">
                        <template #body="slotProps">
                            <span class="capitalize">
                                {{ parseAndJoin(slotProps.data.compulsory) }}
                            </span>
                        </template>
                    </Column>

                    <Column field="group" header="Group Based">
                        <template #body="slotProps">
                            <span class="capitalize">
                                {{ parseAndJoin(slotProps.data.group) }}
                            </span>
                        </template>
                    </Column>

                    <Column field="action" header="Edit">
                        <template #body="slotProps">
                            <Button icon="pi pi-file-edit" link @click="getSelectedSubjects(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="visible" modal header="Update Subjects" :style="{ width: '35rem' }">
                    <div class="grid align-items-end">
                        <div class="col-12">
                            <label for="className" class="capitalize">Class: {{ selectedClassData.class_name }}</label>
                        </div>
                        <div class="col-12">
                            <label for="className" class="capitalize">Group: {{ selectedClassData.group_name }}</label>
                        </div>
                    </div>

                    <div class="grid align-items-end">
                        <div class="col-12">
                            <label for="className">Compulsory Subjects</label>
                            <MultiSelect
                                display="chip"
                                v-model="updateCompulsorySubjects"
                                :options="filteredCompulsorySubjectsForUpdate"
                                optionLabel="subject_name"
                                placeholder="Compulsory Subjects"
                                checkmark
                                :highlightOnSelect="false"
                                class="w-full capitalize"
                            >
                                <template #option="slotProps">
                                    <div class="capitalize">
                                        <div>{{ slotProps.option.subject_name }}</div>
                                    </div>
                                </template>
                            </MultiSelect>
                        </div>

                        <div class="col-12">
                            <label for="className">Group Subjects</label>
                            <MultiSelect display="chip" v-model="updateGroupSubjects" :options="filteredGroupSubjectsForUpdate" optionLabel="subject_name" placeholder="Group Subjects" checkmark :highlightOnSelect="false" class="w-full capitalize">
                                <template #option="slotProps">
                                    <div class="capitalize">
                                        <div>{{ slotProps.option.subject_name }}</div>
                                    </div>
                                </template>
                            </MultiSelect>
                        </div>

                        <div class="col-12">
                            <Button label="Update Subjects" @click="subjectUpdateRequest" size="small" icon="pi pi-sync" :loading="loading" :disabled="!updateCompulsorySubjects.length || !updateGroupSubjects.length" />
                        </div>
                    </div>
                </Dialog>
            </div>
        </TabPanel> -->
    </TabView>
</template>
