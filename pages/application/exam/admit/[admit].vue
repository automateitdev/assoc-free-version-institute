<script setup>
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAdmissionApplicationStore } from '~/stores/admissionApplication';
import { useRuntimeConfig } from 'nuxt/app';
import QrcodeVue from 'qrcode.vue';

const route = useRoute();
const config = useRuntimeConfig();
const { admitData } = storeToRefs(useAdmissionApplicationStore());
const { fetchExamAdmit } = useAdmissionApplicationStore();
const applicantNumber = ref(null);
const qrCodeValue = ref(null);
const currentLink = ref();
onMounted(async () => {
    applicantNumber.value = route.params.admit;
    await fetchExamAdmit(route.params.admit);
    qrCodeValue.value = `${config.public.FRONTEND_URL}/application/payment/${route.params.admit}`;
    currentLink.value = window.location.href;
});

useVisibilityChange(async () => {
    applicantNumber.value = route.params.admit;
    await fetchExamAdmit(route.params.admit);
    // qrCodeValue.value = `${config.public.FRONTEND_URL}/application/payment/${route.params.admit}`;
});

const printInvoice = () => {
    const printContents = document.getElementById('paymentadmit').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents; // Restore original content
};

function formatDateUTCPlus6(timestamp) {
    const date = new Date(timestamp);

    // Adjust for UTC+6
    const adjustedDate = new Date(date.getTime() + 6 * 60 * 60 * 1000);

    const day = adjustedDate.getUTCDate().toString().padStart(2, '0');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[adjustedDate.getUTCMonth()];
    const year = adjustedDate.getUTCFullYear();

    let hours = adjustedDate.getUTCHours();
    const minutes = adjustedDate.getUTCMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert to 12-hour format

    return `${day} ${month} ${year}, ${hours}:${minutes} ${period}`;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);

    // Adjust for UTC+6
    const adjustedDate = new Date(date.getTime() + 6 * 60 * 60 * 1000);

    const day = adjustedDate.getUTCDate().toString().padStart(2, '0');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[adjustedDate.getUTCMonth()];
    const year = adjustedDate.getUTCFullYear();

    let hours = adjustedDate.getUTCHours();
    const minutes = adjustedDate.getUTCMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert to 12-hour format

    return `${day} ${month} ${year}`;
}

definePageMeta({
    layout: false
});
</script>

