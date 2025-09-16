<script setup>
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { Cropper } from 'vue-advanced-cropper';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import 'vue-advanced-cropper/dist/style.css';
const { authorizedUser } = useAuthStore();
const { isAuthenticated, user } = storeToRefs(useAuthStore());

const message = ref('');
const toast = useToast();
const mode = ref(false);
const logo = ref('');
const logoProxy = ref(null);
const presentData = ref('');
const presentId = ref('');
const submit_processing = ref(false);
// const formElements = ref('');
const formData = reactive({
    institute_id: '',
    institute_name: '',
    institute_contact: '',
    institute_email: '',
    institute_address: '',
    institute_district: '',
    institute_upozilla: ''
});
const cropperRef = ref('');
const visibleCropper = ref(false);
const setImage = ref(true);
const chooseFileMode = ref('');

onMounted(async () => {
    let { data } = await axios.get('/institute-information/index');
    presentData.value = data.payload.data.instituteDetails;
    presentId.value = presentData.value.institute_id;

    formData.institute_id = presentData.value.institute_id;
    formData.institute_name = presentData.value.institute_name;
    formData.institute_contact = presentData.value.institute_contact;
    formData.institute_email = presentData.value.institute_email;
    formData.institute_address = presentData.value.institute_address;
    formData.institute_district = presentData.value.institute_district;
    formData.institute_upozilla = presentData.value.institute_upozilla;

    // const commonMargin = '8px 0 8px 0';
    // const commonWidth = '';
    // const formElementsDraft = [
    //     {
    //         $formkit: 'primeInputText',
    //         name: 'institute_name',
    //         label: 'Institute Name',
    //         value: presentData.value.institute_name,
    //         style: { margin: commonMargin, width: '70%' }
    //     },
    //     {
    //         $formkit: 'primeInputText',
    //         name: 'institute_ein',
    //         label: 'Institute EIN',
    //         value: presentData.value.institute_ein,
    //         style: { margin: commonMargin, width: '70%' }
    //     },
    //     {
    //         $formkit: 'primeInputText',
    //         name: 'institute_contact',
    //         label: 'Institute Contact',
    //         value: presentData.value.institute_contact,
    //         style: { margin: commonMargin, width: '70%' }
    //     },
    //     {
    //         $formkit: 'primeInputText',
    //         name: 'institute_email',
    //         label: 'Institute Email',

    //         value: presentData.value.institute_email,
    //         style: { margin: commonMargin, width: '70%' }
    //     },
    //     {
    //         $formkit: 'primeInputText',
    //         name: 'institute_category',
    //         label: 'Institute Category',
    //         value: presentData.value.institute_category,
    //         style: { margin: commonMargin, width: '70%' }
    //     },

    //     {
    //         $formkit: 'primeInputText',
    //         name: 'institute_type',
    //         label: 'Institute Type',
    //         value: presentData.value.institute_type,
    //         style: { margin: commonMargin, width: '70%' }
    //     },
    //     {
    //         $formkit: 'primeInputText',
    //         name: 'institute_board',
    //         label: 'Institute Board',
    //         value: presentData.value.institute_board,
    //         style: { margin: commonMargin, width: '70%' }
    //     },

    //     {
    //         $formkit: 'primeInputText',
    //         name: 'institute_address',
    //         label: 'Institute Adress',
    //         value: presentData.value.institute_address,
    //         style: { margin: commonMargin, width: '70%' }
    //     },
    //     {
    //         $formkit: 'primeInputText',
    //         name: 'institute_district',
    //         label: 'Institute District',
    //         value: presentData.value.institute_district,
    //         style: { margin: commonMargin, width: '70%' }
    //     },

    //     {
    //         $formkit: 'primeInputText',
    //         name: 'institute_sub_distric',
    //         label: 'Institute Sub District',
    //         value: presentData.value.institute_sub_distric,
    //         style: { margin: commonMargin, width: '70%' }
    //     },
    //     {
    //         $formkit: 'primeInputText',
    //         name: 'institute_division',
    //         label: 'Institute Division',
    //         value: presentData.value.institute_division,
    //         style: { margin: commonMargin, width: '70%' }
    //     }
    // ];
    // logoProxy.value = `https://api.academyims.com/storage/${presentData.value.logo}`;
    // formElements.value = formElementsDraft;
    if (logoProxy !== null) {
        chooseFileMode.value = 'Select';
    } else {
        chooseFileMode.value = 'Edit';
    }
});
const onFinaleUpload = () => {
    const { image, canvas } = cropperRef.value.getResult();
    logoProxy.value = canvas.toDataURL();
    canvas.toBlob((blob) => {
        console.log(blob);
        const timestamp = new Date().getTime();
        const fileName = `${timestamp}_${presentId.value}.jpg`;

        // Set the desired file name
        const file = new File([blob], fileName, {
            type: blob.type
        });

        console.log(file);

        // Object.assign(blob, image);
        logo.value = file;
        // console.log(blob);
    });
    visibleCropper.value = true;
    setImage.value = true;
    showSuccess('Cropped and Uploaded sucessfully');
};
const onUpload = ($event) => {
    console.log($event.files[0]);
    logo.value = $event.files[0].objectURL;
    console.log(logo.value);
    setImage.value = false;
    visibleCropper.value = false;
};

