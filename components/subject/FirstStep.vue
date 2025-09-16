<script setup>
    import { storeToRefs } from "pinia";
    import { useSubjectStore } from "~/stores/subject";


    const {formData, subjectData, subs, getGroupSubs, orderFlag, arsSub, remainingSubjects } = storeToRefs(useSubjectStore());
    const { fetchGroupByClass } = useSubjectStore();

    let a = computed(() => subs);

  

    function getGroup(e){
        let class_id = e.value.class_id;
        fetchGroupByClass(class_id);
      
    }

    function handleCommonSubject($event) {
        orderFlag.value = formData.value.compulsorySubjects.length;

        let evArr = $event.value;

        evArr.forEach(item => {
            const remainingSubjectsCopy = JSON.parse(JSON.stringify(remainingSubjects.value.data));

            const remainingSubjectsIndex = remainingSubjectsCopy.findIndex(sub => sub.id === item.id);

            if (remainingSubjectsIndex !== -1) {
                remainingSubjects.value.data = remainingSubjectsCopy.filter(sub => sub.id !== item.id);
            }
        });
    }


</script>

<template>
    <div>

        <div class="row">
           
            <div class="col-md-6">
                <label class="mb-2" for=""><b>Academic Year</b></label>
                <Dropdown v-model="formData.year" :options="subjectData.academicYears" filter optionLabel="core_subcategory_name" placeholder="Select a Year" class="w-full">
                    <template #value="slotProps">
                        <div v-if="slotProps.value" class="flex align-items-center">
                            <div>{{ slotProps.value.coresubcategory_details.core_subcategory_name }}</div>
                        </div>
                        <span v-else>
                            {{ slotProps.placeholder }}
                        </span>
                    </template>
                    <template #option="slotProps">
                        <div class="flex align-items-center">
                            <div>{{ slotProps.option.coresubcategory_details.core_subcategory_name }}</div>
                        </div>
                    </template>
                </Dropdown>
            </div>

            <div class="col-md-6">
                <label for="" class="mb-2"><b>Class</b></label>
                <Dropdown v-model="formData.class" :options="subjectData.classes" filter optionLabel="class_name" placeholder="Select a Class" @change="getGroup" class="w-full">
                    <template #value="slotProps">
                        <div v-if="slotProps.value" class="flex align-items-center">
                            <div>{{ slotProps.value.class_name }}</div>
                        </div>
                        <span v-else>
                            {{ slotProps.placeholder }}
                        </span>
                    </template>
                    <template #option="slotProps">
                        <div class="flex align-items-center">
                            <div>{{ slotProps.option.class_name }}</div>
                        </div>
                    </template>
                </Dropdown>
            </div>
            <div class="col-md-12 mt-5 mb-5">
                <label for="" class="mb-2"><b>Common Subject:</b> </label>
                <br />

                <MultiSelect filter v-model="formData.compulsorySubjects" display="chip" :options="subjectData.subjects" optionLabel="core_subcategory_name" 
                placeholder="Select Subjects" class="w-100" @change="handleCommonSubject($event)"/>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.formkit-wrapper {
    max-width: 32em;
    box-shadow: var(--multistep-shadow);
    border-radius: var(--multistep-radius);
}
</style>
