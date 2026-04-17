import React, { useState } from 'react';
import PtCheckinContainer from './pt/PtCheckinContainer';
import MemberCheckinContainer from './member/MemberCheckinContainer';
// import ClassCheckinContainer from './dance-yoga/ClassCheckinContainer';

export default function CheckinContainer() {
    // State quản lý loại Check-in và trạng thái Đóng/Mở Sidebar
    const [checkinType, setCheckinType] = useState<'PT' | 'MEMBER' | 'CLASS'>('MEMBER');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        {
            id: 'MEMBER',
            label: 'Membership',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M14.4 14.4l-4.8-4.8M6.5 17.5l-4.8-4.8c-.8-.8-.8-2 0-2.8l2.8-2.8c.8-.8 2-.8 2.8 0l4.8 4.8M17.5 6.5l4.8 4.8c.8.8.8 2 0 2.8l-2.8 2.8c-.8.8-2 .8-2.8 0l-4.8-4.8" />
                </svg>
            )
        },
        {
            id: 'PT',
            label: 'PT 1 - 1',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                </svg>
            )
        },
        {
            id: 'CLASS',
            label: 'Group X',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            )
        },
    ];

    return (
        <div className="flex h-screen pt-16 bg-[#0a0a0a] text-white overflow-hidden">

            {/* 1. SIDEBAR BÊN TRÁI (Bật/Tắt mượt mà) */}
            <div
                className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden bg-[#111111] border-r border-gray-800 ${isSidebarOpen ? 'w-48' : 'w-0'
                    }`}
            >
                {/* Wrap nội dung bên trong với chiều rộng cố định w-64 để text không bị bóp méo khi thu nhỏ */}
                <div className="w-48 flex flex-col h-full">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                            MENU
                        </h2>
                    </div>

                    <nav className="flex-1 py-6 px-3 flex flex-col gap-2">
                        {menuItems.map((item) => {
                            const isActive = checkinType === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCheckinType(item.id as any)}
                                    className={`group flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-300 relative overflow-hidden ${isActive
                                        ? 'bg-red-600/10 text-red-500' // Nền đỏ mờ, chữ đỏ khi Active
                                        : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white' // Nền đen, chữ xám khi bình thường
                                        }`}
                                >
                                    {/* Thanh viền đỏ ở mép trái (Indicator) */}
                                    {isActive && (
                                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full shadow-[0_0_10px_rgba(220,38,38,0.8)]"></span>
                                    )}

                                    <div className={`${isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-red-400'} transition-colors`}>
                                        {item.icon}
                                    </div>
                                    <span className={`text-sm font-bold tracking-wide ${isActive ? 'text-white' : ''}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* 2. KHU VỰC NỘI DUNG CHÍNH (Bên phải) */}
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden relative">

                {/* Header Control (Chứa nút Hamburger để Mở/Đóng Menu) */}
                <div className="mb-4 shrink-0 flex items-center gap-4">

                    {/* Nút Hamburger Toggle Menu */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 bg-[#111111] hover:bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>

                    <div>
                        <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider">
                            Quản Lý <span className="text-red-600">Check-in</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {menuItems.find(i => i.id === checkinType)?.label}
                        </p>
                    </div>
                </div>

                {/* Khu vực render giao diện con */}
                <div className="flex-1 overflow-y-auto bg-[#0a0a0a] rounded-xl">
                    {checkinType === 'MEMBER' && <MemberCheckinContainer />}
                    {checkinType === 'PT' && <PtCheckinContainer />}
                    {/* {checkinType === 'CLASS' && <ClassCheckinContainer />} */}
                </div>
            </div>

        </div>
    );
}