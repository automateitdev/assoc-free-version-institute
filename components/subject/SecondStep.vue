<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSubjectStore } from '~/stores/subject';

const { formData, subjectData, getGroupSubs, remainingSubjects } = storeToRefs(useSubjectStore());
let groupSubs = computed(() => getGroupSubs);
onMounted(() => {
    // console.log(formData.groupSubjectList);
});
let t = ref([]);
let availableSubjects = [];

function handleSubject($event, group) {
    const subs = $event.value.map((item) => item);

    const foundIndex = t.value.findIndex((data) => data.group === group.id);

    if (foundIndex !== -1) {
        if (subs.length === 0) {
            t.value.pop();
        } else {
            t.value[foundIndex].subs = Array.from(new Set(subs));
        }
    } else {
        t.value.push({ group: group.id, info: group, subs });
    }
    formData.value.ars = t.value;
}

function handleGroupSelection($event) {
    // console.log($event.value.map(i => i));
    const validGroups = $event.value.map((item) => item.id);
    formData.value.ars = formData.value.ars.filter((item) => validGroups.includes(item.group));
    if (formData.value.ars.length == 0) {
        formData.value.groupSubjectList = {};
    }
}

function filterSubjectData(remainingSubjects, currentGroupIndex) {
    if (formData) {
        const currentGroupSubjects = this.formData.groupSubjectList[currentGroupIndex] || [];
        const allSelectedSubjects = Object.values(this.formData.groupSubjectList).flat();

        // Mark selected subjects as disabled if they are selected in other groups
        const updatedSubjects = remainingSubjects.map((subject) => ({
            ...subject,
            disabled: allSelectedSubjects.some((selectedSubject) => selectedSubject.id === subject.id && !currentGroupSubjects.some((s) => s.id === subject.id))
        }));

        return updatedSubjects;
    }
}
</script>

<template>
    <div>
        <div class="row">
            <div class="col-md-6">
                <label for="" class="mb-2"><b>Groups</b></label>
                <MultiSelect filter v-model="formData.groups" display="chip" :options="subjectData.groups" optionLabel="core_subcategory_name" placeholder="Select Groups" class="w-full text-capitalize" @change="handleGroupSelection($event)" />
            </div>
        </div>

        <table class="table table-striped mt-3">
            <tr v-for="group in formData.groups" :key="group" class="mb-2" style="border-bottom: 1px solid #eee">
                <td class="text-capitalize">
                    {{ group.core_subcategory_name }}
                </td>
                <td>
                    <MultiSelect
                        display="chip"
                        v-model="formData.groupSubjectList[group.id]"
                        :options="filterSubjectData(remainingSubjects.data, group.id)"
                        optionLabel="core_subcategory_name"
                        optionDisabled="disabled"
                        placeholder="Select Subjects"
                        class="p-0 m-2 text-capitalize"
                    />
                </td>
            </tr>
        </table>
    </div>
</template>
