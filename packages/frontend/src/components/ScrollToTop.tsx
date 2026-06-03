import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    // Lấy ra pathname hiện tại (ví dụ: đang từ '/' chuyển sang '/about' thì pathname thay đổi)
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, [pathname]); // Hook này sẽ chạy lại mỗi khi pathname thay đổi

    return null;
};

export default ScrollToTop;