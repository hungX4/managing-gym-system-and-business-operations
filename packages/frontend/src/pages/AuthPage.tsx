import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
    LoginRequestDto,
    RegisterRequestDto,
    AuthResponseDto
} from "@gym/shared";
import toast from 'react-hot-toast';

export default function AuthPage() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true); // true = Login, false = Register
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            navigate('/'); // Nếu có token thì đá về trang chủ luôn
        }
    }, [navigate]);

    // State lưu trữ dữ liệu form
    const [formData, setFormData] = useState({
        phone: '',
        passwordRaw: '',
        fullName: '',
        gmail: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            if (isLogin) {
                //ep kieu dto
                const loginPayLoad: LoginRequestDto = {
                    phone: formData.phone,
                    passwordRaw: formData.passwordRaw,
                };

                const response = await axiosClient.post<AuthResponseDto>(
                    'auth/login',
                    loginPayLoad
                );

                const { accessToken, userData } = response.data;

                // Lưu token và thông tin user vào localStorage
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('userData', JSON.stringify(userData));
                localStorage.setItem('userId', userData.userId); // Lưu userId để dùng cho Booking
                toast.success(`Chào mừng trở lại, ${userData.fullName}!`);
                navigate('/');

            } else {
                //payload dang ky
                const registerPayload: RegisterRequestDto = {
                    phone: formData.phone,
                    passwordRaw: formData.passwordRaw,
                    fullName: formData.fullName,
                    gmail: formData.gmail
                }

                const response = await axiosClient.post<AuthResponseDto>(
                    '/auth/register',
                    registerPayload
                );

                const { accessToken, userData } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('userData', JSON.stringify(userData));
                localStorage.setItem('userId', userData.userId);

                toast.success(`ĐĂNG KÝ THÀNH CÔNG!, ${userData.fullName}!`);

                navigate('/'); // Điều hướng về Home
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            {/* Background mờ mờ cho giống style phòng tập */}
            <div
                className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')" }}
            ></div>

            <div className="relative z-10 w-full max-w-md bg-[#111111] border border-gray-800 rounded-lg shadow-2xl p-8">

                {/* LOGO HOẶC TIÊU ĐỀ */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-wider">
                        FIT<span className="text-red-600">STATION</span>
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        {isLogin ? 'Đăng nhập để tiếp tục' : 'Trở thành hội viên ngay hôm nay'}
                    </p>
                </div>

                {/* THÔNG BÁO LỖI */}
                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-6 text-sm text-center">
                        {errorMsg}
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Họ và Tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required={!isLogin}
                                    className="w-full bg-[#1a1a1a] text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Email</label>
                                <input
                                    type="email"
                                    name="gmail"
                                    value={formData.gmail}
                                    onChange={handleChange}
                                    required={!isLogin}
                                    className="w-full bg-[#1a1a1a] text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                                    placeholder="example@gmail.com"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Số điện thoại</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#1a1a1a] text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                            placeholder="0912345678"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Mật khẩu</label>
                        <input
                            type="password"
                            name="passwordRaw"
                            value={formData.passwordRaw}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#1a1a1a] text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded tracking-widest uppercase transition-colors disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
                    </button>
                </form>

                {/* NÚT CHUYỂN ĐỔI LOGIN / REGISTER */}
                <div className="mt-6 text-center text-sm text-gray-400">
                    {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setErrorMsg('');
                        }}
                        className="text-red-500 hover:text-red-400 font-semibold underline underline-offset-2"
                    >
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </button>
                </div>

            </div>
        </div>
    );
}