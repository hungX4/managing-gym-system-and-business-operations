import React, { useEffect, useState, useRef } from 'react';
import { coachApi } from '../../api/coachApi';
import toast from 'react-hot-toast';

const CoachProfileSettings: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        bio: '',
        coachType: '', // Chỉ hiển thị, không cho sửa
        coachLevel: '' // Chỉ hiển thị, không cho sửa
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Fetch data khi vào trang
        const fetchMyProfile = async () => {
            try {
                const res = await coachApi.getMyProfile();
                const data = res.data;
                setFormData({
                    fullName: data.fullName || '',
                    phone: data.phone || '',
                    bio: data.bio || '',
                    coachType: data.coachType || 'Chưa cập nhật',
                    coachLevel: data.coachLevel || 'Chưa cập nhật'
                });
                setAvatarPreview(data.avatarUrl);
            } catch (error) {
                console.error("Lỗi lấy thông tin:", error);
            }
        };
        fetchMyProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setAvatarPreview(URL.createObjectURL(file)); // Hiển thị ảnh preview
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('phone', formData.phone);
            data.append('bio', formData.bio);
            if (selectedFile) {
                data.append('avatar', selectedFile);
            }

            // 1. Gọi API cập nhật
            const res = await coachApi.updateMyProfile(data);

            // 2. Lấy data mới nhất từ Backend trả về
            const updatedCoach = res.data.data; // Dựa theo controller bạn viết trả về { message: "...", data: result }

            // 3. Cập nhật lại userData trong LocalStorage (Để F5 không bị mất)
            const currentStorage = localStorage.getItem('userData');
            if (currentStorage) {
                const userData = JSON.parse(currentStorage);
                userData.avatarUrl = updatedCoach.avatarUrl; // Cập nhật link ảnh mới
                userData.fullName = updatedCoach.fullName;   // Cập nhật tên mới luôn
                localStorage.setItem('userData', JSON.stringify(userData));
            }

            // 4. 🔥 Bắn sự kiện ra toàn cục để Navbar lắng nghe
            window.dispatchEvent(new Event('userDataUpdated'));

            toast.success("🎉 Cập nhật thông tin thành công!");
        } catch (error) {
            console.error(error);
            toast.error("❌ Có lỗi xảy ra khi cập nhật!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className=" pt-18 min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-800">
                <div className="px-8 py-6 border-b border-gray-800">
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider">Hồ Sơ Chuyên Môn</h2>
                    <p className="text-gray-400 text-sm mt-1">Cập nhật thông tin hiển thị với khách hàng</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Phần Avatar */}
                    <div className="flex items-center space-x-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-800 bg-gray-800">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-full h-full text-gray-600 p-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-red-600 text-gray-900 p-2 rounded-full hover:bg-red-400 transition-colors shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                        <div>
                            <div className="text-red-600 text-sm font-bold uppercase tracking-widest mb-1">{formData.coachLevel}</div>
                            <div className="text-white font-medium">{formData.coachType}</div>
                            <p className="text-gray-500 text-xs mt-2 italic">* Cấp bậc do Admin quy định</p>
                        </div>
                    </div>

                    {/* Phần Input Text */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Họ và tên</label>
                            <input
                                type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Số điện thoại</label>
                            <input
                                type="text" name="phone" value={formData.phone} onChange={handleChange} required
                                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Kinh nghiệm & Thành tích (Bio)</label>
                        <textarea
                            name="bio" value={formData.bio} onChange={handleChange} rows={5}
                            placeholder="Giới thiệu về kinh nghiệm huấn luyện của bạn..."
                            className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit" disabled={isSaving}
                            className="w-full bg-red-600 hover:bg-red-400 text-gray-200 font-black py-4 rounded-xl uppercase tracking-widest transition-colors flex justify-center items-center disabled:opacity-70"
                        >
                            {isSaving ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Đang lưu...</>
                            ) : "Lưu Thay Đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CoachProfileSettings;