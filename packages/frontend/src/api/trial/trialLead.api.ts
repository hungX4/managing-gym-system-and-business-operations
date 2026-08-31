import type { GetLeadsFilterDto, TrialLeadResponseDto } from '@gym/shared';
import axiosClient from '../axiosClient';

// Định nghĩa interface cho data gửi lên nếu cần (hoặc dùng thẳng DTO từ @gym/shared)
export const trialLeadApi = {
    createWebLead: (data: any) => {
        return axiosClient.post('/trial-leads/web', data);
    },

    getLead: async (filters?: { status?: string, assignedToId?: number }) => {
        const response = await axiosClient.get<any, TrialLeadResponseDto[]>('/trial-leads', { params: filters });
        return response;
    },

    // Cập nhật Lead (Staff, Status, Note)
    updateLead: async (id: number, data: { status?: string; assignedToId?: number | null; adminNote?: string }) => {
        const response = await axiosClient.patch<any>(`/trial-leads/${id}`, data);
        return response;
    }
};

