<script setup>
import { useToast } from 'primevue/usetoast';
const toast = useToast();
import axios from 'axios';

// const $axios = axios().provide.axios;
const filters = ref();
import { ref, onMounted } from 'vue';
import { useGlobalStore } from '~/stores';
import { storeToRefs } from 'pinia';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        'shifts.core_subcategory_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'sections.core_subcategory_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'groups.core_subcategory_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
    };
};

initFilters();

function getSeverity(data) {
    let t = '';
    t = data.items
        .map((i) => {
            return `(<b>${i.shifts.core_subcategory_name}</b> - <b>${i.sections.core_subcategory_name}</b> - <b>${i.groups.core_subcategory_name}</b> ), `;
        })
        .join('');
    return t;
}
const { fetchClassSetupData } = useGlobalStore();
const { classSetup, getClassMap } = storeToRefs(useGlobalStore());
let temp = ref([]);
onMounted(() => {
    fetchClassSetupData();
    temp.value = classSetup.value.classDetailsMap[0];
});

//  visibility hook
useVisibilityChange(async () => {
    fetchClassSetupData();
    temp.value = classSetup.value.classDetailsMap[0];
});

const clearFilter = () => {
    initFilters();
};
const formData = reactive({
    class: null,
    shift: null,
    section: null,
    group: null
});

const submit_processing = ref(false);

const handleForm = async () => {
    submit_processing.value = true;
    if (formData.class && formData.section && formData.group) {
        try {
            let groupIds = formData.group.map((item) => item.id);
            let sectionIds = formData.section.map((item) => item.id);
            const response = await axios.post('class-details-map/store', {
                class_id: formData.class.id,
                group_id: groupIds,
                shift_id: formData.shift.id,
                section_id: sectionIds
            });

            if (response.data.payload.data.status == 'success') {
                toast.add({ severity: 'success', summary: 'Data Added Successfully!', detail: 'New Class Created', group: 'br', life: 5000 });
                formData.class = null;
                formData.group = null;
                formData.section = null;
                formData.shift = null;
                fetchClassSetupData();
                submit_processing.value = false;
            }
        } catch (error) {
            console.log(error);
            if (error.response.data.payload.data.status === 'error') {
                toast.add({ severity: 'error', summary: 'Something went wrong!', detail: error.response.data.payload.data.message, group: 'br', life: 5000 });
            }
            submit_processing.value = false;
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', group: 'br', life: 5000 });
        submit_processing.value = false;
    }
};
</script>
<template>
    <Toast position="bottom-right" group="br" />
    <section>
        <div class="card">
            <form action="" @submit.prevent="handleForm">
                <div class="grid mb-2 gx-1">
                    <div class="col-12 md:col-3">
                        <label for=""><b>Class</b></label>
                        <Dropdown filter v-model="formData.class" :options="classSetup.classes" optionLabel="core_subcategory_name" placeholder="Select a Class" class="w-full" />
                    </div>
                    <div class="col-12 md:col-3">
                        <label for=""><b>Shift</b></label>
                        <Dropdown filter v-model="formData.shift" :options="classSetup.shifts" optionLabel="core_subcategory_name" placeholder="Select a Shift" class="w-full" />
                    </div>
                    <div class="col-12 md:col-3">
                        <label for=""><b>Section</b></label>
                        <MultiSelect filter v-model="formData.section" display="chip" :options="classSetup.sections" optionLabel="core_subcategory_name" placeholder="Select Sections" class="w-full" />
                    </div>
                    <div class="col-12 md:col-3">
                        <label for=""><b>Group</b></label>
                        <MultiSelect filter v-model="formData.group" display="chip" :options="classSetup.groups" optionLabel="core_subcategory_name" placeholder="Select Groups" class="w-full" />
                    </div>
                </div>
                <div class="my-2">
                    <Button label="Submit" type="submit" size="small" icon="pi pi-check-circle" :loading="submit_processing" />
                </div>
            </form>
        </div>
        <div class="card">
            <DataTable
                v-model:filters="filters"
                dataKey="id"
                filterDisplay="menu"
                :globalFilterFields="['shifts.core_subcategory_name', 'sections.core_subcategory_name', 'groups.core_subcategory_name']"
                :value="getClassMap"
                showGridlines
                paginator
                :rows="5"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                let-i="rowIndex"
            >
                <template #empty> No Data found. </template>
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
                <template #header>
                    <div class="flex justify-content-between">
                        <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        </span>
                    </div>
                </template>
                <Column field="cls.class_name" header="Class" class="text-capitalize"></Column>
                <Column header="Class Map" class="text-capitalize">
                    <template #body="slotProps">
                        <div v-html="getSeverity(slotProps.data.obj)"></div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </section>
</template>

<style lang="scss" scoped></style>
