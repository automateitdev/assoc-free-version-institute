<script setup>
import axios from 'axios';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const props = defineProps({
    uploadUrl: String,
    title: String,
    nameField: String
});

const emit = defineEmits(['upload-success']);

const previewUrl = ref(null);
const resizedFile = ref(null);

function resizeTo(file, width, height) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                const resized = new File([blob], 'resized.png', { type: 'image/png' });
                resolve(resized);
            }, 'image/png');
        };
        img.src = URL.createObjectURL(file);
    });
}

async function onSelect(event) {
    const file = event.files[0];
    if (!file) return;

    // 1️⃣ Resize image first
    resizedFile.value = await resizeTo(file, 130, 40);

    // 2️⃣ Preview resized image
    previewUrl.value = URL.createObjectURL(resizedFile.value);
}

async function uploadImage() {
    if (!resizedFile.value) return;

    const form = new FormData();
    form.append(props.nameField, resizedFile.value);
    form.append('title', props?.title);

    try {
        const response = await axios.post(props.uploadUrl, form);
        console.log(response);
        
        emit('upload-success');
        toast.add({ severity: 'success', summary: 'Success', detail: 'Signature uploaded' });

        // reset
        previewUrl.value = null;
        resizedFile.value = null;
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Upload failed' });
        console.error(err);
    }
}
</script>

<template>
    <div>
        <!-- Preview resized image -->
        <div v-if="previewUrl">
            <img :src="previewUrl" alt="Preview" style="max-width: 200px; border: 1px solid #ccc; padding: 4px" />
        </div>

        <div class="flex flex-wrap gap-2">
            <!-- File selector BUT NOT auto-upload -->
            <FileUpload mode="basic" :auto="false" accept="image/*" :maxFileSize="2000000" chooseLabel="Choose Image" @select="onSelect" />

            <!-- Upload button shown only if preview exists -->
            <Button v-if="previewUrl" label="Save" @click="uploadImage" icon="pi pi-save" severity="success"/>
        </div>
    </div>
</template>
