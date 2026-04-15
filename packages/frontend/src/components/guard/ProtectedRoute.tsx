import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const userDataString = localStorage.getItem('userData');

    // 1. Nếu chưa đăng nhập -> Đá về trang Auth
    if (!userDataString) {
        return <Navigate to="/auth" replace />;
    }

    try {
        const userData = JSON.parse(userDataString);

        // 2. Kiểm tra xem role của user có nằm trong danh sách cho phép không
        if (!allowedRoles.includes(userData.role)) {
            // Nếu KHÔNG có quyền -> Đá về trang chủ (hoặc một trang báo lỗi 403/Unauthorized)
            alert("Bạn không có quyền truy cập trang này!");
            return <Navigate to="/" replace />;
        }

        // 3. Nếu HỢP LỆ -> Cho phép render các Component con bên trong
        return <Outlet />;

    } catch (error) {
        // Lỗi parse JSON (dữ liệu rác) -> Bắt đăng nhập lại
        localStorage.clear();
        return <Navigate to="/auth" replace />;
    }
}