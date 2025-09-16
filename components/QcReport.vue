<script setup>
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from "pdfmake/build/pdfmake"
import { postRequest } from '~/utils/request';
import { ToWords } from 'to-words';
const toWords = new ToWords();
const header = ref(['Fee Head', 'Fee Sub Heads', 'Fee Amount', 'Waiver', "Fine", 'Previous Paid', 'Payment Of'])

const { studentIdProps, academicYearIdProps, invoiceProps } = defineProps(['studentIdProps', 'academicYearIdProps', 'invoiceProps'])

const instituteDetails = ref({})
const reports = ref([])
const mainDetails = ref({})
const feeHead = ref([])
const reportsDetails = ref({
    fee_head: "",
    fee_subhead: [],
    paid_amount: [],
    payable: [],
    paymentDate: '',
    waiver: [],
    due: [],
    fine: [],
    total_amount: [],



})
const finalLogo = ref('')
const logoProxy = ref('')
const finalArray = ref([])
const student_details = ref({})
const hr = ref('')


const total = ref({
    total_payable: [],
    total_paid: [],
    total_due: [],
    total_payment_of: []
})



onMounted(async () => {
    const { data } = await postRequest('fees-management/fee-collection/quick-collection/report-generate', {
        student_id: studentIdProps,
        academic_year_id: academicYearIdProps,
        invoice: invoiceProps
    })
    console.log(data.reports)

    instituteDetails.value = data.instituteDetails
    student_details.value = data.studentDetail

    // logoProxy.value = `https://api.academyims.com/storage/${instituteDetails.value.logo}`

    reports.value = data.reports
    hr.value = data.hr_name
    feeHead.value = reports.value.map(i => i.fee_head)
    feeHead.value = [...new Set(feeHead.value)]
    feeHead.value.forEach(i => {
        mainDetails.value[i] = reportsDetails.value
    })

    reports.value.forEach(i => {
        const md = mainDetails.value[i.fee_head]
        md.fee_head = i.fee_head
        md.due.push(i.due_amount === null ? 0 : parseInt(i.due_amount))
        total.value.total_due.push(i.due_amount === null ? 0 : parseInt(i.due_amount))
        md.fine.push(i.fine === null ? 0 : parseInt(i.fine))
        md.paid_amount.push(parseInt(i.paid_amount))
        total.value.total_paid.push(parseInt(i.paid_amount))
        md.paymentDate = i.payment_date
        md.waiver.push(i.waiver_amount === null ? 0 : parseInt(i.waiver_amount))
        md.payable.push(parseInt(i.payable))
        total.value.total_payable.push(parseInt(i.payable))
        md.fee_subhead.push(i.fee_subhead.toUpperCase())
        md.total_amount.push(parseInt(i.total_amount))
        total.value.total_payment_of.push(parseInt(i.total_amount))
    })

    finalArray.value = Object.values(mainDetails.value)


})




const adder = (i) => {
    return i.reduce((a, b) => {
        return a + b;
    }, 0);
}






