import { AppDataSource } from '../models/data-source';
import { TrialLead } from '../models/entity/TrialLead';
import { User } from '../models/entity/User';
import { CreateTrialLeadDto, UpdateTrialLeadDto, TrialStatus } from '@gym/shared';

export class TrialLeadService {
    private leadRepo = AppDataSource.getRepository(TrialLead);
    private userRepo = AppDataSource.getRepository(User);

    // 1. Web gọi: Lưu khách hàng mới
    async createFromWeb(data: CreateTrialLeadDto) {
        const newLead = this.leadRepo.create({
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            email: data.email,
            guestNote: data.note,
            status: TrialStatus.UNCONTACTED
        });
        return await this.leadRepo.save(newLead);
    }

    // 2. Admin/Staff gọi: Lấy danh sách (Có thể filter theo Staff hoặc Status)
    async getAllLeads(filters?: { status?: TrialStatus, assignedToId?: number }) {
        const query = this.leadRepo.createQueryBuilder('lead')
            .leftJoinAndSelect('lead.assignedTo', 'staff')
            .orderBy('lead.createdAt', 'DESC');

        if (filters?.status) {
            query.andWhere('lead.status = :status', { status: filters.status });
        }
        if (filters?.assignedToId) {
            query.andWhere('lead.assignedTo.id = :staffId', { staffId: filters.assignedToId });
        }

        return await query.getMany();
    }

    // 3. Admin/Staff gọi: Cập nhật thông tin chăm sóc (Status, Note, Giao việc)
    async updateLead(leadId: number, data: UpdateTrialLeadDto) {
        const lead = await this.leadRepo.findOne({ where: { id: leadId } });
        if (!lead) throw new Error('Không tìm thấy dữ liệu khách hàng!');

        if (data.status) lead.status = data.status;
        if (data.adminNote) lead.adminNote = data.adminNote;

        if (data.assignedToId !== undefined) {
            if (data.assignedToId === null) {
                lead.assignedTo = null; // Gỡ người chăm sóc
            } else {
                const staff = await this.userRepo.findOne({ where: { userId: data.assignedToId } });
                if (!staff) throw new Error('Không tìm thấy nhân viên được giao!');
                lead.assignedTo = staff;
            }
        }

        return await this.leadRepo.save(lead);
    }
}