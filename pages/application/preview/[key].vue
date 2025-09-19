<script setup>
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/auth';
const store = useAuthStore();
const { authError, isAuthenticated } = storeToRefs(store);

import { useAdmissionApplicationStore } from '~/stores/admissionApplication';
import { useToast } from 'primevue/usetoast';
import { Cropper, Preview } from 'vue-advanced-cropper';
import { useClipboard } from '@vueuse/core';
import 'vue-advanced-cropper/dist/style.css';

const { admissionConfig, divisionData, presentDistrictData, permanentDistrictData, presentUpazillaData, permanentUpazillaData, subjectList, previewData, loading } = storeToRefs(useAdmissionApplicationStore());

const { fetchPreviewData, fetchadmissionConfig, fetchDivisions, fetchDistrictByDivision, fetchUpazillaByDistrict, fetchYearwiseSubject, updateFormData, sendPaymentRequest } = useAdmissionApplicationStore();

const consentState = ref(true);
const addressSameAsPresent = ref(false);
const config = useRuntimeConfig();
const toast = useToast();
const route = useRoute();

const keyReference = ref();
onMounted(async () => {
    keyReference.value = route.params.key;
    await fetchPreviewData(route.params.key);
    await fetchadmissionConfig(previewData?.value.student_data?.institute?.institute_id);
    await fetchDivisions();
    formData.unique_number = route.params.key;
});

useVisibilityChange(async () => {
    keyReference.value = route.params.key;
    await fetchPreviewData(route.params.key);
    await fetchadmissionConfig(previewData?.value.student_data?.institute?.institute_id);
    await fetchDivisions();
    formData.unique_number = route.params.key;
});
const parsedEduInformation = computed(() => {
    const eduInformation = previewData.value?.student_data?.edu_information;

    // Log the raw data for debugging

    if (typeof eduInformation !== 'string') {
        console.error('edu_information is not a string:', eduInformation);
        return [];
    }

    try {
        return JSON.parse(eduInformation);
    } catch (e) {
        return [];
    }
});

const parsedSubjects = computed(() => {
    const subjectData = previewData.value?.student_data?.subject;

    // console.log('Raw subject data:', subjectData);

    if (typeof subjectData !== 'string') {
        console.error('subject data is not a string:', subjectData);
        return { compulsory: [], group: [], optional: [] };
    }

    try {
        return JSON.parse(subjectData);
    } catch (e) {
        console.error('Failed to parse subject data:', e);
        return { compulsory: [], group: [], optional: [] };
    }
});

const totalFee = computed(() => {
    const admissionFee = parseFloat(previewData.value?.admission_fee) || 0;
    const softwareFee = parseFloat(previewData.value?.software_fee) || 0;
    return admissionFee + softwareFee;
});

// pdf download
const printPage = () => {
    const printContents = document.getElementById('student-preview').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    // Restore the original content
    document.body.innerHTML = originalContents;
    window.location.reload();
};
const isEditing = ref(false);
const { copy, copied, isSupported } = useClipboard();
definePageMeta({
    layout: false
});

const student_edit = ref(false);
const address_edit = ref(false);
const parent_edit = ref(false);
const guardian_edit = ref(false);
const academic_edit = ref(false);
const education_edit = ref(false);
const attachment_edit = ref(false);
const quota_edit = ref(false);
const covid_edit = ref(false);

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

function convertDateStringToFormatted(dateString) {
    // Parse the date string (assuming it's in YYYY-MM-DD format)
    const [year, month, day] = dateString.split('-').map(Number);

    // Create a new Date object
    const dateObj = new Date(year, month - 1, day); // Month is 0-indexed in Date constructor

    // Define weekdays and months arrays
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Get components of the date
    const weekday = weekdays[dateObj.getDay()];
    const monthName = months[dateObj.getMonth()];
    const dayOfMonth = dateObj.getDate();
    const yearValue = dateObj.getFullYear();
    const timeString = dateObj.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour12: false });

    // Construct the formatted date string
    const formattedDate = `${weekday} ${monthName} ${dayOfMonth} ${yearValue} ${timeString} GMT+0600 (Bangladesh Standard Time)`;
    return formattedDate;
}

const assignformattedDate = (param, variable) => {
    formData[param] = variable ? formatDateToSQL(variable) : '';
};
watch(dateOfBirth, (newDate) => {
    assignformattedDate('date_of_birth', newDate);
});

watch(previewData.value?.student_data?.approval_status, (newVal) => {
    if (newVal == 'Success') {
        console.log(newVal);
    }
});

watch(
    () => student_edit.value,
    async (newVal) => {
        if (newVal) {
            dateOfBirth.value = previewData.value?.student_data?.date_of_birth;
            // formData.student_name_bangla = formData.student_name_bangla ?? previewData.value?.student_data?.student_name_bangla;
            formData.student_name_english = formData.student_name_english ?? previewData.value?.student_data?.student_name_english;
            formData.student_mobile = formData.student_mobile ?? previewData.value?.student_data?.student_mobile;
            formData.nationality = formData.nationality ?? previewData.value?.student_data?.nationality;
            formData.date_of_birth = formData.date_of_birth ?? dateOfBirth.value;
            formData.student_nid_or_birth_no = formData.student_nid_or_birth_no ?? previewData.value?.student_data?.student_nid_or_birth_no;
            formData.gender = formData.gender ?? previewData.value?.student_data?.gender;
            formData.religion = formData.religion ?? previewData.value?.student_data?.religion;
            formData.blood_group = formData.blood_group ?? previewData.value?.student_data?.blood_group;
            // formData.merital_status = formData.merital_status ?? previewData.value?.student_data?.merital_status;
        }
    }
);

watch(
    () => parent_edit.value,
    async (newVal) => {
        if (newVal) {
            formData.father_name_bangla = formData.father_name_bangla ?? previewData.value?.student_data?.father_name_bangla;
            formData.father_name_english = formData.father_name_english ?? previewData.value?.student_data?.father_name_english;
            formData.father_nid = formData.father_nid ?? previewData.value?.student_data?.father_nid;
            formData.father_mobile = formData.father_mobile ?? previewData.value?.student_data?.father_mobile;
            formData.mother_name_bangla = formData.mother_name_bangla ?? previewData.value?.student_data?.mother_name_bangla;
            formData.mother_name_english = formData.mother_name_english ?? previewData.value?.student_data?.mother_name_english;
            formData.mother_nid = formData.mother_nid ?? previewData.value?.student_data?.mother_nid;
            formData.mother_mobile = formData.mother_mobile ?? previewData.value?.student_data?.mother_mobile;
        }
    }
);

