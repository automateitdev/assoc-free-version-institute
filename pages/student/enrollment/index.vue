<script setup>
import { useToast } from 'primevue/usetoast';
const toast = useToast();
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';
import axios from 'axios';
const { studentEnrollment } = storeToRefs(useGlobalStore());
const { fetchStudentEnrollmentData } = useGlobalStore();

const isLoading = ref(false);
const formData = reactive({});
const shiftAndSections = ref([]);
const groups = ref([]);
let formErrors = ref([]);

const genders = ref([
    { name: 'Male', code: 'Male' },
    { name: 'Female', code: 'Female' },
    { name: 'Other', code: 'Other' }
]);

const religions = ref([
    { name: 'Islam', code: 'Islam' },
    { name: 'Hinduism', code: 'Hinduism' },
    { name: 'Buddhism', code: 'Buddhism' },
    { name: 'Christianity', code: 'Christianity' },
    { name: 'Other', code: 'Other' }
]);
const dynamicRow = reactive([
    {
        custom_id: null,
        roll: null,
        name: null,
        gender: null,
        religion: null,
        f_name: null,
        m_name: null,
        f_mobile: null
    }
]);

// let table = document.getElementById("dynamicTable")
function addNewRow() {
    dynamicRow.push({
        id: null,
        roll: null,
        name: null,
        gender: null,
        religion: null,
        f_name: null,
        m_name: null,
        mobile: null
    });
}

function removeRow($e, index) {
    if (dynamicRow.length > 1) {
        dynamicRow.splice(index, 1);
    }
    return;
}

onMounted(() => {
    fetchStudentEnrollmentData();
});

//  visibility hook
useVisibilityChange(async () => {
    fetchStudentEnrollmentData();
});

function getShiftAndSectionByClass($e) {
    let clsID = formData.class;
    let data = studentEnrollment.value?.instituteClassMap
        .filter((item) => item.class_id == clsID)
        .map((item) => {
            return item.class_details.map((temp) => {
                return {
                    shift: temp.shifts,
                    section: temp.sections
                };
            });
        });
    let temp = studentEnrollment.value?.instituteClassMap
        .find((item) => item.class_id == clsID)
        ?.class_details.map((item) => {
            return {
                shift: item.shifts,
                section: item.sections
            };
        });

    const getKey = (item) => `${item.shift.id}-${item.section.id}`;

    const distinctData = temp.filter((item, index, self) => {
        return index === self.findIndex((t) => getKey(t) === getKey(item));
    });

    shiftAndSections.value = distinctData;
    console.log(shiftAndSections);

    // shiftAndSections.value = temp;
}

function getGroupsByShiftAndSection($e) {
    console.log(formData.shiftSection);
    let [shift, section] = formData.shiftSection.split('-');
    groups.value = studentEnrollment.value.instituteClassMap
        .find((item) => item.class_id == formData?.class)
        ?.class_details.filter((item) => {
            return item.shift_id == shift && item.section_id == section;
        })
        .map((item) => item.groups);

    console.log(groups);
}
function getPivotID() {
    const [shift, section] = formData.shiftSection.split('-');
    const classId = formData?.class;

    const foundClass = studentEnrollment.value.instituteClassMap.find((item) => item.class_id == classId)?.class_details.find((item) => item.group_id == formData.group && item.shift_id == shift && item.section_id == section);

    return foundClass ? foundClass.pivot.id : null;
}

function getDynamicValue(field) {
    return dynamicRow.map((item) => item[field]);
}

function formatLabel(item) {
    return `${item.shift.core_subcategory_name} - ${item.section.core_subcategory_name}`;
}
function formatValue(item) {
    return `${item.shift.id}-${item.section.id}`;
}

let router = useRouter();
async function handleForm() {
    if (formData.academicYear && formData.session && formData.class && formData.shiftSection && formData.category) {
        isLoading.value = true;
        try {
            let pivot = getPivotID();

            let res = await axios.post('student-enrollment/store', {
                academic_year: formData.academicYear,
                academic_year_start_date: formData.start_date,
                academic_year_end_date: formData.end_date,
                academic_session: formData.session,
                category: formData.category,
                assign_id: pivot,
                class_id: formData.class,
                group_id: formData.group,
                student_name: getDynamicValue('name'),
                student_gender: getDynamicValue('gender'),
                student_religion: getDynamicValue('religion'),
                custom_student_id: getDynamicValue('custom_id'),
                class_roll: getDynamicValue('roll'),
                father_name: getDynamicValue('f_name'),
                mother_name: getDynamicValue('m_name'),
                father_mobile: getDynamicValue('f_mobile')
            });

            console.log(res);
            if (res.data.payload.data.status == 'success') {
                toast.add({ severity: 'success', summary: 'Success!', detail: 'Student Created Successfully!', life: 3000 });

                setTimeout(() => {
                    router.go(0);
                }, 2000);
            }
            isLoading.value = false;
        } catch (error) {
            isLoading.value = false;
            console.log(error);
            formErrors.value = error.response?.data.payload.data.errors;
        } finally {
            formData = null;
        }
    } else {
        isLoading.value = false;
        toast.add({ severity: 'error', summary: 'Something went wrong!', detail: 'Field Must not be empty!', life: 3000 });
    }
}
</script>

