import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AllowedRoles } from '../config/navigation';

export const useNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState<any>(null);

    // Hàm đồng bộ data (Dùng useCallback để không bị tạo lại tham chiếu)
    const syncUserData = useCallback(() => {
        const stringifiedUser = localStorage.getItem('userData');
        if (stringifiedUser) {
            setUserData(JSON.parse(stringifiedUser));
        } else {
            setUserData(null);
        }
    }, []);

    // 1. Đồng bộ lại dữ liệu mỗi khi chuyển trang (Đổi URL)
    useEffect(() => {
        syncUserData();
    }, [location, syncUserData]);

    // 2. Lắng nghe tín hiệu cập nhật từ nơi khác (Chỉ cần đăng ký 1 lần lúc mount)
    useEffect(() => {
        // Lắng nghe đúng tên sự kiện 'userDataUpdated'
        window.addEventListener('userDataUpdated', syncUserData);

        return () => {
            window.removeEventListener('userDataUpdated', syncUserData);
        };
    }, [syncUserData]);

    // Hàm kiểm tra quyền
    const checkPermission = (allowedRoles: AllowedRoles) => {
        if (allowedRoles === 'ALL') return true;
        if (!userData || !userData.role) return false;
        if (allowedRoles === 'ALL_LOGGED_IN') return true;
        return allowedRoles.includes(userData.role);
    };

    // Hàm đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userId');
        setUserData(null);
        navigate('/');
    };

    return {
        userData,
        setUserData,
        navigate,
        checkPermission,
        handleLogout
    };
};