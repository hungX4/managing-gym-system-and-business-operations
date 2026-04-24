import { Request, Response } from 'express';
import { TrialLeadService } from '../../services/trial-lead.service';

const leadService = new TrialLeadService();

export class TrialLeadController {

    // API Web đăng ký post trial/web
    static async createWebLead(req: Request, res: Response) {
        try {
            const data = req.body;
            const newLead = await leadService.createFromWeb(data);
            return res.status(201).json({ message: 'Gửi yêu cầu thành công', data: newLead });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    // API lấy danh sách cho Admin get /trial
    static async getLeads(req: Request, res: Response) {
        try {
            const { status, assignedToId } = req.query;
            const leads = await leadService.getAllLeads({
                status: status as any,
                assignedToId: assignedToId ? Number(assignedToId) : undefined
            });
            return res.status(200).json(leads);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    // API cập nhật (phân công, đổi trạng thái, note) patch /:id
    static async updateLeadDetails(req: Request, res: Response) {
        try {
            const leadId = Number(req.params.id);
            const data = req.body;
            const updatedLead = await leadService.updateLead(leadId, data);
            return res.status(200).json({ message: 'Cập nhật thành công', data: updatedLead });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
}