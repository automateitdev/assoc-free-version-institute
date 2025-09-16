import axios from "axios";

export const useWaiverStore = defineStore('waiver', () => {

  let waiverIndexData = reactive({
    instituteClassMaps: [],
    academicYears: [],
    category: [],
    feeHead: [],
  });

  const fetchWaiverIndex = async () => {
    try {
      const { data } = await axios.get("/waiver-setup")
      waiverIndexData.instituteClassMaps = data.payload.data.instituteClassMap
      waiverIndexData.academicYears = data.payload.data.academicYears
      waiverIndexData.category = data.payload.data.category
      waiverIndexData.feeHead = data.payload.data.feeHead
      waiverIndexData.waivers = data.payload.data.waivers
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
        const formattedErrors = errors.map(err => `${err.message}`).join('\n');
        return { success: false, error: formattedErrors };
      } else {
        return { success: false, error: "An error occurred during login." };
      }
    }
  }

  const searchStudentsForWaiver = async (formData) => {
    try {
      const response = await axios.post(`waiver-setup/search`, formData);;
      const { student_list, url } = response.data.payload.data;
      // if (response.data.payload.data.status == 'success') {
      return { success: true, student_list: student_list, url: url, error: null };
  // }
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
        const formattedErrors = errors.map(err => `${err.message}`).join('\n');
        return { success: false, error: formattedErrors };
      } else {
        return { success: false, error: "An error occurred during login." };
      }
    }
  }

  const searchWaiverList = async (formData) => {
    try {
      const response = await axios.post(`waiver-setup/assign-list`, formData);;
      const { waiverHistory } = response.data.payload.data;
      // if (response.data.payload.data.status == 'success') {
      return { success: true, waiverHistory: waiverHistory, error: null };
      // }
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
        const formattedErrors = errors.map(err => `${err.message}`).join('\n');
        return { success: false, error: formattedErrors };
      } else {
        return { success: false, error: "An error occurred during login." };
      }
    }
  }

  const waiverPerStudent = async (formData) => {
    try {
      const response = await axios.post("/waiver-setup", formData)
      const { status, message } = response.data.payload.data;
      console.log(status, message);
      return { status: status, message: message, error: null };
    } catch (error) {
      console.log(error);
      if (error.response) {
        const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
        const formattedErrors = errors.map(err => `${err.message}`).join('\n');
        return { success: false, error: formattedErrors };
      } else {
        return { success: false, error: "An error occurred during login." };
      }
    }
  }

  return {
    fetchWaiverIndex,
    waiverIndexData,
    waiverPerStudent,
    searchWaiverList,
    searchStudentsForWaiver
  };
}
);