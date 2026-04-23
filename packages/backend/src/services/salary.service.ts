import { In } from 'typeorm';
import { Role, CoachType, PackageType, WorkLogStatus, SalaryStatus, FinalizeSalaryDto, GetSalaryDetailQueryDto } from '@gym/shared';
import { AppDataSource } from '../models/data-source';
import { User } from '../models/entity/User';
import { MemberSubscription } from '../models/entity/MemberSubscription';
import { WorkLog } from '../models/entity/Worklog';
import { SalaryConfig } from '../models/entity/SalaryConfig';
import { GetSalaryQueryDto, SalaryResponseDto } from '@gym/shared';
import { Salary } from '../models/entity/Salary';

export class SalaryService {
    // Không dùng constructor, khởi tạo trực tiếp Repository
    private userRepo = AppDataSource.getRepository(User);
    private subRepo = AppDataSource.getRepository(MemberSubscription);
    private workLogRepo = AppDataSource.getRepository(WorkLog);
    private salaryConfigRepo = AppDataSource.getRepository(SalaryConfig);
    private salaryRepo = AppDataSource.getRepository(Salary);


    calculateSalary = async (query: GetSalaryQueryDto): Promise<SalaryResponseDto[]> => {
        const { coachId, month, year } = query;

        //kiem tra thang nay da chot luong chua
        const queryMonth = Number(month);
        const queryYear = Number(year);

        const whereCondition: any = {
            month: queryMonth,
            year: queryYear
        };
        if (coachId) whereCondition.employee = { userId: coachId.toString() };

        const finalizedSalaries = await this.salaryRepo.find({
            where: whereCondition,
            relations: ['employee']
        });

        //tra ve data tu database neu da chot
        if (finalizedSalaries.length > 0) {
            return finalizedSalaries.map(s => ({
                salaryId: s.salaryId || (s as any).salary_id, // Lấy ID để Tương tác PATCH
                coachId: Number(s.employee.userId),
                coachName: s.employee.fullName,
                month: s.month,
                year: s.year,
                baseSalary: Number(s.baseSalarySnapshot),
                totalTeachingSessions: 0, // DB không lưu số buổi nên trả 0
                teachingIncome: Number(s.totalWorkIncome),
                totalSalesAmount: 0,      // DB không lưu tổng DS nên trả null
                salesCommission: Number(s.totalCommission),
                staffBonus: Number(s.bonus),
                totalIncome: Number(s.finalAmount),
                status: s.status // Trạng thái thật (PENDING hoặc PAID)
            }));
        }

        // Xác định khoảng thời gian của tháng cần tính
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // 1. Lấy danh sách nhân viên cần tính lương
        const users = await this.userRepo.find({
            where: coachId
                ? { userId: coachId.toString() }
                : { role: In([Role.ADMIN, Role.STAFF, Role.COACH]) },
            relations: ['coachProfile'] // Cần join để lấy coachType
        });

        // 2. Lấy toàn bộ cấu hình lương chuẩn bị sẵn
        const configs = await this.salaryConfigRepo.find();

        // 3. TÍNH DOANH SỐ CHUNG TOÀN CÂU LẠC BỘ (Dùng cho Staff)
        let totalClubMembershipSales = 0;
        const hasStaff = users.some(u => u.role === Role.STAFF);
        if (hasStaff) {
            const clubSales = await this.subRepo.createQueryBuilder('sub')
                .innerJoin('sub.package', 'pkg')
                .where('pkg.type = :type', { type: PackageType.MEMBERSHIP })
                .andWhere('sub.createdAt >= :startDate', { startDate })
                .andWhere('sub.createdAt <= :endDate', { endDate })
                .select('SUM(sub.actualPaid)', 'total')
                .getRawOne();
            totalClubMembershipSales = Number(clubSales?.total || 0);
        }

        const result: SalaryResponseDto[] = [];

        // 4. VÒNG LẶP TÍNH LƯƠNG CHO TỪNG NGƯỜI
        for (const user of users) {
            let baseSalary = 0;
            let teachingIncome = 0;
            let salesCommission = 0;
            let totalTeachingSessions = 0;
            let totalSalesAmount = 0;
            let staffBonus = 0;

            // ================== ADMIN ==================
            if (user.role === Role.ADMIN) {
                const adminConfig = configs.find(c => c.role === Role.ADMIN);
                baseSalary = Number(adminConfig?.baseSalary || 0);
            }
            // ================== STAFF ==================
            else if (user.role === Role.STAFF) {
                const staffConfig = configs.find(c => c.role === Role.STAFF);
                baseSalary = Number(staffConfig?.baseSalary || 0);

                // Tính thưởng: Cứ 100tr -> thưởng 1tr (Max 1 Tỷ)
                const bonusLevels = Math.floor(totalClubMembershipSales / 100_000_000);
                staffBonus = Math.min(bonusLevels * 1_000_000, 1_000_000_000);
            }
            // ================== COACH ==================
            else if (user.role === Role.COACH) {
                const type = user.coachProfile?.type;
                const level = user.coachProfile?.level;

                const coachConfig = configs.find(c => c.role === Role.COACH && c.coachType === type && c.coachLevel === level);
                baseSalary = Number(coachConfig?.baseSalary || 0);

                // Nếu là GYM COACH
                if (type === CoachType.GYM) {
                    // A. Tính Tổng Doanh Số Bán Hàng (Dựa theo seller_id và createdAt)
                    const salesQuery = await this.subRepo.createQueryBuilder('sub')
                        .where('sub.seller_id = :sellerId', { sellerId: user.userId })
                        .andWhere('sub.createdAt >= :startDate', { startDate })
                        .andWhere('sub.createdAt <= :endDate', { endDate })
                        .select('SUM(sub.actualPaid)', 'total')
                        .getRawOne();

                    totalSalesAmount = Number(salesQuery?.total || 0);

                    // Tính bậc doanh số (cứ mốc 30 triệu sẽ nhảy mốc)
                    const salesLevel = Math.floor(totalSalesAmount / 30_000_000);

                    // Hoa hồng bán (Base 4%, +1% mỗi mốc, Tối đa 12%)
                    const commissionPercent = Math.min(4 + (salesLevel * 1), 12);
                    salesCommission = totalSalesAmount * (commissionPercent / 100);

                    // B. Tính Tiền Dạy Học (Dựa theo WorkLog checkinTime)
                    const teachingQuery = await this.workLogRepo.createQueryBuilder('wl')
                        .where('wl.coach_id = :coachId', { coachId: user.userId })
                        .andWhere('wl.checkinTime >= :startDate', { startDate })
                        .andWhere('wl.checkinTime <= :endDate', { endDate })
                        .andWhere('wl.status IN (:...statuses)', { statuses: [WorkLogStatus.COMPLETED, WorkLogStatus.LATE_CANCEL] })
                        .select(['SUM(wl.earnAmount) as totalAmount', 'COUNT(wl.workLogId) as totalSessions'])
                        .getRawOne();

                    const totalEarnAmount = Number(teachingQuery?.totalAmount || 0);
                    totalTeachingSessions = Number(teachingQuery?.totalSessions || 0);

                    // Tỉ lệ ăn tiền dạy (Base 20%, +2% mỗi mốc doanh số, Tối đa 36%)
                    const teachingPercent = Math.min(20 + (salesLevel * 2), 36);
                    teachingIncome = totalEarnAmount * (teachingPercent / 100);
                }
                else {
                    // DANCE / YOGA: Để sau làm 
                }
            }

            // Đóng gói DTO Trả về
            result.push({
                coachId: Number(user.userId),
                coachName: user.fullName,
                month,
                year,
                baseSalary,
                totalTeachingSessions,
                teachingIncome,
                totalSalesAmount,
                salesCommission: salesCommission,
                staffBonus,
                totalIncome: baseSalary + teachingIncome + salesCommission + staffBonus,
                status: SalaryStatus.ESTIMATED
            });
        }

        return result;
    }

