<script setup>
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAdmissionApplicationStore } from '~/stores/admissionApplication';
import { useRuntimeConfig } from 'nuxt/app';
import QrcodeVue from 'qrcode.vue';

const route = useRoute();
const config = useRuntimeConfig();
const { invoiceData } = storeToRefs(useAdmissionApplicationStore());
const { fetchPaymentInvoice } = useAdmissionApplicationStore();

const applicantNumber = ref(null);
const qrCodeValue = ref(null);
const loading = ref(false);

// Unified logic to load invoice
const loadInvoice = async () => {
    const slip = route.params.slip;
    if (!slip) return;

    loading.value = true;
    applicantNumber.value = slip;

    try {
        await fetchPaymentInvoice(slip);
        qrCodeValue.value = `${config.public.FRONTEND_URL}/application/payment/${slip}`;
    } catch (error) {
        console.error('Failed to fetch invoice:', error);
    } finally {
        loading.value = false;
    }
};

// Watch for changes in route param
watch(
    () => route.params.slip,
    async (slip) => {
        if (slip) await loadInvoice();
    },
    { immediate: true }
);

// Also reload invoice when visibility changes (e.g. tab switch)
useVisibilityChange(() => {
    loadInvoice();
});

const printInvoice = () => {
    const printContents = document.getElementById('paymentSlip').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents; // Restore original content
};

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${day}, ${month} ${year}`;
}

definePageMeta({
    layout: false
});
</script>

<template>
    <Toast />
    <div class="mx-auto" style="min-width: 600px; max-width: 900px" :loading="loading">
        <div class="card my-2" v-if="invoiceData">
            <h3 class="font-bold text-center text-primary">Payment Slip</h3>
            <div class="grid gap-2 justify-content-center align-items-center">
                <a :href="`/application/preview/${applicantNumber}`">
                    <Button label="Preview" size="small" icon="pi pi-arrow-left" severity="help"></Button>
                </a>
                <Button label="Print" size="small" icon="pi pi-print" severity="secondary" @click="printInvoice"></Button>
            </div>
        </div>
        <Card v-if="invoiceData?.student_data?.approval_status == 'Success'" id="paymentSlip">
            <template #title></template>
            <template #content>
                <div class="receipt-container">
                    <div class="grid justify-content-between my-3 text-center">
                        <div class="col-2">
                            <!-- <qrcode-vue :value="qrCodeValue" :size="100"></qrcode-vue> -->
                        </div>
                        <div class="col-6">
                            <h5 class="font-bold m-0">{{ invoiceData?.student_data?.institute?.institute_name }}</h5>
                            <p class="m-0">{{ invoiceData?.student_data?.institute?.institute_address }}</p>
                            <div class="my-2">
                                <Button :label="`INVOICE : ${invoiceData?.student_data?.unique_number}`" severity="secondary" outlined></Button>
                            </div>
                            <p class="font-bold">PAID AT: {{ formatDate(invoiceData?.student_data?.date) }}</p>
                        </div>
                        <div class="col-2">
                            <qrcode-vue :value="qrCodeValue" :size="80" class="qrcode" render-as="svg" />
                        </div>
                    </div>
                    <table style="border: none">
                        <tbody style="border: none">
                            <tr style="border: none">
                                <th style="border: none">Assigned Roll :</th>
                                <td style="border: none">{{ invoiceData?.student_data?.assigned_roll ?? 'N/A' }}</td>
                                <th style="border: none">Applicant ID :</th>
                                <td style="border: none">{{ invoiceData?.student_data?.unique_number }}</td>
                                <th style="border: none">Academic Year :</th>
                                <td style="border: none">{{ invoiceData?.student_data?.academic_year }}</td>
                            </tr>
                            <tr style="border: none">
                                <th style="border: none">Student Name :</th>
                                <td style="border: none">{{ invoiceData?.student_data?.student_name_english }}</td>
                                <th style="border: none">Class :</th>
                                <td style="border: none" class="capitalize">{{ invoiceData?.student_data?.class_name }}</td>
                            </tr>
                            <tr style="border: none">
                                <th style="border: none">Institute:</th>
                                <td style="border: none">{{ invoiceData?.student_data?.institute_name }}</td>

                                <th style="border: none">Center :</th>
                                <td style="border: none" class="capitalize">{{ invoiceData?.student_data?.center_name }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table>
                        <tbody>
                            <tr>
                                <th rowspan="2">Online Fees Payment</th>
                                <th>Payable Amount</th>
                                <td>{{ invoiceData?.student_data?.amount }}</td>
                            </tr>
                            <tr>
                                <th>Paid Amount</th>
                                <td>{{ invoiceData?.student_data?.amount }}</td>
                            </tr>
                            <!-- <tr>
                                <td>Paid In Words:</td>
                                <td colspan="3">{{converter(invoiceData?.student_data?.amount)}}</td>
                            </tr> -->
                            <tr>
                                <td>
                                    <small>Powered By: {{ config.public.FRONTEND_URL }}</small>
                                </td>
                                <td colspan="3" style="text-align: right">
                                    <small>*This Money Receipt was created on a software and is valid without signature and seal</small>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </Card>
        <div class="text-center" v-else>
            <Button label="Loading . . ." v-if="loading" :loading="loading" class="mx-auto" text disabled />
            <Message severity="warn" :closable="false" v-else>No payment slip found!</Message>
        </div>
    </div>
</template>
<style scoped>
#paymentSlip {
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
