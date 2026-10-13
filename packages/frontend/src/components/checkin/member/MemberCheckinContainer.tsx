// src/pages/checkin/member/MemberCheckinContainer.tsx
import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { type MemberCheckinRequestDto, type MemberSearchRequestDto } from '@gym/shared';

export default function MemberCheckinContainer() {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [usageLogs, setUsageLogs] = useState<any[]>([]);

    // 🌟 STATE CHO SEARCH API & USER ĐƯỢC CHỌN
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // 🟢 Đóng dropdown khi click ra ngoài vùng tìm kiếm
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 1. 🔍 HÀM GỌI API TÌM KIẾM HỘI VIÊN (Debounce 500ms)
    const handleSearchInput = (value: string) => {
        setSearchKeyword(value);
        setSelectedUser(null); // Reset user đã chọn nếu nhập lại ô tìm kiếm

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res: any = await axiosClient.get(`/user/search?keyword=${encodeURIComponent(value.trim())}`);
                const data = Array.isArray(res) ? res : (res?.data || []);
                setSearchResults(data);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };

    // 🟢 Khi chọn 1 user từ danh sách gợi ý
    const handleSelectUser = (user: any) => {
        setSelectedUser(user);
        // Hiển thị tên & SĐT rõ ràng lên thanh tìm kiếm
        setSearchKeyword(`${user.fullName || user.name} - ${user.phone}`);
        setSearchResults([]); // Ẩn danh sách gợi ý
    };

    // 2. 🎯 HÀM THỰC HIỆN CHECK-IN
    const handleCheckin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Ưu tiên lấy memberId/userId từ user được chọn, nếu gõ trực tiếp ID thì lấy searchKeyword
        const memberId = selectedUser?.userId || selectedUser?.memberId || selectedUser?.id || searchKeyword.trim();

        if (!memberId) {
            return toast.error("Vui lòng chọn hội viên từ danh sách gợi ý để check-in!");
        }

        setIsLoading(true);
        setSearchResults([]);

        try {
            // 🟢 Truyền đúng payload { memberId } sang NestJS API
            const payload: MemberCheckinRequestDto = { memberId: String(memberId) };
            const res: any = await axiosClient.post('/checkin/self', payload);

            toast.success(res?.message || 'Check-in thành công!');

            // Reset ô input & state sau khi checkin xong
            setSearchKeyword('');
            setSelectedUser(null);

            // Reload lại danh sách log trong ngày
            fetchDailyLogs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi check-in!');
        } finally {
            setIsLoading(false);
        }
    };

    // 3. 📋 HÀM LẤY DANH SÁCH LOG TRONG NGÀY
    const fetchDailyLogs = async () => {
        try {
            // Format ngày local YYYY-MM-DD tránh lỗi múi giờ UTC
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const res: any = await axiosClient.get(`/checkin/logs?date=${dateStr}`);

            // Bóc tách mảng an toàn
            const logsData = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

            setUsageLogs(logsData);
        } catch (error) {
            console.error("Lỗi lấy lịch sử:", error);
            setUsageLogs([]);
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
                <div ref={searchContainerRef} className="relative w-full md:w-80">
                    <form onSubmit={handleCheckin} className="flex items-center w-full">
                        <div className="relative group w-full">
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
                                placeholder="Nhập tên hoặc số điện thoại..."
                                className="bg-[#111111] border border-gray-800 text-sm rounded-l-lg py-2.5 pl-10 pr-4 w-full outline-none focus:border-red-600 transition-all text-white font-medium placeholder:text-gray-600"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-r-lg transition-colors border border-red-600 shrink-0 disabled:opacity-50"
                        >
                            {isLoading ? '...' : 'XÁC NHẬN'}
                        </button>
                    </form>

                    {/* 🔽 Dropdown Hiển Thị Kết Quả Tìm Kiếm */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                                <div
                                    key={user.userId || user.memberId || user.id}
                                    onClick={() => handleSelectUser(user)}
                                    className="px-4 py-3 hover:bg-red-600/10 hover:border-l-4 hover:border-red-600 cursor-pointer border-b border-gray-800/80 last:border-0 transition-all flex justify-between items-center"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-white">{user.fullName || user.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>
                                    </div>
                                    <span className="text-[10px] bg-gray-800 border border-gray-700 px-2 py-1 rounded text-gray-300 font-semibold">Chọn</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* BẢNG USAGE_LOG */}
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
                                                {log.packageName || log.type}
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