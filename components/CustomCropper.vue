<script setup>
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
const photoFile = ref(null);
const isCropperVisible = ref(false);
const originalFileName = ref();
const croppingImageUrl = ref();
const result = reactive({
    coordinates: null,
    image: null
});

const props = defineProps({
    quality: { type: Number, default: 0.8 },
    handlers: { type: String, required: true },
    aspectRatio: { type: Number, default: 0 },
    movable: { type: Boolean, default: false },
    resizable: { type: Boolean, default: false },
    cropWidth: { type: Number, default: 0 },
    cropHeight: { type: Number, default: 0 },
    autoZoom: { type: Boolean, default: false },
    uploadUrl: { type: String, default: '' },
    nameField: { type: String, default: '' }
});
const resetCropper = () => {
    croppingImageUrl.value = null;
    isCropperVisible.value = false;
    result.coordinates = null;
    result.image = null;
    photoDataFile.value = null;
    customUploader(props.nameField);
};
function onAvatarSelect($event) {
    photoFile.value = $event.files[0];
    originalFileName.value = photoFile.value.name;

    const reader = new FileReader();
    reader.onload = (e) => {
        croppingImageUrl.value = e.target.result;
        isCropperVisible.value = true;
    };
    reader.readAsDataURL(photoFile.value);
}

const photoDataFile = ref(null);
async function handleCroppedImage({ coordinates, image, canvas }) {
    result.coordinates = coordinates;
    result.image = image;
    const photoData = canvas.toDataURL('image/png');
    const blob = await (await fetch(photoData)).blob();
    photoDataFile.value = new File([blob], originalFileName.value);
    // Convert canvas to WebP blob with compression
    canvas.toBlob(async (blob) => {
        const compressedBlob = await (await fetch(URL.createObjectURL(blob))).blob();
        photoDataFile.value = new File([compressedBlob], originalFileName.value.replace(/\.[^/.]+$/, ".png"), { type: 'image/png' });
    }, 'image/png', props.quality); // 0.8 is the quality factor (0 to 1)
}

const customUploader = async (param) => {
    console.log(param);
};

const emits = defineEmits(['upload-success']);
const uploadPhoto = async () => {
    if (!photoDataFile.value) {
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'No photo selected for upload.', life: 3000 });
        return;
    }

    try {
        const newFormData = new FormData();
        newFormData.append(props.nameField, photoDataFile.value);

        // for (const [key, value] of newFormData.entries()) {
        //     console.log(`${key}:`, value);
        // }

        const response = await axios.post(props.uploadUrl, newFormData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.payload.data.status === 'success') {
            toast.add({ severity: 'success', summary: 'Success', detail: response.data.payload.data.message, life: 3000 });
            emits('upload-success');           
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: response.data.payload.data.errors, life: 3000 });
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred!', life: 3000 });
    } finally {
        isCropperVisible.value = false;
        resetCropper();
    }
};

const toast = useToast();
</script>
<template>
    <div>
        <FileUpload :maxFileSize="2000000" :name="nameField" mode="basic" @select="onAvatarSelect($event)"
            accept="image/*" chooseLabel="Choose Photo" :disabled="croppingImageUrl" @upload="onUpload" />

        <div class="flex flex-wrap gap-2 align-items-end">
            <preview :width="120" :height="120" class="mb-2" :image="result.image" :coordinates="result.coordinates" />
        </div>

        <div v-if="isCropperVisible" class="cropper">
            <Cropper style="height: 200px; width: auto" :stencil-props="{ handlers, movable, resizable, aspectRatio }"
                :resize-image="{
                    adjustStencil: false
                }" :auto-zoom="autoZoom" :src="croppingImageUrl" @change="handleCroppedImage" class="mb-2 mx-auto" />

            <div class="flex justify-center gap-2">
                <Button label="Apply" icon="pi pi-save" @click="uploadPhoto()" size="small" />
                <Button label="Clear" icon="pi pi-eraser" @click="resetCropper()" :disabled="!croppingImageUrl"
                    severity="warning" size="small" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.cropper {
    width: 300px;
    height: 300px;
}
</style>