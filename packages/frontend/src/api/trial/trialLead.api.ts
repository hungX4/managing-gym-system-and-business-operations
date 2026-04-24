import axiosClient from '../axiosClient';

// Định nghĩa interface cho data gửi lên nếu cần (hoặc dùng thẳng DTO từ @gym/shared)
export const trialLeadApi = {
    createWebLead: (data: any) => {
        return axiosClient.post('/trial/web', data);
    }
};