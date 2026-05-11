import { TrialStatus } from '@gym/shared'; // Nhớ import từ thư viện dùng chung

export const TRIAL_STATUS_CONFIG = {
    [TrialStatus.UNCONTACTED]: { label: 'Chưa liên hệ', color: 'bg-neutral-500 text-white' },
    [TrialStatus.CONTACTED]: { label: 'Đã liên hệ', color: 'bg-blue-500 text-white' },
    [TrialStatus.TRIALING]: { label: 'Đang tập thử', color: 'bg-orange-500 text-white' },
    [TrialStatus.CONVERTED]: { label: 'Đã chốt HĐ', color: 'bg-green-500 text-white' },
    [TrialStatus.FAILED]: { label: 'Hủy/Từ chối', color: 'bg-red-600 text-white' },
};