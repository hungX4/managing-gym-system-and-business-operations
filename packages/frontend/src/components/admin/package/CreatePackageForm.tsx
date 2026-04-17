import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CreatePackageRequestDto, PackageType } from '@gym/shared';
import axiosClient from '../../../api/axiosClient';
export default function CreatePackageForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false);

    // State quản lý dữ liệu form
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        type: PackageType.MEMBERSHIP,
        totalSessions: '',
        durationDays: ''
    });

    // Hàm xử lý khi người dùng gõ vào input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Reset lại số buổi về rỗng nếu người dùng chuyển sang gói MEMBERSHIP
        if (name === 'type' && value === PackageType.MEMBERSHIP) {
            setFormData(prev => ({ ...prev, totalSession: '' }));
        }
    };

    // Hàm gọi API khi submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate cơ bản ở FE trước khi gọi API
        if (!formData.name.trim() || !formData.price || !formData.durationDays) {
            return toast.error("Vui lòng điền đầy đủ Tên, Giá và Thời hạn gói tập!");
        }

        if (formData.type === PackageType.COACHING) {
            const sessions = Number(formData.totalSessions);
            if (!formData.totalSessions || isNaN(sessions) || sessions <= 0) {
                return toast.error("Gói PT bắt buộc phải nhập Tổng số buổi (lớn hơn 0)!");
            }
        }

        setIsLoading(true);
        try {
            // Ép kiểu dữ liệu trước khi gửi lên Backend
            const payload: CreatePackageRequestDto = {
                name: formData.name.trim(),
                price: Number(formData.price),
                type: formData.type,
                totalSessions: formData.totalSessions ? Number(formData.totalSessions) : null,
                durationDays: Number(formData.durationDays)
            };

            const res = await axiosClient.post('/package', payload);

            toast.success(res.data.message || 'Tạo gói tập thành công!');

            // Reset form sau khi thành công
            setFormData({
                name: '',
                price: '',
                type: PackageType.MEMBERSHIP,
                totalSessions: '',
                durationDays: ''
            });

            // Gọi callback để load lại bảng danh sách bên ngoài (nếu có)
            if (onSuccess) onSuccess();

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi tạo gói tập!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 shadow-2xl">
            <div className="mb-6 border-b border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                    Thêm Gói Tập <span className="text-red-600">Mới</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">Tạo mới các gói Gym, PT, Yoga/Dance để bán cho Hội viên.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Dòng 1: Tên gói & Loại gói */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tên gói tập <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="VD: Gói PT 1-1 Chuyên Sâu, Gym 1 Tháng..."
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-red-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Loại gói <span className="text-red-500">*</span></label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-red-500 transition-colors appearance-none"
                        >
                            <option value={PackageType.MEMBERSHIP}>Tự tập (Gym)</option>
                            <option value={PackageType.COACHING}>Tập cùng PT 1-1</option>
                            <option value={PackageType.DANCE}>Lớp học (Dance/Yoga)</option>
                        </select>
                    </div>
                </div>

                {/* Dòng 2: Giá tiền */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        placeholder="VD: 500000"
                        className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-red-500 transition-colors"
                    />
                </div>

                {/* Dòng 3: Số buổi & Thời hạn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Tổng số buổi
                            {formData.type === PackageType.COACHING && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type="number"
                            name="totalSessions"
                            value={formData.totalSessions}
                            onChange={handleChange}
                            min="1"
                            disabled={formData.type === PackageType.MEMBERSHIP}
                            placeholder={formData.type === PackageType.MEMBERSHIP ? "Không áp dụng cho gói Gym" : "VD: 12, 24, 36..."}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Thời hạn sử dụng (Ngày) <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="durationDays"
                            value={formData.durationDays}
                            onChange={handleChange}
                            min="1"
                            placeholder="VD: 30, 90, 365..."
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-red-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                ĐANG XỬ LÝ...
                            </>
                        ) : (
                            'LƯU GÓI TẬP'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}