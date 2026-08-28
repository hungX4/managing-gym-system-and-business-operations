import type { CreatePackageRequestDto, PackageResponseDto } from "@gym/shared"
import axiosClient from "../axiosClient"

export const PackageApi = {
    getAllPackages: () => {
        return axiosClient.get<any, PackageResponseDto[]>('/packages');
    },

    createPackage: (data: CreatePackageRequestDto) => {
        return axiosClient.post('/packages', data);
    },

    toggleStatus: (packageId: any) => {
        return axiosClient.patch<any, PackageResponseDto>(`packages/${packageId}/status`);
    }
}