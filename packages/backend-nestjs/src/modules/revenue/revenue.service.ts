import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm'; // Sửa lại đường dẫn entity của bạn
import { MemberSubscriptionStatus } from '@gym/shared';
import { MemberSubscription } from '../subscription/entities/member-subscription.entity';

@Injectable()
export class RevenueService {
    constructor(
        @InjectRepository(MemberSubscription)
        private readonly subscriptionRepo: Repository<MemberSubscription>,
    ) { }

    /**
     * HÀM TỔNG HỢP: Gọi song song Monthly và Yearly
     */
    async getFullDashboardData(month?: number, year?: number) {
        const currentDate = new Date();
        const targetMonth = month ?? currentDate.getMonth() + 1;
        const targetYear = year ?? currentDate.getFullYear();

        const [monthlyData, yearlyData] = await Promise.all([
            this.getMonthlyStats(targetMonth, targetYear),
            this.getYearlyStats(targetYear),
        ]);

        return {
            ...monthlyData,
            yearly: yearlyData,
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

        const validStatuses = [
            MemberSubscriptionStatus.ACTIVE,
            MemberSubscriptionStatus.EXPIRATED,
            MemberSubscriptionStatus.RESERVE,
        ];

        const [currentMonthSubs, prevMonthSubs] = await Promise.all([
            this.subscriptionRepo.find({
                where: {
                    createdAt: Between(startDate, endDate),
                    status: In(validStatuses),
                },
                // 🟢 Đã bổ sung 'member' vào relation để lấy được tên khách hàng
                relations: ['package', 'seller', 'member'],
            }),
            this.subscriptionRepo.find({
                where: {
                    createdAt: Between(prevStartDate, prevEndDate),
                    status: In(validStatuses),
                },
            }),
        ]);

        const totalRevenue = currentMonthSubs.reduce(
            (sum, sub) => sum + Number(sub.actualPaid || 0),
            0,
        );
        const prevTotalRevenue = prevMonthSubs.reduce(
            (sum, sub) => sum + Number(sub.actualPaid || 0),
            0,
        );

        // Tính % tăng trưởng
        const growthRate =
            prevTotalRevenue > 0
                ? Number((((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100).toFixed(2))
                : totalRevenue > 0
                    ? 100
                    : 0;

        // Logic Hiệu suất nhân viên (KPI 800tr)
        const employeeMap: Record<string, { name: string; sold: number; target: number }> = {};

        currentMonthSubs.forEach((sub) => {
            const sellerName = sub.seller?.fullName || 'Membership';
            const amount = Number(sub.actualPaid || 0);

            if (!employeeMap[sellerName]) {
                const isPT = sellerName.toUpperCase().includes('PT');
                employeeMap[sellerName] = {
                    name: sellerName,
                    sold: 0,
                    target: isPT ? 150000000 : 100000000,
                };
            }
            employeeMap[sellerName].sold += amount;
        });

        return {
            totalRevenue,
            monthlyTarget: 800000000,
            growthRate,
            employeeSales: Object.values(employeeMap),
            detailedPackages: currentMonthSubs
                .map((sub) => ({
                    id: sub.subscriptionId,
                    date: new Date(sub.createdAt).toLocaleDateString('vi-VN'),
                    customer: sub.member?.fullName || 'Khách lẻ',
                    packageName: sub.package?.name,
                    type: sub.package?.type,
                    seller: sub.seller?.fullName,
                    amount: sub.actualPaid,
                }))
                .slice(0, 10), // 10 giao dịch gần nhất
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
            MemberSubscriptionStatus.RESERVE,
        ];

        const yearlySubs = await this.subscriptionRepo.find({
            where: {
                createdAt: Between(startYear, endYear),
                status: In(validStatuses),
            },
            relations: ['package'],
        });

        // 1. Xử lý 12 tháng cho biểu đồ cột
        const monthlyChart = Array.from({ length: 12 }, (_, i) => ({
            month: `T${i + 1}`,
            revenue: 0,
        }));

        // 2. Xử lý cơ cấu doanh thu (Biểu đồ tròn)
        const revenueByType: Record<string, number> = {};

        yearlySubs.forEach((sub) => {
            const date = new Date(sub.createdAt);
            const monthIdx = date.getMonth();
            const amount = Number(sub.actualPaid || 0);

            // Cộng dồn vào tháng tương ứng
            monthlyChart[monthIdx].revenue += amount;

            // Phân loại theo type
            const type = sub.package?.type || 'OTHER';
            revenueByType[type] = (revenueByType[type] || 0) + amount;
        });

        return {
            chartData: monthlyChart,
            revenueByType,
        };
    }
}