import axios from "axios";

export const usePromotionStore = defineStore('promotion', {
  state: () => ({
    instituteClassMap: null,
    academicYears: null,
    academicSession: null,
    studentList: null,
    loading: false,
  }),
  getters: {

  },
  actions: {
    async fetchPromotionIndex() {
      this.loading = true;
      try {
        const response = await axios.get('/without-merit-promotion/index');
        // console.log(response);
        const { instituteClassMap, academicYears, academicSession, groups } = response.data.payload.data;
        this.instituteClassMap = instituteClassMap;
        this.academicYears = academicYears;
        this.academicSession = academicSession;
        return true;
      } catch (error) {
        // console.error('Login error:', error);
        this.loading = false;
        return false; // Return false if login fails
      }

    },
    async fetchStudentList(formData) {
      try {
        this.loading = true;
        // Send login request to obtain access token and refresh token
        const response = await axios.post('/student-list', formData);
        const { students } = response.data.payload.data;
        this.studentList = students;
        return true;
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

    async promotionRequest(formData) {
      try {
        this.loading = true;
        // Send login request to obtain access token and refresh token
        const response = await axios.post('/without-merit-promotion/store', formData);
        const { status, message } = response.data.payload.data;
        return { status: status, message: message, error: null };
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

    async pushbackRequest(formData) {
      try {
        this.loading = true;
        // Send login request to obtain access token and refresh token
        const response = await axios.post('/migration-pushback/store', formData);
        const { status, message } = response.data.payload.data;
        return { status: status, message: message, error: null };
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

  },
  persist: true,
});