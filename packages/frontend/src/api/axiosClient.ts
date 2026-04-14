import axios from "axios";

const axiosClient = axios.create({
    baseURL: 'http://localhost:3636/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

//interceptor: tu dong dinh kem token vao request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;