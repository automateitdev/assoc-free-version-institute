export const useApiOption = () => {
    return {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        baseURL: "http://127.0.0.1:8000/"
    };
};