watch(
    () => guardian_edit.value,
    async (newVal) => {
        if (newVal) {
            formData.guardian_name = formData.guardian_name ?? previewData.value?.student_data?.guardian_name;
            formData.guardian_relation = formData.guardian_relation ?? previewData.value?.student_data?.guardian_relation;
            formData.guardian_mobile = formData.guardian_mobile ?? previewData.value?.student_data?.guardian_mobile;
            formData.guardian_occupation = formData.guardian_occupation ?? previewData.value?.student_data?.guardian_occupation;
            formData.guardian_yearly_income = formData.guardian_yearly_income ?? previewData.value?.student_data?.guardian_yearly_income;
            formData.guardian_property = formData.guardian_property ?? previewData.value?.student_data?.guardian_property;
        }
    }
);

watch(
    () => address_edit.value,
    async (newVal) => {
        if (newVal) {
            formData.present_address = formData.present_address ?? previewData.value?.student_data?.present_address;
            formData.present_division = formData.present_division ?? JSON.parse(previewData.value?.student_data?.present_division);
            formData.present_district = formData.present_district ?? JSON.parse(previewData.value?.student_data?.present_district);
            formData.present_upozilla = formData.present_upozilla ?? JSON.parse(previewData.value?.student_data?.present_upozilla);
            formData.present_post_office = formData.present_post_office ?? previewData.value?.student_data?.present_post_office;
            formData.present_post_code = formData.present_post_code ?? previewData.value?.student_data?.present_post_code;

            formData.permanent_address = formData.permanent_address ?? previewData.value?.student_data?.permanent_address;
            formData.permanent_division = formData.permanent_division ?? JSON.parse(previewData.value?.student_data?.permanent_division);
            formData.permanent_district = formData.permanent_district ?? JSON.parse(previewData.value?.student_data?.permanent_district);
            formData.permanent_upozilla = formData.permanent_upozilla ?? JSON.parse(previewData.value?.student_data?.permanent_upozilla);
            formData.permanent_post_office = formData.permanent_post_office ?? previewData.value?.student_data?.permanent_post_office;
            formData.permanent_post_code = formData.permanent_post_code ?? previewData.value?.student_data?.permanent_post_code;
        }
    }
);

watch(
    () => academic_edit.value,
    async (newVal) => {
        if (newVal) {
            formData.academic_year = formData?.academic_year ?? previewData.value?.student_data?.academic_year;
            formData.class = formData?.class ?? previewData.value?.student_data?.class;
            await nextTick();
            formData.shift = formData?.shift ?? previewData.value?.student_data?.shift;
            await nextTick();
            formData.group = formData?.group ?? previewData.value?.student_data?.group;
            await nextTick();
            formData.groupSubjects = formData?.groupSubjects?.length > 0 ? formData.groupSubjects : JSON.parse(previewData.value?.student_data?.subject)?.group;
            formData.optionalSubjects = formData?.optionalSubjects?.length > 0 ? formData.optionalSubjects : JSON.parse(previewData.value?.student_data?.subject)?.optional;
        }
    }
);

watch(
    () => education_edit.value,
    async (newVal) => {
        if (newVal) {
            formData.edu_information = formData?.edu_information?.length > 0 ? formData.edu_information : JSON.parse(previewData?.value?.student_data?.edu_information);
        } else {
            if (formData.hasOwnProperty('edu_information')) {
                delete formData.edu_information;
            }
        }
    }
);

watch(
    () => quota_edit.value,
    async (newVal) => {
        if (newVal) {
            otherQuota.value = previewData?.value?.student_data?.quota && (previewData?.value?.student_data?.quota != 'Freedom Fighter' || previewData?.value?.student_data?.quota != 'Disability');
            formData.quota = formData.quota ?? previewData?.value?.student_data?.quota;
        }
    }
);

watch(
    () => covid_edit.value,
    async (newVal) => {
        if (newVal) {
            formData.vaccine = formData.vaccine ?? previewData?.value?.student_data?.vaccine;
            formData.vaccine_name = formData.vaccine_name ?? previewData?.value?.student_data?.vaccine_name;
        }
    }
);

const formData = reactive({
    subject: reactive({
        compulsory: [],
        group: [],
        optional: []
    }),
    edu_information: []
});

const classOpts = ref([]);
const shiftGroupOpts = ref([]);
const genderOpts = ref(['Male', 'Female', 'Others']);
const religionOpts = ref(['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Others']);
const bloodOpts = ref(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']);
const maritalOpts = ref(['Married', 'Unmarried', 'Divorced', 'Widowed', 'Single']);
const examNameOpts = ref(['PSC', 'JSC', 'HSC', 'SSC', 'B.B.A', 'B.Sc', "Hon's (English)", 'MA', 'MBS', 'M.sc', 'B.B.S', 'B.S.S']);
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
        if (newVal && formData?.present_division?.name != JSON.parse(previewData.value?.student_data.present_division).name) {
            formData.present_district = null;
        }
        await fetchDistrictByDivision('present', newVal.id);
    }
);

watch(
    () => formData.permanent_division,
    async (newVal) => {
        if (newVal && formData?.permanent_division?.name != JSON.parse(previewData.value?.student_data.permanent_division).name) {
            formData.permanent_district = null;
        }
        await fetchDistrictByDivision('permanent', newVal.id);
    }
);

watch(
    () => formData.present_district,
    async (newVal) => {
        if (newVal && formData?.present_district?.name != JSON.parse(previewData.value?.student_data.present_district).name) {
            formData.present_upozilla = null;
        }
        await fetchUpazillaByDistrict('present', newVal.id);
    }
);

watch(
    () => formData.permanent_district,
    async (newVal) => {
        if (newVal && formData?.permanent_district?.name != JSON.parse(previewData.value?.student_data.permanent_district).name) {
            formData.permanent_upozilla = null;
        }
        await fetchUpazillaByDistrict('permanent', newVal.id);
    }
);

watch(
    () => formData.academic_year,
    async (newVal) => {
        if (previewData?.value?.student_data?.academic_year != formData.academic_year) {
            formData.class = null;
        }
        compulsorySubjOpts.value = [];
        groupSubjOpts.value = [];
        formData.compulsorySubjects = compulsorySubjOpts.value;
        formData.subject.compulsory = compulsorySubjOpts.value;
        classOpts.value = admissionConfig.value.details.find((elem) => elem.academic_year == newVal);
    }
);
watch(
    () => formData.class,
    async (newVal) => {
        if (previewData?.value?.student_data?.class != formData.class) {
            formData.shift = null;
            formData.group = null;
        }

        compulsorySubjOpts.value = [];
        groupSubjOpts.value = [];
        formData.compulsorySubjects = compulsorySubjOpts.value;
        formData.subject.compulsory = compulsorySubjOpts.value;
        shiftGroupOpts.value = classOpts.value.details.find((elem) => elem.class == newVal);
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
        return Object.values(info).some((value) => value !== '');
    });
}

function checkFields() {
    if (!isFormValid.value) {
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'Please fill all required (* marked) Fields!', life: 5000 });
    } else if (!isEduInformationFilled()) {
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'At least one education information field must be filled.', life: 5000 });
    } else {
        confirmation.value = true;
    }
}

