import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import BookingPage from '../pages/BookingPage';
import AuthPage from '../pages/AuthPage';
import CheckinPage from '../pages/CheckinPage';
import ProtectedRoute from '../components/guard/ProtectedRoute';
// import CheckinPage from '../pages/CheckinPage'; // Sau này bạn tạo trang này thì uncomment

export default function AppRoutes() {
    return (
        <Routes>
            {/* Trang chủ */}
            <Route path="/" element={<HomePage />} />

            <Route element={<ProtectedRoute allowedRoles={['COACH', 'ADMIN']} />}>
                {/* Trang đặt lịch cho Coach */}
                <Route path="/booking" element={<BookingPage />} />
            </Route>


            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
                {/* Route Checkin */}
                <Route path="/checkin" element={<CheckinPage />} />
            </Route>
            {/* Route Đăng nhập / Đăng ký */}
            <Route path="/auth" element={<AuthPage />} />


        </Routes>
    );
}