const showSuccess = (update) => {
    toast.add({ severity: 'success', summary: 'Success', detail: update, life: 3000 });
};
const showError = (toastData) => {
    toast.add({ severity: 'error', summary: 'Error Message', detail: 'Message Content', life: 3000 });
};
async function submit() {
    submit_processing.value = true;
    
    try {
        const { data } = await axios.post(`institute-information/update/${presentData.value.id}`, formData);
        
        if (data.payload.data.status == 'success') {
            showSuccess(data.payload.data.message);
            message.value = data.payload.data.message;
        } else {
            showError(data.payload.data.message || 'Server Error');
            message.value = data.payload.data.message || 'Server Error';
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showError('An unexpected error occurred. Please try again later.');
        message.value = 'An unexpected error occurred. Please try again later.';
    } finally {
        submit_processing.value = false;
    }

    mode.value = true;
}

//  visibility hook
useVisibilityChange(async () => {
    let { data } = await axios.get('/institute-information/index');
    presentData.value = data.payload.data.instituteDetails;
    presentId.value = presentData.value.institute_id;

    formData.institute_id = presentData.value.institute_id;
    formData.institute_name = presentData.value.institute_name;
    formData.institute_contact = presentData.value.institute_contact;
    formData.institute_email = presentData.value.institute_email;
    formData.institute_address = presentData.value.institute_address;
    formData.institute_district = presentData.value.institute_district;
    formData.institute_upozilla = presentData.value.institute_upozilla;

    if (logoProxy !== null) {
        chooseFileMode.value = 'Select';
    } else {
        chooseFileMode.value = 'Edit';
    }
});

</script>

<template>
    <Toast />
    <div class="grid">
        <!-- <div class="md:col-4">
            <div class="card">
                <div class="">
                    <div class="">
                        <cropper v-if="!visibleCropper" ref="cropperRef" class="cropper" :auto-zoom="true" @change="change" :src="logo" />
                        <div v-if="setImage" class="img-container">
                            <img class="object-cover" :src="logoProxy" />
                        </div>
                        <Button v-if="!visibleCropper" class="mt-4" @click="onFinaleUpload" icon="pi pi-upload" label="Upload" size="small"></Button>
                    </div>
                </div>
                <div v-if="visibleCropper" class="card border-none flex justify-content-center">
                    <Toast />
                    <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" :maxFileSize="1000000" @upload="onUpload($event)" :auto="true" chooseLabel="Browse" />
                </div>
            </div>
        </div> -->
        <div class="md:col-6">
            <div class="card">
                <h4 class="font-bold">Update Institute Detail</h4>
                <div class="grid">
                    <div class="col-12 md:col-4">
                        <label for="institute_id" class="font-bold block mb-2">Institute ID <span style="color: tomato">*</span></label>
                        <InputText class="w-full" v-model="formData.institute_id" placeholder="Institute ID" :disabled="true"/>
                    </div>

                    <div class="col-12 md:col-8">
                        <label for="institute_id" class="font-bold block mb-2">Institute Name <span style="color: tomato">*</span></label>
                        <InputText class="w-full" v-model="formData.institute_name" placeholder="Institute ID" :disabled="true"/>
                    </div>

                    <div class="col-12 md:col-4">
                        <label for="mobile" class="font-bold block mb-2">Contact <span style="color: tomato">*</span></label>
                        <InputMask class="w-full" id="mobile" v-model="formData.institute_contact" mask="+8809999999999" placeholder="+8801234567890" :disabled="true"/>
                    </div>

                    <div class="col-12 md:col-8">
                        <label for="name" class="font-bold block mb-2">Email Address <span style="color: tomato">*</span></label>
                        <InputText class="w-full" v-model="formData.institute_email" placeholder="Institute Email Address" :disabled="true"/>
                    </div>

                    <div class="col-12 md:col-6">
                        <label for="district" class="font-bold block mb-2">District <span style="color: tomato">*</span></label>
                        <InputText class="w-full" v-model="formData.institute_district" placeholder="District" />
                    </div>

                    <div class="col-12 md:col-6">
                        <label for="upozilla" class="font-bold block mb-2">Upazila <span style="color: tomato">*</span></label>
                        <InputText class="w-full" v-model="formData.institute_upozilla" placeholder="Upazila" />
                    </div>

                    <div class="col-12">
                        <label for="address" class="font-bold block mb-2">Address <span style="color: tomato">*</span></label>
                        <!-- <InputText class="w-full" v-model="formData.institute_address" placeholder="Institute Full Address" /> -->
                        <Textarea v-model="formData.institute_address" variant="filled" rows="5" cols="30" class="w-full" placeholder="Institute Full Address"/>
                    </div>
                </div>

                <Button label="Update" icon="pi pi-sync" class="mt-4" size="small" @click="submit" :loading="submit_processing"></Button>
            </div>
        </div>

    </div>
</template>

<style scoped>
.cropper {
    width: 300px;
    height: 150px;
}

input {
    margin: 5px;
}

.img-container {
    width: 300px;
    /* Set the width of the container */
    height: 200px;
    /* Set the height of the container */
    overflow: hidden;
    /* Hide any overflow beyond the container */
    margin: 8px;
    /* Set the object-fit property */
    object-fit: cover;
    /* or contain, fill, scale-down, none */
}

.img-container img {
    width: 100%;
    /* Make the image fill the container horizontally */
    height: 100%;
    /* Make the image fill the container vertically */
    object-fit: inherit;
    /* Inherit the object-fit property from the container */
}
</style>
