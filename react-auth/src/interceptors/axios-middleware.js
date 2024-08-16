// axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api/',
    withCredentials: true
});

let refresh = false;

axiosInstance.interceptors.response.use(response => response, async error => {
    if (error.response && error.response.status === 401 && !refresh) {
        try {
            refresh = true;

            const refreshResponse = await axiosInstance.post('refresh', {});

            if (refreshResponse.status === 200) {
                return axiosInstance.request(error.config);
            }
        }
        catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
        }
    }

    refresh = false;
    return Promise.reject(error);
}
);

export default axiosInstance;

