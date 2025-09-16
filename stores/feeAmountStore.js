

import axios from "axios";

export const useFeeAmountStore = defineStore('subject', () => {

  let amountIndexData = reactive({
    instituteClassMaps: [],
    academicYears: [],
    category: [],
    feeHead: [],
  });


  const fetchFeeAmountIndex = async () => {
    try {
      const { data } = await axios.get("fees-management/amount-setting")
      amountIndexData.instituteClassMaps = data.payload.data.instituteClassMap
      amountIndexData.academicYears = data.payload.data.academicYears
      amountIndexData.category = data.payload.data.category
      amountIndexData.feeHead = data.payload.data.feeHead
    } catch (error) {
      console.log(error);
    }
  }

  const storeFeeAmount = async (formData) => {
    try {
      const response = await axios.post('fees-management/amount-setting/class-wise-feeamount/store', formData);
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

  const feeheadReassign = async (formData) => {
    try {
      const response = await axios.post('remove/feeHead/reassign', formData);
      const { data } = response.data.payload.data;
      if (response.data.payload.data.status == 'success')
        return { success: true, error: null };
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

  const feesubheadReassign = async (formData) => {
    try {
      const response = await axios.post('remove/feeSubHead/reassign', formData);
      const { data } = response.data.payload.data;
      if (response.data.payload.data.status == 'success')
        return { success: true, error: null };
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

  const studentWiseRemovedFeeheads = async (formData) => {
    try {
      const response = await axios.post('remove/feeHead/show', formData);
      const { status, feeHeads } = response.data.payload.data;
      return { success: status, feeheads: feeHeads };

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
    amountIndexData,
    fetchFeeAmountIndex,
    storeFeeAmount,
    feeheadReassign,
    feesubheadReassign,
    studentWiseRemovedFeeheads,
  };
}
);