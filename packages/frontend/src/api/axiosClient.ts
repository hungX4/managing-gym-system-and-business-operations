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
}, (error => {
    return Promise.reject(error);
}));

// 2. RESPONSE INTERCEPTOR: Xử lý khi Token hết hạn (Lỗi 401)
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu mã lỗi là 401 (Unauthorized) và request này chưa được retry lần nào
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Đánh dấu là đã retry để tránh lặp vô hạn

            try {
                // Lấy userId từ localStorage (dựa theo DTO RefreshTokenDto của bạn)
                const userId = localStorage.getItem('userId');

                if (!userId) {
                    throw new Error("Không tìm thấy user id");
                }

                // Gọi API refresh token. Chú ý: Dùng thư viện axios gốc để không bị lặp qua interceptor này
                const res = await axios.post(
                    'http://localhost:3000/api/v1/auth/refresh', // Sửa đường dẫn chuẩn với BE
                    { userId: userId },
                    { withCredentials: true } // Bắt buộc để gửi HttpOnly Cookie chứa refreshToken lên BE
                );

                // Lấy token mới từ response
                const newAccessToken = res.data.accessToken;

                // Lưu token mới vào localStorage
                localStorage.setItem('accessToken', newAccessToken);

                // Cập nhật lại header Authorization cho request cũ đang bị treo
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Gửi lại request cũ bằng axiosClient với token mới
                return axiosClient(originalRequest);

            } catch (refreshError) {
                // Nếu refresh token cũng hết hạn hoặc lỗi -> Xoá sạch data và đá ra trang login
                console.error("Refresh token failed", refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userData');
                localStorage.removeItem('userId');

                // Redirect về trang /auth
                window.location.href = '/auth';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;