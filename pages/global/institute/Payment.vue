<template>
    <div>
         <DataTable v-model:filters="filters" 
         :value="getProducts" 
         removableSort 
         paginator showGridlines :rows="10" dataKey="id"
         tableStyle="min-width: 50rem">
               <template #header>
                    <div class="flex justify-content-between">
                        <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        </span>
                    </div>
                </template>
            <Column field="id" header="ID" sortable style="width: 25%"></Column>
            <Column field="title" header="title" sortable style="width: 25%"></Column>
        </DataTable>
    </div>
</template>

<script setup>
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';
const store = useGlobalStore();
const data = ref([])
const { fetchAllData } = store;
const { getProducts } = storeToRefs(store);

onMounted(() => {
    fetchAllData();
 
});
const filters = ref();
const clearFilter = () => {
    initFilters();
};
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
};

initFilters();
</script>

<style lang="scss" scoped>

</style>