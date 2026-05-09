import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Line, Cell
} from 'recharts';
import { TrendingUp, DollarSign, Users, Package, ChevronDown, Calendar, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const formatCurrency = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + ' ₫';
const formatShortCurrency = (v: number) => `${(v / 1000000).toFixed(0)}M`;

// --- Custom Tooltip cho Nhân viên ---
const EmployeeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isOverTarget = data.sold >= data.target;
        return (
            <div className="bg-neutral-900 p-4 border border-red-900/50 rounded-lg shadow-xl">
                <p className="font-bold text-white mb-1">{data.name}</p>
                <p className={`text-lg font-bold ${isOverTarget ? 'text-green-500' : 'text-red-500'}`}>
                    Đạt: {data.kpiPercent}% KPI
                </p>
                <div className="mt-2 text-sm text-neutral-400">
                    <p>Thực tế: <span className="text-white font-medium">{formatCurrency(data.sold)}</span></p>
                    <p>Chỉ tiêu: <span className="text-neutral-500">{formatCurrency(data.target)}</span></p>
                </div>
            </div>
        );
    }
    return null;
};

const RevenueDashboardRedBlack = () => {
    // Quản lý State Filter
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);

    // Quản lý State Data API
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Gọi API mỗi khi Tháng/Năm thay đổi
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Đổi Port hoặc URL cho khớp với môi trường của bạn
                const response = await axiosClient.get(`/admin?month=${selectedMonth}&year=${selectedYear}`);
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedMonth, selectedYear]);

    // Loading State
    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-red-500">
                <Loader2 className="animate-spin" size={48} />
                <span className="ml-4 text-xl font-bold">Đang tải dữ liệu...</span>
            </div>
        );
    }

    // An toàn khi data null
    if (!data) return <div className="p-6 bg-neutral-950 text-white min-h-screen">Không có dữ liệu</div>;

    // Tính toán chỉ số
    const progressPercent = Math.min(((data.totalRevenue / data.monthlyTarget) * 100), 100).toFixed(1);
    const isTargetMet = data.totalRevenue >= data.monthlyTarget;
    const isGrowthUp = data.growthRate >= 0;

    // Xử lý data KPI nhân viên
    const employeeKpiData = data.employeeSales?.map((emp: any) => ({
        ...emp,
        kpiPercent: Number(((emp.sold / emp.target) * 100).toFixed(1))
    })).sort((a: any, b: any) => b.kpiPercent - a.kpiPercent) || [];

    return (
        // Main Container - Đỏ & Đen
        <div className="p-6 bg-neutral-950 min-h-screen text-neutral-300 font-sans">

            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Dashboard Doanh Thu</h1>
                    <p className="text-neutral-500 text-sm mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Dữ liệu trực tiếp từ Server
                    </p>
                </div>

                {/* Bộ lọc Tháng & Năm */}
                <div className="flex gap-3">
                    {/* Lọc Tháng */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowMonthDropdown(!showMonthDropdown); setShowYearDropdown(false) }}
                            className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 border border-red-900/30 rounded-lg shadow-sm hover:bg-neutral-800 hover:border-red-500/50 transition"
                        >
                            <Calendar size={16} className="text-red-500" />
                            <span>Tháng {selectedMonth}</span>
                            <ChevronDown size={16} className={`transition-transform text-neutral-500 ${showMonthDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showMonthDropdown && (
                            <div className="absolute right-0 mt-2 w-full min-w-[140px] bg-neutral-900 border border-red-900/50 rounded-lg shadow-2xl z-50 overflow-hidden h-64 overflow-y-auto">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <div
                                        key={m}
                                        className={`px-4 py-3 hover:bg-red-950/30 cursor-pointer transition ${selectedMonth === m ? 'bg-red-900/20 text-red-400 font-bold border-l-2 border-red-500' : 'text-neutral-300'}`}
                                        onClick={() => { setSelectedMonth(m); setShowMonthDropdown(false); }}
                                    >
                                        Tháng {m}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Lọc Năm */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowYearDropdown(!showYearDropdown); setShowMonthDropdown(false) }}
                            className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 border border-red-900/30 rounded-lg shadow-sm hover:bg-neutral-800 hover:border-red-500/50 transition"
                        >
                            <span>Năm {selectedYear}</span>
                            <ChevronDown size={16} className={`transition-transform text-neutral-500 ${showYearDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showYearDropdown && (
                            <div className="absolute right-0 mt-2 w-full min-w-[120px] bg-neutral-900 border border-red-900/50 rounded-lg shadow-2xl z-50 overflow-hidden">
                                {[2027, 2026, 2025].map(year => (
                                    <div
                                        key={year}
                                        className={`px-4 py-3 hover:bg-red-950/30 cursor-pointer transition ${selectedYear === year ? 'bg-red-900/20 text-red-400 font-bold border-l-2 border-red-500' : 'text-neutral-300'}`}
                                        onClick={() => { setSelectedYear(year); setShowYearDropdown(false); }}
                                    >
                                        Năm {year}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-neutral-900 p-6 rounded-xl border border-red-900/20 shadow-lg relative overflow-hidden">
                    {/* Vạch kẻ trang trí */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>

                    <div className="flex justify-between items-start mb-4 pl-2">
                        <div className="bg-red-500/10 p-3 rounded-lg text-red-500"><DollarSign size={24} /></div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isGrowthUp ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>
                            {isGrowthUp ? '+' : ''}{data.growthRate}%
                        </span>
                    </div>
                    <p className="text-sm text-neutral-400 font-medium pl-2">Doanh thu T{selectedMonth}/{selectedYear}</p>
                    <h3 className="text-3xl font-black text-white mt-1 pl-2">{formatCurrency(data.totalRevenue)}</h3>
                </div>

                {/* Thanh tiến độ KPI */}
                <div className="bg-neutral-900 p-6 rounded-xl border border-red-900/20 shadow-lg md:col-span-2 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>

                    <div className="flex justify-between mb-3 pl-2">
                        <div>
                            <p className="text-sm text-neutral-400 font-medium">Mục tiêu tháng ({formatShortCurrency(data.monthlyTarget)})</p>
                            {isTargetMet && <p className="text-xs text-green-500 mt-1 font-bold">Đã vượt chỉ tiêu! 🔥</p>}
                        </div>
                        <p className={`text-3xl font-black ${isTargetMet ? 'text-green-500' : 'text-red-500'}`}>
                            {progressPercent}%
                        </p>
                    </div>
                    <div className="w-full bg-neutral-950 h-5 rounded-full overflow-hidden border border-neutral-800 ml-2 shadow-inner">
                        <div
                            className={`h-full transition-all duration-1000 relative overflow-hidden ${isTargetMet ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-red-800 to-red-500'}`}
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-white/10 w-full h-full transform -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Biểu đồ Nhân Viên */}
                <div className="bg-neutral-900 p-6 rounded-xl border border-red-900/20 shadow-lg lg:col-span-1">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Users size={18} className="text-red-500" /> Bảng vàng nhân viên</h3>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={employeeKpiData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <XAxis type="number" hide domain={[0, 'dataMax + 10']} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    // 1. TĂNG WIDTH LÊN 120 HOẶC 140 ĐỂ CHỮ CÓ KHÔNG GIAN HIỂN THỊ NẰM NGANG
                                    width={130}

                                    // 2. CHỈNH LẠI FONT SIZE & KHOẢNG CÁCH (TICK MARGIN)
                                    tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 600 }}
                                    tickMargin={10}

                                    axisLine={false}
                                    tickLine={false}

                                    // 3. (TÙY CHỌN) NẾU TÊN VẪN QUÁ DÀI, TỰ ĐỘNG THÊM DẤU "..."
                                    tickFormatter={(value) => value.length > 18 ? `${value.substring(0, 18)}...` : value}
                                />
                                <Tooltip cursor={{ fill: '#171717' }} content={<EmployeeTooltip />} />
                                <Bar dataKey="kpiPercent" radius={[0, 4, 4, 0]} barSize={16}>
                                    {employeeKpiData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.kpiPercent >= 100 ? '#22c55e' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ 12 Tháng */}
                <div className="bg-neutral-900 p-6 rounded-xl border border-red-900/20 shadow-lg lg:col-span-2">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-red-500" /> Biến động cả năm {selectedYear}</h3>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data.yearly?.chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                                <XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={10} />
                                <YAxis tickFormatter={(v) => `${v / 1e6}M`} tick={{ fill: '#737373', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#171717' }}
                                    contentStyle={{ backgroundColor: '#171717', borderColor: '#450a0a', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                                    formatter={(v: number) => formatCurrency(v)}
                                />
                                <Bar dataKey="revenue" name="Doanh thu" fill="#991b1b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#0a0a0a', stroke: '#ef4444', strokeWidth: 2 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Bảng chi tiết */}
            <div className="bg-neutral-900 rounded-xl border border-red-900/20 shadow-lg overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-800 to-red-500"></div>
                <div className="p-6 border-b border-neutral-800">
                    <h3 className="font-bold text-white flex items-center gap-2"><Package size={18} className="text-red-500" /> Giao dịch gần nhất (Tháng {selectedMonth})</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40 text-neutral-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-bold">Ngày</th>
                                <th className="px-6 py-4 font-bold">Khách hàng</th>
                                <th className="px-6 py-4 font-bold">Gói tập</th>
                                <th className="px-6 py-4 font-bold">Loại</th>
                                <th className="px-6 py-4 font-bold">Người bán</th>
                                <th className="px-6 py-4 font-bold text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50 text-sm text-neutral-300">
                            {data.detailedPackages?.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-neutral-500">Chưa có giao dịch nào trong tháng này</td></tr>
                            ) : (
                                data.detailedPackages?.map((pkg: any) => (
                                    <tr key={pkg.id} className="hover:bg-red-950/20 transition duration-150">
                                        <td className="px-6 py-4 text-neutral-500">{pkg.date}</td>
                                        <td className="px-6 py-4 font-bold text-white">{pkg.customer}</td>
                                        <td className="px-6 py-4 font-medium text-red-400">{pkg.packageName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${pkg.type === 'MEMBERSHIP'
                                                ? 'bg-neutral-800 text-neutral-300 border-neutral-700'
                                                : 'bg-red-950 text-red-400 border-red-900'
                                                }`}>
                                                {pkg.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{pkg.seller || 'Club'}</td>
                                        <td className="px-6 py-4 text-right font-black text-white">{formatCurrency(pkg.amount)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueDashboardRedBlack;