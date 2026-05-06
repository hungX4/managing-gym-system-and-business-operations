import { Between, Repository } from 'typeorm';
import { MemberSubscription } from '../models/entity/MemberSubscription';
import { AppDataSource } from '../models/data-source';

export class RevenueService {
    // Khởi tạo trực tiếp tại đây, không cần constructor
    private subscriptionRepo = AppDataSource.getRepository(MemberSubscription);

    public async getMonthlyRevenue(month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const prevStartDate = new Date(year, month - 2, 1);
        const prevEndDate = new Date(year, month - 1, 0, 23, 59, 59, 999);

        const [currentMonthSubs, prevMonthSubs] = await Promise.all([
            this.subscriptionRepo.find({
                where: { createdAt: Between(startDate, endDate) },
                relations: ['package'],
            }),
            this.subscriptionRepo.find({
                where: { createdAt: Between(prevStartDate, prevEndDate) },
            })
        ]);

        const totalRevenue = currentMonthSubs.reduce((sum, sub) => sum + Number(sub.actualPaid), 0);
        const prevTotalRevenue = prevMonthSubs.reduce((sum, sub) => sum + Number(sub.actualPaid), 0);

        // Tính % tăng trưởng
        let growthRate = 0;
        if (prevTotalRevenue > 0) {
            growthRate = Number((((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100).toFixed(2));
        } else if (totalRevenue > 0) {
            growthRate = 100; // Tháng trước = 0, tháng này có tiền thì tăng 100%
        }

        // 4. Phân loại doanh thu theo mảng (Tự động dynamic theo PackageType)
        const revenueByType: Record<string, number> = {};

        currentMonthSubs.forEach(sub => {
            const type = sub.package?.type || 'OTHER'; // Đề phòng lỗi thiếu package
            const amount = Number(sub.actualPaid);

            if (revenueByType[type]) {
                revenueByType[type] += amount;
            } else {
                revenueByType[type] = amount;
            }
        });

        // 5. Build dữ liệu cho Biểu đồ (Nhóm theo ngày)
        const daysInMonth = endDate.getDate();
        const chartDataMap: Record<string, number> = {};

        // Khởi tạo mốc 0 cho tất cả các ngày trong tháng để biểu đồ không bị đứt đoạn
        for (let i = 1; i <= daysInMonth; i++) {
            const dayString = `${i.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
            chartDataMap[dayString] = 0;
        }

        // Đổ tiền vào từng ngày
        currentMonthSubs.forEach(sub => {
            const dateObj = new Date(sub.createdAt);
            const dayString = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
            chartDataMap[dayString] += Number(sub.actualPaid);
        });

        // Chuyển Object Map thành Array dùng cho Recharts bên Frontend
        const chartData = Object.keys(chartDataMap).map(date => ({
            date: date,
            revenue: chartDataMap[date]
        }));

        return {
            totalRevenue,
            growthRate,
            revenueByType,
            chartData
        };
    }
}