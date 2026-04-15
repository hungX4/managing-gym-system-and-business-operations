import axios from "axios";

const axiosClient = axios.create({
    baseURL: 'http://localhost:3636/api/v1',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

//interceptor: tu dong dinh kem token vao request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error => {
    return Promise.reject(error);
}));

// 2. RESPONSE INTERCEPTOR: Xử lý khi Token hết hạn (Lỗi 401)
let refreshTokenPromise: any = null;

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // NẾU CHƯA CÓ AI GỌI REFRESH -> MÌNH ĐỨNG RA GỌI
            if (!refreshTokenPromise) {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    window.location.href = '/auth';
                    return Promise.reject(error);
                }

                // Gán promise đang gọi API vào biến khoá
                refreshTokenPromise = axios.post(
                    `${axiosClient.defaults.baseURL}/auth/refresh`,
                    { userId: userId },
                    { withCredentials: true }
                ).then(res => {
                    const newAccessToken = res.data.accessToken;
                    localStorage.setItem('accessToken', newAccessToken);
                    return newAccessToken;
                }).catch(refreshError => {
                    console.error("Refresh token failed", refreshError);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('userData');
                    localStorage.removeItem('userId');
                    // window.location.href = '/auth';
                    return Promise.reject(refreshError);
                }).finally(() => {
                    // Xong việc thì reset khoá
                    refreshTokenPromise = null;
                });
            }

            try {
                // TẤT CẢ CÁC REQUEST 401 SẼ ĐỨNG CHỜ Ở ĐÂY CHO ĐẾN KHI CÓ TOKEN
                const newAccessToken = await refreshTokenPromise;

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosClient(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;