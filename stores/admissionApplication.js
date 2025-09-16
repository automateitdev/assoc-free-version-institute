import axios from 'axios';
import { defineStore } from 'pinia';
const config = useRuntimeConfig();

export const useAdmissionApplicationStore = defineStore('admissionApplication', {
  state: () => ({
    admissionConfig: null,
    divisionData: [],
    presentDistrictData: [],
    permanentDistrictData: [],
    presentUpazillaData: [],
    permanentUpazillaData: [],
    subjectList: [],
    studentDataByRoll: [],
    configList: [],
    previewData: [],
    invoiceData: null,
    admitData: null,
    appInstruction: null,
    loading: false,
    error: null,
  }),
  getters: {
    getadmissionConfig(state) {
      return state.admissionConfig;
    },
  },
  actions: {

    // getting Initial application config
    async fetchadmissionConfig(ins_id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`admission-data/${ins_id}`);
        this.admissionConfig = response.data.payload.data.admissionConfig;
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

    // Fetching All the Divisions
    async fetchDivisions() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`/divisions-data`);
        this.divisionData = response.data.payload.data.divisions;
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

    async getAppInstruction() {
      try {
        const response = await axios.get('/online-admission-instruction')
        this.appInstruction = response.data.payload.data.instruction
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          this.loading = false
          return { status: false, error: formattedErrors };
        } else {
          this.loading = false
          return { status: false, error: "An error occurred during login." };
        }
      }
    },

    // Fetching district by division
    async fetchDistrictByDivision(type, division_id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`/district-data/${division_id}`);
        // console.log(type)
        if (type == 'present') {
          this.presentDistrictData = response.data.payload.data.districts;
        } else if (type == 'permanent') {
          this.permanentDistrictData = response.data.payload.data.districts;
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

    // Fetching upazilla by district
    async fetchUpazillaByDistrict(type, district_id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`/upozila-data/${district_id}`);
        this.upazillaData = response.data.payload.data.upazilas;
        if (type == 'present') {
          this.presentUpazillaData = response.data.payload.data.upazilas;
        } else if (type == 'permanent') {
          this.permanentUpazillaData = response.data.payload.data.upazilas;
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

    // Fetching the subject by acdemic year
    async fetchYearwiseSubject(formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post(`/admission-year-search/${formData.academic_year}`, formData);
        this.subjectList = response.data.payload.data.subject_list;
        this.configList = response.data.payload.data.configured_data;

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

    // Fetching student data by roll when form disabled
    async fetchStudentDataByRoll(formData) {
      this.loading = true;
      this.error = null;
      try {

        const response = await axios.post(`/student-roll-search`, formData);

        if (response?.data?.payload?.data?.unique_number) {
          return {
            status: response.data.payload.data.status,
            message: response.data.payload.data.message,
            unique_number: response.data.payload.data.unique_number,
            error: null
          }
        }
        this.studentDataByRoll = response.data.payload.data.student_data;
        return {
          status: response.data.payload.data.status,
          message: response.data.payload.data.message,
          unique_number: null,
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

    // Storing student application data
    async saveFormData(formData) {
      try {
        // console.log(formData);
        this.loading = true;
        const response = await axios.post('/student-form-store', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return {
          status: response.data.payload.data.status,
          message: response.data.payload.data.message,
          unique_number: response.data.payload.data.unique_number,
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

    // Storing student application data
    async updateFormData(formData) {
      try {
        const unique_number = formData.get('unique_number');
        this.loading = true;
        const response = await axios.post(`/student-form-update/${unique_number}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
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

    // Fetching student preview data by unique id
    async fetchPreviewData(formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`/student-form-preview/${formData}`);
        this.previewData = response.data.payload.data;
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

    // send payment 
    async sendPaymentRequest(formData) {
      this.loading = true;
      this.error = null;
      try {
        console.log(formData)
        const response = await axios.post(`${formData.url}`, formData); // Ensure you have this line to make the POST request

        let parsedData;
        if (typeof response?.data?.payload?.data === 'string') {
          try {
            parsedData = JSON.parse(response.data.payload.data);
          } catch (e) {
            this.loading = false;
            return {
              status: response.status,
              gateway: null,
              error: 'Invalid JSON string'
            };
          }
        } else {
          parsedData = response.data;
        }
        this.loading = false;
        return {
          status: parsedData.status || parsedData.status,
          gateway: parsedData.data || parsedData.gateway,
          error: null
        };

      } catch (error) {
        this.loading = false;
        if (error.response) {
          const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
          const formattedErrors = errors.map(err => `${err.message}`).join('\n');
          return { status: false, error: formattedErrors };
        } else {
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.loading = false;
      }
    },

    // Fetching student preview data by unique id
    async fetchPaymentInvoice(formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`/student-admission-invoice/${formData}`);
        this.invoiceData = response.data.payload.data;
        if (this.invoiceData.payment_url) {
          window.location.href = this.invoiceData.payment_url
        }
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

    async fetchExamAdmit(formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`/student-admission-admit/${formData}`);
        this.admitData = response.data.payload.data;

        console.log(this.admitData)

        if (this.admitData.payment_url) {
          window.location.href = this.admitData.payment_url
        }
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

  },
});
