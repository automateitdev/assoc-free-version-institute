<script setup>
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAdmissionApplicationStore } from '~/stores/admissionApplication';
import { useToast } from 'primevue/usetoast';
import { Cropper, Preview } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const consentState = ref(false);
const config = useRuntimeConfig();
const toast = useToast();
const route = useRoute();
const applicantNumber = ref(null);

const getPreview = () => {
    window.location = `/application/preview/${applicantNumber.value}`;
};

const dateOfBirth = ref();
function formatDateToSQL(date) {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
const assignformattedDate = (param, variable) => {
    formData[param] = variable ? formatDateToSQL(variable) : '';
};
watch(dateOfBirth, (newDate) => {
    assignformattedDate('date_of_birth', newDate);
});

const instituteReference = ref();

const { admissionConfig, divisionData, presentDistrictData, permanentDistrictData, presentUpazillaData, permanentUpazillaData, subjectList, configList, studentDataByRoll, appInstruction, loading } = storeToRefs(useAdmissionApplicationStore());

const { fetchadmissionConfig, fetchStudentDataByRoll, fetchDivisions, fetchDistrictByDivision, fetchUpazillaByDistrict, fetchYearwiseSubject, saveFormData, fetchPreviewData, getAppInstruction } = useAdmissionApplicationStore();

const addressSameAsPresent = ref(false);
const ins_response = ref();
const classOpts = ref([]);
const centerOpts = ref([]);
const instituteOpts = ref([]);
const genderOpts = ref(['Male', 'Female', 'Others']);
const religionOpts = ref(['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Others']);
const bloodOpts = ref(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']);
const maritalOpts = ref(['Married', 'Unmarried', 'Divorced', 'Widowed', 'Single']);
const examNameOpts = ref(['PSC', 'JSC', 'SSC', 'HSC', 'B.B.A', 'B.Sc', "Hon's", 'MA', 'MBS', 'M.sc', 'B.B.S', 'B.S.S']);
const boardNameOpts = ref(['Dhaka', 'Barisal', 'Chittagong', 'Comilla', 'Jessore', 'Mymensingh', 'Rajshahi', 'Sylhet', 'Dinajpur', 'Bangladesh Madrasah Education Board', 'Bangladesh Technical Education Board', 'Directorate of Primary Education']);
const vaccinatedStatus = ref(['No', 'Yes - 1st Dose', 'Yes - 1st & 2nd Dose', 'Yes - 1st, 2nd & Booster Dose']);
const vaccinOpts = ref(['Moderna / মডার্না', 'Sinovac / সিনোভ্যাক', 'BioNTech-Pfizer / বায়োনটেক-ফাইজার', 'Oxford-AstraZeneca / অক্সফোর্ড-অ্যাস্ট্রাজেনেকা']);
const otherQuota = ref(false);

function handleOtherQuota() {
    if (otherQuota != 'other') {
        formData.quota = '';
    }
}

const confirmation = ref(false);
const studentPhotoFile = ref();
const result = reactive({
    coordinates: null,
    image: null
});

const rollWiseSearch = reactive({
    institute_id: null,
    roll: null
});

const studentByRollFound = ref(false);
const getStudentInfo = async () => {
    try {
        const { status, message, unique_number, error } = await fetchStudentDataByRoll(rollWiseSearch);
        if (status == 'success') {
            if (unique_number) {
                window.location.href = '/application/preview/' + unique_number;
            } else {
                studentByRollFound.value = true;
                subjectSearchForm.institute_details_id = admissionConfig.value.instiute_details.id;
                (formData.academic_year = studentDataByRoll.value.admission_payment.academic_year),
                (formData.academic_year_id = studentDataByRoll.value.admission_payment.academic_year_id),
                    (formData.center = studentDataByRoll.value.admission_payment.center),
                    (formData.institute = studentDataByRoll.value.admission_payment.group),
                    (formData.class = studentDataByRoll.value.admission_payment.class),
                    (formData.student_name_english = studentDataByRoll.value.name),
                    (formData.edu_information[0].exam = studentDataByRoll.value.roll ? 'SSC' : ''),
                    (formData.edu_information[0].roll = studentDataByRoll.value.roll),
                    toast.add({ severity: 'success', summary: 'Success Message', detail: message, life: 5000 });
            }
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', life: 5000 });
    }
};

onMounted(async () => {
    instituteReference.value = route.params.id;
    formData.institute_id = route.params.id;
    rollWiseSearch.institute_id = route.params.id;
    ins_response.value = await fetchadmissionConfig(instituteReference.value);
    await fetchDivisions();
    await getAppInstruction();
});
//  visibility hook
useVisibilityChange(async () => {
    instituteReference.value = route.params.id;
    formData.institute_id = route.params.id;
    rollWiseSearch.institute_id = route.params.id;
    ins_response.value = await fetchadmissionConfig(instituteReference.value);
    await fetchDivisions();
    await getAppInstruction();
});

const formData = reactive({
    institute_id: null,
    student_name_bangla: null,
    student_name_english: null,
    student_mobile: null,
    father_name_bangla: null,
    father_name_english: null,
    father_nid: null,
    father_mobile: null,
    mother_name_bangla: null,
    mother_name_english: null,
    mother_nid: null,
    mother_mobile: null,
    nationality: 'Bangladeshi',
    date_of_birth: null,
    student_nid_or_birth_no: null,
    gender: null,
    religion: null,
    blood_group: null,
    merital_status: null,
    present_division: null,
    present_district: null,
    present_upozilla: null,
    present_post_office: null,
    present_post_code: null,
    present_address: null,
    permanent_division: null,
    permanent_district: null,
    permanent_upozilla: null,
    permanent_post_office: null,
    permanent_post_code: null,
    permanent_address: null,
    guardian_name: null,
    guardian_relation: null,
    guardian_mobile: null,
    guardian_occupation: null,
    guardian_yearly_income: null,
    guardian_property: null,
    academic_year: null,
    academic_year_id: null,

    class_id: null,
    class_name: null,
    center_id: null,
    center_name: null,
    chosen_institute_id: null,
    chosen_institute_name: null,

    // group: null,
    compulsorySubjects: [],
    groupSubjects: [],
    optionalSubjects: [],
    subject: reactive({
        compulsory: [],
        group: [],
        optional: []
    }),
    edu_information: [
        {
            exam: '',
            board: '',
            institute: '',
            group: '',
            roll: '',
            registration: '',
            gpa: '',
            passingYear: ''
        }
    ],
    quota: null,
    vaccine: 'No',
    vaccine_name: null,
    vaccine_certificate: null,
    student_pic: null,
    student_birth_nid_file: null,
    other_file: null
});

watch(
    () => formData.present_district,
    async (newVal) => {
        formData.present_upozilla = null;
        await fetchUpazillaByDistrict('present', newVal.id);
    }
);
const addQualification = () => {
    formData.edu_information.push({
        exam: '',
        board: '',
        institute: '',
        group: '',
        roll: '',
        registration: '',
        gpa: '',
        passingYear: ''
    });
};

function removeQualification(index) {
    formData.edu_information.splice(index, 1);
}

function resetPermanentAddress() {
    formData.permanent_address = '';
    formData.permanent_district = null;
    formData.permanent_division = null;
    formData.permanent_upozilla = null;
    formData.permanent_post_office = '';
    formData.permanent_post_code = '';
}

watch(
    () => formData.vaccine,
    async (newVal) => {
        if (newVal === 'No') {
            formData.vaccine_certificate = null;
            formData.vaccine_name = null;
        }
    }
);

watch(
    () => formData.present_division,
    async (newVal) => {
        formData.present_district = null;
        await fetchDistrictByDivision('present', newVal.id);
    }
);

watch(
    () => formData.permanent_division,
    async (newVal) => {
        formData.permanent_district = null;
        await fetchDistrictByDivision('permanent', newVal.id);
    }
);

watch(
    () => formData.present_district,
    async (newVal) => {
        formData.present_upozilla = null;
        await fetchUpazillaByDistrict('present', newVal.id);
    }
);

watch(
    () => formData.permanent_district,
    async (newVal) => {
        formData.permanent_upozilla = null;
        await fetchUpazillaByDistrict('permanent', newVal.id);
    }
);

watch(
    () => formData.academic_year,
    async (newVal) => {
        if (!studentByRollFound) {
            formData.class = null;
        }
        classOpts.value = admissionConfig.value.details.find((elem) => elem.academic_year == newVal);
    }
);
watch(
    () => formData.class,
    async (newVal) => {
        formData.center = null;
        formData.center_id = null;
        formData.center_name = null;
        formData.class_id = null;
        formData.class_name = null;
        formData.chosen_institute_id = null;
        formData.chosen_institute_name = null;
        if (!studentByRollFound) {
            formData.institute = null;
        }
        formData.class_id = newVal.class_id
        formData.class_name = newVal.class_name
        instituteOpts.value = classOpts.value.details.find((elem) => elem.class_id == newVal.class_id);
    }
);

watch(
    () => formData.institute,
    (newInstitute) => {
        // Reset center if no student found
        formData.center_id = null;
        formData.center_name = null;
        formData.chosen_institute_id = null;
        formData.chosen_institute_name = null;
        if (!studentByRollFound) {
            formData.center = null;
        }

        // Find the detail that matches the selected class and selected institute
        const matchedDetail = classOpts.value.details.find((detail) => detail.class_id === formData.class.class_id && detail.institutes.some((inst) => inst.id === newInstitute.id));

        formData.chosen_institute_id = newInstitute.id
        formData.chosen_institute_name = newInstitute.name

        // Update center options
        console.log(matchedDetail);
        centerOpts.value = matchedDetail ? [{ id: matchedDetail.center_id, name: matchedDetail.center_name }] : [];

        formData.center_id=matchedDetail.center_id
        formData.center_name=matchedDetail.center_name

        // Auto-select the first center if available
        if (centerOpts.value.length) {
            formData.center = centerOpts.value[0];
        }
    }
);

watch(addressSameAsPresent, async (newValue) => {
    try {
        if (newValue) {
            formData.permanent_address = formData.present_address;
            formData.permanent_division = formData.present_division;
            await nextTick();
            formData.permanent_district = formData.present_district;
            await nextTick();
            formData.permanent_upozilla = formData.present_upozilla;
            formData.permanent_post_office = formData.present_post_office;
            formData.permanent_post_code = formData.present_post_code;
        } else {
            resetPermanentAddress();
        }
    } catch (error) {
        console.log(error);
    }
});
function isEduInformationFilled() {
    return formData.edu_information.some((info) => {
        if (admissionConfig.value.academic_info_status == 'YES') {
            return Object.values(info).every((value) => value !== '');
        } else {
            return true;
        }
    });
}

function isSubjectFilled() {
    if (admissionConfig.value.subject_status == 'YES') {
        return formData.subject.hasOwnProperty('compulsory') && formData.subject.compulsory.length > 0;
    } else {
        return true;
    }
}

function checkFields() {
    if (!isFormValid.value) {
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'Please fill all required (* marked) Fields!', life: 5000 });
    } else if (!isEduInformationFilled()) {
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'All education information fields must be filled.', life: 5000 });
    } else if (!isSubjectFilled()) {
        toast.add({ severity: 'error', summary: 'Provide compulsory subjects', life: 5000 });
    } else {
        confirmation.value = true;
    }
}

