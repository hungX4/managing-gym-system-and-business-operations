import React, { useState, useEffect } from 'react';
import { SalaryApi } from '../../../api/salary/salary.api';
import { SalaryStatus } from '@gym/shared';
import toast from 'react-hot-toast';
import { SalaryDetailsModal } from './SalaryDetailModal';

export const SalaryComponent: React.FC = () => {
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());

    const [salaries, setSalaries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState<any>(null);

    const fetchSalaries = async () => {
        setIsLoading(true);
        try {
            const data = await SalaryApi.getSalaries({ month, year });
            setSalaries(data);
        } catch (error) {
            console.error("Lỗi khi tải bảng lương:", error);
            toast.error("Không thể tải bảng lương!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSalaries(); }, [month, year]);

    const handlePrevMonth = () => {
        if (month === 1) { setMonth(12); setYear(year - 1); }
        else { setMonth(month - 1); }
    };

    const handleNextMonth = () => {
        if (month === 12) { setMonth(1); setYear(year + 1); }
        else { setMonth(month + 1); }
    };

    const today = new Date();
    const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1);
    const hasData = salaries.length > 0;

    const isFinalized = hasData && salaries.some(s => s.status !== SalaryStatus.ESTIMATED);
    const canFinalize = isPastMonth && !isFinalized && hasData;

    const handleFinalize = async () => {
        setIsFinalizing(true);
        try {
            await SalaryApi.finalizeSalary({ month, year });
            setIsConfirmModalOpen(false);
            toast.success("Đã chốt sổ lương thành công!");
            fetchSalaries();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi chốt lương");
        } finally {
            setIsFinalizing(false);
        }
    };

    const handlePaySalary = async (salaryId?: number) => {
        if (!salaryId) return;
        if (!window.confirm("Xác nhận đã chuyển khoản và thanh toán lương cho nhân sự này?")) return;

        try {
            await SalaryApi.paySalary(salaryId);
            toast.success("Đã cập nhật trạng thái: Đã thanh toán!");
            fetchSalaries();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi thanh toán");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const openDetailsModal = (coach: any) => {
        setSelectedCoach(coach);
        setIsDetailsModalOpen(true);
    };

    return (
        /* Xóa min-h-screen ở đây - Để h-auto để không ép tạo chiều cao riêng */
        <div className="p-6 md:p-8 bg-black w-full h-auto font-sans text-zinc-100">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[#121212] p-6 rounded-xl border border-zinc-800 shadow-2xl">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white">
                        BẢNG LƯƠNG <span className="text-red-600">HỆ THỐNG</span>
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1 font-medium">
                        Quản lý và cập nhật mức lương tiêu chuẩn cho hệ thống FitStation.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center bg-black border border-zinc-800 rounded-lg p-1">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="px-4 font-bold min-w-[130px] text-center text-red-500 text-sm">
                            Tháng {month} / {year}
                        </div>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <button
                        onClick={() => setIsConfirmModalOpen(true)}
                        disabled={!canFinalize}
                        className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2
                            ${isFinalized
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 cursor-not-allowed'
                                : !isPastMonth || !hasData
                                    ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 active:scale-95'}`}
                    >
                        {isFinalized ? "Đã Khóa Sổ" : !isPastMonth ? "Chưa hết tháng" : "Chốt Lương Tháng Này"}
                    </button>
                </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-[#121212] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
                {/* Chỉ giữ overflow-x-auto cho trường hợp màn hình nhỏ thiếu ngang, KHÔNG dùng overflow-y */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-[#18181b] border-b border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4 border-r border-zinc-800/80">Nhân viên</th>
                                <th className="p-4 text-right border-r border-zinc-800/80">Lương cứng</th>
                                <th className="p-4 text-right border-r border-zinc-800/80">Lương dạy</th>
                                <th className="p-4 text-right border-r border-zinc-800/80">Hoa hồng</th>
                                <th className="p-4 text-right border-r border-zinc-800/80">Thưởng</th>
                                <th className="p-4 text-right border-r border-zinc-800/80 text-red-500">Tổng thu nhập</th>
                                <th className="p-4 text-center border-r border-zinc-800/80">Trạng thái</th>
                                <th className="p-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-zinc-500 font-medium">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            ) : salaries.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-zinc-500 italic">
                                        Không có dữ liệu lương trong tháng này.
                                    </td>
                                </tr>
                            ) : salaries.map((item) => (
                                <tr key={item.coachId} className="hover:bg-zinc-800/40 transition-colors">
                                    <td className="p-4 font-bold text-white border-r border-zinc-800/50">
                                        {item.coachName}
                                    </td>
                                    <td className="p-4 text-right text-zinc-300 border-r border-zinc-800/50 font-mono">
                                        {formatCurrency(item.baseSalary)}
                                    </td>
                                    <td className="p-4 text-right text-zinc-300 border-r border-zinc-800/50 font-mono">
                                        {formatCurrency(item.teachingIncome)}
                                    </td>
                                    <td className="p-4 text-right text-zinc-300 border-r border-zinc-800/50 font-mono">
                                        {formatCurrency(item.salesCommission || 0)}
                                    </td>
                                    <td className="p-4 text-right text-zinc-300 border-r border-zinc-800/50 font-mono">
                                        {formatCurrency(item.staffBonus || 0)}
                                    </td>
                                    <td className="p-4 text-right font-black text-red-500 text-base border-r border-zinc-800/50 font-mono">
                                        {formatCurrency(item.totalIncome)}
                                    </td>
                                    <td className="p-4 text-center border-r border-zinc-800/50">
                                        <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wider border ${item.status === 'PAID'
                                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' :
                                                item.status === 'PENDING'
                                                    ? 'bg-amber-950/60 text-amber-400 border-amber-800/80' :
                                                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                                            }`}>
                                            {item.status === 'PAID' ? 'ĐÃ CHI' : item.status === 'PENDING' ? 'CHỜ CHI' : 'NHÁP'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => openDetailsModal(item)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-red-600 hover:bg-red-950/30 font-bold text-xs transition-all"
                                        >
                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL XÁC NHẬN */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="bg-[#121212] border border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-950/60 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-800/50">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase">Xác nhận chốt sổ tháng {month}/{year}?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Sau khi chốt, các số liệu sẽ được khóa cố định và <strong className="text-red-500">không thể thay đổi</strong>.
                            </p>
                        </div>
                        <div className="bg-black/60 px-6 py-4 flex gap-3 justify-end border-t border-zinc-800">
                            <button
                                disabled={isFinalizing}
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 text-xs font-bold uppercase hover:bg-zinc-800 transition"
                            >
                                Hủy
                            </button>
                            <button
                                disabled={isFinalizing}
                                onClick={handleFinalize}
                                className="px-5 py-2 bg-red-600 rounded-lg text-white text-xs font-bold uppercase hover:bg-red-700 shadow-lg shadow-red-600/30 transition"
                            >
                                {isFinalizing ? 'Đang xử lý...' : 'Chốt sổ ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SalaryDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                coachId={selectedCoach?.coachId || null}
                coachName={selectedCoach?.coachName || ''}
                month={month}
                year={year}
                salaryData={selectedCoach}
                onPaySalary={handlePaySalary}
            />
        </div>
    );
};