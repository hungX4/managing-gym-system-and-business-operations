import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ADMIN_DASHBOARD } from '../../config/adminDashboard';

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const currentPath = location.pathname;

    const activeMenuItem = ADMIN_DASHBOARD.find(item => item.path === currentPath) || ADMIN_DASHBOARD[0];

    return (
        <div className="flex h-screen pt-16 bg-[#0a0a0a] text-white overflow-hidden">
            {/* Bọc thêm 1 div relative ở đây để làm mốc tọa độ cho nút Toggle lơ lửng */}
            <div className="relative flex w-full h-full">


                {/* LEFT SIDEBAR  */}
                <div
                    className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden bg-[#111111] border-r border-gray-800 ${isSidebarOpen ? 'w-56' : 'w-0'}`}
                >
                    <div className="w-56 flex flex-col h-full">


                        <nav className="flex-1 py-6 px-3 flex flex-col gap-2">
                            {ADMIN_DASHBOARD.map((item) => {
                                const isActive = currentPath === item.path;

                                return (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className={`group flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-300 relative overflow-hidden ${isActive
                                            ? 'bg-red-600/10 text-red-500'
                                            : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                                            }`}
                                    >
                                        {isActive && (
                                            <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full shadow-[0_0_10px_rgba(220,38,38,0.8)]"></span>
                                        )}

                                        <div className={`${isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-red-400'} transition-colors`}>
                                            {item.icon}
                                        </div>
                                        <span className={`text-sm font-bold tracking-wide ${isActive ? 'text-white' : ''}`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* NÚT TOGGLE ABSOLUTE  */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    // Logic vị trí: 
                    // - Khi mở: Nút nằm ở tọa độ left-[208px]. Vì sidebar rộng w-56 (224px) và nút rộng 8 (32px), tọa độ này giúp nút nằm canh GIỮA đường viền.
                    // - Khi đóng: Nút lùi về left-4 (cách mép màn hình 16px).
                    className={`absolute top-6 z-50 flex items-center justify-center w-8 h-8 bg-[#111111] border border-gray-800 rounded-full text-gray-400 hover:text-white hover:border-red-500 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] focus:outline-none
                    ${isSidebarOpen ? 'left-[208px]' : 'left-4'}
                    `}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        // Xoay icon mũi tên khi đóng/mở
                        className={`w-4 h-4 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`}>
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                {/* 2. KHU VỰC NỘI DUNG CHÍNH */}

                <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden relative">
                    {/*  thêm marginLeft (ml) khi sidebar đóng để chữ không đè lên nút nổi */}
                    <div className={`mb-4 shrink-0 transition-all duration-300 ${!isSidebarOpen ? 'ml-10' : 'ml-0'}`}>
                        <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider">
                            {activeMenuItem.label}
                        </h1>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] rounded-xl border border-gray-800 p-4">
                        <Outlet />
                    </div>
                </div>

            </div>
        </div>
    );
}