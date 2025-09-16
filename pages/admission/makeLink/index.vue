<script setup>
import useVisibilityChange from '~/composables/useVisibilityChange';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useClipboard } from '@vueuse/core';

// Pinia store
import { storeToRefs } from 'pinia';
import { useAdmissionStore } from '~/stores/admission';
const { admissionLink, loading } = storeToRefs(useAdmissionStore());

//
const { fetchadmissionLink, add_link, updateAdmissionLink } = useAdmissionStore();

const toast = useToast();
const confirm = useConfirm();

// Mounted hook
onMounted(async () => {
    await fetchadmissionLink();
});
//  visibility hook
useVisibilityChange(async () => {
    await fetchadmissionLink();
});

const formEnabled = ref(null);
const currentlyActive = ref(null);

const formData = reactive({
    enabled: 'NO',
    heading: null,
    form: 'NO',
    subject: 'NO',
    academic_info: 'NO'
});

// Watch for changes in currentlyActive and update formData.enabled
watch(currentlyActive, (newVal) => {
    formData.enabled = newVal ? 'YES' : 'NO';
});

// Watch for changes in formEnabled and update formData.form
watch(formEnabled, (newVal) => {
    formData.form = newVal ? 'YES' : 'NO';
});

const linkEnabled = ref(null);
const subjectEnabled = ref(null);
const acinfoEnabled = ref(null);
const formActive = ref(null);

watch(admissionLink, (newVal) => {
    linkEnabled.value = newVal.enabled == 'YES' ?? false;
    subjectEnabled.value = newVal.subject == 'YES' ?? false;
    acinfoEnabled.value = newVal.academic_info == 'YES' ?? false;
});

// Watch for changes in currentlyActive and update formData.enabled
watch(linkEnabled, (newVal) => {
    admissionLink.value.enabled = newVal ? 'YES' : 'NO';
});

watch(subjectEnabled, (newVal) => {
    admissionLink.value.subject = newVal ? 'YES' : 'NO';
});

watch(acinfoEnabled, (newVal) => {
    admissionLink.value.academic_info = newVal ? 'YES' : 'NO';
});

// Watch for changes in formEnabled and update formData.form
watch(formActive, (newVal) => {
    console.log(newVal);
    admissionLink.value.form = newVal ? 'YES' : 'NO';
});

async function submitLink() {
    try {
        const { status, message, error } = await add_link(formData);
        if (status === 'success') {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    } finally {
        await fetchadmissionLink();
    }
}

async function updatetLink() {
    try {
        console.log(admissionLink)
        const { status, message, error } = await updateAdmissionLink(admissionLink.value);
        if (status === 'success') {
            toast.add({ severity: 'success', summary: 'Success Message', detail: message, group: 'br', life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error Message', detail: error, group: 'br', life: 5000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error Message', detail: 'An unexpected error occured!', group: 'br', life: 5000 });
    } finally {
        await fetchadmissionLink();
    }
}
const { copy, copied, isSupported } = useClipboard();
</script>
<template>
    <Toast position="bottom-right" group="br" />
    <div class="card" v-if="!admissionLink.admission_link">
        <div class="grid gap-2 align-items-end">
            <div>
                <label for="headingAdmission">Admission Heading</label>
                <InputText v-model="formData.heading" required id="headingAdmission" placeholder="Admission Heading" class="w-full mr-2" />
            </div>

            <div>
                <label for="store_id">Enable Form</label>
                <ToggleButton v-model="formEnabled" onIcon="pi pi-check" offIcon="pi pi-times" :invalid="!checked" aria-label="Confirmation" size="small" class="w-full" />
            </div>

            <div>
                <label for="store_id">Activate</label>
                <ToggleButton v-model="currentlyActive" onLabel="On" offLabel="Off" class="w-full" />
            </div>

            <div>
                <Button label="Save" icon="pi pi-check-circle" :loading="loading" @click="submitLink" />
            </div>
        </div>
    </div>
    <div class="card" style="max-width: 600px" v-else>
        <h5 class="font-bold text-primary">Admission Link Information</h5>
        <div class="grid">
            <div v-if="isSupported" class="text-center">
                <Button @click="copy(admissionLink.admission_link)" :icon="copied ? 'pi pi-check-circle' : 'pi pi-copy'" severity="help" text />
            </div>
            <p v-else>Your browser does not support Clipboard API</p>
            <a :href="admissionLink.admission_link" target="_blank">
                <Button :label="admissionLink.admission_link" icon="pi pi-link" link severity="secondary"></Button>
            </a>
            <div class="col-12 mb-2">
                <label for="headingAdmission">Admission Heading</label>
                <InputText v-model="admissionLink.heading" :value="admissionLink.heading" required id="headingAdmission" class="w-full" placeholder="Admission Heading" />
            </div>

            <div class="col-12 mb-2">
                <label for="store_id" class="">Admission Form Status</label>
                <ToggleButton v-model="formActive" onIcon="pi pi-check" offIcon="pi pi-times" onLabel="Form Enabled" offLabel="Form Disabled" :invalid="!checked" aria-label="Confirmation" size="small" class="w-full" />
            </div>

            <div class="col-12 mb-2">
                <label for="store_id">Admission Link Status</label>
                <ToggleButton v-model="linkEnabled" onIcon="pi pi-check" offIcon="pi pi-times" onLabel="Link Enabled" offLabel="Link Disabled" class="w-full" />
            </div>

            <!-- <div class="col-12 mb-2">
                <label for="store_id">Is Subject list Enabled</label>
                <ToggleButton v-model="subjectEnabled" onIcon="pi pi-check" offIcon="pi pi-times" onLabel="Subject List Enabled" offLabel="Subject List Disabled" class="w-full" />
            </div>

            <div class="col-12 mb-2">
                <label for="store_id">Is Academic Info of applicants needed?</label>
                <ToggleButton v-model="acinfoEnabled" onIcon="pi pi-check" offIcon="pi pi-times" onLabel="Academic Info Enabled" offLabel="Academic Info Disabled" class="w-full" />
            </div> -->
        </div>

        <br />
        <div>
            <Button label="Update" icon="pi pi-check-circle" :loading="loading" @click="updatetLink" size="small" severity="info" />
        </div>
    </div>
</template>
