export const useGlobalStoreData = defineStore('globalStore', {
    state: () => ({
        isLoading: false
    }),
    getters: {
        getLoadingStatus(state) {
            return state.isLoading;
        }
    },
    actions: {
        setLoadingStatus(status) {
            this.isLoading = status;
        }
    }
});
