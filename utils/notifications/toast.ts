import { useToast } from "primevue/usetoast";



export function toastSuccess(summary: any = "Success!", detail:any="Data Added Successfully!") {
    useToast().add({ severity: 'success', summary, detail, life: 3000 })
}

export function toastWarn(summary: any = "Warn!", detail: any = "Something Went Wrong!") {
    useToast().add({ severity: 'warn', summary, detail, life: 3000 })
}

export function toastError(summary: any = "Error!", detail: any = "Something Went Wrong!") {
    useToast().add({ severity: 'error', summary, detail, life: 3000 })
}