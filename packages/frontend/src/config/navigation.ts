// src/config/navigation.ts
import { Role } from '@gym/shared';

// 1. Định nghĩa Types
export type AllowedRoles = 'ALL_LOGGED_IN' | 'ALL' | Role[];

export type NavLink = {
    path: string;
    label: string;
    allowedRoles: AllowedRoles;
};

// 2. Export các mảng dữ liệu (Config)
export const MAIN_NAV_LINKS: NavLink[] = [
    { path: '/services', label: 'Dịch vụ', allowedRoles: 'ALL' },
    { path: '/clubs', label: 'Câu lạc bộ', allowedRoles: 'ALL' },
    { path: '/schedule/groupx', label: 'Lịch nhóm', allowedRoles: 'ALL' },
    { path: '/pricing', label: 'Bảng giá', allowedRoles: 'ALL' }, // Nhớ thêm dấu / trước pricing
];

export const DROPDOWN_LINKS: NavLink[] = [
    { path: '/profile', label: 'Hồ sơ của tôi', allowedRoles: 'ALL_LOGGED_IN' },
    { path: '/admin', label: 'Quản lý hệ thống', allowedRoles: [Role.ADMIN] },
    { path: '/salary', label: "Chốt lương", allowedRoles: [Role.ADMIN] },
    { path: '/booking', label: 'Đặt lịch hẹn', allowedRoles: [Role.ADMIN, Role.COACH] },
    { path: '/checkin', label: 'Quản lý lịch tập', allowedRoles: [Role.ADMIN, Role.STAFF] },
];