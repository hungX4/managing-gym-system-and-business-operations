import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mail, Phone, User, ShieldCheck, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavbar } from '../hooks/useNavbar';
import axiosClient from '../api/axiosClient';

const ProfilePage = () => {
    // Lấy userData và setUserData từ hook đã được refactor
    const { userData, setUserData } = useNavbar();
    const [isUpdating, setIsUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        gmail: '',
    });

    // Đồng bộ dữ liệu vào form khi userData thay đổi
    useEffect(() => {
        if (userData) {
            setFormData({
                fullName: userData.fullName || '',
                phone: userData.phone || '',
                gmail: userData.gmail || '',
            });
        }
    }, [userData]);

    // 1. Xử lý Upload Ảnh (Đẩy lên Cloudinary qua API backend)
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userData) return;

        // 1. Khởi tạo FormData
        const uploadFormData = new FormData();

        // 2. Append các trường. Tên 'avatar' phải khớp với upload.single('avatar') ở BE
        uploadFormData.append('avatar', file);
        uploadFormData.append('fullName', userData.fullName || '');
        uploadFormData.append('phone', userData.phone || '');
        uploadFormData.append('gmail', userData.gmail || '');

        setUploading(true);
        try {
            //  Gửi request. 
            // QUAN TRỌNG: Không được để axios tự ép kiểu Content-Type là application/json
            const res = await axiosClient.patch(`/user/${userData.userId}`, uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Ép định dạng gửi file
                },
            });

            const updatedUser = res.data.data;

            // 4. Cập nhật localStorage và State
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            if (setUserData) setUserData(updatedUser);
            window.dispatchEvent(new Event('userDataUpdated'));
            toast.success('Cập nhật ảnh thành công!');
        } catch (error: any) {
            toast.error('Lỗi khi tải ảnh lên');
        } finally {
            setUploading(false);
        }
    };

    // 2. Xử lý Cập nhật Thông tin chữ
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await axiosClient.patch(`/user/${userData.userId}`, formData);
            const updatedUser = res.data.data;

            localStorage.setItem('userData', JSON.stringify(updatedUser));
            setUserData(updatedUser);
            toast.success('Cập nhật hồ sơ thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-28 pb-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* CỘT TRÁI: AVATAR CARD */}
                    <div className="md:w-1/3">
                        <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
                            {/* Background trang trí */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>

                            <div className="relative group">
                                <div className="w-40 h-40 rounded-full border-4 border-red-600/20 p-1.5 group-hover:border-red-600 transition-all duration-500">
                                    <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden flex items-center justify-center">
                                        {userData?.avatarUrl ? (
                                            <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-5xl font-black text-neutral-700">{userData?.fullName?.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 p-3 rounded-full shadow-xl hover:scale-110 transition-all"
                                    disabled={uploading}
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                            </div>

                            <h2 className="mt-6 text-2xl font-black italic uppercase tracking-tighter text-center">
                                {userData?.fullName}
                            </h2>
                            <div className="mt-3 flex items-center gap-2 text-red-500 bg-red-500/5 border border-red-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase italic">
                                <ShieldCheck size={14} />
                                {userData?.role}
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: FORM CHỈNH SỬA */}
                    <div className="md:w-2/3">
                        <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
                            <div className="mb-8">
                                <h3 className="text-xl font-black uppercase italic tracking-widest text-red-600">Thông tin tài khoản</h3>
                                <div className="h-1 w-12 bg-red-600 mt-1"></div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                            <User size={12} className="text-red-600" /> Họ và tên
                                        </label>
                                        <input
                                            className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3.5 focus:border-red-600 outline-none transition-all placeholder:text-neutral-700"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="Họ và tên của bạn"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                            <Phone size={12} className="text-red-600" /> Số điện thoại
                                        </label>
                                        <input
                                            className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3.5 focus:border-red-600 outline-none transition-all"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                        <Mail size={12} className="text-red-600" /> Địa chỉ Email
                                    </label>
                                    <input
                                        className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3.5 focus:border-red-600 outline-none transition-all"
                                        value={formData.gmail}
                                        onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 border-t border-neutral-900 mt-8 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="group bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded-xl transition-all flex items-center gap-3 shadow-[0_10px_20px_-10px_rgba(220,38,38,0.5)] hover:shadow-red-600/40 uppercase italic tracking-tighter"
                                    >
                                        {isUpdating ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                        Cập nhật ngay
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;