const submitFormData = async () => {
    try {
        const newFormData = new FormData();

        // Loop through formData object and append each field
        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                const value = formData[key];
                if (value !== null && value !== undefined) {
                    if (value instanceof File) {
                        // Append the file directly
                        newFormData.append(key, value);
                    } else if (typeof value === 'object') {
                        // Convert other objects to JSON strings
                        newFormData.append(key, JSON.stringify(value));
                    } else {
                        // Append other non-object values as-is
                        newFormData.append(key, value);
                    }
                }
            }
        }

        if (isEduInformationFilled() && isSubjectFilled()) {
            const response = await saveFormData(newFormData);
            if (response.status === 'success') {
                const unique_number = response.unique_number;
                toast.add({ severity: 'success', summary: 'Success Message', detail: response.message, life: 5000 });
                setTimeout(() => {
                    window.location.href = `/application/preview/${unique_number}`;
                }, 500);
            } else {
                toast.add({ severity: 'error', summary: 'Error Message', detail: response.error || 'An error occurred', life: 5000 });
            }
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: 'Please complete all required fields.', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occurred!', life: 5000 });
    }
};

const customUploader = async (param) => {
    formData[param] = null;
};

const subjectSearchForm = reactive({
    institute_details_id: null,
    academic_year: null,
    academic_year_id: null,
    class: null,
    center: null,
    institute: null
});

