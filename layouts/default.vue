<script setup>
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '~/stores';

const { globalLoader } = storeToRefs(useGlobalStore());
import AppLayout from '@/layouts/AppLayout.vue';
</script>

<template>
    <Loader v-if="globalLoader" />
    <Toast position="bottom-right" group="br" />
    <app-layout></app-layout>
</template>
