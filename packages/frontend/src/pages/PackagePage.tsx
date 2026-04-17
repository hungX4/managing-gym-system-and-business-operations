// src/pages/admin/PackageManagementPage.tsx
import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import CreatePackageForm from '../components/admin/package/CreatePackageForm';
import { PackageType } from '@gym/shared';

export default function PackagePage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [filterType, setFilterType] = useState<string>('ALL');
    const [isLoading, setIsLoading] = useState(false);

    // 1. GỌI API LẤY DANH SÁCH GÓI TẬP
    const fetchPackages = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get('/package');
            setPackages(res.data);
        } catch (error) {
            toast.error('Không thể tải danh sách gói tập');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    // 2. GỌI API ĐỔI TRẠNG THÁI
    const handleToggleStatus = async (packageId: number) => {
        try {
            const res = await axiosClient.patch(`/package/${packageId}/status`);
            toast.success(res.data.message);
            // Cập nhật lại state mượt mà không cần load lại cả trang
            setPackages(prev => prev.map(pkg =>
                pkg.packageId === packageId ? { ...pkg, isActive: res.data.data.isActive } : pkg
            ));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi đổi trạng thái');
        }
    };

    // 3. LOGIC LỌC DỮ LIỆU TRÊN FRONTEND
    const filteredPackages = filterType === 'ALL'
        ? packages
        : packages.filter(pkg => pkg.type === filterType);

    // Hàm render label cho loại gói
    const getPackageTypeLabel = (type: string) => {
        switch (type) {
            case PackageType.MEMBERSHIP: return <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs border border-blue-800">Tự tập (Gym)</span>;
            case PackageType.COACHING: return <span className="bg-red-900/30 text-red-400 px-2 py-1 rounded text-xs border border-red-800">PT 1-1</span>;
            case PackageType.DANCE: return <span className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded text-xs border border-purple-800">Lớp Yoga/Dance</span>;
            default: return type;
        }
    };

    return (
        // pt-24 để né cái NavBar fixed (h-16 = 64px, thêm khoảng cách cho thoáng)
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 md:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* COMPONENT FORM THÊM MỚI (Truyền fetchPackages vào onSuccess để tạo xong thì bảng tự update) */}
                <CreatePackageForm onSuccess={fetchPackages} />

                {/* KHU VỰC BẢNG DANH SÁCH */}
                <div className="bg-[#111111] border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
                    {/* Toolbar: Tiêu đề & Bộ lọc */}
                    <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#161616]">
                        <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                            Danh sách gói tập
                        </h2>

                        {/* Bộ lọc filter */}
                        <div className="flex gap-2 bg-[#0a0a0a] p-1 rounded-lg border border-gray-800">
                            {['ALL', PackageType.MEMBERSHIP, PackageType.COACHING, PackageType.DANCE].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-md uppercase transition-all ${filterType === type
                                        ? 'bg-gray-800 text-white shadow'
                                        : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {type === 'ALL' ? 'Tất cả' : type === PackageType.MEMBERSHIP ? 'Gym' : type === PackageType.COACHING ? 'PT 1-1' : 'Yoga/Dance'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bảng Dữ Liệu */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-widest text-gray-500 border-b border-gray-800 bg-[#1a1a1a]">
                                    <th className="px-6 py-4 font-black">Tên Gói</th>
                                    <th className="px-6 py-4 font-black">Loại</th>
                                    <th className="px-6 py-4 font-black">Giá (VNĐ)</th>
                                    <th className="px-6 py-4 font-black">Thời hạn</th>
                                    <th className="px-6 py-4 font-black text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-gray-500">Đang tải dữ liệu...</td></tr>
                                ) : filteredPackages.length > 0 ? (
                                    filteredPackages.map((pkg) => (
                                        <tr key={pkg.packageId} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-bold text-white">
                                                {pkg.name}
                                                {/* Hiển thị số buổi bên dưới tên nếu là gói PT */}
                                                {pkg.type === PackageType.COACHING && (
                                                    <p className="text-xs text-red-400 font-normal mt-0.5">Tổng: {pkg.totalSession} buổi</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getPackageTypeLabel(pkg.type)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-yellow-500 font-mono">
                                                {Number(pkg.price).toLocaleString('vi-VN')} đ
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {pkg.durationDays} ngày
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {/* Nút Toggle Switch Đổi trạng thái */}
                                                <button
                                                    onClick={() => handleToggleStatus(pkg.packageId)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${pkg.isActive ? 'bg-green-500' : 'bg-gray-700'
                                                        }`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pkg.isActive ? 'translate-x-6' : 'translate-x-1'
                                                        }`} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-gray-500 italic">
                                            Chưa có gói tập nào phù hợp.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}