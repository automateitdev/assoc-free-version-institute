<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
const model = ref([
    // {
    //     label: 'Home',
    //     items: [
    //         { label: 'Dashboard', icon: 'pi pi-fw pi-palette', to: '/' },
    //         {
    //             label: 'Student',
    //             icon: 'pi pi-fw pi-users',
    //             items: [
    //                 {
    //                     label: 'Registration',
    //                     icon: 'pi pi-fw pi-plus-circle',
    //                     items: [
    //                         { label: 'Enrollment Form', icon: 'pi pi-fw pi-ellipsis-h', to: '/student/enrollment' },
    //                         { label: 'Excel Form', icon: 'pi pi-fw pi-ellipsis-h', to: '/student/enrollment/excel' }
    //                     ]
    //                 },
    //                 {
    //                     label: 'Update',
    //                     icon: 'pi pi-fw pi-file-edit',
    //                     items: [
    //                         { label: 'Basic Info', icon: 'pi pi-fw pi-ellipsis-h', to: '/student/update' },
    //                         { label: 'Class Info', icon: 'pi pi-fw pi-ellipsis-h', to: '/student/update/classinfo' }
    //                     ]
    //                 },
    //                 // {
    //                 //     label: 'Status',
    //                 //     icon: 'pi pi-fw pi-bookmark',
    //                 //     to: '/student/status'
    //                 // },
    //                 {
    //                     label: 'Migration',
    //                     icon: 'pi pi-fw pi-sync',
    //                     items: [
    //                         { label: 'Promotion', icon: 'pi pi-fw pi-ellipsis-h', to: '/student/migration' },
    //                         { label: 'Push back', icon: 'pi pi-fw pi-ellipsis-h', to: '/student/push-back' }
    //                     ]
    //                 },
    //                 {
    //                     label: 'Report',
    //                     icon: 'pi pi-fw pi-bookmark',
    //                     items: [{ label: 'Student list', icon: 'pi pi-fw pi-ellipsis-h', to: '/student/report' }]
    //                 }
    //             ]
    //         },
    //         {
    //             label: 'Fee Management',
    //             icon: 'pi pi-fw pi-calculator',
    //             items: [
    //                 {
    //                     label: 'Fixed Portal',
    //                     icon: 'pi pi-fw pi-circle-fill',
    //                     items: [
    //                         {
    //                             label: 'Settings',
    //                             icon: 'pi pi-fw pi-cog',
    //                             items: [
    //                                 {
    //                                     label: 'Fee Startup',
    //                                     icon: 'pi pi-fw pi-ellipsis-h',
    //                                     to: '/fee-management/fee_startup'
    //                                 },
    //                                 {
    //                                     label: 'Fee Mapping',
    //                                     icon: 'pi pi-fw pi-ellipsis-h',
    //                                     to: '/fee-management/fee_map'
    //                                 },
    //                                 {
    //                                     label: 'Amount Setup',
    //                                     icon: 'pi pi-fw pi-ellipsis-h',
    //                                     to: '/fee-management/fee_amount_setup'
    //                                 },
    //                                 {
    //                                     label: 'Date Setup',
    //                                     icon: 'pi pi-fw pi-ellipsis-h',
    //                                     to: '/fee-management/date_setup'
    //                                 },
    //                                 {
    //                                     label: 'Waiver',
    //                                     icon: 'pi pi-fw pi-bookmark',
    //                                     items: [
    //                                         {
    //                                             label: 'Setup',
    //                                             icon: 'pi pi-fw pi-ellipsis-h',
    //                                             to: '/fee-management/waiver/assign'
    //                                         }
    //                                     ]
    //                                 },
    //                                 {
    //                                     label: 'Fee Remove',
    //                                     icon: 'pi pi-fw pi-bookmark',
    //                                     items: [
    //                                         {
    //                                             label: 'Fee Head',
    //                                             icon: 'pi pi-fw pi-ellipsis-h',
    //                                             to: '/fee-management/remove/feehead'
    //                                         },
    //                                         {
    //                                             label: 'Fee SubHead',
    //                                             icon: 'pi pi-fw pi-ellipsis-h',
    //                                             to: '/fee-management/remove/feesubhead'
    //                                         }
    //                                     ]
    //                                 }
    //                             ]
    //                         },
    //                         {
    //                             label: 'Report',
    //                             icon: 'pi pi-fw pi-bookmark',
    //                             items: [
    //                                 {
    //                                     label: 'Student',
    //                                     icon: 'pi pi-fw pi-ellipsis-h',
    //                                     to: '/student/report'
    //                                 }
    //                             ]
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     label: 'Open Portal',
    //                     icon: 'pi pi-fw pi-circle',
    //                     items: [
    //                         {
    //                             label: 'Setup',
    //                             icon: 'pi pi-fw pi-ellipsis-h',
    //                             to: '/fee-management/open-portal/'
    //                         }
    //                     ]
    //                 }
    //             ]
    //         }
    //     ]
    // },
    {
        label: 'Maintenance',
        items: [
            // { label: 'Startup', icon: 'pi pi-fw pi-play', to: '/master-settings/institute/startup' },
            { label: 'Basic Setup', icon: 'pi pi-fw pi-sliders-h', to: '/master-settings/institute/basic-setup' }
            // { label: 'Class Setup', icon: 'pi pi-fw pi-cog', to: '/master-settings/institute/class' }
        ]
    },
    {
        label: 'Online Application',
        items: [
            { label: 'Startup', icon: 'pi pi-fw pi-book', to: '/admission/startup' },
            { label: 'Class Mapping', icon: 'pi pi-fw pi-wrench', to: '/admission/basic-setup' },
            { label: 'Admission Config', icon: 'pi pi-fw pi-cog', to: '/admission/config' },
            { label: 'Link Generate', icon: 'pi pi-fw pi-link', to: '/admission/makelink' }
            // { label: 'Lottery', icon: 'pi pi-fw pi-th-large', to: '/admission/lottery'},
        ]
    },
    {
        label: 'Report',
        icon: 'pi pi-fw pi-bookmark',
        items: [
            { label: 'Applicants', icon: 'pi pi-fw pi-users', to: '/admission/report/applicants' },
            { label: 'Collections', icon: 'pi pi-fw pi-tags', to: '/admission/report/collection' }
            // { label: 'Others', icon: 'pi pi-fw pi-ellipsis-h', to: '/admission/report/others' }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