const updateApplication = async () => {
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
                        // console.log('Current key:', key);
                        // console.log('Current value:', value);
                        // console.log('academic_edit:', academic_edit.value);
                        // console.log('education_edit:', education_edit.value);

                        if (!academic_edit.value && key == 'subject') {
                            continue;
                        }

                        if (!education_edit.value && key == 'edu_information') {
                            continue;
                        }

                        newFormData.append(key, JSON.stringify(value));
                    } else {
                        // Append other non-object values as-is
                        newFormData.append(key, value);
                    }
                }
            }
        }

        // console.log(newFormData);
        const response = await updateFormData(newFormData);
        if (response.status == 'success') {
            toast.add({ severity: 'success', summary: 'Success Message', detail: response.message, life: 5000 });
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: response.error || 'An error occurred', life: 5000 });
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
    class: null,
    shift: null,
    group: null
});

const compulsorySubjOpts = ref([]);
const groupSubjOpts = ref([]);
watch(
    () => formData.group,
    async (newVal) => {
        if (newVal) {
            subjectSearchForm.institute_details_id = admissionConfig.value.instiute_details.id;
            subjectSearchForm.academic_year = formData.academic_year;
            subjectSearchForm.class = formData.class;
            subjectSearchForm.shift = formData.shift;
            subjectSearchForm.group = formData.group;
            compulsorySubjOpts.value = [];
            groupSubjOpts.value = [];
            await fetchYearwiseSubject(subjectSearchForm);
            compulsorySubjOpts.value = subjectList.value ? JSON.parse(subjectList?.value?.compulsory.replace(/'/g, '"')) : [];
            groupSubjOpts.value = subjectList.value ? JSON.parse(subjectList?.value?.group.replace(/'/g, '"')) : [];
            formData.compulsorySubjects = compulsorySubjOpts.value;
            formData.subject.compulsory = compulsorySubjOpts.value;
        }
    }
);

const availableGroupSubjects = computed(() => {
    formData.subject.group = formData.groupSubjects;
    // console.log(formData.optionalSubjects);
    return groupSubjOpts.value.filter((subject) => !formData.optionalSubjects.includes(subject));
});

const availableOptionalSubjects = computed(() => {
    formData.subject.optional = formData.optionalSubjects;
    return groupSubjOpts.value.filter((subject) => !formData.groupSubjects.includes(subject));
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
    'student_name_english',
    'student_mobile',
    'date_of_birth',
    'student_nid_or_birth_no',
    'gender',
    'religion',
    // 'merital_status',
    'father_name_english',
    // 'father_nid',
    'mother_name_english',
    'present_address',
    'present_division',
    'present_district',
    'present_upozilla',
    'present_post_office',
    'present_post_code',
    'permanent_address',
    'permanent_division',
    'permanent_district',
    'permanent_upozilla',
    'permanent_post_office',
    'permanent_post_code',
    'academic_year',
    'class',
    'shift',
    'group',
    'subject',
    'student_pic'
    // 'student_birth_nid_file'
];
const isFormValid = computed(() => {
    return requiredFields.every((field) => formData[field]);
});
const paymentInfo = reactive({
    unique_number: null,
    admission_fee: null,
    software_fee: null,
    url: null
});
const payNow = async () => {
    try {
        paymentInfo.unique_number = keyReference.value;
        paymentInfo.admission_fee = previewData?.value?.admission_fee;
        paymentInfo.software_fee = previewData?.value?.software_fee;
        paymentInfo.url = previewData?.value?.payment_url;

        const response = await sendPaymentRequest(paymentInfo);

        if (response.status == 'success') {
            window.location.href = response.gateway;
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: response.error || 'An error occurred', life: 5000 });
        }
    } catch (error) {
        console.log(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occurred', life: 5000 });
    }
};

const isPaymentDeadlinePassed = computed(() => {
    if(previewData.value?.deadline_status == 'passed'){
        return true;
    }
    return false;
});
</script>

<template>
    <Toast />

    <div class="card flex mx-auto my-5 col-12 md:col-8">
        <div class="w-full" v-if="previewData?.student_data" :loading="loading">
            <a :href="`${config.public.FRONTEND_URL}/application/${previewData?.student_data?.institute?.institute_id}`">
                <Button label="Application" icon="pi pi-arrow-left" severity="info" outlined />
            </a>
            <div class="notification">
                <div v-if="isSupported" class="flex flex-wrap justify-content-center align-items-center text-center">
                    <Button @click="copy(previewData?.student_data?.unique_number)" :label="`Application ID: ${previewData?.student_data?.unique_number}`" :icon="copied ? 'pi pi-check-circle' : 'pi pi-copy'" severity="help" />
                </div>
                <p v-else>{{ previewData?.student_data?.unique_number }}</p>

                <Message severity="warn" icon="pi pi-none" :closable="false">
                    <ul>
                        <li>উপরোক্ত এপ্লিকেশান আইডি (Application ID) সংরক্ষণ করুন।</li>
                        <li>ফি পরিশোধের পূর্বে তথ্য যাচাই ও সংশোধন করুন, ফি পরিশোধের পর কোন প্রকার তথ্য সংশোধন করা যাবে না</li>
                    </ul>
                </Message>
                <div class="flex flex-wrap gap-2 my-3">
                    <Button label="Print" @click="printPage" severity="secondary" icon="pi pi-print" size="small" :loading="loading" />
                    <div v-if="previewData?.student_data?.approval_status != 'Success' || isAuthenticated" class="flex flex-wrap gap-2">
                        <Button label="Edit" @click="isEditing = true" severity="info" icon="pi pi-file-edit" size="small" :loading="loading" />
                        <Button label="Payment" @click="payNow" :loading="loading" severity="success" icon="pi pi-money-bill" size="small" v-if="previewData?.student_data?.approval_status != 'Success' && !isPaymentDeadlinePassed" />
                    </div>
                    <div v-if="previewData?.exam && previewData?.student_data?.approval_status == 'Success'">
                        <a :href="`/application/exam/admit/${previewData?.student_data?.unique_number}`">
                            <Button severity="success" label="Admit Card" :loading="loading" icon="pi pi-eye" />
                        </a>
                    </div>

                    <div class="" v-if="previewData?.student_data?.approval_status == 'Success'">
                        <a :href="`/application/payment/${previewData?.student_data?.unique_number}`">
                            <Button label="Payment Slip" :loading="loading" icon="pi pi-eye" />
                        </a>
                        <Button label="Paid" icon="pi pi-check-circle" :disabled="true" text />
                    </div>

                    
                    <div v-else-if="isPaymentDeadlinePassed">
                        <Button severity="danger" label="Deadline Passed" icon="pi pi-times-circle" :disabled="true" text />
                    </div>
                </div>
                <Dialog v-model:visible="isEditing" maximizable modal header="Edit Necessary Information" :style="{ maxWidth: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
                    <div class="card flex flex-wrap gap-3">
                        <div class="flex align-items-center">
                            <Checkbox v-model="student_edit" inputId="ingredient1" :binary="true" />
                            <label for="ingredient1" class="ml-2 font-bold"> Student Information</label>
                        </div>
                        <div class="grid" v-if="student_edit">
                            <!-- <div class="col-12 md:col-6">
                                <label for="student-name-bangla">Student Name (Bangla) <span style="color: tomato"> * </span></label>
                                <InputText id="student-name-bangla" v-model="formData.student_name_bangla" class="w-full" placeholder="Student Name (Bangla)" />
                            </div> -->
                            <div class="col-12 md:col-6">
                                <label for="student-name-english">Student Name (English) <span style="color: tomato"> * </span></label>
                                <InputText id="student-name-english" v-model="formData.student_name_english" class="w-full" placeholder="Student Name (English)" />
                            </div>
                            <div class="col-12 md:col-6">
                                <label for="student-mobile">Student Mobile No. <span style="color: tomato"> * </span></label>
                                <InputText id="student-mobile" v-model="formData.student_mobile" class="w-full" placeholder="Student Contact" />
                            </div>

                            <div class="col-12 md:col-6">
                                <label for="student-nationality">Nationality <span style="color: tomato"> * </span></label>
                                <InputText id="student-nationality" v-model="formData.nationality" class="w-full" placeholder="Nationality" />
                            </div>

                            <div class="col-12 md:col-6">
                                <label for="student-dob">Date of Birth <span style="color: tomato"> * </span></label>
                                <Calendar id="student-dob" v-model="dateOfBirth" class="w-full" placeholder="Date of Birth" />
                            </div>

                            <div class="col-12 md:col-6">
                                <label for="student-birthReg">NID/Birth Registration </label>
                                <InputText id="student-birthReg" v-model="formData.student_nid_or_birth_no" class="w-full" placeholder="NID or Birth certificate no." />
                            </div>

                            <div class="col-12 md:col-6">
                                <label for="stdGender">Gender <span style="color: tomato"> * </span></label>
                                <Dropdown id="stdGender" :options="genderOpts" v-model="formData.gender" placeholder="Select Gender" class="w-full" />
                            </div>

                            <div class="col-12 md:col-6">
                                <label for="stdReligion">Religion <span style="color: tomato"> * </span></label>
                                <Dropdown id="stdReligion" :options="religionOpts" v-model="formData.religion" placeholder="Select Religion" class="w-full" />
                            </div>

                            <div class="col-12 md:col-6">
                                <label for="stdBlood">Blood Group</label>
                                <Dropdown id="stdBlood" :options="bloodOpts" v-model="formData.blood_group" placeholder="Select Blood Group" class="w-full" />
                            </div>

                            <!-- <div class="col-12 md:col-6">
                                <label for="stdMarriage">Marital Status <span style="color: tomato"> * </span></label>
                                <Dropdown id="stdMarriage" :options="maritalOpts" v-model="formData.merital_status" placeholder="Select Marital Status" class="w-full" />
                            </div> -->
                        </div>

                        <div class="flex align-items-center">
                            <Checkbox v-model="parent_edit" inputId="ingredient3" :binary="true" />
                            <label for="ingredient3" class="ml-2 font-bold"> Parent Information </label>
                        </div>
                        <div class="grid" v-if="parent_edit">
                            <!-- <div class="col-12 md:col-6">
                                <label for="father-name-bangla">Father's Name (Bangla)</label>
                                <InputText id="father-name-bangla" v-model="formData.father_name_bangla" class="w-full" placeholder="Father Name (Bangla)" />
                            </div> -->
                            <div class="col-12 md:col-6">
                                <label for="father-name-english">Father's Name (English) <span style="color: tomato"> * </span></label>
                                <InputText id="father-name-english" v-model="formData.father_name_english" class="w-full" placeholder="Father Name (English)" />
                            </div>

                            <div class="col-12 md:col-6">
                                <label for="father-nid">Father's National ID/Passport No. </label>
                                <InputText id="father-nid" v-model="formData.father_nid" class="w-full" placeholder="Father NID or Passport No." />
                            </div>
                            <div class="col-12 md:col-6">
                                <label for="father-mobile">Father's Mobile No.</label>
                                <InputText id="father-mobile" v-model="formData.father_mobile" class="w-full" placeholder="Father's Contact" />
                            </div>

                            <!-- <div class="col-12 md:col-6">
                                <label for="mother-name-bangla">Mother's Name (Bangla)</label>
                                <InputText id="mother-name-bangla" v-model="formData.mother_name_bangla" class="w-full" placeholder="Mother Name (Bangla)" />
                            </div> -->

                            <div class="col-12 md:col-6">
                                <label for="mother-name-english">Mother's Name (English) <span style="color: tomato"> * </span></label>
                                <InputText id="mother-name-english" v-model="formData.mother_name_english" class="w-full" placeholder="Mother Name (English)" />
                            </div>
                            <div class="col-12 md:col-6">
                                <label for="mother-nid">Mother's National ID/Passport No. </label>
                                <InputText id="mother-nid" v-model="formData.mother_nid" class="w-full" placeholder="Mother NID or Passport No." />
                            </div>
                            <div class="col-12 md:col-6">
                                <label for="mother-mobile">mother's Mobile No.</label>
                                <InputText id="mother-mobile" v-model="formData.mother_mobile" class="w-full" placeholder="Mother's Contact" />
                            </div>
                        </div>

                        <div class="flex align-items-center">
                            <Checkbox v-model="address_edit" inputId="ingredient2" :binary="true" />
                            <label for="ingredient2" class="ml-2 font-bold"> Address Information</label>
                        </div>
                        <div class="w-full" v-if="address_edit">
                            <div class="grid">
                                <!-- Present Address Information -->
                                <div class="col-12 md:col-6">
                                    <legend class="text-primary font-bold">Mailing/Present Address <span style="color: tomato"> * </span></legend>
                                    <br />
                                    <div class="field w-full">
                                        <Textarea id="present-address" v-model="formData.present_address" variant="filled" rows="5" cols="30" class="w-full" placeholder="Address / Village" :disabled="addressSameAsPresent" />
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
                                        <Textarea id="permanent-address" v-model="formData.permanent_address" variant="filled" rows="5" cols="30" class="w-full" placeholder="Permanent Address" :disabled="addressSameAsPresent" />
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
                        </div>

                        <!-- <div class="flex align-items-center">
                            <Checkbox v-model="guardian_edit" inputId="ingredient4" :binary="true" />
                            <label for="ingredient4" class="ml-2 font-bold"> Guardian Information </label>
                        </div>
                        <div class="grid" v-if="guardian_edit">
                            <div class="col-12 md:col-6">
                                <label for="guardian-name">Guardian Name</label>
                                <InputText id="guardian-name" v-model="formData.guardian_name" class="w-full" placeholder="Guardian Name" />
                            </div>
                            <div class="col-12 md:col-6">
                                <label for="guardian-relationship">Relationship</label>
                                <InputText id="guardian-relationship" v-model="formData.guardian_relation" class="w-full" placeholder="Relation with Guardian" />
                            </div>
                            <div class="col-12 md:col-6">
                                <label for="guardian-mobile">Mobile Number</label>
                                <InputText id="guardian-mobile" v-model="formData.guardian_mobile" class="w-full" placeholder="Guardian Contact" />
                            </div>
                            <div class="col-12 md:col-6">
                                <label for="guardian-occupation">Occupation</label>
                                <InputText id="guardian-occupation" v-model="formData.guardian_occupation" class="w-full" placeholder="Guardian Occupation" />
                            </div>

                            <div class="col-12 md:col-6">
                                <label for="guardian-income">Yearly Income</label>
                                <InputNumber inputId="integeronly" id="guardian-income" v-model="formData.guardian_yearly_income" class="w-full" placeholder="Guardian Income (yearly)" />
                            </div>

                            <div class="col-12 md:col-6">
                                <label for="guardian-property">Property</label>
                                <InputText id="guardian-property" v-model="formData.guardian_property" class="w-full" placeholder="Guardian Property" />
                            </div>
                        </div> -->

                        <div class="flex align-items-center" v-if="admissionConfig?.subject_status == 'YES'">
                            <Checkbox v-model="academic_edit" inputId="ingredient6" :binary="true" />
                            <label for="ingredient6" class="ml-2 font-bold"> Accademic Information </label>
                        </div>
                        <div class="grid" v-if="academic_edit">
                            <div class="col-12 md:col-3">
                                <label for="year-session">Year / Session <span style="color: tomato"> * </span></label>
                                <Dropdown
                                    filter
                                    id="permanentPS"
                                    :options="admissionConfig?.details"
                                    v-model="formData.academic_year"
                                    optionLabel="academic_year"
                                    optionValue="academic_year"
                                    placeholder="Select Academic year"
                                    class="w-full capitalize"
                                    :disabled="previewData?.student_data?.academic_year"
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
                                    :options="classOpts.details"
                                    optionLabel="class"
                                    optionValue="class"
                                    placeholder="Select Class"
                                    class="w-full capitalize"
                                    :disabled="!formData.academic_year || previewData?.student_data?.class"
                                >
                                    <template #option="slotProps">
                                        <div class="capitalize">{{ slotProps.option.class }}</div>
                                    </template>
                                </Dropdown>
                            </div>

                            <div class="col-12 md:col-3">
                                <label for="class">Shift <span style="color: tomato"> * </span></label>
                                <Dropdown filter v-model="formData.shift" :options="shiftGroupOpts?.shifts" placeholder="Select Shift" class="w-full capitalize" :disabled="!formData.class || previewData?.student_data?.shift">
                                    <template #option="slotProps">
                                        <div class="capitalize">{{ slotProps.option }}</div>
                                    </template>
                                </Dropdown>
                            </div>
                            <div class="col-12 md:col-3">
                                <label for="class">Group <span style="color: tomato"> * </span></label>
                                <Dropdown filter v-model="formData.group" :options="shiftGroupOpts?.groups" placeholder="Select Group" class="w-full capitalize" :disabled="!formData.shift || previewData?.student_data?.group">
                                    <template #option="slotProps">
                                        <div class="capitalize">{{ slotProps.option }}</div>
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
                                    v-model="formData.groupSubjects"
                                    :options="availableGroupSubjects"
                                    placeholder="Group Subjects"
                                    class="w-full capitalize"
                                    :disabled="!groupSubjOpts"
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
                                    :disabled="!groupSubjOpts"
                                    :selectionLimit="1"
                                >
                                </MultiSelect>
                            </div>
                        </div>

                        <div class="flex align-items-center" v-if="admissionConfig?.academic_info_status == 'YES'">
                            <Checkbox v-model="education_edit" inputId="ingredient7" :binary="true" />
                            <label for="ingredient7" class="ml-2 font-bold"> Education Qualifications </label>
                        </div>
                        <div v-if="education_edit">
                            <div v-for="(qualification, index) in formData.edu_information" :key="index" class="card flex flex-wrap align-items-end">
                                <div class="col-12 md:col-6">
                                    <label for="exam">Exam</label>
                                    <Dropdown v-model="qualification.exam" :options="examNameOpts" placeholder="Select Exam" class="w-full capitalize" :disabled="qualification.exam">
                                        <template #option="slotProps">
                                            <div class="capitalize">{{ slotProps.option }}</div>
                                        </template>
                                    </Dropdown>
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="institute">Board</label>
                                    <Dropdown v-model="qualification.board" :options="boardNameOpts" placeholder="Select Board" class="w-full capitalize">
                                        <template #option="slotProps">
                                            <div class="capitalize">{{ slotProps.option }}</div>
                                        </template>
                                    </Dropdown>
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="institute">Institute</label>
                                    <InputText id="institute" v-model="qualification.institute" class="w-full" placeholder="Institute Name" />
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="institute">Group</label>
                                    <InputText id="institute" v-model="qualification.group" class="w-full" placeholder="Name of the Group/Dept." />
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="institute">Roll</label>
                                    <InputText id="institute" v-model="qualification.roll" class="w-full" placeholder="Enter the Roll" :disabled="qualification.exam" />
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="institute">Registration</label>
                                    <InputText id="institute" v-model="qualification.registration" class="w-full" placeholder="Enter Registration No." />
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="institute">G.P.A</label>
                                    <InputText id="institute" v-model="qualification.gpa" class="w-full" placeholder="Attained G.P.A" />
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="institute">Passing Year</label>
                                    <InputText id="institute" v-model="qualification.passingYear" class="w-full" placeholder="Enter Passing Year" />
                                </div>
                                <div class="col-12 md:col-6">
                                    <Button label="" icon="pi pi-trash" @click="removeQualification(index)" size="small" severity="danger" v-if="index != 0" text />
                                </div>
                            </div>
                            <Button label="Add More" @click="addQualification" icon="pi pi-plus-circle" severity="secondary" size="small" />
                        </div>

                        <!-- <div class="flex align-items-center">
                            <Checkbox v-model="covid_edit" inputId="ingredient5" :binary="true" />
                            <label for="ingredient5" class="ml-2 font-bold"> COVID-19 Vaccine Information </label>
                        </div>
                        <div class="w-full" v-if="covid_edit">
                            <div class="card flex flex-wrap">
                                <div class="col-12 md:col-6">
                                    <label for="vaccinated">Vaccinated?</label>
                                    <Dropdown :options="vaccinatedStatus" v-model="formData.vaccine" placeholder="Select Status" class="w-full" />
                                </div>
                                <div class="col-12 md:col-6">
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
                                    <Button label="Previously Uploaded" severity="secondary" v-if="previewData?.student_data?.vaccine_certificate" icon="pi pi-check-circle" size="small" text disabled />
                                </div>
                            </div>
                        </div> -->

                        <!-- <div class="flex align-items-center">
                            <Checkbox v-model="quota_edit" inputId="ingredient8" :binary="true" />
                            <label for="ingredient8" class="ml-2 font-bold"> Quota Information </label>
                        </div>
                        <div class="w-full" v-if="quota_edit">
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
                            </div>
                        </div> -->

                        <div class="flex align-items-center">
                            <Checkbox v-model="attachment_edit" inputId="ingredient9" :binary="true" />
                            <label for="ingredient9" class="ml-2 font-bold"> Attachment Information </label>
                        </div>
                        <div class="w-full" v-if="attachment_edit">
                            <div class="col-12">
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
                                    v-if="isCropperVisible"
                                />
                                <div class="flex flex-wrap gap-2 align-items-end" v-if="isCropperVisible">
                                    <preview :width="120" :height="120" class="my-2" :image="result.image" :coordinates="result.coordinates" />
                                    <div>
                                        <Button class="mb-2" label="Apply" icon="pi pi-image" @click="isCropperVisible = false" severity="help" size="small" />
                                    </div>
                                </div>
                            </div>
                            <div class="grid">
                                <div class="col-12 md:col-6">
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
                                    <Button label="Previously Uploaded" severity="secondary" v-if="previewData?.student_data?.student_pic" icon="pi pi-check-circle" size="small" text disabled />
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="birth-certificate">Birth Certificate/NID </label>
                                    <FileUpload mode="basic" customUpload @uploader="customUploader('student_birth_nid_file')" @select="onFileSelect($event, 'identity')" class="p-button-sm" chooseLabel="Identity Photo" />
                                    <Button label="Previously Uploaded" severity="secondary" v-if="previewData?.student_data?.student_birth_nid_file" icon="pi pi-check-circle" size="small" text disabled />
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="other-document">Other Document</label>
                                    <FileUpload mode="basic" customUpload @uploader="customUploader('other_file')" @select="onFileSelect($event, 'document')" class="p-button-sm" chooseLabel="Other Document" />
                                    <Button label="Previously Uploaded" severity="secondary" v-if="previewData?.student_data?.other_file" icon="pi pi-check-circle" size="small" text disabled />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="student_edit || parent_edit || address_edit || guardian_edit || academic_edit || education_edit || covid_edit || quota_edit || attachment_edit">
                        <Message severity="warn" class="text-justify" :closable="false" icon="pi pi-warning">
                            I, <b>{{ previewData?.student_data?.student_name_english }}</b
                            >, hereby declare that the above-mentioned information and photo are correct. If any information provided by me is found to be false,
                            <b>{{ admissionConfig?.instiute_details?.institute_name }}, {{ admissionConfig?.instiute_details?.institute_address }}</b> reserves the right to cancel my admission. I shall be obliged to obey the rules and regulations of
                            the relevant Education Board/University as well as <b>{{ admissionConfig?.instiute_details?.institute_name }}, {{ admissionConfig?.instiute_details?.institute_address }}</b> and to pay all the required fees.
                        </Message>
                        <div class="flex align-items-center">
                            <Checkbox v-model="consentState" inputId="agreement" :binary="true" disabled />
                            <label for="agreement" class="ml-2"> I have read and accepted the consent </label>
                        </div>
                    </div>

                    <div class="flex flex-wrap justify-content-end">
                        <Button
                            severity="info"
                            label="Update"
                            :loading="loading"
                            icon="pi pi-sync"
                            :disabled="!student_edit && !parent_edit && !address_edit && !guardian_edit && !academic_edit && !education_edit && !covid_edit && !quota_edit && !attachment_edit"
                            @click="updateApplication"
                        />
                    </div>
                </Dialog>
            </div>
            <div id="student-preview">
                <div>
                    <div class="flex flex-wrap justify-content-around align-items-center">
                        <img :src="`${config.public.BASE_URL}/storage/${previewData?.student_data?.institute?.logo}`" alt="Instiute Logo" style="max-width: 6rem" class="col-2" />
                        <div class="text-center col-8">
                            <h5 class="font-bold m-0">{{ previewData?.student_data?.institute?.institute_name }}</h5>
                            <p class="m-0">{{ previewData?.student_data?.institute?.institute_address }}</p>
                        </div>
                        <img :src="`${config.public.BASE_URL}/storage/${previewData?.student_data?.student_pic}`" alt="student Photo" style="max-width: 6rem" class="col-2" />
                    </div>
                </div>
                <h5 class="text-center success m-0 mb-1"><b>Admission Information</b></h5>
                <table>
                    <caption class="text-left font-bold">
                        Status
                    </caption>
                    <tbody>
                        <tr>
                            <td>Payment Status</td>
                            <td class="capitalize">{{ previewData?.student_data?.approval_status }}</td>
                            <td>
                                <p class="m-0 p-0">Payable Amount</p>
                                <p class="m-0 p-0">
                                    <small>Software Fee: {{ previewData?.software_fee }}</small>
                                </p>
                            </td>
                            <td>{{ totalFee }}</td>
                            <td>Assigned Roll</td>
                            <td class="capitalize">{{ previewData?.student_data?.assigned_roll ?? 'N/A' }}</td>
                        </tr>
                    </tbody>
                </table>

                                <table>
                    <caption class="text-left font-bold">
                        Academic Information
                    </caption>
                    <tbody>
                        <tr>
                            <td>Year/session</td>
                            <td>{{ previewData?.student_data?.academic_year }}</td>
                            
                            <td>Class</td>
                            <td>{{ previewData?.student_data?.class_name }}</td>

                            <td>Institute</td>
                            <td>{{ previewData?.student_data?.institute_name }}</td>
                            
                            <td>Center</td>
                            <td>{{ previewData?.student_data?.center_name }}</td>
                        </tr>
                        <tr v-if="admissionConfig?.subject_status == 'YES'">
                            <td>Subjects</td>
                            <td colspan="7">
                                Compulsory: (
                                <span v-for="subject in parsedSubjects.compulsory" :key="subject"> {{ subject }}, </span>
                                ) Group: (
                                <span v-for="subject in parsedSubjects.group" :key="subject">{{ subject }}, </span>
                                ) Optional: (
                                <span v-for="subject in parsedSubjects.optional" :key="subject">{{ subject }}, </span>
                                )
                            </td>
                        </tr>
                    </tbody>
                </table>


                <table>
                    <caption class="text-left font-bold">
                        Student Information
                    </caption>
                    <tbody>
                        <tr>
                            <td>Application ID</td>
                            <td>{{ previewData?.student_data?.unique_number }}</td>
                            <td>Application Date</td>
                            <td>{{ previewData?.student_data?.date }}</td>
                            <td>Student's Contact</td>
                            <td>{{ previewData?.student_data?.student_mobile }}</td>
                        </tr>
                        <tr>
                            <!-- <td>Name (Bangla)</td>
                            <td>{{ previewData?.student_data?.student_name_bangla }}</td> -->
                            <td>Name (English)</td>
                            <td>{{ previewData?.student_data?.student_name_english }}</td>
                            <td>Nationality</td>
                            <td>{{ previewData?.student_data?.nationality }}</td>
                        </tr>

                        <tr>
                            <td>NID/Birth Certificate No.</td>
                            <td>{{ previewData?.student_data?.student_nid_or_birth_no }}</td>
                            <td>Blood Group</td>
                            <td>{{ previewData?.student_data?.blood_group }}</td>
                            <td>Date of Birth</td>
                            <td>{{ previewData?.student_data?.date_of_birth }}</td>
                        </tr>
                        <tr>
                            <td>Gender</td>
                            <td>{{ previewData?.student_data?.gender }}</td>
                            <!-- <td>Marital Status</td>
                            <td>{{ previewData?.student_data?.merital_status }}</td> -->
                            <td>Religion</td>
                            <td>{{ previewData?.student_data?.religion }}</td>
                        </tr>
                        <tr>
                            <td>Father's Name (English)</td>
                            <td>{{ previewData?.student_data?.father_name_english }}</td>
                            <!-- <td>Father's Name (Bangla)</td>
                            <td>{{ previewData?.student_data?.father_name_bangla }}</td> -->
                            <td>Father's National ID</td>
                            <td>{{ previewData?.student_data?.father_nid }}</td>

                            <td>Father's Contact</td>
                            <td>{{ previewData?.student_data?.father_mobile }}</td>
                        </tr>
                        <tr>
                            <td>Mother's Name (English)</td>
                            <td>{{ previewData?.student_data?.mother_name_english }}</td>
                            <!-- <td>Mother's Name (Bangla)</td>
                            <td>{{ previewData?.student_data?.mother_name_bangla }}</td> -->
                            <td>Mother's National ID</td>
                            <td>{{ previewData?.student_data?.mother_nid }}</td>
                            <td>Mother's Contact</td>
                            <td>{{ previewData?.student_data?.mother_mobile }}</td>
                        </tr>

                        <tr>
                            
                            
                        </tr>
                    </tbody>
                </table>

                <!-- <table>
                    <caption class="text-left font-bold">
                        Applied For
                    </caption>
                    <tbody>
                        <tr>
                            <td>Class</td>
                            <td class="capitalize">{{ previewData?.student_data?.class }}</td>
                            <td>Shift</td>
                            <td class="capitalize">{{ previewData?.student_data?.shift }}</td>
                            <td>Group</td>
                            <td class="capitalize">{{ previewData?.student_data?.group }}</td>
                        </tr>
                    </tbody>
                </table> -->

                <table>
                    <caption class="text-left font-bold">
                        Present Address
                    </caption>
                    <tbody>
                        <tr>
                            <td>Address</td>
                            <td colspan="5">{{ previewData?.student_data?.present_address }}</td>
                        </tr>
                        <tr>
                            <td>Division</td>
                            <td>{{ JSON.parse(previewData?.student_data?.present_division)?.name }}</td>
                            <td>District</td>
                            <td>{{ JSON.parse(previewData?.student_data?.present_district)?.name }}</td>
                            <td>Upazila</td>
                            <td>{{ JSON.parse(previewData?.student_data?.present_upozilla)?.name }}</td>
                        </tr>

                        <tr>
                            <td>Post Office</td>
                            <td>{{ previewData?.student_data?.present_post_office }}</td>
                            <td>Post Code</td>
                            <td>{{ previewData?.student_data?.present_post_code }}</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>

                <table>
                    <caption class="text-left font-bold">
                        Permanent Address
                    </caption>
                    <tbody>
                        <tr>
                            <td>Address</td>
                            <td colspan="5">{{ previewData?.student_data?.permanent_address }}</td>
                        </tr>
                        <tr>
                            <td>Division</td>
                            <td>{{ JSON.parse(previewData?.student_data?.permanent_division)?.name }}</td>
                            <td>District</td>
                            <td>{{ JSON.parse(previewData?.student_data?.permanent_district)?.name }}</td>
                            <td>Upazila</td>
                            <td>{{ JSON.parse(previewData?.student_data?.permanent_upozilla)?.name }}</td>
                        </tr>
                        <tr>
                            <td>Post Office</td>
                            <td>{{ previewData?.student_data?.permanent_post_office }}</td>
                            <td>Post Code</td>
                            <td>{{ previewData?.student_data?.permanent_post_code }}</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>



                <table v-if="admissionConfig?.academic_info_status == 'YES'">
                    <caption class="text-left font-bold">
                        Educational Qualifications
                    </caption>
                    <thead>
                        <tr>
                            <td>Exam</td>
                            <td>Institute</td>
                            <td>Board</td>
                            <td>Group</td>
                            <td>Roll No.</td>
                            <td>Reg. No.</td>
                            <td>GPA</td>
                            <td>Passing Year</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="exam in parsedEduInformation" :key="exam">
                            <td>{{ exam?.exam }}</td>
                            <td>{{ exam?.institute }}</td>
                            <td>{{ exam?.board }}</td>
                            <td>{{ exam?.group }}</td>
                            <td>{{ exam?.roll }}</td>
                            <td>{{ exam?.registration }}</td>
                            <td>{{ exam?.gpa }}</td>
                            <td>{{ exam?.passingYear }}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- <table>
                    <caption class="text-left font-bold">
                        Guardian Information
                    </caption>
                    <tbody>
                        <tr>
                            <td>Name & Relationship</td>
                            <td>{{ previewData?.student_data?.guardian_name }} {{ previewData?.student_data?.guardian_relation ? `(${previewData?.student_data?.guardian_relation})` : '' }}</td>
                            <td>Mobile</td>
                            <td>{{ previewData?.student_data?.guardian_mobile }}</td>

                            <td>Occupation</td>
                            <td>{{ previewData?.student_data?.guardian_occupation }}</td>
                            <td>Yearly Income</td>
                            <td>{{ previewData?.student_data?.guardian_yearly_income }}</td>
                        </tr>
                        <tr>
                            <td>Land Property of Parents</td>
                            <td>{{ previewData?.student_data?.guardian_property }}</td>
                        </tr>
                    </tbody>
                </table> -->

                <!-- <table>
                    <caption class="text-left font-bold">
                        Covid-19 Vaccine Information
                    </caption>
                    <tbody>
                        <tr>
                            <td>Vaccinated?</td>
                            <td>{{ previewData?.student_data?.vaccine ? 'Yes' : 'No' }}</td>
                            <td>Vaccine Name</td>
                            <td>{{ previewData?.student_data?.vaccine ? previewData?.student_data?.vaccine_name : '' }}</td>
                        </tr>
                    </tbody>
                </table> -->

                <!-- <table>
                    <caption class="text-left font-bold">
                        Quota Information
                    </caption>
                    <tbody>
                        <tr>
                            <td>Quota?</td>
                            <td>{{ previewData?.student_data?.quota ? 'Yes' : 'No' }}</td>
                            <td>Quota Name</td>
                            <td>{{ previewData?.student_data?.quota }}</td>
                        </tr>
                    </tbody>
                </table> -->
                
                <table>
                    <caption class="text-left font-bold">
                        Attachments
                    </caption>
                    <tbody>
                        <tr>
                            <td>Student Photo</td>
                            <td>
                                <div class="flex flex-wrap justify-content-start align-items-center">
                                    <i :class="previewData?.student_data?.student_pic ? 'pi pi-check-circle' : 'pi pi-times-circle'" />
                                    <a :href="config.public.BASE_URL + '/storage/' + previewData?.student_data?.student_pic" target="_blank" v-if="previewData?.student_data?.student_pic">
                                        <Button label="show" v-if="previewData?.student_data?.student_pic" link class="no-print" />
                                    </a>
                                </div>
                            </td>

                            <!-- <td>Vaccine Certificate</td>
                            <td>
                                <div class="flex flex-wrap justify-content-start align-items-center">
                                    <i :class="previewData?.student_data?.vaccine_certificate ? 'pi pi-check-circle' : 'pi pi-times-circle'" />
                                    <a :href="config.public.BASE_URL + '/storage/' + previewData?.student_data?.vaccine_certificate" target="_blank" v-if="previewData?.student_data?.vaccine_certificate">
                                        <Button label="show" v-if="previewData?.student_data?.vaccine_certificate" link class="no-print" />
                                    </a>
                                </div>
                            </td> -->
                            
                            <td>Birth Certificate/NID</td>
                            <td>
                                <div class="flex flex-wrap justify-content-start align-items-center">
                                    <i :class="previewData?.student_data?.student_birth_nid_file ? 'pi pi-check-circle' : 'pi pi-times-circle'" />
                                    <a :href="config.public.BASE_URL + '/storage/' + previewData?.student_data?.student_birth_nid_file" target="_blank" v-if="previewData?.student_data?.student_birth_nid_file">
                                        <Button label="show" v-if="previewData?.student_data?.student_birth_nid_file" link class="no-print" />
                                    </a>
                                </div>
                            </td>
                            <td>Optional</td>
                            <td>
                                <div class="flex flex-wrap justify-content-start align-items-center">
                                    <i :class="previewData?.student_data?.other_file ? 'pi pi-check-circle' : 'pi pi-times-circle'" />
                                    <a :href="config.public.BASE_URL + '/storage/' + previewData?.student_data?.other_file" target="_blank" v-if="previewData?.student_data?.other_file">
                                        <Button label="show" v-if="previewData?.student_data?.other_file" link class="no-print" />
                                    </a>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- <table>
                    <tbody>
                        <tr>
                            <td>
                                <b>নিম্নে বর্ণিত কাগজপত্র ভর্তি ফর্মের সাথে সংযুক্ত করতে হবেঃ </b>
                                <ul style="list-style: none; padding: 0; margin: 0">
                                    <li>১। এসএসসি /সমমানের পরীক্ষার রেজিস্ট্রেশন কার্ড, প্রবেশপ্ত্র, প্রসংশাপত্র ও মার্কশীটের ফটোকপি।</li>
                                    <li>২। শিক্ষার্থী জন্ম সনদের ফটোকপি এবং পিতা, মাতার জাতীয় পরিচয় পত্রের ফটোকপি।</li>
                                    <li>৩। কোটায় নির্বাচিত শিক্ষার্থীদের কোটা সংক্রান্ত প্রয়োজনীয় ডকুমেন্ট সংযুক্ত করতে হবে।</li>
                                    <li>৪। সম্প্রতি তোলা ০৪ কপি পাসপোর্ট সাইজের রঙ্গিন ছবি।</li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table> -->

                <div class="declaration">
                    <h5 class="font-bold">Declaration:</h5>
                    <p class="text-justify">
                        I, <b>{{ previewData?.student_data?.student_name_english }}</b
                        >, hereby declare that the above-mentioned information and photo are correct. If any information provided by me is found to be false,
                        <b>{{ admissionConfig?.instiute_details?.institute_name }}, {{ admissionConfig?.instiute_details?.institute_address }}</b> reserves the right to cancel my admission. I shall be obliged to obey the rules and regulations of the
                        relevant Education Board/University as well as <b>{{ admissionConfig?.instiute_details?.institute_name }}, {{ admissionConfig?.instiute_details?.institute_address }}</b> and to pay all the required fees.
                    </p>
                    <!-- <table class="signatures-table">
                        <tr>
                            <td>
                                <p>Guardian Signature</p>
                                <span>{{ previewData?.student_data?.guardianSignature }}</span>
                            </td>
                            <td>
                                <p>Student Signature</p>
                                <span>{{ previewData?.student_data?.studentSignature }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>Signature of Convener</p>
                                <span>{{ previewData?.student_data?.convenerSignature }}</span>
                            </td>
                            <td>
                                <p>Signature of Principal</p>
                                <span>{{ previewData?.student_data?.principalSignature }}</span>
                            </td>
                        </tr>
                    </table> -->
                    <table class="signatures-table" border-all>
                        <tbody >
                            <tr>
                                <td class="text-left">
                                    <p class="text-center">Signature of Principal</p>
                                    <span>{{ previewData?.student_data?.principalSignature }}</span>
                                </td>
                                <td class="text-center">
                                    <!-- <p>Signature of Convener</p>
                                    <span>{{ previewData?.student_data?.convenerSignature }}</span> -->
                                </td>
                                <td class="text-right">
                                    <p class="text-center">Signature of Coordinator</p>
                                    <span>{{ previewData?.student_data?.coordinatorSign }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="w-full text-center" v-else>
            <Button label="Loading . . ." v-if="loading" :loading="loading" text disabled />
            <Message severity="error" :closable="false" v-else><b>Invalid Request</b></Message>
        </div>
    </div>
</template>
<style scoped>
.wrapper {
    /* height: 297mm; */
    margin: 0px auto;
    font-size: 15px;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

table,
th,
td {
    border: 1px solid #000;
}

th,
td {
    padding: 5px;
    text-align: left;
}

.signatures-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    border: none !important;
}

.signatures-table td {
    width: 33.33%;
    vertical-align: baseline;
    border: none !important;
}

.signatures-table p {
    /* width: 70%; */
    margin: 0;
    font-weight: bold;
    border-top: 2px dotted grey;
    margin-top: 60px;
}

.signatures-table span {
    display: block;
}
.cropper {
    width: 300px;
    height: 300px;
}

@media print {
    @page {
        size: legal;
    }

    body {
        width: 100% !important;
        font-size: 12px;
        box-sizing: border-box;
    }

    #student-preview {
        width: 100% !important;
        box-sizing: border-box;
    }

    table {
        width: 100% !important;
        border-collapse: collapse;
        page-break-inside: avoid;
    }

    table,
    th,
    td {
        border: 1px solid gray;
    }

    th,
    td {
        padding: 3px;
        text-align: left;
    }

    .no-print {
        display: none;
    }
}
</style>
