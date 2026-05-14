// services/revenue.service.ts
import { Between, In, Repository } from 'typeorm';
import { MemberSubscription } from '../models/entity/MemberSubscription';
import { AppDataSource } from '../models/data-source';
import { MemberSubscriptionStatus } from '@gym/shared';

export class RevenueService {
    private subscriptionRepo = AppDataSource.getRepository(MemberSubscription);

    /**
     * HÀM TỔNG HỢP: Gọi song song Monthly và Yearly
     */
    public async getFullDashboardData(month: number, year: number) {
        const [monthlyData, yearlyData] = await Promise.all([
            this.getMonthlyStats(month, year),
            this.getYearlyStats(year)
        ]);

        return {
            ...monthlyData,
            yearly: yearlyData
        };
    }

    /**
     * LOGIC THÁNG: Doanh thu, Tăng trưởng, Nhân viên, Danh sách gói
     */
    private async getMonthlyStats(month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        const prevStartDate = new Date(year, month - 2, 1);
        const prevEndDate = new Date(year, month - 1, 0, 23, 59, 59, 999);
        // ĐỊNH NGHĨA TRẠNG THÁI HỢP LỆ (Chỉ lấy đơn ĐÃ CÓ TIỀN)
        const validStatuses = [
            MemberSubscriptionStatus.ACTIVE,
            MemberSubscriptionStatus.EXPIRATED,
            MemberSubscriptionStatus.RESERVE
        ];
        const [currentMonthSubs, prevMonthSubs] = await Promise.all([
            this.subscriptionRepo.find({
                where: {
                    createdAt: Between(startDate, endDate),
                    status: In(validStatuses)
                },
                relations: ['package', 'seller'], //có relation seller để biết ai bán
            }),
            this.subscriptionRepo.find({
                where: {
                    createdAt: Between(prevStartDate, prevEndDate),
                    status: In(validStatuses)
                },
            })
        ]);

        const totalRevenue = currentMonthSubs.reduce((sum, sub) => sum + Number(sub.actualPaid), 0);
        const prevTotalRevenue = prevMonthSubs.reduce((sum, sub) => sum + Number(sub.actualPaid), 0);

        // Tính % tăng trưởng
        let growthRate = prevTotalRevenue > 0
            ? Number((((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100).toFixed(2))
            : (totalRevenue > 0 ? 100 : 0);

        // Logic Hiệu suất nhân viên (KPI 800tr)
        const employeeMap: Record<string, any> = {};
        currentMonthSubs.forEach(sub => {
            const sellerName = sub.seller?.fullName || 'Membership';
            const amount = Number(sub.actualPaid);

            if (!employeeMap[sellerName]) {
                // Mock target dựa trên role (Ở thực tế nên lấy từ DB)
                // Giả sử logic: Nếu tên có chữ PT thì target 150tr, còn lại 100tr
                const isPT = sellerName.toUpperCase().includes('PT');
                employeeMap[sellerName] = {
                    name: sellerName,
                    sold: 0,
                    target: isPT ? 150000000 : 100000000
                };
            }
            employeeMap[sellerName].sold += amount;
        });

        return {
            totalRevenue,
            monthlyTarget: 800000000,
            growthRate,
            employeeSales: Object.values(employeeMap),
            detailedPackages: currentMonthSubs.map(sub => ({
                id: sub.subscriptionId,
                date: new Date(sub.createdAt).toLocaleDateString('vi-VN'),
                customer: sub.member?.fullName || 'Khách lẻ',
                packageName: sub.package?.name,
                type: sub.package?.type,
                seller: sub.seller?.fullName,
                amount: sub.actualPaid
            })).slice(0, 10) // Lấy 10 giao dịch gần nhất
        };
    }

    /**
     * LOGIC NĂM: Biểu đồ 12 tháng và Cơ cấu doanh thu năm
     */
    private async getYearlyStats(year: number) {
        const startYear = new Date(year, 0, 1);
        const endYear = new Date(year, 11, 31, 23, 59, 59);
        const validStatuses = [
            MemberSubscriptionStatus.ACTIVE,
            MemberSubscriptionStatus.EXPIRATED,
            MemberSubscriptionStatus.RESERVE
        ];
        const yearlySubs = await this.subscriptionRepo.find({
            where: {
                createdAt: Between(startYear, endYear),
                status: In(validStatuses)
            },
            relations: ['package']
        });

        // 1. Xử lý 12 tháng cho biểu đồ cột
        const monthlyChart = Array.from({ length: 12 }, (_, i) => ({
            month: `T${i + 1}`,
            revenue: 0
        }));

        // 2. Xử lý cơ cấu doanh thu (Biểu đồ tròn)
        const revenueByType: Record<string, number> = {};

        yearlySubs.forEach(sub => {
            const date = new Date(sub.createdAt);
            const monthIdx = date.getMonth();
            const amount = Number(sub.actualPaid);

            // Cộng dồn vào tháng tương ứng
            monthlyChart[monthIdx].revenue += amount;

            // Phân loại theo type
            const type = sub.package?.type || 'OTHER';
            revenueByType[type] = (revenueByType[type] || 0) + amount;
        });

        return {
            chartData: monthlyChart,
            revenueByType: revenueByType
        };
    }
}