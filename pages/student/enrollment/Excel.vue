<script setup>
import { useToast } from 'primevue/usetoast';
const toast = useToast();
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';
import axios from 'axios';
const { studentEnrollment } = storeToRefs(useGlobalStore());
const { fetchStudentEnrollmentData } = useGlobalStore();
const config = useRuntimeConfig();

const formData = reactive({});
const shiftAndSections = ref([]);
const groups = ref([]);
const dialogVisible = ref(false);
const rows = ref();
let formErrors = ref([]);

// let excelFile = `${window.location.origin}/files/excel_form.xlsx`;
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

    // shiftAndSections.value = temp;
}

function getGroupsByShiftAndSection($e) {
    let [shift, section] = formData.shiftSection.split('-');

    groups.value = studentEnrollment.value.instituteClassMap
        .find((item) => item.class_id == formData?.class)
        ?.class_details.filter((item) => {
            return item.shift_id == shift && item.section_id == section;
        })
        .map((item) => item.groups);
}
function getPivotID() {
    const [shift, section] = formData.shiftSection.split('-');
    const classId = formData?.class;

    const foundClass = studentEnrollment.value.instituteClassMap.find((item) => item.class_id == classId)?.class_details.find((item) => item.group_id == formData.group && item.shift_id == shift && item.section_id == section);

    return foundClass ? foundClass.pivot.id : null;
}

function formatLabel(item) {
    return `${item.shift.core_subcategory_name} - ${item.section.core_subcategory_name}`;
}
function formatValue(item) {
    return `${item.shift.id}-${item.section.id}`;
}

function getDynamicValue(field) {
    return dynamicRow.map((item) => item[field]);
}
let fd = ref(new FormData());
const file = ref();
function handleExcelFile($event) {
    file.value = $event.target.files ? $event.target.files[0] : null;
    fd.value.append('file', file.value);
}
let router = useRouter();
async function handleForm() {
    if (formData.academicYear && formData.session && formData.class && formData.shiftSection && formData.category) {
        try {
            let pivot = getPivotID();

            fd.value.append('academic_year', formData.academicYear);
            fd.value.append('academic_session', formData.session);
            fd.value.append('category', formData.category);
            // fd.value.append('institute_class_map_id', pivot);
            fd.value.append('assign_id', pivot);
            fd.value.append('class_id', formData.class);
            fd.value.append('group_id', formData.group);

            let res = await axios.post('student-enrollment/excel-store', fd.value);

            console.log(res);
            if (res.data.payload.data.status == 'success') {
                toast.add({ severity: 'success', summary: 'Success!', detail: 'Student Created Successfully!', life: 3000 });
                // setTimeout(() => {
                //     router.go(0);
                // }, 2000);
            }
        } catch (error) {
            console.log(error);
            formErrors.value = error.response?.data.errors;
        } finally {
            fd.value = new FormData();
            file.value = null;
            formData.value = null;
        }
    } else {
        toast.add({ severity: 'error', summary: 'Something went wrong!', detail: 'Field Must not be empty!', life: 3000 });
    }
}

async function demoExcelDownload() {
    const res = await axios.get('/student-enrollment/excel-file/download', { params: { rows: rows.value } });
    if (res.data.payload.data.status == 'success') {
        console.log(res);
        dialogVisible.value = false;
        window.open(`${config.public.BASE_URL}${res.data.payload.data.download_url}`, '_blank');
    } else {
        toast.add({ severity: 'error', summary: 'Something went wrong!', detail: 'Field Must not be empty!', life: 3000 });
    }
}
</script>

<template>
    <div>
        <div class="card">
            <div>
                <ul>
                    <li v-for="error in formErrors" :key="error">
                        <span class="text-danger">{{ error[0] }}</span>
                    </li>
                </ul>
            </div>

            <form action="" @submit.prevent="handleForm">
                <div class="grid">
                    <!-- <div class="col-md-3">
                        <label for="">Academic Year</label>
                        <select class="form-control form-select" v-model="formData.academicYear">
                            <option :value="year.id" v-for="year in studentEnrollment.academicYears" :key="year">
                                {{ year.core_subcategory_name }}
                            </option>
                        </select>
                    </div> -->

                    <div class="md:col-4">
                        <label for="">Academic Year</label>
                        <Dropdown v-model="formData.academicYear" filter class="w-full capitalize" placeholder="Academic Year" :options="studentEnrollment.academicYears" optionLabel="core_subcategory_name" optionValue="id">
                            <template #option="slotProps">
                                <div class="capitalize">
                                    {{ slotProps.option.core_subcategory_name }}
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label for="">Session</label>
                        <Dropdown v-model="formData.session" filter class="w-full capitalize" placeholder="Academic Session" :options="studentEnrollment.academicSession" optionLabel="core_subcategory_name" optionValue="id">
                            <template #option="slotProps">
                                <div class="capitalize">
                                    {{ slotProps.option.core_subcategory_name }}
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label for="">Class</label>
                        <Dropdown v-model="formData.class" filter class="w-full capitalize" placeholder="Class" :options="studentEnrollment.classes" optionLabel="className" optionValue="classId" @change="getShiftAndSectionByClass">
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
                            :optionLabel="formatLabel"
                            :optionValue="formatValue"
                            @change="getGroupsByShiftAndSection"
                        >
                            <template #option="slotProps">
                                <div class="capitalize">
                                    {{ slotProps.option.shift.core_subcategory_name }} - {{ slotProps.option.section.core_subcategory_name }}
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4 mb-2">
                        <label for="">Group</label>
                        <Dropdown :disabled="!formData.shiftSection" v-model="formData.group" filter class="w-full capitalize" placeholder="Select Group" :options="groups" optionLabel="core_subcategory_name" optionValue="id">
                            <template #option="slotProps">
                                <div class="capitalize">
                                    {{ slotProps.option.core_subcategory_name }}
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="md:col-4">
                        <label for="">Category</label>
                        <Dropdown v-model="formData.category" filter class="w-full capitalize" placeholder="Select Category" :options="studentEnrollment.category" optionLabel="core_subcategory_name" optionValue="id">
                            <template #option="slotProps">
                                <div class="capitalize">
                                    {{ slotProps.option.core_subcategory_name }}
                                </div>
                            </template>
                        </Dropdown>
                    </div>
                </div>

                <div>
                    <Button icon="pi pi-file-excel" label="Download Sample Excel" size="small" @click="demoExcelDownload" :disabled="!formData.category || !formData.academicYear" />
                </div>

                <div class="my-2">
                    <label for="excelFile" class="p-button p-component p-button-info m-0"><i class="pi pi-plus mr-2"></i><small>Add Excel File</small></label>
                    <input id="excelFile" type="file" class="form-control" @change="handleExcelFile($event)" accept=".xlsx, .xls, .csv" style="display: none" />
                    <Button type="submit" icon="pi pi-upload" label="Upload Excel" size="small" class="ml-2" :disabled="!file" />
                </div>
            </form>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
