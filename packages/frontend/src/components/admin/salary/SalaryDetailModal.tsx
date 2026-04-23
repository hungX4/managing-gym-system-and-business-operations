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

            // XỬ LÝ ĐÚNG CẤU TRÚC DATA TRẢ VỀ (Bọc trong trường data)
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* HEADER */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Sao kê chi tiết lương</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Nhân viên: <span className="font-bold text-red-600 uppercase">{coachName}</span> • Tháng {month}/{year}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6">
                    {/* --- 1. TỔNG HỢP CON SỐ (SUMMARY) --- */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Tổng số buổi dạy</p>
                            <p className="text-lg font-bold text-blue-900">{salaryData?.totalTeachingSessions || salaryData?.totalSessions || 0} buổi</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">Tổng doanh số bán</p>
                            <p className="text-lg font-bold text-purple-900">{formatCurrency(salaryData?.totalSalesAmount)}</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Lương cứng</p>
                            <p className="text-lg font-bold text-amber-900">{formatCurrency(salaryData?.baseSalary)}</p>
                        </div>
                        <div className="p-4 bg-red-600 rounded-xl shadow-md text-white">
                            <p className="text-[10px] font-bold text-red-100 uppercase mb-1">Tổng thực nhận</p>
                            <p className="text-xl font-extrabold">{formatCurrency(salaryData?.totalIncome)}</p>
                        </div>
                    </div>

                    {/* --- 2. TABS ĐIỀU HƯỚNG --- */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab('TEACHING')}
                            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'TEACHING' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            Chi tiết dạy học ({detailsData.teachingDetails?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('SALES')}
                            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'SALES' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            Chi tiết bán gói ({detailsData.salesDetails?.length || 0})
                        </button>
                    </div>

                    {/* --- 3. BẢNG DỮ LIỆU --- */}
                    <div className="min-h-[300px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm">Đang lấy dữ liệu sao kê...</p>
                            </div>
                        ) : activeTab === 'TEACHING' ? (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100 bg-gray-50/50">
                                    <tr>
                                        <th className="p-3 border-r border-gray-100/50 w-20 text-center">Buổi số</th>
                                        <th className="p-3 border-r border-gray-100/50">Check-in</th>
                                        <th className="p-3 border-r border-gray-100/50">Khách hàng</th>
                                        <th className="p-3 border-r border-gray-100/50 text-right">Hoa hồng nhận</th>
                                        <th className="p-3 text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {detailsData.teachingDetails?.length === 0 ? (
                                        <tr><td colSpan={5} className="py-12 text-center text-gray-400 italic">Không có dữ liệu buổi dạy.</td></tr>
                                    ) : detailsData.teachingDetails.map((log: any, idx) => (
                                        <tr key={log.workLogId || idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-3 border-r border-gray-100/50 font-bold text-gray-500 text-center">{idx + 1}</td>
                                            <td className="p-3 border-r border-gray-100/50 font-mono">
                                                {new Date(log.checkinTime).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="p-3 border-r border-gray-100/50 font-bold text-gray-800">
                                                {log.booking?.member?.fullName || 'Khách lẻ'}
                                            </td>
                                            <td className="p-3 border-r border-gray-100/50 text-right font-bold text-blue-600">
                                                {formatCurrency(log.earnAmount)}
                                            </td>
                                            <td className="p-3 uppercase text-[10px] font-extrabold text-center">
                                                <span className={`px-2 py-1 rounded ${log.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100 bg-gray-50/50">
                                    <tr>
                                        <th className="p-3 border-r border-gray-100/50">Ngày bán</th>
                                        <th className="p-3 border-r border-gray-100/50">Gói tập</th>
                                        <th className="p-3 border-r border-gray-100/50">Khách mua</th>
                                        <th className="p-3 text-right">Doanh số (Thực thu)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {detailsData.salesDetails?.length === 0 ? (
                                        <tr><td colSpan={4} className="py-12 text-center text-gray-400 italic">Chưa bán được gói nào trong tháng.</td></tr>
                                    ) : detailsData.salesDetails.map((sale: any, idx) => (
                                        <tr key={sale.subscriptionId || idx} className="hover:bg-gray-50/50">
                                            <td className="p-3 border-r border-gray-100/50 font-mono">
                                                {new Date(sale.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="p-3 border-r border-gray-100/50 font-bold text-blue-600">{sale.package?.name}</td>
                                            <td className="p-3 border-r border-gray-100/50">{sale.member?.fullName}</td>
                                            <td className="p-3 text-right font-bold text-gray-900">
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
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 items-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-white transition-all"
                    >
                        Đóng
                    </button>
                    {salaryData?.status === 'PENDING' && (
                        <button
                            disabled={isPaying}
                            onClick={handleConfirmPayment}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center gap-2"
                        >
                            {isPaying ? 'Đang thực hiện...' : 'Xác nhận & Thanh toán lương'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};