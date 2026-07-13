import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mail, Phone, User, ShieldCheck, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavbar } from '../hooks/useNavbar';
import { userApi } from '../api/user/user.api';

const ProfilePage = () => {
    const { userData, setUserData } = useNavbar();
    const [isUpdating, setIsUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        gmail: '',
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                fullName: userData.fullName || '',
                phone: userData.phone || '',
                gmail: userData.gmail || '',
            });
            setAvatarPreview(userData.avatarUrl);
        }
    }, [userData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('phone', formData.phone);
            data.append('gmail', formData.gmail);

            if (selectedFile) {
                data.append('avatar', selectedFile);
            }

            const res = await userApi.updateUserProfile(data);
            const updatedUser = res.data.data;

            localStorage.setItem('userData', JSON.stringify(updatedUser));
            if (setUserData) setUserData(updatedUser);
            window.dispatchEvent(new Event('userDataUpdated'));
            toast.success('Cập nhật hồ sơ thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        // Đổi background nền tổng thể thành màu Đen Tuyền (Black)
        <div className="min-h-screen bg-[#050505] text-gray-100 pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Khung chứa nội dung chính với nền xám rất tối và viền tinh tế */}
                <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[700px]">

                    {/* CỘT TRÁI: THÔNG TIN CƠ BẢN & AVATAR (Chiếm 1/3) */}
                    <div className="md:w-1/3 bg-black/40 border-r border-neutral-800 p-8 flex flex-col items-center">

                        <div className="relative mb-6 mt-4 group">
                            {/* Vòng tròn Avatar - Đổi viền thành màu Đỏ */}
                            <div className="w-40 h-40 rounded-full border-2 border-red-600 p-1 bg-neutral-900 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all duration-300">
                                <div className="w-full h-full rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-full h-full text-neutral-600 p-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    )}
                                </div>
                            </div>

                            {/* Nút Upload đè lên góc phải dưới */}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-2 right-2 bg-neutral-800 border border-neutral-600 text-gray-300 hover:text-white hover:bg-red-600 hover:border-red-600 p-2.5 rounded-full shadow-lg transition-all focus:outline-none"
                                title="Thay đổi ảnh đại diện"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>

                        {/* Tên & Email (Chữ trắng và xám) */}
                        <h2 className="text-2xl font-bold text-white text-center mb-1 uppercase tracking-wide">
                            {userData?.fullName || 'Người dùng'}
                        </h2>
                        <p className="text-sm text-gray-400 mb-4 text-center">
                            {userData?.gmail || 'Chưa cập nhật email'}
                        </p>

                        {/* Badge Role (Nền đỏ nhạt, chữ đỏ rực) */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/40 border border-red-900/50 rounded-md text-xs font-bold text-red-500 uppercase tracking-widest shadow-sm">
                            <ShieldCheck size={14} />
                            {userData?.role || 'Member'}
                        </div>
                    </div>

                    {/* CỘT PHẢI: FORM CHỈNH SỬA (Chiếm 2/3) */}
                    <div className="md:w-2/3 p-8 md:p-12">
                        <div className="mb-10 border-b border-neutral-800 pb-4">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                Thông tin <span className="text-red-600">tài khoản</span>
                            </h3>
                            <p className="text-neutral-400 text-sm mt-1">Quản lý thông tin cá nhân và cách liên hệ với bạn.</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-2xl">

                            {/* Dòng 1: Họ tên & Số điện thoại */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                        <User size={16} className="text-red-500" /> Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all placeholder:text-neutral-600"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                        <Phone size={16} className="text-red-500" /> Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all placeholder:text-neutral-600"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                            </div>

                            {/* Dòng 2: Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                    <Mail size={16} className="text-red-500" /> Địa chỉ Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all placeholder:text-neutral-600"
                                    value={formData.gmail}
                                    onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>

                            {/* Nút Submit */}
                            <div className="pt-8 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-sm py-3.5 px-8 rounded-lg transition-all flex items-center gap-2 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(220,38,38,0.2)] hover:shadow-red-600/40 cursor-pointer"
                                >
                                    {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Lưu thay đổi
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;