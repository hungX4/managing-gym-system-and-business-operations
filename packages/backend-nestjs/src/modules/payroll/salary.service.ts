// src/modules/salary/salary.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
    Role,
    CoachType,
    PackageType,
    WorkLogStatus,
    SalaryStatus,
    MemberSubscriptionStatus,
    SalaryResponseDto,
} from '@gym/shared';
import { User } from '../user/entities/user.entity';
import { MemberSubscription } from '../subscription/entities/member-subscription.entity';
import { SalaryConfig } from './entities/salary-config.entity';
import { Salary } from './entities/salary.entity';
import { GetSalaryQueryDto, FinalizeSalaryDto, GetSalaryDetailQueryDto } from './dto/salary.dto';
import { WorkLog } from '../attendance/entities/work-log.entity';

@Injectable()
export class SalaryService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(MemberSubscription)
        private readonly subRepo: Repository<MemberSubscription>,
        @InjectRepository(WorkLog)
        private readonly workLogRepo: Repository<WorkLog>,
        @InjectRepository(SalaryConfig)
        private readonly salaryConfigRepo: Repository<SalaryConfig>,
        @InjectRepository(Salary)
        private readonly salaryRepo: Repository<Salary>,
    ) { }

    async calculateSalary(query: GetSalaryQueryDto): Promise<SalaryResponseDto[]> {
        const { coachId, month, year } = query;
        const queryMonth = Number(month);
        const queryYear = Number(year);

        const whereCondition: any = {
            month: queryMonth,
            year: queryYear,
        };
        if (coachId) whereCondition.employee = { userId: coachId.toString() };

        // 1. Kiểm tra xem tháng này đã chốt lương chưa
        const finalizedSalaries = await this.salaryRepo.find({
            where: whereCondition,
            relations: ['employee'],
        });

        if (finalizedSalaries.length > 0) {
            return finalizedSalaries.map((s) => ({
                salaryId: s.salaryId || (s as any).salary_id,
                coachId: Number(s.employee.userId),
                coachName: s.employee.fullName,
                month: s.month,
                year: s.year,
                baseSalary: Number(s.baseSalarySnapshot),
                totalTeachingSessions: 0,
                teachingIncome: Number(s.totalWorkIncome),
                totalSalesAmount: 0,
                salesCommission: Number(s.totalCommission),
                staffBonus: Number(s.bonus),
                totalIncome: Number(s.finalAmount),
                status: s.status,
            }));
        }

        // 2. Xác định khoảng thời gian của tháng
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // 3. Lấy danh sách nhân viên cần tính lương
        const users = await this.userRepo.find({
            where: coachId
                ? { userId: coachId.toString() }
                : { role: In([Role.ADMIN, Role.STAFF, Role.COACH]) },
            relations: ['coachProfile'],
        });

        // 4. Lấy cấu hình lương
        const configs = await this.salaryConfigRepo.find();

        // 5. Tính doanh số chung toàn CLB (dành cho STAFF)
        let totalClubMembershipSales = 0;
        const hasStaff = users.some((u) => u.role === Role.STAFF);
        if (hasStaff) {
            const clubSales = await this.subRepo
                .createQueryBuilder('sub')
                .innerJoin('sub.package', 'pkg')
                .where('pkg.type = :type', { type: PackageType.MEMBERSHIP })
                .andWhere('sub.createdAt >= :startDate', { startDate })
                .andWhere('sub.createdAt <= :endDate', { endDate })
                .andWhere('sub.status NOT IN (:...invalidStatuses)', {
                    invalidStatuses: [
                        MemberSubscriptionStatus.CANCELLED,
                        MemberSubscriptionStatus.PENDING,
                    ],
                })
                .select('SUM(sub.actualPaid)', 'total')
                .getRawOne();

            totalClubMembershipSales = Number(clubSales?.total || 0);
        }

        const result: SalaryResponseDto[] = [];

        // 6. Lặp tính lương từng người
        for (const user of users) {
            let baseSalary = 0;
            let teachingIncome = 0;
            let salesCommission = 0;
            let totalTeachingSessions = 0;
            let totalSalesAmount = 0;
            let staffBonus = 0;

            if (user.role === Role.ADMIN) {
                const adminConfig = configs.find((c) => c.role === Role.ADMIN);
                baseSalary = Number(adminConfig?.baseSalary || 0);
            } else if (user.role === Role.STAFF) {
                const staffConfig = configs.find((c) => c.role === Role.STAFF);
                baseSalary = Number(staffConfig?.baseSalary || 0);

                const bonusLevels = Math.floor(totalClubMembershipSales / 100_000_000);
                staffBonus = Math.min(bonusLevels * 1_000_000, 1_000_000_000);
            } else if (user.role === Role.COACH) {
                const type = user.coachProfile?.type;
                const level = user.coachProfile?.level;

                const coachConfig = configs.find(
                    (c) => c.role === Role.COACH && c.coachType === type && c.coachLevel === level,
                );
                baseSalary = Number(coachConfig?.baseSalary || 0);

                if (type === CoachType.GYM) {
                    // Tính doanh số bán hàng
                    const salesQuery = await this.subRepo
                        .createQueryBuilder('sub')
                        .where('sub.seller_id = :sellerId', { sellerId: user.userId })
                        .andWhere('sub.createdAt >= :startDate', { startDate })
                        .andWhere('sub.createdAt <= :endDate', { endDate })
                        .select('SUM(sub.actualPaid)', 'total')
                        .getRawOne();

                    totalSalesAmount = Number(salesQuery?.total || 0);
                    const salesLevel = Math.floor(totalSalesAmount / 30_000_000);

                    const commissionPercent = Math.min(4 + salesLevel * 1, 12);
                    salesCommission = totalSalesAmount * (commissionPercent / 100);

                    // Tính tiền dạy học
                    const teachingQuery = await this.workLogRepo
                        .createQueryBuilder('wl')
                        .where('wl.coach_id = :coachId', { coachId: user.userId })
                        .andWhere('wl.checkinTime >= :startDate', { startDate })
                        .andWhere('wl.checkinTime <= :endDate', { endDate })
                        .andWhere('wl.status IN (:...statuses)', {
                            statuses: [WorkLogStatus.COMPLETED, WorkLogStatus.LATE_CANCEL],
                        })
                        .select(['SUM(wl.earnAmount) as totalAmount', 'COUNT(wl.workLogId) as totalSessions'])
                        .getRawOne();

                    const totalEarnAmount = Number(teachingQuery?.totalAmount || 0);
                    totalTeachingSessions = Number(teachingQuery?.totalSessions || 0);

                    const teachingPercent = Math.min(20 + salesLevel * 2, 36);
                    teachingIncome = totalEarnAmount * (teachingPercent / 100);
                }
            }

            result.push({
                coachId: Number(user.userId),
                coachName: user.fullName,
                month,
                year,
                baseSalary,
                totalTeachingSessions,
                teachingIncome,
                totalSalesAmount,
                salesCommission,
                staffBonus,
                totalIncome: baseSalary + teachingIncome + salesCommission + staffBonus,
                status: SalaryStatus.ESTIMATED,
            });
        }

        return result;
    }

    async finalizeSalary(data: FinalizeSalaryDto): Promise<Salary[]> {
        const { month, year } = data;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        if (year > currentYear || (year === currentYear && month >= currentMonth)) {
            throw new BadRequestException(`Chưa hết tháng ${month}/${year}, không thể chốt sổ lương!`);
        }

        const existingSalaries = await this.salaryRepo.findOne({ where: { month, year } });
        if (existingSalaries) {
            throw new BadRequestException(`Lương tháng ${month}/${year} đã được chốt, không thể chốt lại!`);
        }

        const estimatedSalaries = await this.calculateSalary({ month, year });

        const salariesToSave = estimatedSalaries.map((est) => {
            const salary = new Salary();
            salary.employee = { userId: est.coachId.toString() } as User;
            salary.month = month;
            salary.year = year;
            salary.totalWorkIncome = est.teachingIncome;
            salary.totalCommission = est.salesCommission;
            salary.baseSalarySnapshot = est.baseSalary;
            salary.bonus = est.staffBonus || 0;
            salary.deduction = 0;
            salary.finalAmount = est.totalIncome;
            salary.status = SalaryStatus.PENDING;
            return salary;
        });

        return await this.salaryRepo.save(salariesToSave);
    }

    async paySalary(salaryId: number): Promise<Salary> {
        const salary = await this.salaryRepo.findOne({ where: { salaryId } });
        if (!salary) {
            throw new NotFoundException('Không tìm thấy bản ghi lương này!');
        }
        if (salary.status === SalaryStatus.PAID) {
            throw new BadRequestException('Bản ghi lương này đã được thanh toán rồi!');
        }

        salary.status = SalaryStatus.PAID;
        salary.paidAt = new Date();

        return await this.salaryRepo.save(salary);
    }

    async getSalaryDetails(query: GetSalaryDetailQueryDto) {
        const { coachId, month, year } = query;
        if (!month || !year) {
            throw new BadRequestException('Bắt buộc phải truyền month và year!');
        }
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const teachingDetails = await this.workLogRepo
            .createQueryBuilder('wl')
            .leftJoinAndSelect('wl.booking', 'booking')
            .leftJoinAndSelect('booking.member', 'member')
            .where('wl.coach_id = :coachId', { coachId })
            .andWhere('wl.checkinTime >= :startDate', { startDate })
            .andWhere('wl.checkinTime <= :endDate', { endDate })
            .andWhere('wl.status IN (:...statuses)', {
                statuses: [WorkLogStatus.COMPLETED, WorkLogStatus.LATE_CANCEL],
            })
            .getMany();

        const salesDetails = await this.subRepo
            .createQueryBuilder('sub')
            .leftJoinAndSelect('sub.package', 'pkg')
            .leftJoinAndSelect('sub.member', 'member')
            .where('sub.seller_id = :sellerId', { sellerId: coachId })
            .andWhere('sub.createdAt >= :startDate', { startDate })
            .andWhere('sub.createdAt <= :endDate', { endDate })
            .getMany();

        return { teachingDetails, salesDetails };
    }
}