<script setup>
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
</script>

<template>
    <h1>Status</h1>
    <TabView>
        <TabPanel header="Inactive">
            <StatusActive></StatusActive>
        </TabPanel>
        <TabPanel header="Active">
            <StatusInactive></StatusInactive>
        </TabPanel>
    </TabView>
</template>
