<script setup>
import { postRequest } from '~/utils/request';
const invoiceData = ref(null)
const props = defineProps(['studentIdProps', 'academicYearIdProps']);
onMounted(async () => {
    const { data } = await postRequest('fees-management/fee-collection/quick-collection/view', {
        student_id: props.studentIdProps,
        academic_year_id: props.academicYearIdProps,
    })
    invoiceData.value = data.paymentInvoices
});
</script>

<template>
    <div class="card">
        <DataTable v-if="invoiceData" :value="invoiceData" class="p-datatable-sm">

            <Column header="Payment Date" field="transaction_date">

            </Column>
            <Column header="Invoice Id" field="payment_invoice">

            </Column>
            <Column header="Amount" field="amount">

            </Column>

            <Column header="Download">
                <template #body="{ data }">

                    <QcReport :studentIdProps="props.studentIdProps" :academicYearIdProps="props.academicYearIdProps"
                        :invoiceProps="data.payment_invoice"></QcReport>
                </template>
            </Column>

        </DataTable>

    </div>
</template>~/utils/request