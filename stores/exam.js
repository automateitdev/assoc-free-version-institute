import { defineStore } from 'pinia'
import axios from 'axios'
export const useExamStore = defineStore('exam', {
  state: () => ({
    loading: false,
    essentials: null,
    existingExams: [],
    examinee: [],
  }),
  actions: {
    async fetchEssentials() {
      try {
        this.loading = true;
        const response = await axios.get('/admission/exam/essentials');
        const { essentials } = response.data.payload.data;
        this.essentials = essentials;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          return { loginSuccess: false, error: formattedErrors };
        } else {
          return { loginSuccess: false, error: "An error occurred during login." };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchExamList() {
      try {
        this.loading = true;
        const response = await axios.get('/admission/exams');
        const { exams } = response.data.payload.data;
        this.existingExams = exams;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          return { loginSuccess: false, error: formattedErrors };
        } else {
          return { loginSuccess: false, error: "An error occurred during login." };
        }
      } finally {
        this.loading = false;
      }
    },

    async saveExamSetup(formData) {
      try {
        this.loading = true;
        const response = await axios.post('/admission/exam-save', formData);
        const { status, message, error = null } = response.data.payload.data;
        return { status: status, message: message, error: error };
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          return { loginSuccess: false, error: formattedErrors };
        } else {
          return { loginSuccess: false, error: "An error occurred during login." };
        }
      } finally {
        this.loading = false;
      }
    },

    async removeExamCenter(center_id) {
      try {
        this.loading = true;
        const response = await axios.delete(`/admission/remove/center/${center_id}`);
        const { status, message, error = null } = response.data.payload.data;
        return { status: status, message: message, error: error };
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          return { loginSuccess: false, error: formattedErrors };
        } else {
          return { loginSuccess: false, error: "An error occurred during login." };
        }
      } finally {
        this.loading = false;
      }
    },

    async removeExam(exam_id) {
      try {
        this.loading = true;
        const response = await axios.delete(`/admission/remove/exam/${exam_id}`);
        const { status, message, error = null } = response.data.payload.data;
        return { status: status, message: message, error: error };
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          return { loginSuccess: false, error: formattedErrors };
        } else {
          return { loginSuccess: false, error: "An error occurred during login." };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchExaminee(payload, lazyParams = {}) {
      try {
        this.loading = true;
        const response = await axios.post('/admission/examinee-list', {
          ...payload,
          dt_params: lazyParams,
        });

        const { status, message, error = null, list } = response.data.payload.data;
        if (status === 'success') {
          this.examinee = list;
        }
      } catch (error) {
        console.error(error)
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          return { loginSuccess: false, error: formattedErrors };
        } else {
          return { loginSuccess: false, error: "An error occurred during login." };
        }
      } finally {
        this.loading = false;
      }
    }
  }
})
