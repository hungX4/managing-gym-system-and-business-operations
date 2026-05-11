// src/api/revenue.api.ts
import axiosClient from '../axiosClient';

export const revenueApi = {
    getDashboardData: async (month: number, year: number) => {
        try {
            const response = await axiosClient.get(`/admin?month=${month}&year=${year}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi gọi API Dashboard:", error);
            throw error;
        }
    }
};