    // 1. CHỐT LƯƠNG: Tính toán lại và lưu cứng vào Database
    finalizeSalary = async (data: FinalizeSalaryDto): Promise<Salary[]> => {
        const { month, year } = data;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() trả về từ 0-11 nên phải +1
        const currentYear = currentDate.getFullYear();

        // Chặn : Không cho chốt lương của tháng hiện tại hoặc tháng trong tương lai
        if (year > currentYear || (year === currentYear && month >= currentMonth)) {
            throw new Error(`Chưa hết tháng ${month}/${year}, không thể chốt sổ lương!`);
        }

        // Kiểm tra xem tháng này đã chốt lương chưa
        const existingSalaries = await this.salaryRepo.findOne({ where: { month, year } });
        if (existingSalaries) {
            throw new Error(`Lương tháng ${month}/${year} đã được chốt, không thể chốt lại!`);
        }

        // Gọi lại chính hàm calculateSalary (như 1 bản nháp) để lấy số liệu mới nhất
        const estimatedSalaries = await this.calculateSalary({ month, year });

        // Chuyển đổi từ DTO sang Entity để lưu vào DB
        const salariesToSave = estimatedSalaries.map(est => {
            const salary = new Salary();
            salary.employee = { userId: est.coachId.toString() } as User;
            salary.month = month;
            salary.year = year;
            salary.totalWorkIncome = est.teachingIncome;
            salary.totalCommission = est.salesCommission;
            salary.baseSalarySnapshot = est.baseSalary;
            salary.bonus = est.staffBonus || 0;
            salary.deduction = 0; // Khấu trừ/Phạt để 0, tính năng này có thể mở rộng sau
            salary.finalAmount = est.totalIncome;
            salary.status = SalaryStatus.PENDING; // Chốt xong thì trạng thái là CHỜ THANH TOÁN
            return salary;
        });

        // Insert toàn bộ mảng vào DB
        await this.salaryRepo.save(salariesToSave);
        return salariesToSave;
    }