<template>
    <Toast />
    <div class="mx-auto" style="min-width: 800px; max-width: 900px" :loading="loading">
        <div class="card my-2" v-if="admitData">
            <h3 class="font-bold text-center text-primary">Admit For: {{ admitData?.admission_setup?.heading }}</h3>
            <div class="grid gap-2 justify-content-center align-items-center">
                <a :href="`/application/preview/${applicantNumber}`">
                    <Button label="Preview" size="small" icon="pi pi-arrow-left" severity="help"></Button>
                </a>
                <Button label="Print" size="small" icon="pi pi-print" severity="secondary" @click="printInvoice"></Button>
            </div>
        </div>
        <Card v-if="admitData?.student_data?.approval_status == 'Success'" id="paymentadmit">
            <template #title></template>
            <template #content>
                <div class="receipt-container">
                    <div class="flex flex-wrap justify-content-around align-items-center">
                        <img :src="`${config.public.BASE_URL}/storage/${admitData?.student_data?.institute?.logo}`" alt="Instiute Logo" style="max-width: 6rem" class="col-2" />
                        <div class="text-center col-8">
                            <h5 class="font-bold m-0">{{ admitData?.student_data?.institute?.institute_name }}</h5>
                            <p class="m-0">{{ admitData?.student_data?.institute?.institute_address }}</p>
                        </div>
                        <img :src="`${config.public.BASE_URL}/storage/${admitData?.student_data?.student_pic}`" alt="student Photo" style="max-width: 6rem" class="col-2" />
                    </div>
                    <div class="my-2 text-center">
                        <!-- <Button severity="success" :label="`${admitData?.admission_setup?.heading}`" class="font-bold border-2 mx-auto mb-2" size="small"></Button> -->
                        <Button severity="success" label="Admit Card" class="font-bold border-2 mx-auto mb-2" size="small"></Button>
                        <h6 class="font-bold m-0 text-center capitalize">{{ admitData?.admission_setup?.heading }}</h6>
                        <h6 class="font-bold m-0 text-center capitalize">Institute: {{ admitData?.student_data?.institute_name }}</h6>
                    </div>
                    <div class="grid justify-content-between">
                        <p class="p-2 m-0 text-center">Center: {{ admitData?.admission_payment?.center_name }}</p>
                        <p class="p-2 m-0 text-center">Exam At: {{ formatDateUTCPlus6(admitData?.admission_payment?.exam_date_time) }}</p>
                    </div>
                    <!-- <div class="col-2">
                            <qrcode-vue :value="qrCodeValue" :size="80" class="qrcode" render-as="svg" />
                        </div> -->
                    <table>
                        <tbody>
                            <tr>
                                <th>Applicant ID :</th>
                                <td>{{ admitData?.student_data?.unique_number }}</td>

                                <th>Academic Year :</th>
                                <td>{{ admitData?.student_data?.academic_year }}</td>
                            </tr>
                            <tr>
                                <th>Applicant's Name :</th>
                                <td>{{ admitData?.student_data?.student_name_english }}</td>
                                <th>Date of Birth :</th>
                                <td>{{ formatDate(admitData?.student_data?.date_of_birth) }}</td>
                            </tr>
                            <tr>
                                <th>Father's Name :</th>
                                <td>{{ admitData?.student_data?.father_name_english }}</td>
                                <th>Mother's Name :</th>
                                <td>{{ admitData?.student_data?.mother_name_english }}</td>
                            </tr>
                            <tr>
                                <th>Class :</th>
                                <td class="capitalize">{{ admitData?.student_data?.class_name }}</td>
                                <th>Roll :</th>
                                <td>{{ admitData?.student_data?.assigned_roll ?? 'N/A' }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p>
                        <small
                            >*This admit card was generated via: <a :href="currentLink"> {{ currentLink }}</a></small
                        >
                    </p>
                    <!-- <table>
                        <tbody>
                            <tr>
                                <th rowspan="2">Online Fees Payment</th>
                                <th>Payable Amount</th>
                                <td>{{ admitData?.student_data?.amount }}</td>
                            </tr>
                            <tr>
                                <th>Paid Amount</th>
                                <td>{{ admitData?.student_data?.amount }}</td>
                            </tr>
                            <tr>
                                <td>
                                    <small>Powered By: {{ config.public.FRONTEND_URL }}</small>
                                </td>
                                <td colspan="3" style="text-align: right">
                                    <small>*This Money Receipt was created on a software and is valid without signature and seal</small>
                                </td>
                            </tr>
                        </tbody>
                    </table> -->
                </div>
            </template>
        </Card>
        <div class="text-center" v-else>
            <Button label="Loading . . ." v-if="loading" :loading="loading" class="mx-auto" text disabled />
            <Message severity="warn" :closable="false" v-else>No admit found for the applicant!</Message>
        </div>
    </div>
</template>
<style scoped>
#paymentadmit {
    /* background-color: #f0fff0; */
    background-color: white;
}
table {
    background-color: transparent;
    width: 100% !important;
    border-collapse: collapse;
    page-break-inside: avoid;
}

table,
th,
tr,
td {
    background-color: transparent;
    border: 1px solid black;
}

th,
td {
    padding: 5px;
    text-align: left;
}

.no-print {
    display: none;
}

.receipt-container {
    width: 100%;
    margin: auto;
    padding: 16px;
    /* background-color: #f0fff0; */
    background-color: #fff;
}

.qrcode {
    margin-top: 16px;
}
@media print {
    .qrcode {
        display: block;
        width: 100px;
        height: 100px;
        margin-top: 16px;
        margin-left: auto;
        margin-right: auto;
    }
    .qrcode {
        display: block !important;
        visibility: visible !important;
    }
}
</style>