const compulsorySubjOpts = ref([]);
const instituteSubjOpts = ref([]);

const getSubjects = async () => {
    subjectSearchForm.institute_details_id = admissionConfig.value.instiute_details.id;
    subjectSearchForm.academic_year = formData.academic_year;
    subjectSearchForm.academic_year_id = formData.academic_year_id;
    subjectSearchForm.class = formData.class;
    subjectSearchForm.center = formData.center;
    subjectSearchForm.institute = formData.institute;

    await fetchYearwiseSubject(subjectSearchForm);
    compulsorySubjOpts.value = JSON.parse(subjectList.value.compulsory.replace(/'/g, '"'));
    instituteSubjOpts.value = JSON.parse(subjectList.value.group.replace(/'/g, '"'));
    formData.compulsorySubjects = compulsorySubjOpts.value;
    formData.subject.compulsory = compulsorySubjOpts.value;
};

watch(
    () => [formData.institute, formData.academic_year, formData.class, formData.center],
    async ([newinstitute, newAcademicYear, newClass, newCenter]) => {
        if (newinstitute && newAcademicYear && newClass && newCenter) {
            if (admissionConfig.value.subject_status == 'YES') {
                await getSubjects();
            }
        }
    }
);

watch(() => formData.academic_year_id, (newId) => {
    const selected = admissionConfig?.value?.details.find(a => a.academic_year_id === newId);
    formData.academic_year = selected ? selected.academic_year : null;
});

const availableGroupSubjects = computed(() => {
    formData.subject.group = formData.instituteSubjects;
    return instituteSubjOpts.value.filter((subject) => !formData.optionalSubjects.includes(subject));
});

const availableOptionalSubjects = computed(() => {
    formData.subject.optional = formData.optionalSubjects;
    return instituteSubjOpts.value.filter((subject) => !formData.instituteSubjects.includes(subject));
});

const croppingImageUrl = ref();
const isCropperVisible = ref(false);
const originalFileName = ref();
function onAvatarSelect($event) {
    studentPhotoFile.value = $event.files[0];
    originalFileName.value = studentPhotoFile.value.name;
    const reader = new FileReader();
    reader.onload = (e) => {
        croppingImageUrl.value = e.target.result;
        isCropperVisible.value = true;
    };
    reader.readAsDataURL(studentPhotoFile.value);
}
async function handleCroppedImage({ coordinates, image, canvas }) {
    result.coordinates = coordinates;
    result.image = image;
    const webpImageData = canvas.toDataURL('image/png', 0.7); // Adjust the compression quality (0.0 to 1.0)
    // Create a new File from the WebP image data
    const blob = await (await fetch(webpImageData)).blob();
    formData.student_pic = new File([blob], originalFileName, {
        type: 'image/png'
    });
}

function onFileSelect($event, type) {
    if (type == 'vaccine') {
        formData.vaccine_certificate = $event.files[0];
    } else if (type == 'identity') {
        formData.student_birth_nid_file = $event.files[0];
    } else if (type == 'document') {
        formData.other_file = $event.files[0];
    } else {
        console.error('No type provided!');
    }
}

const requiredFields = [
    // 'student_name_bangla',
    'student_name_english',
    'student_mobile',
    'date_of_birth',
    'student_nid_or_birth_no',
    'gender',
    'religion',
    // 'merital_status',
    'father_name_english',
    //'father_nid',
    'mother_name_english',
    'present_address',
    'present_division',
    'present_district',
    'present_upozilla',
    'present_post_office',
    'permanent_address',
    'permanent_division',
    'permanent_district',
    'permanent_upozilla',
    'permanent_post_office',
    'academic_year',

    'class_id',
    'class_name',

    'center_id',
    'center_name',

    'chosen_institute_id',
    'chosen_institute_name',
    
    // 'subject',
    'student_pic'
    // 'student_birth_nid_file'
];
const isFormValid = computed(() => {
    return requiredFields.every((field) => formData[field]);
});

const refresh = () => {
    window.location.reload();
};

definePageMeta({
    layout: false
});
</script>

<template>
    <Toast />
    <section class="mx-auto" style="max-width: 1378px" v-if="!ins_response">
        <div class="card my-3 text-center">
            <img :src="`${config.public.BASE_URL}/storage/${admissionConfig?.instiute_details?.logo}`" alt="logo" class="mx-auto" style="width: 100px" />
            <h2 class="m-0 font-bold">{{ admissionConfig?.instiute_details?.institute_name }}</h2>
            <h4 class="m-0">{{ admissionConfig?.instiute_details?.institute_address }}</h4>
        </div>
        <TabView class="mx-auto">
            <TabPanel header="Apply Online">
                <div class="card" v-if="admissionConfig?.enabled == 'YES'">
                    <h4 class="text-primary text-center font-bold">{{ admissionConfig?.heading }}</h4>
                    <div class="mx-auto my-3" v-if="admissionConfig?.form == 'YES' || studentByRollFound">
                        <Button icon="pi pi-refresh" label="Refresh" size="small" severity="secondary" @click="refresh" />
                        <div>
                            <Message severity="success" icon="pi pi-book" :closable="false" class="mt-5">Academic Information</Message>
                            <div class="grid">
                                <div class="col-12 md:col-3">
                                    <label for="year-session">Academic Year<span style="color: tomato"> * </span></label>
                                    <Dropdown
                                        filter
                                        id="permanentPS"
                                        :options="admissionConfig?.details"
                                        v-model="formData.academic_year_id"
                                        optionLabel="academic_year"
                                        optionValue="academic_year_id"
                                        placeholder="Select Academic year"
                                        class="w-full capitalize"
                                        :disabled="studentDataByRoll?.admission_payment?.academic_year"
                                    >
                                        <template #option="slotProps">
                                            <div class="capitalize">{{ slotProps.option.academic_year }}</div>
                                        </template>
                                    </Dropdown>
                                </div>
                                <div class="col-12 md:col-3">
                                    <label for="class">Class <span style="color: tomato"> * </span></label>
                                    <Dropdown
                                        filter
                                        v-model="formData.class"
                                        :options="classOpts?.details"
                                        optionLabel="class_name"
                                        placeholder="Select Class"
                                        class="w-full capitalize"
                                        :disabled="!formData.academic_year || studentDataByRoll?.admission_payment?.class"
                                    >
                                        <template #option="slotProps">
                                            <div class="capitalize">{{ slotProps.option.class_name }}</div>
                                        </template>
                                    </Dropdown>
                                </div>

                                <div class="col-12 md:col-3">
                                    <label for="class">Institute <span style="color: tomato"> * </span></label>
                                    <Dropdown
                                        filter
                                        v-model="formData.institute"
                                        :options="instituteOpts?.institutes"
                                        optionLabel="name"
                                        placeholder="Select Institute"
                                        class="w-full capitalize"
                                        :disabled="!formData.academic_year || !formData.class || studentDataByRoll?.admission_payment?.institute"
                                    >
                                        <template #option="slotProps">
                                            <div class="capitalize">{{ slotProps.option.name }}</div>
                                        </template>
                                    </Dropdown>
                                </div>

                                <div class="col-12 md:col-3">
                                    <label for="class">Center <span style="color: tomato"> * </span></label>
                                    <Dropdown
                                        filter
                                        v-model="formData.center"
                                        :options="centerOpts"
                                        optionLabel="name"
                                        placeholder="Select Center"
                                        class="w-full capitalize"
                                        :disabled="!formData.academic_year || !formData.class || !formData.institute || studentDataByRoll?.admission_payment?.institute"
                                    >
                                        <template #option="slotProps">
                                            <div class="capitalize">{{ slotProps.option.name }}</div>
                                        </template>
                                    </Dropdown>
                                </div>

                                <div class="col-12" v-if="admissionConfig?.subject_status == 'YES'">
                                    <label for="className">Compulsory Subjects</label>
                                    <MultiSelect filter checkmark display="chip" v-model="formData.compulsorySubjects" :options="compulsorySubjOpts" placeholder="Compulsory Subjects" class="w-full capitalize" :disabled="compulsorySubjOpts">
                                    </MultiSelect>
                                </div>

                                <div class="col-12" v-if="admissionConfig?.subject_status == 'YES'">
                                    <label for="className">Choose Group Subjects</label>
                                    <MultiSelect
                                        filter
                                        checkmark
                                        display="chip"
                                        v-model="formData.instituteSubjects"
                                        :options="availableGroupSubjects"
                                        placeholder="Group Subjects"
                                        class="w-full capitalize"
                                        :disabled="!instituteSubjOpts"
                                        :selectionLimit="3"
                                    ></MultiSelect>
                                </div>

                                <div class="col-12" v-if="admissionConfig?.subject_status == 'YES'">
                                    <label for="className">Choose Optional Subjects</label>
                                    <MultiSelect
                                        filter
                                        checkmark
                                        display="chip"
                                        v-model="formData.optionalSubjects"
                                        :options="availableOptionalSubjects"
                                        placeholder="Optional Subjects"
                                        class="w-full capitalize"
                                        :disabled="!instituteSubjOpts"
                                        :selectionLimit="1"
                                    >
                                    </MultiSelect>
                                </div>
                            </div>

                            <Message severity="success" icon="pi pi-user" :closable="false">Student Information</Message>
                            <div class="grid">
                                <!-- <div class="col-12 md:col-3">
                                    <label for="student-name-bangla">Name of Student (Bangla) <span style="color: tomato"> * </span></label>
                                    <InputText id="student-name-bangla" v-model="formData.student_name_bangla" class="w-full" placeholder="Student Name (Bangla)" />
                                </div> -->
                                <div class="col-12 md:col-3">
                                    <label for="student-name-english">Name of Student (English) <span style="color: tomato"> * </span></label>
                                    <InputText id="student-name-english" v-model="formData.student_name_english" class="w-full" placeholder="Student Name (English)" />
                                </div>
                                <div class="col-12 md:col-3">
                                    <label for="student-mobile">Student Mobile No. <span style="color: tomato"> * </span></label>
                                    <InputText id="student-mobile" v-model="formData.student_mobile" class="w-full" placeholder="Student Contact" />
                                </div>

                                <div class="col-12 md:col-3">
                                    <label for="student-nationality">Nationality <span style="color: tomato"> * </span></label>
                                    <InputText id="student-nationality" v-model="formData.nationality" class="w-full" placeholder="Nationality" />
                                </div>

                                <div class="col-12 md:col-3">
                                    <label for="student-dob">Date of Birth <span style="color: tomato"> * </span></label>
                                    <Calendar id="student-dob" v-model="dateOfBirth" class="w-full" placeholder="Date of Birth" />
                                </div>

                                <div class="col-12 md:col-3">
                                    <label for="student-birthReg">NID/Birth Registration <span style="color: tomato"> * </span></label>
                                    <InputText id="student-birthReg" v-model="formData.student_nid_or_birth_no" class="w-full" placeholder="NID or Birth certificate no." />
                                </div>

                                <div class="col-12 md:col-3">
                                    <label for="stdGender">Gender <span style="color: tomato"> * </span></label>
                                    <Dropdown id="stdGender" :options="genderOpts" v-model="formData.gender" placeholder="Select Gender" class="w-full" />
                                </div>

                                <div class="col-12 md:col-3">
                                    <label for="stdReligion">Religion <span style="color: tomato"> * </span></label>
                                    <Dropdown id="stdReligion" :options="religionOpts" v-model="formData.religion" placeholder="Select Religion" class="w-full" />
                                </div>

                                <div class="col-12 md:col-3">
                                    <label for="stdBlood">Blood Group</label>
                                    <Dropdown id="stdBlood" :options="bloodOpts" v-model="formData.blood_group" placeholder="Select Blood Group" class="w-full" />
                                </div>

                                <!-- <div class="col-12 md:col-3">
                                    <label for="stdMarriage">Marital Status</label>
                                    <Dropdown id="stdMarriage" :options="maritalOpts" v-model="formData.merital_status" placeholder="Select Marital Status" class="w-full" />
                                </div> -->

                                <div class="col-12"><hr /></div>
                                <!-- <div class="col-12 md:col-3">
                                    <label for="father-name-bangla">Father's Name (Bangla)</label>
                                    <InputText id="father-name-bangla" v-model="formData.father_name_bangla" class="w-full" placeholder="Father Name (Bangla)" />
                                </div> -->
                                <div class="col-12 md:col-3">
                                    <label for="father-name-english">Father's Name (English) <span style="color: tomato"> * </span></label>
                                    <InputText id="father-name-english" v-model="formData.father_name_english" class="w-full" placeholder="Father Name (English)" />
                                </div>

                                <div class="col-12 md:col-3">
                                    <label for="father-nid">Father's National ID/Passport No.</label>
                                    <InputText id="father-nid" v-model="formData.father_nid" class="w-full" placeholder="Father NID or Passport No." />
                                </div>
                                <div class="col-12 md:col-3">
                                    <label for="father-mobile">Father's Mobile No.</label>
                                    <InputText id="father-mobile" v-model="formData.father_mobile" class="w-full" placeholder="Father's Contact" />
                                </div>

                                <!-- <div class="col-12 md:col-3">
                                    <label for="mother-name-bangla">Mother's Name (Bangla)</label>
                                    <InputText id="mother-name-bangla" v-model="formData.mother_name_bangla" class="w-full" placeholder="Mother Name (Bangla)" />
                                </div> -->

                                <div class="col-12 md:col-3">
                                    <label for="mother-name-english">Mother's Name (English) <span style="color: tomato"> * </span></label>
                                    <InputText id="mother-name-english" v-model="formData.mother_name_english" class="w-full" placeholder="Mother Name (English)" />
                                </div>
                                <div class="col-12 md:col-3">
                                    <label for="mother-nid">Mother's National ID/Passport No. </label>
                                    <InputText id="mother-nid" v-model="formData.mother_nid" class="w-full" placeholder="Mother NID or Passport No." />
                                </div>
                                <div class="col-12 md:col-3">
                                    <label for="mother-mobile">mother's Mobile No.</label>
                                    <InputText id="mother-mobile" v-model="formData.mother_mobile" class="w-full" placeholder="Mother's Contact" />
                                </div>
                            </div>

                            <Message severity="success" icon="pi pi-map" :closable="false" class="mt-5">Address Information</Message>
                            <div class="grid">
                                <!-- Present Address Information -->
                                <div class="col-12 md:col-6">
                                    <legend class="text-primary font-bold">Mailing/Present Address <span style="color: tomato"> * </span></legend>
                                    <br />
                                    <div class="field">
                                        <Textarea id="present-address" v-model="formData.present_address" variant="filled" rows="5" cols="30" class="w-full" placeholder="Address / Villages" :disabled="addressSameAsPresent" />
                                    </div>

                                    <div class="field">
                                        <label for="presentDivision">Division <span style="color: tomato"> * </span></label>
                                        <Dropdown filter id="presentDivision" :options="divisionData" optionLabel="name" v-model="formData.present_division" placeholder="Select Division" class="w-full" :disabled="addressSameAsPresent">
                                            <template #option="slotProps">
                                                <div class="capitalize">{{ slotProps.option.name }} ( {{ slotProps.option.bn_name }} )</div>
                                            </template>
                                        </Dropdown>
                                    </div>

                                    <div class="field">
                                        <label for="presentDistrict">District <span style="color: tomato"> * </span></label>
                                        <Dropdown
                                            filter
                                            id="presentDistrict"
                                            :options="presentDistrictData"
                                            optionLabel="name"
                                            v-model="formData.present_district"
                                            placeholder="Select District"
                                            class="w-full"
                                            :disabled="formData.present_division == null || addressSameAsPresent"
                                        >
                                            <template #option="slotProps">
                                                <div class="capitalize">{{ slotProps.option.name }} ( {{ slotProps.option.bn_name }} )</div>
                                            </template>
                                        </Dropdown>
                                    </div>
                                    <div class="field">
                                        <label for="presentPS">P.S./Upazila <span style="color: tomato"> * </span></label>
                                        <Dropdown
                                            filter
                                            id="presentPS"
                                            :options="presentUpazillaData"
                                            optionLabel="name"
                                            v-model="formData.present_upozilla"
                                            placeholder="Select Upazilla"
                                            class="w-full"
                                            :disabled="formData.present_district == null || addressSameAsPresent"
                                        >
                                            <template #option="slotProps">
                                                <div class="capitalize">{{ slotProps.option.name }} ( {{ slotProps.option.bn_name }} )</div>
                                            </template>
                                        </Dropdown>
                                    </div>
                                    <div class="field">
                                        <label for="presentPostOffice">Post Office <span style="color: tomato"> * </span></label>
                                        <InputText id="presentPostOffice" v-model="formData.present_post_office" placeholder="Post Office" class="w-full" :disabled="addressSameAsPresent" />
                                    </div>
                                    <div class="field">
                                        <label for="presentPostCode">Postal Code </label>
                                        <InputText id="presentPostCode" v-model="formData.present_post_code" placeholder="Postal Code" class="w-full" :disabled="addressSameAsPresent" />
                                    </div>
                                </div>

                                <!-- Permanent Address Information -->
                                <div class="col-12 md:col-6">
                                    <div>
                                        <legend class="text-primary font-bold">Permanent Address <span style="color: tomato"> * </span></legend>
                                        <div class="field-checkbox" style="margin-bottom: 0.5rem">
                                            <Checkbox
                                                id="sameAsPresent"
                                                v-model="addressSameAsPresent"
                                                :binary="true"
                                                :disabled="!formData.present_address || !formData.present_division || !formData.present_district || !formData.present_upozilla || !formData.present_post_office"
                                            />
                                            <label for="sameAsPresent">Same as present address</label>
                                        </div>
                                    </div>
                                    <div class="field">
                                        <Textarea id="permanent-address" v-model="formData.permanent_address" variant="filled" rows="5" cols="30" class="w-full" placeholder="Address / Village" :disabled="addressSameAsPresent" />
                                    </div>

                                    <div class="field">
                                        <label for="permanentDivision">Division <span style="color: tomato"> * </span></label>
                                        <Dropdown filter id="permanentDivision" :options="divisionData" optionLabel="name" v-model="formData.permanent_division" placeholder="Select Division" class="w-full" :disabled="addressSameAsPresent">
                                            <template #option="slotProps">
                                                <div class="capitalize">{{ slotProps.option.name }} ( {{ slotProps.option.bn_name }} )</div>
                                            </template>
                                        </Dropdown>
                                    </div>

                                    <div class="field">
                                        <label for="permanentDistrict">District <span style="color: tomato"> * </span></label>
                                        <Dropdown
                                            filter
                                            id="permanentDistrict"
                                            :options="permanentDistrictData"
                                            optionLabel="name"
                                            v-model="formData.permanent_district"
                                            placeholder="Select District"
                                            class="w-full"
                                            :disabled="addressSameAsPresent || formData.permanent_division == null"
                                        >
                                            <template #option="slotProps">
                                                <div class="capitalize">{{ slotProps.option.name }} ( {{ slotProps.option.bn_name }} )</div>
                                            </template>
                                        </Dropdown>
                                    </div>

                                    <div class="field">
                                        <label for="permanentPS">P.S./Upazila <span style="color: tomato"> * </span></label>
                                        <Dropdown
                                            filter
                                            id="permanentPS"
                                            :options="permanentUpazillaData"
                                            optionLabel="name"
                                            v-model="formData.permanent_upozilla"
                                            placeholder="Select Upazilla"
                                            class="w-full"
                                            :disabled="addressSameAsPresent || formData.permanent_district == null"
                                        >
                                            <template #option="slotProps">
                                                <div class="capitalize">{{ slotProps.option.name }} ( {{ slotProps.option.bn_name }} )</div>
                                            </template>
                                        </Dropdown>
                                    </div>
                                    <div class="field">
                                        <label for="permanentPostOffice">Post Office <span style="color: tomato"> * </span></label>
                                        <InputText id="permanentPostOffice" v-model="formData.permanent_post_office" placeholder="Post Office" class="w-full" :disabled="addressSameAsPresent" />
                                    </div>
                                    <div class="field">
                                        <label for="permanentPostCode">Postal Code </label>
                                        <InputText id="permanentPostCode" v-model="formData.permanent_post_code" placeholder="Postal Code" class="w-full" :disabled="addressSameAsPresent" />
                                    </div>
                                </div>
                            </div>

                            <!-- <Message severity="success" icon="pi pi-users" :closable="false" class="mt-5">Guardian Information</Message>
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <label for="guardian-name">Guardian Name</label>
                                    <InputText id="guardian-name" v-model="formData.guardian_name" class="w-full" placeholder="Guardian Name" />
                                </div>
                                <div class="col-12 md:col-4">
                                    <label for="guardian-relationship">Relationship</label>
                                    <InputText id="guardian-relationship" v-model="formData.guardian_relation" class="w-full" placeholder="Relation with Guardian" />
                                </div>
                                <div class="col-12 md:col-4">
                                    <label for="guardian-mobile">Mobile Number</label>
                                    <InputText id="guardian-mobile" v-model="formData.guardian_mobile" class="w-full" placeholder="Guardian Contact" />
                                </div>
                                <div class="col-12 md:col-4">
                                    <label for="guardian-occupation">Occupation</label>
                                    <InputText id="guardian-occupation" v-model="formData.guardian_occupation" class="w-full" placeholder="Guardian Occupation" />
                                </div>

                                <div class="col-12 md:col-4">
                                    <label for="guardian-income">Yearly Income</label>
                                    <InputNumber inputId="integeronly" id="guardian-income" v-model="formData.guardian_yearly_income" class="w-full" placeholder="Guardian Income (yearly)" />
                                </div>

                                <div class="col-12 md:col-4">
                                    <label for="guardian-property">Property</label>
                                    <InputText id="guardian-property" v-model="formData.guardian_property" class="w-full" placeholder="Guardian Property" />
                                </div>
                            </div> -->

                            <Message severity="success" icon="pi pi-pencil" :closable="false" class="mt-5" v-if="admissionConfig?.academic_info_status == 'YES'"
                                >Educational Qualifications <span style="color: tomato"> * (Atleast One Required)</span></Message
                            >
                            <div v-if="admissionConfig?.academic_info_status == 'YES'" class="mb-3">
                                <div v-for="(qualification, index) in formData.edu_information" :key="index" class="card flex flex-wrap align-items-end">
                                    <div class="col-12 md:col-4">
                                        <label for="exam">Exam</label>
                                        <Dropdown v-model="qualification.exam" :options="examNameOpts" placeholder="Select Exam" class="w-full capitalize">
                                            <template #option="slotProps">
                                                <div class="capitalize">{{ slotProps.option }}</div>
                                            </template>
                                        </Dropdown>
                                    </div>
                                    <div class="col-12 md:col-4">
                                        <label for="institute">Board</label>
                                        <Dropdown v-model="qualification.board" :options="boardNameOpts" placeholder="Select Board" class="w-full capitalize">
                                            <template #option="slotProps">
                                                <div class="capitalize">{{ slotProps.option }}</div>
                                            </template>
                                        </Dropdown>
                                    </div>
                                    <div class="col-12 md:col-4">
                                        <label for="institute">Institute</label>
                                        <InputText id="institute" v-model="qualification.institute" class="w-full" placeholder="Institute Name" />
                                    </div>
                                    <div class="col-12 md:col-4">
                                        <label for="institute">Group</label>
                                        <InputText id="institute" v-model="qualification.group" class="w-full" placeholder="Name of the Group/Dept." />
                                    </div>
                                    <div class="col-12 md:col-4">
                                        <label for="institute">Roll</label>
                                        <InputText id="institute" v-model="qualification.roll" class="w-full" placeholder="Enter the Roll" />
                                    </div>
                                    <div class="col-12 md:col-4">
                                        <label for="institute">Registration</label>
                                        <InputText id="institute" v-model="qualification.registration" class="w-full" placeholder="Enter Registration No." />
                                    </div>
                                    <div class="col-12 md:col-4">
                                        <label for="institute">G.P.A</label>
                                        <InputText id="institute" v-model="qualification.gpa" class="w-full" placeholder="Attained G.P.A" />
                                    </div>
                                    <div class="col-12 md:col-4">
                                        <label for="institute">Passing Year</label>
                                        <InputText id="institute" v-model="qualification.passingYear" class="w-full" placeholder="Enter Passing Year" />
                                    </div>
                                    <div class="col-12 md:col-4">
                                        <Button label="" icon="pi pi-trash" @click="removeQualification(index)" size="small" severity="danger" v-if="index != 0" text />
                                    </div>
                                </div>
                            </div>
                            <Button label="Add More" @click="addQualification" icon="pi pi-plus-circle" severity="secondary" size="small" v-if="admissionConfig?.academic_info_status == 'YES'" />

                            <!-- <Message severity="success" icon="pi pi-bookmark" :closable="false" class="mt-5">Quota Information</Message>
                            <div class="card flex flex-wrap gap-3">
                                <div class="flex align-items-center">
                                    <RadioButton v-model="formData.quota" inputId="ingredient1" name="quota" value="Freedom Fighter" @change="otherQuota = false" />
                                    <label for="ingredient1" class="ml-2">Freedom Fighter</label>
                                </div>
                                <div class="flex align-items-center">
                                    <RadioButton v-model="formData.quota" inputId="ingredient2" name="quota" value="Disability" @change="otherQuota = false" />
                                    <label for="ingredient2" class="ml-2">Disability</label>
                                </div>
                                <div class="flex align-items-center">
                                    <Checkbox id="otherQuota" v-model="otherQuota" :binary="true" @change="handleOtherQuota" />
                                    <label for="ingredient3" class="ml-2">Other</label>
                                    <InputText v-model="formData.quota" placeholder="Name the quota" class="w-full mx-2" v-if="otherQuota" />
                                </div>
                            </div> -->

                            <!-- <Message severity="success" icon="pi pi-check-square" :closable="false" class="mt-5">Covid-19 Vaccine Information</Message>
                            <div class="card flex flex-wrap">
                                <div class="col-12 md:col-4">
                                    <label for="vaccinated">Vaccinated?</label>
                                    <Dropdown :options="vaccinatedStatus" v-model="formData.vaccine" placeholder="Select Status" class="w-full" />
                                </div>
                                <div class="col-12 md:col-4">
                                    <label for="vaccine-name">Vaccine Name</label>
                                    <Dropdown :options="vaccinOpts" v-model="formData.vaccine_name" placeholder="Select Status" class="w-full" :disabled="formData.vaccine == 'No' || !formData.vaccine" />
                                </div>
                                <div class="col-12 md:col-4">
                                    <label for="vaccine-certificate">Vaccine Certificate</label>
                                    <FileUpload
                                        mode="basic"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        customUpload
                                        @uploader="customUploader('vaccine_certificate')"
                                        @select="onFileSelect($event, 'vaccine')"
                                        class="p-button-sm"
                                        :disabled="formData.vaccine == 'No' || !formData.vaccine"
                                        chooseLabel="Vaccine Certificate"
                                    />
                                </div>
                            </div> -->

                            <Message severity="success" icon="pi pi-file" :closable="false" class="mt-5">File Attachment</Message>
                            <div class="card flex flex-wrap">
                                <div class="col-12 md:col-4">
                                    <label for="student-photo">Student Photo <span style="color: tomato"> * </span></label>
                                    <FileUpload
                                        mode="basic"
                                        customUpload
                                        @uploader="customUploader('student_pic')"
                                        @select="onAvatarSelect($event)"
                                        accept=".jpeg,.png,.jpg"
                                        class="p-button-sm"
                                        chooseLabel="Student Photo"
                                        :disabled="isCropperVisible"
                                    />

                                    <Dialog v-model:visible="isCropperVisible" :closable="false">
                                        <div class="flex flex-wrap gap-2 align-items-end">
                                            <preview :width="120" :height="120" class="mb-2" :image="result.image" :coordinates="result.coordinates" />
                                            <div>
                                                <Button class="mb-2" label="Apply" icon="pi pi-image" @click="isCropperVisible = false" />
                                            </div>
                                        </div>
                                        <Cropper
                                            class="cropper"
                                            :stencil-props="{
                                                handlers: {},
                                                movable: true,
                                                resizable: false,
                                                aspectRatio: 1
                                            }"
                                            :resize-image="{
                                                adjustStencil: false
                                            }"
                                            image-restriction="stencil"
                                            :src="croppingImageUrl"
                                            @change="handleCroppedImage"
                                        />
                                    </Dialog>
                                </div>
                                <div class="col-12 md:col-4">
                                    <label for="birth-certificate">Birth Certificate/NID </label>
                                    <FileUpload mode="basic" customUpload @uploader="customUploader('student_birth_nid_file')" @select="onFileSelect($event, 'identity')" class="p-button-sm" chooseLabel="Identity Photo" />
                                </div>
                                <div class="col-12 md:col-4">
                                    <label for="other-document">Other Document</label>
                                    <FileUpload mode="basic" customUpload @uploader="customUploader('other_file')" @select="onFileSelect($event, 'document')" class="p-button-sm" chooseLabel="Other Document" />
                                </div>
                            </div>

                            <div class="grid justify-content-center my-3">
                                <Dialog
                                    v-model:visible="confirmation"
                                    modal
                                    header="Consent and Confimation"
                                    :style="{ width: '50rem' }"
                                    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
                                    v-if="formData.student_name_english && admissionConfig?.instiute_details?.institute_name"
                                >
                                    <Message severity="warn" class="text-justify" :closable="false" icon="pi pi-warning">
                                        I, <b>{{ formData.student_name_english }}</b
                                        >, hereby declare that the above-mentioned information and photo are correct. If any information provided by me is found to be false,
                                        <b>{{ admissionConfig?.instiute_details?.institute_name }}, {{ admissionConfig?.instiute_details?.institute_address }}</b> reserves the right to cancel my admission. I shall be obliged to obey the rules and
                                        regulations of the relevant Education Board/University as well as <b>{{ admissionConfig?.instiute_details?.institute_name }}, {{ admissionConfig?.instiute_details?.institute_address }}</b> and to pay all the
                                        required fees.
                                    </Message>
                                    <div class="flex align-items-center">
                                        <Checkbox v-model="consentState" inputId="agreement" :binary="true" />
                                        <label for="agreement" class="ml-2"> I have read and accepted the consent </label>
                                    </div>
                                    <Button severity="secondary" class="my-3 mr-2" label="Back" icon="pi pi-arrow-left" @click="confirmation = false" outlined size="small" />
                                    <Button class="my-3" label="Apply" icon="pi pi-check-circle" @click="submitFormData()" :disabled="!consentState" size="small" :loading="loading" />
                                </Dialog>
                                <Button @click="checkFields()" label="Apply For Admission" severity="info" icon="pi pi-question-circle" />
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <label for="rollSearch" class="w-full text-center">Enter registered roll number</label>
                        <div class="grid justify-content-left my-3 gap-2">
                            <InputText id="rollSearch" class="d-block" v-model="rollWiseSearch.roll" placeholder="Enter Roll . . ." />
                            <Button label="Search" icon="pi pi-search" severity="info" :loading="loading" @click="getStudentInfo" :disabled="!rollWiseSearch.roll || !rollWiseSearch.institute_id" />
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div v-if="!loading">
                        <Message severity="warn" :closable="false">This admission application is disabled!</Message>
                    </div>
                    <div class="text-center" v-else>
                        <Button label="Loading" :loading="loading" class="mx-auto" text disabled />
                    </div>
                </div>
            </TabPanel>
            <TabPanel header="Preview and payment">
                <div class="card">
                    <h4 class="text-primary text-center font-bold">{{ admissionConfig?.heading }}</h4>

                    <label for="applicantSearch">Enter provided applicant id</label>
                    <div class="grid justify-content-left my-3 gap-2">
                        <InputText id="applicantSearch" class="d-block" v-model="applicantNumber" placeholder="Enter Application id to search. . ." />
                        <Button label="Search" icon="pi pi-search" severity="info" :loading="loading" @click="getPreview" :disabled="!applicantNumber" />
                    </div>
                </div>
            </TabPanel>
            <TabPanel header="How to apply & pay">
                <Card v-if="appInstruction?.instruction">
                    <template #title>Ho to apply and pay</template>
                    <template #content>
                        <div v-html="appInstruction?.instruction"></div>
                    </template>
                </Card>
                <div v-else>
                    <Message severity="warn" :closable="false">No instruction yet!</Message>
                </div>
            </TabPanel>
            <!-- <TabPanel header="Instiute Instruction">
            </TabPanel> -->
        </TabView>
    </section>
    <section class="mx-auto" style="max-width: 1378px" v-else>
        <div class="card my-3 text-center">
            <InlineMessage severity="error">Invalid request observed !</InlineMessage>
        </div>
    </section>
</template>
<style scoped>
.cropper {
    width: 300px;
    height: 300px;
}
</style>
