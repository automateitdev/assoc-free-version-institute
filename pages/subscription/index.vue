<script setup>
import { postRequest, getRequest } from '~/utils/request';

    definePageMeta({
        layout: false,
        middleware: false
    });

    const checked = ref(true)
    let formErrors = ref([])
    let formData = reactive({
        partner_id : null,
        agreement_date : "2011-09-29",
        validity_date : "2011-09-29",
        duration : null,
        institute_name : "ARS" + Math.random(),
        authority_name : "Shahin",
        authority_designation : "Root",
        authority_mobile : "098",
        telephone : "12345",
        email : "a@mail.com",
        chairman_name : "shahin",
        chairman_mobile : "1234",
        ict_in_charge : "ars",
        ict_in_charge_mobile : "12345",
        address : "Dhaka",
        upazila_thana : "Tejgaon",
        district: "Dhaka",
        division: "Dhaka",
        institute_type: "School",
        education_board: "Dhaka",
        module_list: null,
        student_quantity: 500,
        hr_number_quantity: 100,
        payment_type: "Yearly",
        service_rate: 120,
        institute_domain: null,
        data_submission_date: null,
        tentative_handover_date: null,
        sign_2nd: null
    });
    let router = useRouter();
    async function submitForm() {
     
        if(checked.value){
            try{
                let moduleIds = formData.module_list.map(item => item.id)
                formErrors.value = null;
                console.log(moduleIds);
                let res = await postRequest("subscribe", {
                    "partner_id": formData.partner_id,
                    "agreement_date": formData.agreement_date,
                    "validity_date": formData.validity_date,
                    "duration": "2014-06-26",
                    "institute_name": formData.institute_name,
                    "authority_name": formData.authority_name,
                    "authority_designation": formData.authority_designation,
                    "authority_mobile": formData.authority_mobile,
                    "telephone": formData.telephone,
                    "email": formData.email,
                    "chairman_name": formData.chairman_name,
                    "chairman_mobile": formData.chairman_mobile,
    
                    "ict_in_charge": formData.ict_in_charge,
                    "ict_in_charge_mobile":formData.ict_in_charge_mobile,
                    "address": formData.address,
                    "upazila_thana": formData.upazila_thana,
                    "district":formData.district,
                    "division":formData.division,
                    "institute_type":formData.institute_type,
                    "education_board":formData.education_board,
                    "module_list": moduleIds,
                    "student_quantity": formData.student_quantity,
                    "hr_number_quantity": formData.hr_number_quantity,
                    "payment_type": formData.payment_type,
                    "service_rate":  formData.service_rate,
                    "institute_domain": "qq",
                    "data_submission_date": formData.data_submission_date,
                    "tentative_handover_date": formData.tentative_handover_date,
                    "sign_2nd":"null"
            });

            if(res?.data.success){
                alert("Thanks for application! We will contact with you soon. ");
                router.go(0)
            }
            }catch(err){
                console.log(err);
                formErrors.value = err.response?.data.errors
               
            }
        }
    }

    let modules = ref([])
    onMounted(async () =>{
        let {data:{data}} = await axios.get("module-list");

        modules.value = data
    });


    let partner_key = ref(null);
    let partnerData = reactive({

    });

    async function getPartnerByKey(){

        try {
            if(partner_key.value){
                let {data:{data}} = await getRequest(`fetch-partner-info/${partner_key.value}`);
                partnerData.id = data.id;
                formData.partner_id = data.id;
                partnerData.email = data.email;
                partnerData.name = data.partner_name;
                partnerData.upazila = data.upazila_thana;
                partnerData.phone = data.mobile;
                partnerData.district = data.district;
            }
        } catch (error) {
            console.log(error);
        }
    }
</script>


