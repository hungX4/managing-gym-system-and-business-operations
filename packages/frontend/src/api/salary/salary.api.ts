import axiosClient from '../axiosClient';
import type { GetSalaryQueryDto, SalaryResponseDto, FinalizeSalaryDto } from '@gym/shared'; // Trỏ đúng đường dẫn file DTO của bạn

// Định nghĩa form Response chung từ Backend trả về
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const SalaryApi = {
    // Lấy danh sách lương (Tính nháp hoặc đã chốt)
    getSalaries: async (params: GetSalaryQueryDto): Promise<SalaryResponseDto[]> => {
        const response = await axiosClient.get<ApiResponse<SalaryResponseDto[]>>('/salary', { params });
        return response.data.data;
    },

    // Chốt lương tháng
    finalizeSalary: async (data: FinalizeSalaryDto): Promise<any> => {
        const response = await axiosClient.post<ApiResponse<any>>('/salary/finalize', data);
        return response.data;
    },

    // Kế toán xác nhận thanh toán
    paySalary: async (salaryId: number): Promise<any> => {
        const response = await axiosClient.patch<ApiResponse<any>>(`/salary/${salaryId}/pay`);
        return response.data;
    },

    getSalaryDetails: async (params: { coachId: number, month: number, year: number }) => {
        const response = await axiosClient.get('/salary/details', { params });
        return response.data;
    }
};