import { useState, useEffect, useCallback } from 'react';
import { trialLeadApi } from '../../api/trial/trialLead.api';
import { userApi } from '../../api/user/user.api';
import toast from 'react-hot-toast';
import { GetLeadsFilterDto, TrialStatus, type TrialLeadResponseDto } from '@gym/shared';
import { coachApi } from '../../api/user/coachApi';

export const useTrialLeads = () => {
    const [leads, setLeads] = useState<any>([]);
    const [coaches, setCoaches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<TrialStatus | ''>('');

    // Hàm lấy danh sách khách hàng
    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const data: TrialLeadResponseDto[] = await trialLeadApi.getLead(filterStatus ? { status: filterStatus } : {});
            setLeads(data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách KH:', error);
            toast.error('Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    // Hàm lấy danh sách HLV
    const fetchCoaches = useCallback(async () => {
        try {
            const data = await coachApi.getCoaches();
            setCoaches(data);
            console.log(data)
        } catch (error) {
            console.error('Lỗi tải danh sách HLV:', error);
        }
    }, []);

    // Cập nhật Lead
    const updateLead = async (id: number, data: any) => {
        try {
            await trialLeadApi.updateLead(id, data);
            toast.success('Cập nhật thành công!');
            await fetchLeads(); // Cập nhật xong thì tải lại bảng
            return true;
        } catch (error) {
            toast.error('Có lỗi khi cập nhật!');
            return false;
        }
    };

    // Chạy khi filter đổi hoặc mới vào trang
    useEffect(() => {
        fetchLeads();
        fetchCoaches();
    }, [fetchLeads, fetchCoaches]);

    return {
        leads,
        coaches,
        loading,
        filterStatus,
        setFilterStatus,
        updateLead
    };
};