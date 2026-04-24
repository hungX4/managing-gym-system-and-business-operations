import { useState } from 'react';
import toast from 'react-hot-toast';
import { trialLeadApi } from '../../api/trial/trialLead.api'

export const useTrialForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        note: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName.trim() || !formData.phoneNumber.trim()) {
            toast.error('Vui lòng điền đầy đủ Tên và Số điện thoại!');
            return;
        }

        setIsLoading(true);
        try {
            // Gọi qua file API
            await trialLeadApi.createWebLead(formData);

            toast.success('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
            setFormData({ fullName: '', phoneNumber: '', email: '', note: '' });
        } catch (error: any) {
            const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Có lỗi xảy ra!';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Trả ra những gì UI cần
    return {
        formData,
        isLoading,
        handleChange,
        handleSubmit
    };
};