    // 2. THANH TOÁN LƯƠNG: Kế toán bấm xác nhận đã chuyển khoản
    paySalary = async (salaryId: number): Promise<Salary> => {
        const salary = await this.salaryRepo.findOne({ where: { salaryId } });
        if (!salary) throw new Error('Không tìm thấy bản ghi lương này!');
        if (salary.status === SalaryStatus.PAID) throw new Error('Bản ghi lương này đã được thanh toán rồi!');

        salary.status = SalaryStatus.PAID;
        salary.paidAt = new Date(); // Ghi nhận thời gian chuyển tiền

        await this.salaryRepo.save(salary);
        return salary;
    }

    // 3. SAO KÊ CHI TIẾT: Lấy danh sách từng buổi dạy và gói đã bán
    getSalaryDetails = async (query: GetSalaryDetailQueryDto) => {
        const { coachId, month, year } = query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // Lấy lịch sử dạy học (Join với booking để lấy tên khách hàng)
        const teachingDetails = await this.workLogRepo.createQueryBuilder('wl')
            .leftJoinAndSelect('wl.booking', 'booking')
            .leftJoinAndSelect('booking.member', 'member')
            .where('wl.coach_id = :coachId', { coachId })
            .andWhere('wl.checkinTime >= :startDate', { startDate })
            .andWhere('wl.checkinTime <= :endDate', { endDate })
            .andWhere('wl.status IN (:...statuses)', { statuses: [WorkLogStatus.COMPLETED, WorkLogStatus.LATE_CANCEL] })
            .getMany();

        // Lấy lịch sử bán gói (Join với package để lấy tên gói, member để lấy tên khách)
        const salesDetails = await this.subRepo.createQueryBuilder('sub')
            .leftJoinAndSelect('sub.package', 'pkg')
            .leftJoinAndSelect('sub.member', 'member')
            .where('sub.seller_id = :sellerId', { sellerId: coachId })
            .andWhere('sub.createdAt >= :startDate', { startDate })
            .andWhere('sub.createdAt <= :endDate', { endDate })
            .getMany();

        return { teachingDetails, salesDetails };
    }
}