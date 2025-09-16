import axios from "axios";

export const usePortalStore = defineStore('waiver', () => {

  let portalIndexData = reactive({
    instituteClassMaps: [],
    academicYears: [],
    category: [],
    feeHead: [],
  });

  let open_portal_settings = ref();

  const fetchPortalIndex = async () => {
    try {
      const { data } = await axios.get("/open-portal-index")
      portalIndexData.instituteClassMaps = data.payload.data.instituteClassMap
      portalIndexData.academicYears = data.payload.data.academicYears
      portalIndexData.category = data.payload.data.category
      portalIndexData.feeHead = data.payload.data.feeHead
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


  const fetchPortalSettings = async () => {
    try {
      const { data } = await axios.get("/open-portal/show")
      open_portal_settings.value = data.payload.data.open_history
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

  const storePortalSetup = async (formData) => {
    try {
      const response = await axios.post('/open-portal/store', formData);
      const { message } = response.data.payload.data;
      // if (response.data.payload.data.status == 'success') {
      return { success: true, message: message, error: null };
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

  const updatePortalSetup = async (formData) => {
    try {
      const response = await axios.post('/open-portal/update', formData);
      const { message } = response.data.payload.data;
      // if (response.data.payload.data.status == 'success') {
      return { success: true, message: message, error: null };
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


  return {
    fetchPortalIndex,
    fetchPortalSettings,
    portalIndexData,
    open_portal_settings,
    storePortalSetup,
    updatePortalSetup,
  };
}
);