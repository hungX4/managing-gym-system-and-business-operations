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
                const res = await axiosClient.get<any, any[]>(`/user/search?keyword=${encodeURIComponent(keyword)}`);
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
        /* 🟢 Căn giữa vertically, giảm padding top/bottom xuống py-4 md:py-6 */
        <div className="w-full min-h-[calc(100vh-70px)] flex flex-col justify-center items-center px-4 py-4 md:py-6 text-white font-sans">

            {/* 🟢 Khóa chiều rộng max-w-lg (512px) cho toàn bộ Form không bị thô/phình to */}
            <div className="w-full max-w-md sm:max-w-lg mx-auto space-y-3.5">

                {/* 1. TÌM KIẾM HỘI VIÊN */}
                <div className="bg-[#111111] border border-neutral-800/80 p-4 rounded-xl relative shadow-xl">
                    <h2 className="text-xs font-bold text-red-500 mb-2.5 uppercase tracking-wider">
                        1. Tìm kiếm hội viên
                    </h2>

                    <div className="flex gap-2.5 items-center">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Nhập SĐT hoặc Tên..."
                                className={`w-full bg-[#161616] border rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white outline-none transition-all ${selectedMember
                                    ? 'border-green-500/50 bg-green-500/5'
                                    : 'border-neutral-800 focus:border-red-600'
                                    }`}
                                value={selectedMember ? `${selectedMember.fullName} - ${selectedMember.phone}` : keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                readOnly={!!selectedMember}
                            />

                            {selectedMember && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {selectedMember && (
                            <button
                                type="button"
                                onClick={handleClearMember}
                                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg text-xs font-medium border border-neutral-700 transition-colors whitespace-nowrap shrink-0"
                            >
                                Đổi hội viên
                            </button>
                        )}
                    </div>

                    {/* Dropdown Tìm kiếm */}
                    {searchResults.length > 0 && (
                        <div className="absolute left-4 right-4 top-full mt-1 bg-[#1a1a1a] border border-neutral-700 rounded-lg shadow-2xl z-30 max-h-52 overflow-y-auto">
                            {searchResults.map((user) => (
                                <div
                                    key={user.memberId}
                                    onClick={() => handleSelectMember(user)}
                                    className="p-3 border-b border-neutral-800/80 hover:bg-neutral-800/80 cursor-pointer flex justify-between items-center group transition-colors"
                                >
                                    <div>
                                        <p className="font-bold text-xs sm:text-sm group-hover:text-red-400 transition-colors">{user.fullName}</p>
                                        <p className="text-neutral-400 text-[11px]">{user.phone}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${user.hasActivePackage
                                        ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                                        : 'bg-red-900/30 text-red-400 border border-red-800/50'
                                        }`}>
                                        {user.hasActivePackage ? 'Đang Active' : 'Không có gói'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. THÔNG TIN HỢP ĐỒNG */}
                <div className={`bg-[#111111] border border-neutral-800/80 p-4 rounded-xl shadow-xl transition-all ${!selectedMember ? 'opacity-40 pointer-events-none' : ''}`}>
                    <h2 className="text-xs font-bold text-red-500 mb-3 uppercase tracking-wider">
                        2. Thông tin hợp đồng
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-3">

                        {/* GÓI TẬP */}
                        <div>
                            <label className="block text-xs text-neutral-400 mb-1 font-medium">Gói tập đăng ký (*)</label>
                            <select
                                className="w-full bg-[#161616] border border-neutral-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white focus:border-red-600 outline-none cursor-pointer"
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

                        {/* HLV (CHỈ KHI GÓI LÀ COACHING) */}
                        {isCoachingPackage && (
                            <div className="animate-fadeIn">
                                <label className="block text-xs text-red-400 font-bold mb-1">Chọn Huấn luyện viên (*)</label>
                                <select
                                    className="w-full bg-[#161616] border border-gray-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white focus:border-red-600 outline-none cursor-pointer"
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

                        {/* NGÀY BẮT ĐẦU & GIẢM GIÁ (2 CỘT SONG SONG NGHỆ THUẬT) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-neutral-400 mb-1 font-medium">Ngày bắt đầu</label>
                                <input
                                    type="date"
                                    className="w-full bg-[#161616] border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-red-600"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-400 mb-1 font-medium">Giảm giá (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-full bg-[#161616] border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-red-600"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* PHƯƠNG THỨC THANH TOÁN */}
                        <div>
                            <label className="block text-xs text-neutral-400 mb-1 font-medium">Thanh toán</label>
                            <select
                                className="w-full bg-[#161616] border border-neutral-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white outline-none focus:border-red-600 cursor-pointer"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                            >
                                <option value={PaymentMethod.CASH}>Tiền mặt</option>
                                <option value={PaymentMethod.BANK_TRANSFER}>Chuyển khoản</option>
                                <option value={PaymentMethod.CREDIT_CARD}>Thẻ tín dụng</option>
                            </select>
                        </div>

                        {/* NÚT SUBMIT GỌN GÀNG */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm tracking-wider uppercase transition-all disabled:opacity-50 mt-1 shadow-md shadow-red-600/20"
                        >
                            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN TẠO HỢP ĐỒNG'}
                        </button>
                    </form>
                </div>
            </div>

            {/* MODAL THÀNH CÔNG (PREMIUM STYLE) */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="relative w-full max-w-md bg-gradient-to-b from-[#18181b] to-[#0f0f11] border border-neutral-800/90 rounded-2xl p-6 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_-10px_rgba(34,197,94,0.15)] overflow-hidden">

                        {/* Đường viền Gradient hắt sáng cực tinh tế ở đỉnh Modal */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/80 to-transparent" />

                        {/* Icon Thành Công Hiện Đại */}
                        <div className="flex justify-center mb-5">
                            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 shadow-[0_0_25px_rgba(34,197,94,0.2)]">
                                <svg className="w-7 h-7 text-green-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                        </div>

                        {/* Tiêu đề & Nội dung */}
                        <div className="text-center space-y-1 mb-5">
                            <h3 className="text-lg sm:text-xl font-extrabold text-white uppercase tracking-wide">
                                Tạo hợp đồng thành công
                            </h3>
                            <p className="text-xs sm:text-sm text-neutral-400">
                                Gói tập đã được kích hoạt thành công trên hệ thống.
                            </p>
                        </div>

                        {/* Thẻ Tóm Tắt Biên Nhận Hợp Đồng (Receipt Summary) */}
                        <div className="bg-[#121214] border border-neutral-800/80 rounded-xl p-3.5 mb-6 text-xs space-y-2.5">
                            <div className="flex justify-between items-center pb-2 border-b border-neutral-800/60">
                                <span className="text-neutral-400">Hội viên:</span>
                                <span className="font-semibold text-white">{selectedMember?.fullName}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-neutral-800/60">
                                <span className="text-neutral-400">Gói đăng ký:</span>
                                <span className="font-semibold text-red-400">{selectedPkgInfo?.name}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-neutral-800/60">
                                <span className="text-neutral-400">Ngày bắt đầu:</span>
                                <span className="font-mono text-neutral-200">{formData.startDate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-400">Thanh toán:</span>
                                <span className="font-medium text-green-400 bg-green-950/40 border border-green-800/40 px-2 py-0.5 rounded text-[11px]">
                                    {formData.paymentMethod}
                                </span>
                            </div>
                        </div>

                        {/* Cụm Nút Hành Động */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => toast.success("Tính năng in hợp đồng đang được xử lý...")}
                                className="w-full bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/80 text-neutral-200 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-[0.98]"
                            >
                                🖨️ In biên nhận
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/25 active:scale-[0.98]"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}