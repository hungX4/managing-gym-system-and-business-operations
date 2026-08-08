import { Injectable, NotFoundException } from "@nestjs/common";
import { TrialLead } from "./entities/trial-lead.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { CreateTrialLeadDto, GetLeadsFilterDto, TrialStatus, UpdateTrialLeadDto } from "@gym/shared";

@Injectable()
export class LeadService {
    constructor(
        @InjectRepository(TrialLead)
        private readonly leadRepo: Repository<TrialLead>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) { }

    //save new client data
    async createNewData(data: CreateTrialLeadDto) {
        const newData = this.leadRepo.create({
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            email: data.email,
            guestNote: data.note,
            status: TrialStatus.UNCONTACTED,

        });
        return await this.leadRepo.save(newData);
    }

    async getDataList(filters?: GetLeadsFilterDto) {
        const query = this.leadRepo
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.assignedTo', 'staff')
            .orderBy('lead.createdAt', 'DESC');

        if (filters?.status) {
            query.andWhere('lead.status = :status', { status: filters.status });
        }
        if (filters?.assignedToId) {
            query.andWhere('staff.userId = :staffId', { staffId: filters.assignedToId });
        }

        return await query.getMany();
    }

    // 3. Admin/Staff gọi: Cập nhật thông tin chăm sóc
    async updateLead(leadId: number, data: UpdateTrialLeadDto) {
        const lead = await this.leadRepo.findOne({ where: { id: leadId } });
        if (!lead) {
            throw new NotFoundException('Không tìm thấy dữ liệu khách hàng!');
        }

        if (data.status) lead.status = data.status;

        //  !== undefined để cho phép truyền chuỗi rỗng 
        if (data.adminNote !== undefined) lead.adminNote = data.adminNote;

        if (data.assignedToId !== undefined) {
            if (data.assignedToId === null) {
                lead.assignedTo = null; // Gỡ người chăm sóc
            } else {
                const staff = await this.userRepo.findOne({ where: { userId: data.assignedToId as any } });
                if (!staff) {
                    throw new NotFoundException('Không tìm thấy nhân viên được giao!');
                }
                lead.assignedTo = staff;
            }
        }

        return await this.leadRepo.save(lead);
    }
}