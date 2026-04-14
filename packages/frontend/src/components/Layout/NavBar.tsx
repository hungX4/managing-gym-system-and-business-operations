import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState<any>(null);

    // Lấy data user từ localStorage khi Navbar load
    useEffect(() => {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        } else {
            setUserData(null);
        }
    }, [location]);

    const handleLogout = () => {
        // Xóa sạch dấu vết đăng nhập
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userId');

        setUserData(null);
        navigate('/auth'); // Đá về trang đăng nhập
    };

    return (
        <nav className="fixed w-full z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 text-sm">

                    {/* Logo - Bấm vào để về Home */}
                    <div
                        className="flex-shrink-0 flex items-center font-bold text-xl tracking-widest uppercase cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <span className='text-white'>FIT</span><span className="text-red-600">STATION</span>
                    </div>

                    {/* Menu links - Ẩn trên mobile */}
                    <div className="hidden md:flex space-x-8 uppercase font-medium text-gray-300">
                        {/* Lưu ý: Nên dùng <Link to="..."> của react-router-dom thay vì thẻ <a> để không bị reload trang */}
                        <Link to="/" className="hover:text-red-500 transition">Dịch vụ</Link>
                        <Link to="/" className="hover:text-red-500 transition">Câu lạc bộ</Link>
                        <Link to="/bookings" className="hover:text-red-500 transition">Lịch tập</Link>
                        <Link to="/" className="hover:text-red-500 transition">Bảng giá</Link>
                    </div>

                    {/* Khu vực Auth / Profile */}
                    <div className="flex items-center">
                        {userData ? (
                            /* --- GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP --- */
                            <div className="relative group cursor-pointer">
                                {/* Cục Avatar & Tên hiển thị trên thanh Navbar */}
                                <div className="flex items-center space-x-3 text-white hover:text-red-500 transition p-2">
                                    <span className="hidden sm:block font-medium text-gray-300 group-hover:text-white transition">
                                        {userData.fullName}
                                    </span>
                                    {/* Avatar chữ cái đầu (VD: Nguyễn Văn A -> N) */}
                                    <div className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center font-bold uppercase border border-gray-600 group-hover:border-red-500 transition">
                                        {userData.fullName?.charAt(0) || 'U'}
                                    </div>
                                </div>

                                {/* DROPDOWN MENU (Chỉ hiện khi di chuột vào cụm trên) */}
                                <div className="absolute right-0 mt-2 w-56 bg-[#111111] border border-gray-800 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                                    {/* Header của Dropdown */}
                                    <div className="p-4 border-b border-gray-800">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Xin chào,</p>
                                        <p className="text-white font-bold truncate">{userData.fullName}</p>
                                        {/* Hiện Role hoặc Gói tập (Tạm lấy role làm ví dụ) */}
                                        <p className="text-red-500 text-xs font-semibold mt-1 uppercase bg-red-500/10 inline-block px-2 py-1 rounded">
                                            Vị trí: {userData.role}
                                        </p>
                                    </div>

                                    {/* Các link chức năng */}
                                    <div className="p-2">
                                        <Link to="/profile" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition">
                                            Hồ sơ của tôi
                                        </Link>
                                        <Link to="/bookings" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition">
                                            Quản lý lịch tập
                                        </Link>
                                    </div>

                                    {/* Nút Logout */}
                                    <div className="p-2 border-t border-gray-800">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-red-500 hover:text-white hover:bg-red-600 rounded transition font-medium"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* --- GIAO DIỆN KHI CHƯA ĐĂNG NHẬP --- */
                            <Link to="/auth" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded uppercase font-bold text-sm transition">
                                Đăng nhập
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;