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
import SalaryConfigurationPage from '../pages/salary/SalaryConfigurationPage';
import { SalaryComponent } from '../components/admin/salary/SalaryComponent';
import AdminDashboard from '../pages/AdminDashboard';

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
                <Route path='/salary' element={<SalaryComponent />} />
            </Route>

            {/* for admin */}
            <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
                <Route path="/admin" element={<AdminDashboard />}>

                    {/* index: Nghĩa là khi vào "/admin", nó sẽ mặc định render Thống kê */}
                    <Route index element={<div>Giao diện Thống kê nhét vào đây</div>} />

                    {/* Trang Trial: URL sẽ là /admin/trial */}
                    <Route path="trial" element={<div>Giao diện Trial Data nhét vào đây</div>} />

                    {/* Bạn có thể đưa các route admin cũ vào đây luôn */}
                    <Route path="package" element={<PackagePage />} />
                    <Route path="salaryconfig" element={<SalaryConfigurationPage />} />
                    <Route path="salary" element={<SalaryComponent />} />

                </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[Role.STAFF, Role.ADMIN, Role.COACH]} />}>
                {/* Route mua goi tập offline */}
                <Route path="/offline-sub" element={<OfflineSucscriptionPage />} />
            </Route>
        </Routes>
    );
}