const printDocument = () => {
    const newdate = new Date();
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };
    const formattedDate = newdate.toLocaleDateString('en-us', options);

    pdfMake.fonts = {
        globalFont: { normal: 'https://fonts.cdnfonts.com/s/109/DejaVuSerif.woff', bold: 'https://fonts.cdnfonts.com/s/109/DejaVuSerifCondensed-Bold.woff' }
    };
    const pdfTable = document.getElementById('divToPrint')

    const html = htmlToPdfmake(pdfTable.innerHTML, { window: window })

    const documentDefinition = {
        pageSize: {
            width: 595.28,
            height: 'auto'
        },
        content: [
            {
                columns: [
                    // { image: 'snow', width: 70, alignment: 'left' },
                    { text: 'logo' },
                    {
                        alignment: 'center',
                        text: instituteDetails.value.institute_name,
                        bold: true,
                        // margin: [130, 0, 0, 0]



                    },
                    { qr: 'text in QR', fit: '60', alignment: 'right' },
                ]
            },
            {
                alignment: 'center',
                text: instituteDetails.value.institute_address,
                margin: [0, 0, 0, 20]

            },
            {
                alignment: 'center',
                text: "Fee Receipt",
                bold: true


            },
            {
                alignment: 'center',
                text: '--------',
                bold: 'ture'
            },


            {
                alignment: 'justify',
                columns: [
                    {
                        text: [{ text: 'Academic Year :  ', bold: true }, `${student_details.value.academic_year}\n\n`, { text: 'Student ID   :  ', bold: true }, `${student_details.value.custom_student_id}\n\n`, { text: ' Name : ', bold: true }, `${student_details.value.student_name}\n\n`, { text: 'Invoice ID :', bold: true }, invoiceProps]
                    },
                    {
                        text: [
                            { text: 'Academic Session : ', bold: true }, '2022-2023\n\n',
                            { text: 'Roll No : ', bold: true }, `${student_details.value.class_roll}\n\n`,
                            { text: 'Class-Shift-Section : ', bold: true }, `${student_details.value.class_name}-${student_details.value.shift}-${student_details.value.section}\n\n`.toUpperCase(),
                            { text: 'Payment Date : ', bold: true }, reportsDetails.value.paymentDate
                        ]
                    }
                ],
                margin: [0, 20, 0, 20]
            }, html,
            {
                columns: [
                    { text: `Collected By: ${hr.value}`, fontSize: 6, bold: true }
                ]
            }



        ],

        styles: {
            'html-b': {
                bold: true,
            },
            'html-th': {


            },
            'popi': {
                fontSize: 5,
                align: 'justify'
            },
            head: {
                fontSize: 10,
                bold: true
            }
        },
        // images: {
        //     snow: ""
        // },
        defaultStyle: {
            font: 'globalFont',
            fontSize: 9,



        },

    };

    pdfMake.createPdf(documentDefinition).open();
};

</script>

<template>
    <div id="divToPrint" class="flex flex-column justify-content-center  ">


        <table border="2px">

            <tr>
                <th v-for="(i, idx) in header" :key="idx">
                    {{ i }}
                </th>
            </tr>

            <tr v-for="i in finalArray" :key="i.fee_head">
                <td>{{ i.fee_head }}</td>
                <td>{{ i.fee_subhead.toString() }}</td>
                <td>{{ adder(i.payable) }}</td>
                <td>{{ adder(i.waiver) }}</td>
                <td>{{ adder(i.fine) }}</td>
                <td>{{ adder(i.payable) + adder(i.fine) - adder(i.waiver) - adder(i.total_amount) }}</td>
                <td>{{ adder(i.total_amount) }}</td>



            </tr>




            <tr align="center">
                <td colspan="4" rowspan="3">
                    <div><b>Note:</b><br> Cash Recieved</div>

                </td>
                <td colspan="2"><b>Total Payable</b></td>
                <td>{{ adder(total.total_payment_of) }}</td>
            </tr>
            <tr>
                <td rowspan="1" colspan="2"><b>Total Paid</b></td>
                <td rowspan="1">{{ adder(total.total_paid) }}</td>
            </tr>

            <tr>
                <td colspan="2"><b>Due Amount</b></td>
                <td>{{ adder(total.total_due) }}</td>
            </tr>
            <tr>
                <td colspan="7"><b>Paid In Word:</b>{{ toWords.convert(adder(total.total_paid)) }}</td>
            </tr>
            <tfoot>
                <td colspan="7" class="popi">
                    <span>Powered By: Academy-Institute Management System
                        &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;</span>
                    <span align="end">Special Note: This Money Receipt was created on software
                        and is valid without signatureand seal</span>
                </td>

            </tfoot>


        </table>

    </div>
    <Button size="small"  icon="pi pi-download" @click="printDocument" class="my-right"/>
</template>

<style scoped>
table {
    display: none
}

th,
td {
    border: 1px solid black;

}
</style>~/utils/request