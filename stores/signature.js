import { defineStore } from 'pinia'
import axios from 'axios'
export const useSignatureStore = defineStore('signature', {
  state: () => ({
    error: null,
    loading: false,
    signatures: null,
  }),
  actions: {
    async fetchSignatures() {
      try {
        this.loading = true;
        const response = await axios.get('/signatures');
        const { signatures } = response.data.payload.data;
        this.signatures = signatures;
      } catch (error) {
        if (error.response) {
          this.handleAxiosError(error.response);
        } else {
          return { error: "An error occurred during login." };
        }
      } finally {
        this.loading = false;
      }
    },

    handleAxiosError(err) {
      if (err.response) {
        const errors =
          err.response.data.errors.validation_error ??
          err.response.data.errors.system_error ??
          err.response.data.errors.request_error;
        this.error = errors.map(e => e.message).join('\n');
      } else {
        console.error('Error:', err);
        this.error = 'Unexpected error occurred!';
      }
      // toast.add({ severity: 'error', summary: 'Error', detail: this.error, life: 3000, group: 'br' });
    }
  }
})
