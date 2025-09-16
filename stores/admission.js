import axios from 'axios';
import { defineStore } from 'pinia';
const config = useRuntimeConfig();

export const useAdmissionStore = defineStore('admission', {
  state: () => ({
    admissionLink: [],
    classSetupIndex: [],
    subjectSetupIndex: [],
    admissionClassData: [],
    existingConfigs: [],
    applicantList: [],
    enrollment_list: [],
    AllApplicantsList: [],
    all_enrollment_list: [],
    collectionList: [],
    esifList: [],
    AllCollectionList: [],
    lotteryList: [],
    admissionFormData: null,
    loading: false,
    error: null,
  }),
  getters: {
    getLinks(state) {
      return state.admissionLink;
    },

    getClassSetup(state) {
      return state.classSetupIndex;
    },

    getSubjectSetup(state) {
      return state.subjectSetupIndex;
    }

  },
  actions: {
    // getting Initial application config
    async fetchAdmissionSetup() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`admission-configuration`);
        this.existingConfigs = response.data.payload.data;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },
    async fetchadmissionLink(current = 1, perPage = 20) {
      // console.log(current, perPage);
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/admission-setup', {
          page: current,
          per_page: perPage
        });
        this.admissionLink = response.data.payload.data;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },


    async fetchAppliedListByYear(academicYear, lazyParams = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('/admission-applied-list', {
          academic_year: academicYear,
          dt_params: {
            ...lazyParams
          }
        });
        this.applicantList = response.data.payload.data;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false;
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false;
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchAllApplicantList(academicYear, lazyParams = {}) {
      this.loading = true;
      this.error = null;
      try {
        // Merge lazyParams into formData
        const dataToSend = {
          academic_year: academicYear,
          dt_params: lazyParams
        };
        const response = await axios.post('/admission-applied-list', dataToSend);
        this.AllApplicantsList = response.data.payload.data;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false;
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false;
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchCollectionList(formData, lazyParams = {}) {
      this.loading = true;
      this.error = null;
      try {
        // Merge lazyParams into formData
        const dataToSend = {
          ...formData,
          dt_params: lazyParams
        };
        const response = await axios.post('/admission-ops-report', dataToSend);
        this.collectionList = response.data.payload.data;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false;
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false;
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchesifList(formData, lazyParams = {}) {
      this.loading = true;
      this.error = null;
      try {
        // Merge lazyParams into formData
        const dataToSend = {
          ...formData,
          dt_params: lazyParams
        };
        const response = await axios.post('/admission-applied-esif-details-report', dataToSend);
        this.esifList = response.data.payload.data;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false;
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false;
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchAllCollectionList(formData, lazyParams = {}) {
      this.loading = true;
      this.error = null;
      try {
        // Merge lazyParams into formData
        const dataToSend = {
          ...formData,
          dt_params: lazyParams
        };
        const response = await axios.post('/admission-ops-report', dataToSend);
        this.AllCollectionList = response.data.payload.data;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false;
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false;
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchClassSetupIndex(current = 1, perPage = 20) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/admission-class-setup', {
          page: current,
          per_page: perPage
        });
        this.classSetupIndex = response.data.payload.data;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchSubjectSetupIndex(formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/admission-subject-setup', formData);
        this.subjectSetupIndex = response.data.payload.data;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchSubjectChoice(formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('/admission-applied-subject-wise-report', formData);
        return {
          status: response.data.payload.data.status,
          file_url: response.data.payload.data.file_url,
          error: null
        }
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchAdmissionDetails(formData) {
      try {
        const response = await axios.post('/admission-applied-details-report', formData);
        return {
          status: response.data.payload.data.status,
          message: response.data.payload.data.message,
          pdf: response.data.payload.data.pdf ?? null,
          error: null
        }
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },

    // saveClassSetup
    async saveClassSetup(formData) {
      try {
        console.log(formData);
        this.loading = true;
        const response = await axios.post('/admission-class-setup', formData);
        return {
          status: response.data.payload.data.status,
          message: response.data.payload.data.message,
          error: null
        }
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },

    // saveSubjectSetup
    async saveSubjectSetup(formData) {
      try {
        console.log(formData);
        this.loading = true;
        const response = await axios.post('/admission-subject-setup', formData);
        return {
          status: response.data.payload.data.status,
          message: response.data.payload.data.message,
          error: null
        }
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },

    // updateSubjectSetup
    async updateSubjectSetup(formData) {
      try {
        console.log(formData);
        this.loading = true;
        const response = await axios.put(`/admission-subject-setup/${formData.id}`, formData);
        return {
          status: response.data.payload.data.status,
          message: response.data.payload.data.message,
          error: null
        }
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },

    async add_link(formData) {
      try {
        console.log(formData);
        this.loading = true;
        const response = await axios.post('/admission-setup', formData);
        return {
          status: response.data.payload.data.status,
          message: response.data.payload.data.message,
          error: null
        }
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },

    // admission-configuration
    async add_admissionConfig(formData) {
      try {
        console.log(formData);
        this.loading = true;
        const response = await axios.post('/admission-configuration', formData);
        return {
          status: response.data.payload.data.status,
          message: response.data.payload.data.message,
          error: null
        }
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },

    // update_admissionConfig
    async update_admissionConfig(formData) {
      try {
        // console.log(formData);
        this.loading = true;

        // Create an object with only the provided fields
        const dataToUpdate = {};
        if (formData.value.amount !== undefined) dataToUpdate.amount = formData.value.amount;
        if (formData.value.start_date_time !== undefined) dataToUpdate.start_date_time = formData.value.start_date_time;
        if (formData.value.end_date_time !== undefined) dataToUpdate.end_date_time = formData.value.end_date_time;
        // if (formData.value.roll_start !== undefined) dataToUpdate.roll_start = formData.value.roll_start;
        if (formData.value.exam_enabled !== undefined) dataToUpdate.exam_enabled = formData.value.exam_enabled;
        // Allow exam_date_time to be null or a date
        dataToUpdate.exam_date_time = formData.value.exam_date_time;

        const response = await axios.put(`/admission-configuration/${formData.value.id}`, dataToUpdate);
        return {
          status: response.data.payload.data.status,
          message: response.data.payload.data.message,
          error: null
        };
      } catch (error) {
        this.loading = false;
        if (error.response) {
          const errors = error.response.data.errors.validation_error
            ?? error.response.data.errors.system_error
            ?? error.response.data.errors.request_error;

          const formattedErrors = errors ? errors.map(err => err.message).join('\n') : "Unknown error occurred!";
          return { status: false, error: formattedErrors };
        } else {
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.loading = false;
      }
    },
    // get demo excel
    async demoExcelDownload() {
      try {
        this.loading = true;
        const response = await axios.post('/admission-configuration/excelDownload');
        console.log(config.public.BASE_URL);
        window.open(`${config.public.BASE_URL}${response.data.payload.data.download_url}`, '_blank');
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },
    async updateAdmissionLink(formData) {
      try {
        console.log(formData);
        this.loading = true;
        const response = await axios.put(`/admission-setup/${formData.id}`, formData);
        return {
          status: response.data.payload.data.status,
          message: response.data.payload.data.message,
          error: null
        }
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchEnlistmentList(formData, lazyParams = {}) {
      try {
        this.loading = true;
        const response = await axios.post('/admission-configuration/enlistment-list', {
          ...formData,
          dt_params: {
            ...lazyParams
          }
        });
        this.enrollment_list = response.data.payload.data;
        return {
          status: response.data.payload.data.status,
          message: response.data.payload.data.message,
          error: null
        }
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "Unexpected error occured !" };
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchAllEnlistmentList(formData, lazyParams = {}) {
      this.loading = true;
      this.error = null;
      try {
        // Merge lazyParams into formData
        const dataToSend = {
          ...formData,
          dt_params: lazyParams
        };
        const response = await axios.post('/admission-configuration/enlistment-list', dataToSend);
        this.all_enrollment_list = response.data.payload.data;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false;
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false;
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.loading = false;
      }
    },


    async makeLottery(formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('/admission-lottery-generate', formData);
        const { status, message, error = null } = response.data.payload.data;
        return { status: status, message: message, error: error };
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false;
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false;
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.loading = false;
      }
    },

    async getLotteryList(formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('/admission-lottery-list', formData);
        const { status, message, payload, error = null } = response.data.payload.data;
        this.lotteryList = payload;
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false;
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false;
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.loading = false;
      }
    }
  },
});
