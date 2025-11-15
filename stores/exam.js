import { defineStore } from 'pinia'
import axios from 'axios'
export const useExamStore = defineStore('exam', {
  state: () => ({
    error: null,
    loading: false,
    essentials: null,
    existingExams: [],
    examinee: [],
    examConfig: null,
    progressInterval: null,

    exportInProgress: false,
    exportProgress: 0,
    exportReadyUrl: null,
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

        const { status, message, error = null, list, examConf } = response.data.payload.data;
        if (status === 'success') {
          this.examinee = list;
          this.examConfig = examConf;
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
    },


    getGradeInfo(mark) {
      if (mark === null || mark === undefined || mark === "") return { grade: "", gradePoint: "" };

      const ranges = [
        { from: 80, to: 100, grade: "A+", gradePoint: 5.00 },
        { from: 70, to: 79.99, grade: "A", gradePoint: 4.50 },
        { from: 60, to: 69.99, grade: "A-", gradePoint: 4.00 },
        { from: 50, to: 59.99, grade: "B", gradePoint: 3.00 },
        { from: 40, to: 49.99, grade: "C", gradePoint: 2.00 },
        { from: 30, to: 39.99, grade: "D", gradePoint: 1.00 },
        { from: 0, to: 32.99, grade: "F", gradePoint: 0.00 },
      ];

      const result = ranges.find(r => mark >= r.from && mark <= r.to);

      return result
        ? { grade: result.grade, gradePoint: result.gradePoint }
        : { grade: "", gradePoint: "" };
    },



    // --- Start export ---
    async startExport(payload) {
      this.exportInProgress = true;
      this.exportProgress = 0;
      this.exportReadyUrl = null;
      this.progressInterval = null;
      try {
        const { data } = await axios.post('seat-card/export', payload);
        const exportId = data?.payload?.data?.exportId;

        if (!exportId) {
          throw new Error('Export ID not returned from server.');
        }

        // toast.add({ severity: 'info', summary: 'Export started', detail: 'Please wait...', life: 3000, group: 'br' });

        // Start polling every 5 seconds
        this.progressInterval = setInterval(() => this.fetchExportProgress(exportId), 5000);
      } catch (err) {
        this.exportInProgress = false;
        this.handleAxiosError(err);
      }
    },

    async startMarkSheetExport(payload) {
      this.exportInProgress = true;
      this.exportProgress = 0;
      this.exportReadyUrl = null;
      this.progressInterval = null;
      try {
        const { data } = await axios.post('mark-sheet/export', payload);
        const exportId = data?.payload?.data?.exportId;

        if (!exportId) {
          throw new Error('Export ID not returned from server.');
        }

        // toast.add({ severity: 'info', summary: 'Export started', detail: 'Please wait...', life: 3000, group: 'br' });

        // Start polling every 5 seconds
        this.progressInterval = setInterval(() => this.fetchExportProgress(exportId), 5000);
      } catch (err) {
        console.error(err)
        this.exportInProgress = false;
        this.handleAxiosError(err);
      }
    },

    // --- Poll export progress ---
    async fetchExportProgress(exportId) {
      try {
        const { data } = await axios.get('export-progress', { params: { exportId } });
        const payload = data?.payload?.data || {};

        this.exportProgress = Number(payload.progress ?? 0);
        const readyFile = payload.readyFile ?? null;

        console.debug(`Progress check: ${this.exportProgress}% | readyFile: ${readyFile}`);

        if (this.exportProgress < 0) {
          this.cancelExport('Can not export currently. try again later.');
          return;
        }


        if (readyFile) {
          this.exportReadyUrl = readyFile;
          this.exportProgress = 100;
          this.exportInProgress = false;
          clearInterval(this.progressInterval);
          this.progressInterval = null;

          // toast.add({
          //   severity: 'success',
          //   summary: 'Export Ready',
          //   detail: 'Starting download...',
          //   life: 3000,
          // });

          this.downloadExport();
        }
      } catch (err) {
        console.error('Export progress error:', err);
        // Optionally show error toast here
      }
    },

    // --- Cancel export ---
    async cancelExport(message = null) {
      this.exportInProgress = false;
      this.exportProgress = 0;

      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }

      // toast.add({
      //   severity: 'warn',
      //   summary: 'Export Cancelled',
      //   detail: message ?? 'You have cancelled the export process.',
      //   life: 3000,
      // });

      // Optionally inform backend to cancel the job
      // await axios.post('archive/export-cancel', { exportId });
    },

    // --- Download export file ---
    downloadExport() {
      if (!this.exportReadyUrl) return;

      const url = this.exportReadyUrl.startsWith('/')
        ? this.exportReadyUrl
        : '/storage/' + this.exportReadyUrl;


      console.log(url);

      const link = document.createElement('a');
      link.href = url;
      link.download = url.split('/').pop();
      document.body.appendChild(link); // 👈 add to DOM
      link.click();
      document.body.removeChild(link); // 👈 clean up
    },


    async importExamMark(payload) {
      try {
        this.loading = true;
        const { status, message, error = null } = await axios.post('mark-sheet/import', payload);
        if (status === 'success') {
          return { status: status, message: message, error: error }
        } else {
          if (error.response) {
            this.handleAxiosError(error.response);
          }
        }
      } catch (err) {
        console.error(err)
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
