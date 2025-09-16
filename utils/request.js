import axios from 'axios';
const request = axios.create({
    // baseURL: 'https://api.academyims.com/api/',
    baseURL: 'http://127.0.0.1:8000/api/',
    timeout: 30000
})
request.interceptors.request.use(
    (config) => {
        // console.log(2);
        const token = localStorage.getItem('authToken');
        const con = config || {};
        if (token) {
            con.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

request.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export function getRequest(url) {
    return request.get(url);
}
export function postRequest(url, data) {
    return request.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export default request