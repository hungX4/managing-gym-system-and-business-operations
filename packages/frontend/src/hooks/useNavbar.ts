import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AllowedRoles } from '../config/navigation';
export const useNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState<any>(null);

    // Đồng bộ thông tin user từ LocalStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        } else {
            setUserData(null);
        }
        const syncUserData = () => {
            const stringifiedUser = localStorage.getItem('userData');
            if (stringifiedUser) {
                setUserData(JSON.parse(stringifiedUser));
            }
        };

        // Lắng nghe sự kiện thay đổi
        window.addEventListener('userDataUpdated', syncUserData);
        return () => {
            window.removeEventListener('userDataUpdated', syncUserData);
        };
    }, [location, setUserData]); // Chạy lại mỗi khi đổi trang để cập nhật trạng thái mới nhất

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