// src/hooks/useRevenue.ts
import { useState, useEffect } from 'react';
import { revenueApi } from '../api/revenue/revenue.api';

export const useRevenue = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const result = await revenueApi.getDashboardData(selectedMonth, selectedYear);
                if (result.success) {
                    setData(result.data);
                }
            } catch (error) {
                // Có thể thêm logic show toast notification báo lỗi ở đây
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedMonth, selectedYear]);

    // Trả về những State và Hàm mà UI cần dùng
    return {
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        data,
        loading
    };
};