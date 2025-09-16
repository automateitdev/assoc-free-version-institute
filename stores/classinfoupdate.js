import axios from "axios";

export const useClassInfoUpdateStore = defineStore('waiver', () => {

  let classInfoIndex = reactive({
    groups: null,
    students: null,
  });

  const fetchClassInfoIndex = async (formData) => {
    console.log(formData)
    if (!formData) {
      classInfoIndex.groups = null
      classInfoIndex.students = null
      return { success: true, error: null }
    }
    try {
      const { data } = await axios.post("/student-update/basic-info-search", formData)
      classInfoIndex.groups = data.payload.data.groups
      classInfoIndex.students = data.payload.data.students

      return { success: true, error: null }
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

  const classInfoUpdate = async (formData) => {
    try {
      const response = await axios.post("/student-update/class-info-update", formData)
      const { status, message } = response.data.payload.data
      return { status: status, message: message, error: null }
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
    fetchClassInfoIndex,
    classInfoIndex,
    classInfoUpdate,
  };
}
);