<script setup>
import { useSignatureStore } from '~/stores/signature';
const signatureStore = useSignatureStore();
const config = useRuntimeConfig();
const formData = reactive({
    title: null
});

async function initPage() {
    formData.title = null;
}

const signatureList = ref([]);
onMounted(async () => {
    await initPage();
    await refreshSignatures();
});

async function refreshSignatures() {
    await signatureStore.fetchSignatures();
    signatureList.value = signatureStore.signatures; // <-- update reactive local list
}
</script>
<template>
    <Card>
        <template #content>
            <div class="">
                <div class="">
                    <InputText v-model="formData.title" placeholder="Add Signature title" class="mb-2" />
                    <ImageResizerUploader @upload-success="refreshSignatures()" :uploadUrl="`/signature/upload`" nameField="signature" :title="formData.title" v-if="formData.title" />
                </div>
                <div class="my-2">
                    <DataTable stripedRows showGridlines resizableColumns columnResizeMode="fit" size="small" data-key="id" :loading="signatureStore.loading" :value="signatureList">
                        <template #empty>
                            <Message :closable="false">No results</Message>
                        </template>
                        <Column header="Title" field="title" />
                        <Column header="Signature" field="image_path">
                            <template #body="slotProps">
                                <img :src="`${config.public.BASE_URL}/storage/${slotProps.data.image_path}`" alt="signature" style="height: 40px; object-fit: contain" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </template>
    </Card>
</template>
