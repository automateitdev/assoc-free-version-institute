<script setup>
const { getMethodUrl, postMethodUrl } = defineProps(['getMethodUrl', 'postMethodUrl']);
const emit = defineEmits(['coustomChange', 'getYear', 'dataForRefresh']);
const searchData = reactive({});
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const { fetchStudentListData } = useGlobalStore();
const { classShiftSectionData, globalLoader } = storeToRefs(useGlobalStore());
let isSearching = ref(false);
let studentSearch = ref({
    years: null,
    instituteClassMap: null,
    section_id: null,
    academic_year_id: null,
    shift_id: null,
    instituteClassMapId: null
});
const searchForm = ref({
    year: null,
    class: null
});
const formData = reactive({
    students: []
});

onMounted(async () => {
    fetchStudentListData();
    let { data } = await axios.get(getMethodUrl);

    studentSearch.value.years = data.payload.data.academicYears;

    studentSearch.value.instituteClassMap = data.payload.data.instituteClassMap;
});
function getCombinationID($event) {
    console.log($event);
    let { id, shift, section } = $event.value;
    studentSearch.value.instituteClassMapId = id;
    // studentSearch.value.section_id = studentSearch.value.instituteClassMap.find((i) => i.id == id).class_details.find((cls) => cls.shifts.id == shift && cls.sections.id == section).sections.id;

    // studentSearch.value.shift_id = studentSearch.value.instituteClassMap.find((i) => i.id == id).class_details.find((cls) => cls.shifts.id == shift && cls.sections.id == section).shift_id;

    // Find the relevant class_details object
    let relevantClassDetails = studentSearch.value.instituteClassMap.find((i) => i.id == id).class_details.find((cls) => cls.shifts.id == shift && cls.sections.id == section);

    // Set the section_id and shift_id based on the relevant class_details
    if (relevantClassDetails) {
        studentSearch.value.section_id = relevantClassDetails.sections.id;
        studentSearch.value.shift_id = relevantClassDetails.shift_id;
    } else {
        // Handle the case when relevantClassDetails is not found
        console.log('Class details not found for the given criteria.');
    }
}

async function handleSearchForm() {
    try {
        try {
            if (studentSearch.value.shift_id && searchForm.value.year) {
                isSearching.value = true;
                globalLoader.value = true;

                let { data } = await axios.post(postMethodUrl, {
                    institute_class_map_id: studentSearch.value.instituteClassMapId,
                    section_id: studentSearch.value.section_id,
                    shift_id: studentSearch.value.shift_id,
                    academic_year_id: searchForm.value.year.id
                });
                let dataRfersh = ref({
                    institute_class_map_id: studentSearch.value.instituteClassMapId,
                    section_id: studentSearch.value.section_id,
                    shift_id: studentSearch.value.shift_id,
                    academic_year_id: searchForm.value.year.id
                });
                emit('dataForRefresh', dataRfersh.value);

                console.log(data);
                emit('coustomChange', data.payload.data);
                emit('getYear', searchForm.value.year);
                globalLoader.value = false;
                isSearching.value = false;
            } else {
                isSearching.value = false;
                globalLoader.value = false;
                toast.add({ severity: 'error', summary: 'Error!', detail: 'Field Must not be empty!', life: 3000 });
            }
        } catch (error) {
            isSearching.value = false;
            searchData.status = false;
            globalLoader.value = false;
            toast.add({ severity: 'error', summary: 'Error!', detail: 'Something went wrong!', life: 3000 });
        }
    } catch (error) {
        isSearching.value = false;
        searchData.status = false;
        globalLoader.value = false;
        toast.add({ severity: 'error', summary: 'Error!', detail: 'Something went wrong!', life: 3000 });
    }
}
</script>

<template>
    <div class="card">
        <form action="" @submit.prevent="handleSearchForm">
            <div class="grid gap-3">
                <div class="">
                    <label class="mb-1 block"><b>Academic Year</b></label>
                    <Dropdown v-model="searchForm.year" :options="studentSearch.years" filter
                        optionLabel="core_subcategory_name" placeholder="Select a Year">
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex align-items-center">
                                <div>{{ slotProps.value.core_subcategory_name }}</div>
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex align-items-center">
                                <div>
                                    {{ slotProps.option.core_subcategory_name }}
                                </div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="">
                    <label class="mb-1 block"><b>Class Shift Section</b></label>
                    <Dropdown v-model="searchForm.class" :options="classShiftSectionData.classes" filter
                        optionLabel="combination" placeholder="Select a Option" class="w-100"
                        @change="getCombinationID($event)">
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex align-items-center text-capitalize">
                                <div>{{ slotProps.value.combination }}</div>
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex align-items-center">
                                <div style="text-transform: capitalize">
                                    {{ slotProps.option.combination }}
                                </div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-2 align-self-end">
                    <!-- <button type="submit" class="btn bg-primary mt-4" size="small" v-if="isSearching">Searching..</button>
                    <button type="submit" class="btn bg-primary mt-4" size="small" v-else>Search</button> -->
                    <Button :loading="isSearching" label="Search" type="submit" icon="pi pi-search" size="small"/>
                </div>
            </div>
        </form>
    </div>
</template>