<template>
    <div>
        <div>
            <ul>
                <li v-for="error in formErrors" :key="error">
                    <span class="text-danger">{{ error[0] }}</span>
                </li>
            </ul>
        </div>
        <form action="" @submit.prevent="handleForm">
            <div class="card grid">
                <div class="md:col-4">
                    <label for="">Academic Year</label>
                    <Dropdown v-model="formData.academicYear" filter class="w-full capitalize" placeholder="Academic Year" :options="studentEnrollment.academicYears" option-label="core_subcategory_name" option-value="id">
                        <template #option="slotProps">
                            <div class="capitalize">
                                {{ slotProps.option.core_subcategory_name }}
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-4">
                    <label for="">Session</label>
                    <Dropdown v-model="formData.session" filter class="w-full capitalize" placeholder="Academic Session" :options="studentEnrollment.academicSession" option-label="core_subcategory_name" option-value="id">
                        <template #option="slotProps">
                            <div class="capitalize">
                                {{ slotProps.option.core_subcategory_name }}
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-4">
                    <label for="">Category</label>
                    <Dropdown v-model="formData.category" filter class="w-full capitalize" placeholder="Select Category" :options="studentEnrollment.category" option-label="core_subcategory_name" option-value="id">
                        <template #option="slotProps">
                            <div class="capitalize">
                                {{ slotProps.option.core_subcategory_name }}
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-4">
                    <label for="">Class</label>
                    <Dropdown v-model="formData.class" filter class="w-full capitalize" placeholder="Class" :options="studentEnrollment.classes" option-label="className" option-value="classId" @change="getShiftAndSectionByClass">
                        <template #option="slotProps">
                            <div class="capitalize">
                                {{ slotProps.option.className }}
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-4">
                    <label for="">Shift-Section</label>

                    <Dropdown
                        :disabled="!formData.class"
                        v-model="formData.shiftSection"
                        filter
                        class="w-full capitalize"
                        placeholder="Shift-Section"
                        :options="shiftAndSections"
                        :option-label="formatLabel"
                        :option-value="formatValue"
                        @change="getGroupsByShiftAndSection"
                    >
                        <template #option="slotProps">
                            <div class="capitalize">{{ slotProps.option.shift.core_subcategory_name }} - {{ slotProps.option.section.core_subcategory_name }}</div>
                        </template>
                    </Dropdown>
                </div>

                <div class="md:col-4 mb-2">
                    <label for="">Group</label>
                    <Dropdown :disabled="!formData.shiftSection" v-model="formData.group" filter class="w-full capitalize" placeholder="Select Group" :options="groups" option-label="core_subcategory_name" option-value="id">
                        <template #option="slotProps">
                            <div class="capitalize">
                                {{ slotProps.option.core_subcategory_name }}
                            </div>
                        </template>
                    </Dropdown>
                </div>
            </div>
            <div class="card gx-2 my-4 relative" v-for="(item, index) in dynamicRow" :key="item" style="border-bottom: 1px solid #ddd">
                <div class="my-2" style="position: absolute; top: -10%; left: -15px" v-if="index > 0">
                    <Button class="text-sm" text icon="pi pi-times" severity="danger" raised rounded aria-label="Cancel" size="small" @click="removeRow($e, index)" />
                </div>
                <div class="grid">
                    <div class="col-12">
                        <p class="mb-2">Student Count {{ index + 1 }}</p>
                    </div>
                    <div class="md:col-3 mb-3">
                        <span class="p-float-label">
                            <inputText id="studentName" class="w-full" v-model="item.name" />
                            <label for="studentName">Student Name</label>
                        </span>
                    </div>
                    <div class="md:col-3 mb-3">
                        <span class="p-float-label">
                            <inputText id="fatherName" class="w-full" v-model="item.f_name" />
                            <label for="fatherName">Father Name</label>
                        </span>
                    </div>
                    <div class="md:col-3 mb-3">
                        <span class="p-float-label">
                            <inputText id="motherName" class="w-full" v-model="item.m_name" />
                            <label for="motherName">Mother Name</label>
                        </span>
                    </div>

                    <div class="md:col-3 mb-3">
                        <span class="p-float-label">
                            <InputMask class="w-full" id="guardianPhone" v-model="item.f_mobile" mask="99999999999" />
                            <label for="guardianPhone">01234567890</label>
                        </span>
                    </div>
                    <div class="md:col-3 mb-3">
                        <span class="p-float-label">
                            <inputText id="customId" class="w-full" v-model="item.custom_id" />
                            <label for="customId">Student ID</label>
                        </span>
                    </div>
                    <div class="md:col-3 mb-3">
                        <span class="p-float-label">
                            <inputText id="classRoll" class="w-full" v-model="item.roll" />
                            <label for="classRoll">Class Roll</label>
                        </span>
                    </div>

                    <div class="md:col-3 mb-3">
                        <Dropdown class="w-full" v-model="item.gender" placeholder="Gender" :options="genders" option-label="name" option-value="name" />
                    </div>
                    <div class="md:col-3 mb-3">
                        <Dropdown class="w-full" v-model="item.religion" placeholder="Religion" :options="religions" option-label="name" option-value="name" />
                    </div>
                </div>
            </div>
            <div>
                <Button label="New Student" icon="pi pi-plus-circle" size="small" severity="info" class="mr-2" @click="addNewRow" />
                <Button :loading="isLoading" label="Save" icon="pi pi-save" size="small" class="mr-2" type="submit" />
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped></style>
