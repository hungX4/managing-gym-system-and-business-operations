import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import BookingPage from '../pages/BookingPage';
import AuthPage from '../pages/AuthPage';

import ProtectedRoute from '../components/guard/ProtectedRoute';
import PackagePage from '../pages/PackagePage';
import CheckinPage from '../pages/CheckinPage';
import OfflineSucscriptionPage from '../pages/OfflineSubscriptionPage';
import { Role } from '@gym/shared';
import SalaryConfigurationPage from '../pages/SalaryConfigurationPage';

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

            <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
                <Route path='/package' element={<PackagePage />} />
                <Route path='/salaryconfig' element={<SalaryConfigurationPage />} />
            </Route>


            <Route element={<ProtectedRoute allowedRoles={[Role.STAFF, Role.ADMIN, Role.COACH]} />}>
                {/* Route mua goi tập offline */}
                <Route path="/offline-sub" element={<OfflineSucscriptionPage />} />
            </Route>
        </Routes>
    );
}