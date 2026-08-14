import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UsageLogStatus, WorkLogStatus } from '@gym/shared';
import { userApi } from '../api/user/user.api';
import Pagination from '../components/common/Pagination';

export default function UserAttendanceHistory() {
    const [isLoading, setIsLoading] = useState(false);
    const [usageLogs, setUsageLogs] = useState<any[]>([]);
    const [page, setPage] = useState(1);

    const [meta, setMeta] = useState({
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
    });

    const userId = localStorage.getItem('userId');

    const fetchHistoryLogs = async (currentPage: number) => {
        if (!userId) {
            toast.error("Không tìm thấy thông tin tài khoản!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await userApi.getUserAttendanceHistory(userId, currentPage, 10);
            setUsageLogs(response.data);
            setMeta(response.meta);
        } catch (error: any) {
            console.error("Lỗi lấy lịch sử:", error);
            toast.error("Lấy lịch sử thất bại!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistoryLogs(page);
    }, [page]);

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case UsageLogStatus.SELFCHECKIN:
                return (
                    <span className="text-[10px] sm:text-[11px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded border border-blue-800/50 font-bold whitespace-nowrap">
                        TỰ TẬP
                    </span>
                );
            case UsageLogStatus.COACHCHECKIN:
                return (
                    <span className="text-[10px] sm:text-[11px] bg-green-900/30 text-green-400 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded border border-green-800/50 font-bold whitespace-nowrap">
                        TẬP VỚI PT
                    </span>
                );
            case WorkLogStatus.LATE_CANCEL:
                return (
                    <span className="text-[10px] sm:text-[11px] bg-red-900/30 text-red-400 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded border border-red-800/50 font-bold whitespace-nowrap">
                        LATE CANCEL
                    </span>
                );
            default:
                return (
                    <span className="text-[10px] sm:text-[11px] bg-gray-800 text-gray-400 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded border border-gray-700 whitespace-nowrap">
                        {status}
                    </span>
                );
        }
    };

    return (
        /* ÉP KHUÔN VỪA KHÍT 1 MÀN HÌNH (100dvh) */
        <div className="h-[100dvh] w-full bg-black text-gray-200 sm:pt-20 pb-3 px-2 sm:px-6 flex flex-col overflow-hidden">

            {/* TITLE BAR (Đã bỏ chữ "Lịch sử tập luyện", căn gọn gàng) */}
            <div className="flex items-center justify-between mb-2.5 px-1 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">
                        Nhật ký <span className="text-red-500 font-bold">độ body</span>
                    </p>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 bg-[#161616] px-2.5 py-1 rounded-full border border-gray-800">
                    Tổng: <span className="text-red-500 font-bold">{meta.totalItems}</span> buổi
                </div>
            </div>

            {/* CONTAINER BẢNG (Tự co giãn chiếm hết chiều cao còn lại) */}
            <div className="flex-1 bg-[#111111] border border-gray-800 rounded-xl flex flex-col overflow-hidden shadow-2xl relative">

                {isLoading && (
                    <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
                        <svg className="w-8 h-8 animate-spin text-red-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}

                {/* VÙNG CHỨA BẢNG - TỰ CUỘN NỘI BỘ NẾU TRÀN */}
                <div className="flex-1 overflow-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[320px]">
                        <thead className="sticky top-0 z-10 bg-[#161616] border-b border-gray-800">
                            <tr className="text-[10px] sm:text-[11px] uppercase tracking-widest text-gray-400">
                                <th className="px-2.5 sm:px-6 py-3 font-black">Thời gian</th>
                                <th className="px-2.5 sm:px-6 py-3 font-black">Gói tập</th>
                                <th className="px-2.5 sm:px-6 py-3 font-black">Trạng thái</th>
                                <th className="px-2.5 sm:px-6 py-3 font-black">HLV</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {usageLogs.length > 0 ? (
                                usageLogs.map((log) => (
                                    <tr key={log.usageLogId} className="hover:bg-white/5 transition-colors group">
                                        {/* Thời gian */}
                                        <td className="px-2.5 sm:px-6 py-2.5 sm:py-3.5">
                                            <div className="text-xs sm:text-sm font-mono text-red-500 font-bold">
                                                {log.checkinTime.split(' ')[1]}
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                                {log.checkinTime.split(' ')[0]}
                                            </div>
                                        </td>
                                        {/* Gói tập */}
                                        <td className="px-2.5 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-gray-300 group-hover:text-red-400 transition-colors max-w-[100px] sm:max-w-none truncate">
                                            {log.packageName}
                                        </td>
                                        {/* Trạng thái */}
                                        <td className="px-2.5 sm:px-6 py-2.5 sm:py-3.5">
                                            {renderStatusBadge(log.status)}
                                        </td>
                                        {/* HLV */}
                                        <td className="px-2.5 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm text-gray-400">
                                            {log.coachName ? (
                                                <span className="flex items-center gap-1.5 max-w-[80px] sm:max-w-none truncate">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
                                                    <span className="truncate">{log.coachName}</span>
                                                </span>
                                            ) : (
                                                <span className="text-gray-600 italic">--</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-16 text-center text-gray-600 italic text-xs sm:text-sm">
                                        {isLoading ? '' : 'Chưa có lịch sử điểm danh.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* THANH PHÂN TRANG (Cố định dưới đáy bảng) */}
                <div className="shrink-0 border-t border-gray-800">
                    <Pagination meta={meta} onPageChange={(newPage) => setPage(newPage)} />
                </div>
            </div>
        </div>
    );
}