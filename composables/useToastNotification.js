import { useToast } from "primevue/usetoast";
// const toast = useToast();
const nuxtApp = useNuxtApp();
const getToast = () => nuxtApp.vueApp.config.globalProperties.$toast
export default useToastNotification = () =>{

    function toastSuccess () {
        getToast.add({ severity: 'warn', summary: 'Field must not be empty!', detail: 'Missing form value.', life: 3000 });
    }



    return {
        toastSuccess
    }
}