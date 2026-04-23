
import { SalaryStatus } from '../enums';


// 1. REQUEST: kiểm tra lương theo tháng

export interface GetSalaryQueryDto {
    // Nếu Frontend không gửi coach_id, Backend tự hiểu là lấy danh sách lương của TẤT CẢ Coach.
    // Nếu có gửi, Backend chỉ tính lương cho đúng 1 ông Coach đó.
    coachId?: number;

    month: number; // VD: 3
    year: number;  // VD: 2024
}



// 2. RESPONSE: Phiếu lương trả về cho Fe

export interface SalaryResponseDto {
    // Nếu bạn có lưu bảng Salary trong DB thì có ID, nếu BE tính toán real-time thì không cần
    salaryId?: number;

    coachId: number;
    coachName: string;
    month: number;
    year: number;

    // PHẦN 1: LƯƠNG CƠ BẢN (Nếu có)
    baseSalary: number;

    // PHẦN 2: LƯƠNG DẠY HỌC (Query từ bảng WorkLog)
    totalTeachingSessions: number; // Tổng số buổi đã dạy (Bao gồm cả COMPLETED và LATE_CANCEL)
    teachingIncome: number;         // Tổng tiền từ các buổi dạy đó

    // PHẦN 3: LƯƠNG HOA HỒNG SALE (Query từ bảng MemberSubscription dựa theo created_at)
    totalSalesAmount: number;      // Tổng doanh số mang về (Cộng tổng actual_paid)
    salesCommission: number;        // Tiền hoa hồng (BE tự tính dựa trên tổng doanh số và trả về)
    staffBonus: number;
    // TỔNG KẾT
    totalIncome: number;            // = base_salary + teaching_income + sales_commission
    status: SalaryStatus;            // 'PENDING' (Chưa chốt), 'PAID' (Đã chuyển khoản)
}

export interface FinalizeSalaryDto {
    month: number;
    year: number;
}

export interface GetSalaryDetailQueryDto {
    coachId: number;
    month: number;
    year: number;
}