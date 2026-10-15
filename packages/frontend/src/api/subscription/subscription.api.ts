// src/api/subscription.api.ts
import type {
    PackageResponseDto,
    CoachResponseDto,
    MemberSearchResponseDto,
    CreateContractRequestDto
} from '@gym/shared';
import axiosClient from '../axiosClient';

export const subscriptionApi = {

    // 4. Tạo hợp đồng đăng ký gói tập Offline (Staff/Coach/Admin)
    createContract: async (payload: CreateContractRequestDto): Promise<any> => {
        return await axiosClient.post('/subscription/contract', payload);
    }
};