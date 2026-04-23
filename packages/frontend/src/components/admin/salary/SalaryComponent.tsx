import React, { useState, useEffect } from 'react';
import { SalaryApi } from '../../../api/salary/salary.api';
import { SalaryResponseDto, SalaryStatus } from '@gym/shared';
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

    // LOGIC CHECK NÚT CHỐT LƯƠNG: Nếu có bất kỳ dòng nào khác ESTIMATED (nghĩa là PENDING hoặc PAID) -> Khóa
    const isFinalized = hasData && salaries.some(s => s.status !== SalaryStatus.ESTIMATED);
    const canFinalize = isPastMonth && !isFinalized && hasData;

    // 1. HÀM GỌI POST: CHỐT LƯƠNG
    const handleFinalize = async () => {
        setIsFinalizing(true);
        try {
            await SalaryApi.finalizeSalary({ month, year });
            setIsConfirmModalOpen(false);
            toast.success("Đã chốt sổ lương thành công!");
            fetchSalaries(); // Load lại data, BE sẽ trả về PENDING -> isFinalized thành true -> Nút tự tắt!
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi chốt lương");
        } finally {
            setIsFinalizing(false);
        }
    };

    // 2. HÀM GỌI PATCH: TRẢ LƯƠNG
    const handlePaySalary = async (salaryId?: number) => {
        if (!salaryId) return;
        if (!window.confirm("Xác nhận đã chuyển khoản và thanh toán lương cho nhân sự này?")) return;

        try {
            await SalaryApi.paySalary(salaryId);
            toast.success("Đã cập nhật trạng thái: Đã thanh toán!");
            fetchSalaries(); // Load lại data để đổi badge thành ĐÃ THANH TOÁN
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
        <div className=" p-8 md:pt-22 bg-gray-50 min-h-screen font-sans text-gray-800">
            {/* HEADER */}
            <div className="xs:mt-12 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-gray-900">
                        BẢNG LƯƠNG <span className="text-red-600">HỆ THỐNG</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý thu nhập của nhân sự trong tháng</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-200 rounded text-gray-600 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                        <div className="px-4 font-bold min-w-[120px] text-center text-red-600">Tháng {month} / {year}</div>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-200 rounded text-gray-600 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
                    </div>

                    <button
                        onClick={() => setIsConfirmModalOpen(true)}
                        disabled={!canFinalize}
                        className={`px-6 py-2.5 rounded-lg font-bold shadow-sm transition-all duration-300 flex items-center gap-2
                            ${isFinalized ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed' :
                                !isPastMonth ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' :
                                    !hasData ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' :
                                        'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 hover:shadow-lg'}`}
                    >
                        {isFinalized ? "Đã Khóa Sổ" : !isPastMonth ? "Chưa hết tháng" : "Chốt Lương Tháng Này"}
                    </button>
                </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                            <tr className='bg-red-500'>
                                <th className="p-4 font-bold border-r border-gray-200/50 text-white">Nhân viên</th>
                                <th className="p-4 font-bold text-right border-r border-gray-200/50 text-white">Lương cứng</th>
                                <th className="p-4 font-bold text-right border-r border-gray-200/50 text-white">Lương dạy</th>
                                <th className="p-4 font-bold text-right border-r border-gray-200/50 text-white">Hoa hồng</th>
                                <th className="p-4 font-bold text-right border-r border-gray-200/50 text-white">Thưởng</th>
                                <th className="p-4 font-bold text-right border-r border-gray-200/50 text-white">Tổng thu nhập</th>
                                <th className="p-4 font-bold text-center border-r border-gray-200/50 text-white">Trạng thái</th>
                                <th className="p-4 font-bold text-center text-white">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={7} className="p-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                            ) : salaries.length === 0 ? (
                                <tr><td colSpan={7} className="p-10 text-center text-gray-400">Không có dữ liệu lương trong tháng này.</td></tr>
                            ) : salaries.map((item) => (
                                <tr key={item.coachId} className="hover:bg-red-50/50 transition-colors">
                                    <td className="p-4 font-medium text-gray-600 border-r border-gray-200/50">
                                        {item.coachName}
                                    </td>
                                    <td className="p-4 font-medium text-right text-gray-600 border-r border-gray-200/50">
                                        {formatCurrency(item.baseSalary)}
                                    </td>
                                    <td className="p-4 text-right text-gray-600 border-r border-gray-200/50 font-medium">

                                        {formatCurrency(item.teachingIncome)}
                                    </td>
                                    <td className="p-4 text-right text-gray-600 font-medium border-r border-gray-200/50">

                                        {formatCurrency(item.salesCommission || 0)}
                                    </td>
                                    <td className="p-4 text-right text-gray-600 font-medium border-r border-gray-200/50">
                                        {formatCurrency(item.staffBonus || 0)}
                                    </td>
                                    <td className="p-4 text-right font-medium text-lg text-red-600 border-r border-gray-200/50">
                                        {formatCurrency(item.totalIncome)}
                                    </td>
                                    <td className="p-4 text-center border-r border-gray-200/50">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${item.status === 'PAID' ? 'bg-green-50 text-green-600 border-green-200' :
                                            item.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                'bg-gray-100 text-gray-400 border-gray-200'
                                            }`}>
                                            {item.status === 'PAID' ? 'ĐÃ CHI' : item.status === 'PENDING' ? 'CHỜ CHI' : 'NHÁP'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => openDetailsModal(item)}
                                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL XÁC NHẬN CHỐT LƯƠNG */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận chốt sổ tháng {month}/{year}?</h3>
                            <p className="text-gray-500 text-sm">Sau khi chốt, các số liệu sẽ được lưu cố định vào cơ sở dữ liệu và <strong className="text-red-600">không thể thay đổi</strong>.</p>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                            <button disabled={isFinalizing} onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Hủy</button>
                            <button disabled={isFinalizing} onClick={handleFinalize} className="px-4 py-2 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700">{isFinalizing ? 'Đang xử lý...' : 'Chốt sổ ngay'}</button>
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