import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import BookingPage from '../pages/BookingPage';
import AuthPage from '../pages/AuthPage';
// import CheckinPage from '../pages/CheckinPage'; // Sau này bạn tạo trang này thì uncomment

export default function AppRoutes() {
    return (
        <Routes>
            {/* Trang chủ */}
            <Route path="/" element={<HomePage />} />

            {/* Trang đặt lịch cho Coach */}
            <Route path="/bookings" element={<BookingPage />} />

            {/* Route Đăng nhập / Đăng ký */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Trang Lễ tân check-in */}
            {/* <Route path="/checkin" element={<CheckinPage />} /> */}
        </Routes>
    );
}