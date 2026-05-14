import axiosClient from './axiosClient';

export const coachApi = {
    // Public: Lấy danh sách HLV
    getAllCoaches: () => {
        return axiosClient.get('/coach');
    },

    // Private: HLV lấy thông tin của mình
    getMyProfile: () => {
        return axiosClient.get('/coach/me');
    },

    // Private: HLV cập nhật thông tin (Dùng FormData để upload ảnh)
    updateMyProfile: (formData: FormData) => {
        return axiosClient.patch('/coach/me', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};