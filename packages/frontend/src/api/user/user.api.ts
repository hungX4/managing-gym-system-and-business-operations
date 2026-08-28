import type { UserResponseDto } from "@gym/shared";
import axiosClient from "../axiosClient"

export const userApi = {

    updateUserProfile: async (formData: FormData) => {
        return axiosClient.patch<any, UserResponseDto>('/user/me', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    getUserAttendanceHistory: async (userId: string, page: number = 1, limit: number = 10) => {
        // Truyền page và limit qua query params (axios sẽ tự động build thành ?page=1&limit=10)
        const response = await axiosClient.get<any, any>(`/attendance/history/${userId}`, {
            params: { page, limit }
        });
        return response;
    }
}