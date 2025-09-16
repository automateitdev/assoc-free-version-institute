<script>
import { useToast } from 'primevue/usetoast';
import { useGlobalStoreData } from '../../../stores/globalStore';
export default {
    name: 'role-list',
    setup() {
        let apiOptions = reactive(useApiOption());
        const globalStore = useGlobalStoreData();
        const toast = useToast();
        let allRoleList = reactive([]);

        useSeoMeta({
            title: 'HR Role List'
        });

        onMounted(() => {
            getRoleListHandler();
        });

        const getRoleListHandler = async () => {
            const {
                data: role_lists,
                pending,
                error,
                refresh
            } = await useFetch(`/back-office/role-list`, {
                ...apiOptions,
                method: 'GET'
            });
            console.log(role_lists);
        };
        return {
            allRoleList,
            getRoleListHandler
        };
    }
};
</script>
<template>
    <div></div>
</template>

<style lang="scss" scoped></style>
