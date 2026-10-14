import React, { useState, useEffect } from 'react';
import { SalaryApi } from '../../../api/salary/salary.api';

interface SalaryDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    coachId: number | null;
    coachName: string;
    month: number;
    year: number;
    salaryData?: any;
    onPaySalary?: (salaryId: number) => Promise<void>;
}

const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0);
};

export const SalaryDetailsModal: React.FC<SalaryDetailsModalProps> = ({
    isOpen, onClose, coachId, coachName, month, year, salaryData, onPaySalary
}) => {
    const [activeTab, setActiveTab] = useState<'TEACHING' | 'SALES'>('TEACHING');
    const [detailsData, setDetailsData] = useState<{ teachingDetails: any[], salesDetails: any[] }>({
        teachingDetails: [],
        salesDetails: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    // Khóa cuộn trang chính khi Modal đang mở để tránh lồng scrollbar
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && coachId) {
            fetchDetails();
        } else {
            setDetailsData({ teachingDetails: [], salesDetails: [] });
            setActiveTab('TEACHING');
        }
    }, [isOpen, coachId, month, year]);

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const response = await SalaryApi.getSalaryDetails({ coachId: coachId!, month, year });
            const payload = response.data || response;

            setDetailsData({
                teachingDetails: payload?.teachingDetails || [],
                salesDetails: payload?.salesDetails || []
            });
        } catch (error) {
            console.error("Lỗi tải chi tiết:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!salaryData?.salaryId || !onPaySalary) return;
        if (window.confirm(`Xác nhận thanh toán lương cho ${coachName}?`)) {
            setIsPaying(true);
            await onPaySalary(salaryData.salaryId);
            setIsPaying(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#121212] rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col">

                {/* HEADER */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/60 shrink-0">
                    <div>
                        <h2 className="text-xl font-black uppercase text-white tracking-wider">Sao kê chi tiết lương</h2>
                        <p className="text-xs text-zinc-400 mt-1 font-medium">
                            Nhân viên: <span className="font-bold text-red-500 uppercase">{coachName}</span> • Tháng {month}/{year}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                        title="Đóng cửa sổ"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* BODY CÓ SCROLLBAR TỰ ĐỊNH DẠNG MỎNG ĐẸP */}
                <div className="overflow-y-auto flex-1 p-6 bg-black/30 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-red-600">
                    {/* --- 1. TỔNG HỢP CON SỐ --- */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 bg-black rounded-xl border border-zinc-800">
                            <p className="text-[10px] font-bold text-red-500 uppercase mb-1">Tổng số buổi dạy</p>
                            <p className="text-xl font-black text-white">{salaryData?.totalTeachingSessions || salaryData?.totalSessions || 0} buổi</p>
                        </div>
                        <div className="p-4 bg-black rounded-xl border border-zinc-800">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Tổng doanh số bán</p>
                            <p className="text-lg font-bold text-white font-mono">{formatCurrency(salaryData?.totalSalesAmount)}</p>
                        </div>
                        <div className="p-4 bg-black rounded-xl border border-zinc-800">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Lương cứng</p>
                            <p className="text-lg font-bold text-white font-mono">{formatCurrency(salaryData?.baseSalary)}</p>
                        </div>
                        <div className="p-4 bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/20 border border-red-500">
                            <p className="text-[10px] font-bold text-red-100 uppercase mb-1">Tổng thực nhận</p>
                            <p className="text-xl font-black font-mono">{formatCurrency(salaryData?.totalIncome)}</p>
                        </div>
                    </div>

                    {/* --- 2. TABS ĐIỀU HƯỚNG --- */}
                    <div className="flex border-b border-zinc-800 mb-6 bg-black rounded-t-xl px-2">
                        <button
                            onClick={() => setActiveTab('TEACHING')}
                            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${activeTab === 'TEACHING'
                                    ? 'border-red-600 text-red-500 bg-red-950/20'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            Chi tiết dạy học ({detailsData.teachingDetails?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('SALES')}
                            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${activeTab === 'SALES'
                                    ? 'border-red-600 text-red-500 bg-red-950/20'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            Chi tiết bán gói ({detailsData.salesDetails?.length || 0})
                        </button>
                    </div>

                    {/* --- 3. BẢNG DỮ LIỆU --- */}
                    <div className="min-h-[280px] bg-black rounded-xl border border-zinc-800 overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2">
                                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs">Đang lấy dữ liệu sao kê...</p>
                            </div>
                        ) : activeTab === 'TEACHING' ? (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-[#18181b] text-zinc-400 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-800">
                                    <tr>
                                        <th className="p-3 border-r border-zinc-800/80 w-20 text-center">Buổi số</th>
                                        <th className="p-3 border-r border-zinc-800/80">Check-in</th>
                                        <th className="p-3 border-r border-zinc-800/80">Khách hàng</th>
                                        <th className="p-3 border-r border-zinc-800/80 text-right">Hoa hồng nhận</th>
                                        <th className="p-3 text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {detailsData.teachingDetails?.length === 0 ? (
                                        <tr><td colSpan={5} className="py-12 text-center text-zinc-500 italic">Không có dữ liệu buổi dạy.</td></tr>
                                    ) : detailsData.teachingDetails.map((log: any, idx) => (
                                        <tr key={log.workLogId || idx} className="hover:bg-zinc-900/50 transition-colors">
                                            <td className="p-3 border-r border-zinc-800/50 font-bold text-zinc-500 text-center">{idx + 1}</td>
                                            <td className="p-3 border-r border-zinc-800/50 font-mono text-zinc-300 text-xs">
                                                {new Date(log.checkinTime).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="p-3 border-r border-zinc-800/50 font-bold text-white">
                                                {log.booking?.member?.fullName || 'Khách lẻ'}
                                            </td>
                                            <td className="p-3 border-r border-zinc-800/50 text-right font-bold text-red-500 font-mono">
                                                {formatCurrency(log.earnAmount)}
                                            </td>
                                            <td className="p-3 uppercase text-[10px] font-black text-center">
                                                <span className={`px-2 py-0.5 rounded border ${log.status === 'COMPLETED'
                                                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                                                        : 'bg-red-950/60 text-red-400 border-red-800/60'
                                                    }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-[#18181b] text-zinc-400 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-800">
                                    <tr>
                                        <th className="p-3 border-r border-zinc-800/80">Ngày bán</th>
                                        <th className="p-3 border-r border-zinc-800/80">Gói tập</th>
                                        <th className="p-3 border-r border-zinc-800/80">Khách mua</th>
                                        <th className="p-3 text-right">Doanh số (Thực thu)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {detailsData.salesDetails?.length === 0 ? (
                                        <tr><td colSpan={4} className="py-12 text-center text-zinc-500 italic">Chưa bán được gói nào trong tháng.</td></tr>
                                    ) : detailsData.salesDetails.map((sale: any, idx) => (
                                        <tr key={sale.subscriptionId || idx} className="hover:bg-zinc-900/50 transition-colors">
                                            <td className="p-3 border-r border-zinc-800/50 font-mono text-zinc-300 text-xs">
                                                {new Date(sale.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="p-3 border-r border-zinc-800/50 font-bold text-red-500">{sale.package?.name}</td>
                                            <td className="p-3 border-r border-zinc-800/50 font-medium text-white">{sale.member?.fullName}</td>
                                            <td className="p-3 text-right font-bold text-white font-mono">
                                                {formatCurrency(sale.actualPaid)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* --- 4. FOOTER --- */}
                <div className="p-4 bg-black/60 border-t border-zinc-800 flex justify-end gap-3 items-center shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-zinc-800 rounded-lg text-zinc-300 font-bold text-xs uppercase hover:bg-zinc-800 transition-all"
                    >
                        Đóng
                    </button>
                    {salaryData?.status === 'PENDING' && (
                        <button
                            disabled={isPaying}
                            onClick={handleConfirmPayment}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                        >
                            {isPaying ? 'Đang thực hiện...' : 'Xác nhận & Thanh toán lương'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};