import axiosClient from "../axiosClient"

export const userApi = {
    getCoaches: async () => {
        const response = await axiosClient.get('/user/coaches');
        return response.data;
    }
}