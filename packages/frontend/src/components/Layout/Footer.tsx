import React from 'react';
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="w-full bg-black text-white py-12 px-4 md:px-10 lg:px-16 border-t border-gray-800">
            <div className="max-w-7xl mx-auto flex flex-col items-center">

                {/* 1. Logo Section */}
                <div className="flex items-center mb-10">
                    {/* Thay bằng ảnh logo của bạn nếu có */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center font-bold italic">F</div>
                        <span className="text-2xl font-bold tracking-widest uppercase">FIT STATION</span>
                    </div>
                </div>

                {/* 2. Menu Section */}
                <nav className="mb-8">
                    <ul className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm font-semibold uppercase tracking-wider">
                        <li><a href="#" className="hover:text-red-600 transition-colors">Hội viên</a></li>
                        <li><a href="#" className="hover:text-red-600 transition-colors">Lớp học</a></li>
                        <li><a href="#" className="hover:text-red-600 transition-colors">HLV Cá nhân</a></li>
                        <li><a href="#" className="hover:text-red-600 transition-colors">Chăm sóc sức khỏe</a></li>
                        <li><a href="#" className="hover:text-red-600 transition-colors">Câu lạc bộ</a></li>
                        <li><a href="#" className="hover:text-red-600 transition-colors">Bài viết</a></li>
                    </ul>
                </nav>

                {/* 3. Privacy Policy & Copyright */}
                <div className="text-center mb-8">
                    <a href="#" className="text-sm font-bold uppercase hover:underline mb-2 block">Chính sách bảo mật</a>
                    <p className="text-gray-500 text-xs tracking-widest">
                        Copyright © 2026 Fit Station. All rights reserved
                    </p>
                </div>

                {/* 4. Social Icons Section */}
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                        <FaFacebookF />
                    </a>
                    <a href="#" className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                        <FaInstagram />
                    </a>
                    <a href="#" className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                        <FaTiktok />
                    </a>
                    <a href="#" className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                        <FaYoutube />
                    </a>
                </div>

            </div>
        </footer>
    );
};

export default Footer;