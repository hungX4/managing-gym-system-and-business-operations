import axiosClient from "../axiosClient"

export const userApi = {
    getCoaches: async () => {
        const response = await axiosClient.get('/user/coaches');
        return response.data;
    },
    updateUserProfile: async (formData: FormData) => {
        return axiosClient.patch('/user/me', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}