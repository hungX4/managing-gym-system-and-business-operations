// src/pages/subscription/OfflineSubscriptionForm.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    PaymentMethod,
    type PackageResponseDto,
    PackageType,
    type CoachResponseDto,
    type MemberSearchResponseDto,
    type CreateContractRequestDto
} from '@gym/shared';
import { subscriptionApi } from '../../api/subscription/subscription.api';
import { PackageApi } from '../../api/packgage/package.api';
import { coachApi } from '../../api/user/coachApi';
import axiosClient from '../../api/axiosClient';

export default function OfflineSubscriptionForm() {
    // --- STATE TÌM KIẾM ---
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<MemberSearchResponseDto[]>([]);
    const [selectedMember, setSelectedMember] = useState<MemberSearchResponseDto | null>(null);

    // --- STATE DATA MASTER ---
    const [packages, setPackages] = useState<PackageResponseDto[]>([]);
    const [coaches, setCoaches] = useState<CoachResponseDto[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(false);
    const [loadingCoaches, setLoadingCoaches] = useState(false);

    // --- STATE FORM ---
    const [formData, setFormData] = useState({
        packageId: '',
        sellerId: '',
        startDate: new Date().toISOString().split('T')[0],
        discount: 0,
        paymentMethod: PaymentMethod.CASH
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // 1. FETCH DATA BAN ĐẦU
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingPackages(true);
            setLoadingCoaches(true);
            try {
                const [pkgRes, coachRes] = await Promise.all([
                    PackageApi.getAllPackages(),
                    coachApi.getCoaches()
                ]);

                // Bóc tách dữ liệu an toàn
                const pkgList = Array.isArray(pkgRes) ? pkgRes : (pkgRes as any)?.data || [];
                const coachList = Array.isArray(coachRes) ? coachRes : (coachRes as any)?.data || [];
                setPackages(pkgList.filter((p: PackageResponseDto) => p.isActive));
                setCoaches(coachList);
            } catch (error) {
                console.error("Lỗi fetch data:", error);
                toast.error("Không thể tải dữ liệu hệ thống");
            } finally {
                setLoadingPackages(false);
                setLoadingCoaches(false);
            }
        };
        fetchInitialData();
    }, []);

    // 2. TÌM KIẾM HỘI VIÊN (DEBOUNCE)
    useEffect(() => {
        if (!keyword.trim() || selectedMember) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await axiosClient.get<any, any[]>(`/user/search?keyword=${keyword}`);;
                const memberList = Array.isArray(res) ? res : (res as any)?.data || [];
                setSearchResults(memberList);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [keyword, selectedMember]);

    const handleSelectMember = (member: MemberSearchResponseDto) => {
        setSelectedMember(member);
        setSearchResults([]);
        setKeyword(`${member.fullName} - ${member.phone}`);
    };

    const handleClearMember = () => {
        setSelectedMember(null);
        setKeyword('');
        setSearchResults([]);
        setFormData(prev => ({ ...prev, packageId: '', sellerId: '' }));
    };

    const selectedPkgInfo = packages.find(p => p.packageId.toString() === formData.packageId);
    const isCoachingPackage = selectedPkgInfo?.type === PackageType.COACHING;

    // 3. SUBMIT TẠO HỢP ĐỒNG
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMember || !formData.packageId) {
            return toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
        }

        if (isCoachingPackage && !formData.sellerId) {
            return toast.error('Vui lòng chọn Huấn luyện viên cho gói tập này!');
        }

        setIsSubmitting(true);
        try {
            const payload: CreateContractRequestDto = {
                memberId: selectedMember.memberId.toString(),
                packageId: Number(formData.packageId),
                startDate: new Date(formData.startDate),
                sellerId: isCoachingPackage ? formData.sellerId : null,
                discount: Number(formData.discount),
                paymentMethod: formData.paymentMethod
            };

            await subscriptionApi.createContract(payload);
            setShowSuccessModal(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi tạo hợp đồng!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setShowSuccessModal(false);
        setSelectedMember(null);
        setKeyword('');
        setFormData({
            packageId: '',
            sellerId: '',
            startDate: new Date().toISOString().split('T')[0],
            discount: 0,
            paymentMethod: PaymentMethod.CASH
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white px-4 sm:px-8 pb-8 pt-24 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* 1. Tìm kiếm hội viên */}
                <div className="bg-[#111111] border border-neutral-800 p-6 rounded-xl relative shadow-2xl">
                    <h2 className="text-sm font-bold text-red-500 mb-4 uppercase tracking-wider">1. Tìm kiếm hội viên</h2>
                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Nhập SĐT hoặc Tên..."
                                className={`w-full bg-[#1a1a1a] border rounded-lg px-4 py-3 text-white outline-none transition-all ${selectedMember
                                    ? 'border-green-500/50 bg-green-500/5'
                                    : 'border-neutral-700 focus:border-red-500'
                                    }`}
                                value={selectedMember ? `${selectedMember.fullName} - ${selectedMember.phone}` : keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                readOnly={!!selectedMember}
                            />

                            {selectedMember && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {selectedMember && (
                            <button
                                type="button"
                                onClick={handleClearMember}
                                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-3 rounded-lg text-sm font-medium border border-neutral-700 transition-colors whitespace-nowrap"
                            >
                                Đổi hội viên
                            </button>
                        )}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="absolute left-6 right-6 top-full mt-2 bg-[#1a1a1a] border border-neutral-600 rounded-lg shadow-2xl z-20 max-h-64 overflow-y-auto">
                            {searchResults.map((user) => (
                                <div key={user.memberId} onClick={() => handleSelectMember(user)} className="p-4 border-b border-neutral-800 hover:bg-neutral-800 cursor-pointer flex justify-between items-center group">
                                    <div>
                                        <p className="font-bold group-hover:text-red-400 transition-colors">{user.fullName}</p>
                                        <p className="text-neutral-400 text-sm">{user.phone}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className={`px-2 py-1 rounded text-[10px] font-medium ${user.hasActivePackage ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-red-900/30 text-red-400 border border-red-800/50'}`}>
                                            {user.hasActivePackage ? 'Đang Active' : 'Không có gói'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Thông tin hợp đồng */}
                <div className={`bg-[#111111] border border-neutral-800 p-6 rounded-xl shadow-2xl transition-all ${!selectedMember ? 'opacity-40 pointer-events-none' : ''}`}>
                    <h2 className="text-sm font-bold text-red-500 mb-5 uppercase tracking-wider">2. Thông tin hợp đồng</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-neutral-400 mb-1">Gói tập đăng ký</label>
                            <select
                                className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none appearance-none cursor-pointer"
                                value={formData.packageId}
                                onChange={(e) => setFormData({ ...formData, packageId: e.target.value, sellerId: '' })}
                                disabled={loadingPackages}
                            >
                                <option value="" disabled>
                                    {loadingPackages ? 'Đang tải gói tập...' : '-- Chọn gói tập --'}
                                </option>
                                {packages.map((pkg) => (
                                    <option key={pkg.packageId} value={pkg.packageId}>
                                        {pkg.name} - {pkg.price.toLocaleString('vi-VN')} VNĐ
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isCoachingPackage && (
                            <div className="animate-fadeIn">
                                <label className="block text-sm text-red-400 font-bold mb-1">Chọn Huấn luyện viên (*)</label>
                                <select
                                    className="w-full bg-[#111111] border border-gray-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
                                    value={formData.sellerId}
                                    onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
                                    disabled={loadingCoaches}
                                >
                                    <option value="" className='bg-neutral-900 text-neutral-500' disabled>
                                        {loadingCoaches ? 'Đang tải danh sách...' : '-- Chọn Huấn luyện viên --'}
                                    </option>
                                    {coaches.map((coach) => (
                                        <option key={coach.userId} value={coach.userId}>
                                            {coach.fullName} {coach.coachType ? `- ${coach.coachType}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Ngày bắt đầu</label>
                                <input
                                    type="date"
                                    className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-2.5 text-white"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Giảm giá (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-2.5 text-white"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-neutral-400 mb-1">Thanh toán</label>
                            <select
                                className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-2.5 text-white"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                            >
                                <option value={PaymentMethod.CASH}>Tiền mặt</option>
                                <option value={PaymentMethod.BANK_TRANSFER}>Chuyển khoản</option>
                                <option value={PaymentMethod.CREDIT_CARD}>Thẻ tín dụng</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN TẠO HỢP ĐỒNG'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Modal thành công */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-[#111111] border border-red-600/50 rounded-2xl p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
                        <h2 className="text-xl font-bold mb-2">Thành công!</h2>
                        <p className="text-neutral-400 mb-6">Hợp đồng đã được kích hoạt cho hội viên.</p>
                        <button onClick={resetForm} className="w-full bg-red-600 py-3 rounded-lg font-bold">TIẾP TỤC</button>
                    </div>
                </div>
            )}
        </div>
    );
}