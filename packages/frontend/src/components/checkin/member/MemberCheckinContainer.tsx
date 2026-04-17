// src/pages/checkin/member/MemberCheckinContainer.tsx
import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { MemberCheckinRequestDto, PackageType } from '@gym/shared';

export default function MemberCheckinContainer() {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [usageLogs, setUsageLogs] = useState<any[]>([]);

    // 🌟 STATE CHO SEARCH API
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 1. 🔍 HÀM GỌI API TÌM KIẾM HỘI VIÊN (Debounce)
    const handleSearchInput = (value: string) => {
        setSearchKeyword(value);

        // Xóa timeout cũ nếu người dùng vẫn đang gõ
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        // Đợi 500ms sau khi ngừng gõ mới gọi API để đỡ quá tải Server
        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                // ĐIỀN API SEARCH CỦA BẠN VÀO ĐÂY (Giả định: GET /users/search?keyword=...)
                const res = await axiosClient.get(`/user/search?keyword=${value}`);
                setSearchResults(res.data);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };

    // Khi lễ tân click chọn 1 user từ danh sách gợi ý
    const handleSelectUser = (user: any) => {
        setSearchKeyword(user.phone); // Điền SĐT vào ô input
        setSearchResults([]); // Ẩn danh sách gợi ý
    };


    // 2. 🎯 HÀM THỰC HIỆN CHECK-IN
    const handleCheckin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchKeyword.trim()) return toast.error("Vui lòng nhập số điện thoại để check-in!");

        setIsLoading(true);
        setSearchResults([]); // Ẩn kết quả search nếu đang mở

        try {
            // Checkin theo số điện thoại đang có trong ô input
            const payload: MemberCheckinRequestDto = { phone: searchKeyword.trim() };
            await axiosClient.post('/checkin/self', payload);

            toast.success('Check-in thành công!');
            setSearchKeyword(''); // Reset ô input
            fetchDailyLogs(); // Load lại bảng danh sách
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi check-in!');
        } finally {
            setIsLoading(false);
        }
    };

    // 3. 📋 HÀM LẤY DANH SÁCH LOG TRONG NGÀY
    const fetchDailyLogs = async () => {
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const res = await axiosClient.get(`/checkin/logs?date=${dateStr}`);

            // Chỉ lấy MEMBERSHIP
            const filteredLogs = res.data.filter((log: any) =>
                log.type === PackageType.MEMBERSHIP
            );

            setUsageLogs(filteredLogs);
        } catch (error) {
            console.error("Lỗi lấy lịch sử:", error);
        }
    };

    useEffect(() => {
        fetchDailyLogs();
    }, [selectedDate]);

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
    };

    return (
        <div className="flex flex-col h-full text-gray-200">
            {/* HEADER TOOLBAR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative">
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Hội viên tự tập</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Quản lý lượt vào cửa</p>
                </div>

                {/* 🔍 Thanh Tìm Kiếm & Check-in */}
                <div className="relative w-full md:w-auto">
                    <form onSubmit={handleCheckin} className="flex items-center w-full">
                        <div className="relative group w-full md:w-64">
                            {/* Icon Search */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                                {isSearching ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                )}
                            </div>

                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder="Tên hoặc SĐT..."
                                className="bg-[#111111] border border-gray-800 text-sm rounded-l-lg py-2.5 pl-10 pr-4 w-full outline-none focus:border-red-600 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-r-lg transition-colors border border-red-600 shrink-0"
                        >
                            {isLoading ? '...' : 'XÁC NHẬN'}
                        </button>
                    </form>

                    {/* 🔽 Dropdown Hiển Thị Kết Quả Tìm Kiếm */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 mt-1 w-full md:w-64 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                                <div
                                    key={user.userId}
                                    onClick={() => handleSelectUser(user)}
                                    className="px-4 py-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0 transition-colors flex justify-between items-center"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-white">{user.fullName}</p>
                                        <p className="text-xs text-gray-400">{user.phone}</p>
                                    </div>
                                    <span className="text-[10px] bg-gray-700 px-2 py-1 rounded text-gray-300">Chọn</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ... PHẦN BẢNG USAGE_LOG */}
            <div className="bg-[#111111] border border-gray-800 rounded-xl flex flex-col overflow-hidden shadow-2xl">
                {/* Thanh điều hướng ngày */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#161616]">
                    <div className="flex items-center gap-2">
                        <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-gray-800 rounded text-gray-400">&lt;</button>
                        <span className="text-sm font-bold min-w-[120px] text-center">
                            {selectedDate.toLocaleDateString('vi-VN')}
                        </span>
                        <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-gray-800 rounded text-gray-400">&gt;</button>
                        <button
                            onClick={() => setSelectedDate(new Date())}
                            className="ml-2 text-[10px] bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded uppercase font-bold"
                        >
                            Hôm nay
                        </button>
                    </div>
                    <div className="text-xs text-gray-500">
                        Tổng cộng: <span className="text-red-500 font-bold">{usageLogs.length}</span> lượt tập
                    </div>
                </div>

                {/* Nội dung bảng */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
                                <th className="px-6 py-4 font-black">Thời gian</th>
                                <th className="px-6 py-4 font-black">Hội viên</th>
                                <th className="px-6 py-4 font-black">Số điện thoại</th>
                                <th className="px-6 py-4 font-black">Gói tập</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {usageLogs.length > 0 ? (
                                usageLogs.map((log) => (
                                    <tr key={log.usageLogId} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-mono text-red-500">
                                            {new Date(log.checkinTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                                            {log.memberName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {log.memberPhone}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
                                                {log.type}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-600 italic text-sm">
                                        Chưa có lượt check-in nào trong ngày này.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}