<template>
    <div style="background: white;">
        <div class="row justify-content-center">
            <div class="col-sm-12 col-md-10">
                <div class="container mt-3">
                    <div class="text-center">
                        <h3 class="text-center"><u>Service Agreement of Academy</u></h3>
                        <p class="text-center">[An Educational Institute Management Software]</p>
                    </div>
                    <div>
                        <ul>
                            <li v-for="error in formErrors" :key="error">
                                <span class="text-danger">{{ error[0] }}</span>
                            </li>
                        </ul>
                    </div>
                    <form action="" @submit.prevent="submitForm">
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-control form-control-sm">Date of Agreement:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="date" class="form-control form-control-sm" v-model="formData.agreement_date">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-control form-control-sm">End of Agreement:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="date" class="form-control form-control-sm" v-model="formData.validity_date">
                            </div>
                        </div>
                        <div class="row gx-0 bg_gray text-center py-1">
                            <div class="col-12">
                                <b>1st Party (Automate IT Limited)</b>
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Partner Code: </label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" @keyup="getPartnerByKey" v-model="partner_key">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Name:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" :value="partnerData.name">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Mobile No.:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" :value="partnerData.phone">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Email:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="email" class="form-control form-control-sm" :value="partnerData.email">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Upazila/Thana:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" :value="partnerData.upazila">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">District:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" :value="partnerData.district">
                            </div>
                        </div>
                        <div class="row gx-0 bg_gray text-center py-1">
                            <div class="col-12">
                                <b>2nd Party (Institute)</b>
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class="mx-2">Name of Institute:</label>
                            </div>
                            <div class="col-sm-12 col-md-9">
                                <input type="text" class="form-control form-control-sm" v-model="formData.institute_name">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class="mx-2">Name of Authority:</label>
                            </div>
                            <div class="col-sm-12 col-md-9">
                                <input type="text" class="form-control form-control-sm" v-model="formData.authority_name">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Designation:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.authority_designation">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Mobile No.:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.authority_mobile">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Telephone:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.telephone">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Email:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="email" class="form-control form-control-sm" v-model="formData.email">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Chairman of Governing Body:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.chairman_name">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Mobile No.:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.chairman_mobile">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">ICT In-charge:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.ict_in_charge">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Mobile No.:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.ict_in_charge_mobile">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Address:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.address">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Upazila/Thana:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.upazila_thana">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">District:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.district">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Division:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.division">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Institute Type:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.institute_type">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Education Board:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.education_board">
                            </div>
                        </div>
                        <div class="row gx-0 bg_gray text-center py-1">
                            <div class="col-12">
                                <b>Price Plan (Package Wise)</b>
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-control form-control-sm">Package</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <select name="" id="" class="form-select form-select-sm">
                                    <option value="">Startup</option>
                                    <option value="">Basic</option>
                                    <option value="">Startup</option>
                                    <option value="">Startup</option>
                                </select>
                            </div>
                            <div class="col-sm-12 col-md-12 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Module List:</label>
                                 <MultiSelect filter v-model="formData.module_list" display="chip" :options="modules" optionLabel="module_name" placeholder="Select Module" class="form-select-sm"/>
                                <!-- <input type="text" class="form-control form-control-sm" v-model="formData.module_list"> -->
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">No. of Student:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="number" class="form-control form-control-sm" v-model="formData.student_quantity">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">No. of Teacher &amp; Stuff:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="number" class="form-control form-control-sm" v-model="formData.hr_number_quantity">
                            </div>
                        </div>
                        <div class="row gx-0 py-1 border border-1 gx-0">
                            <div class="col-12">
                                <span class="d-block px-2">Note: Minimum no. of students should be 300 by default. Even if,
                                    no. of student
                                    go down, it will actually be counted as
                                    300.</span>
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-control form-control-sm">Payment Type:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <select name="" id="" class="form-select form-select-sm" v-model="formData.payment_type">
                                    <option value="Monthly">Monthly</option>
                                    <option value="Yearly" selected>Yearly</option>
                                    <option value="Half">Half</option>
                                </select>
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Service Charge:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm" v-model="formData.service_rate">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Total Service Charge:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <input type="text" class="form-control form-control-sm">
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Domain/Hosting Renew Charge:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Registration Charge:</label>
                            </div>
                            <div class="col-sm-12 col-md-3">
                                <input type="text" class="form-control form-control-sm">
                            </div>
                        </div>
                        <div class="row border border-1 gx-0">
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Last date of data Submission:
                                    (2nd party will provide to the 1st party):</label>
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center">
                                <input type="date" class="form-control form-control-sm" v-model="formData.data_submission_date">
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center ">
                                <label for="" class=" form-contro form-control-sm">Handover Date:
                                    (1st Party will Provide to the 2nd Party):</label>
                            </div>
                            <div class="col-sm-12 col-md-3 align-self-center">
                                <input type="date" class="form-control form-control-sm" v-model="formData.tentative_handover_date">
                            </div>
                        </div>
                       
                        <p class="rules">১ম পক্ষের প্রস্তাবনায় সম্মত হয়ে ২য় পক্ষ ১ম পক্ষের অনলাইন ভিত্তিক শিক্ষা প্রতিষ্ঠান
                            ব্যবস্থাপনা সফটওয়্যার
                            (একাডেমী-ইন্সটিটিউট ম্যানেজমেন্ট সিস্টেম) এর পরিপুর্ণভাবে প্রেজেন্টেশন দেখে, একে অন্যের সকল
                            বিষয়াবলীর মর্ম
                            উপলব্ধি করে
                            ১ম ও ২য় পক্ষ একে অপরের সাথে নিম্নলিখিত চুক্তির ভিত্তিতে অনলাইন ভিত্তিক শিক্ষা প্রতিষ্ঠান
                            ব্যবস্থাপনা
                            সফটওয়্যার
                            (একাডেমী-ইন্সটিটিউট ম্যানেজমেন্ট সিস্টেম) ব্যবহারের চুক্তিনামা সম্পাদন করছি।
                        </p>
                        <p class="rules">[By agreeing to the proposal of the 1st party, the 2nd party having thoroughly
                            reviewed the
                            presentation of the 1st
                            party's Online Based Educational Institution Management Software (Academy-Institute Management
                            System),
                            understanding
                            each other's content, the 1st and the 2nd party enter into the following agreement with each
                            other on the
                            basis of the
                            following agreement. (Academy-Institute Management System) User Agreement.]
                        </p>
                        <!-- <h4 class="text-center mt-2"><u><b>শর্তাবলী</b></u></h4>
                         <p class="text-center"><b>Terms and Conditions</b></p> -->
                        <div class="my-2">
                            <input type="checkbox" class="" v-model="checked" @click="!checked"> <span>Agreed  <nuxt-link to="/subscription/rules" class="btn btn-link">Terms and
                                        Conditions.</nuxt-link> </span>
                        </div>
                       
                        <div class="my-2">
                            <button class="btn btn-sm btn-success">Submit</button>
                        </div>
                        <br><br><br><br><br><br>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>


<style lang="scss" scoped>
label {
    font-weight: bold;
}

.bg_gray {
    background-color: #C8DAF9;
}


/* input{
    border-top: 0!important;
    border-bottom: 0 !important;
} */

.row {
    margin-bottom: 1.5px;
}

.form-control,
.form-select {
    border-radius: 0;
    /* border-top: 0;
    border-bottom: 0; */
}

p.rules {
    text-align: justify;
    font-family: 'Noto Sans Bengali', sans-serif;
}

.text_white {
    color: #fff;
}

.text_black {
    color: #111;
}
</style>~/utils/request