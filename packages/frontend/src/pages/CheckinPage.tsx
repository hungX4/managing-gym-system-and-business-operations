import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import CheckinGrid from '../components/checkin/CheckinGrid';
import SlotListModal from '../components/checkin/SlotList';
import ConfirmCheckinModal from '../components/checkin/ConfirmCheckinModal';

export default function CheckinPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);

    // State Modals
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [slotBookings, setSlotBookings] = useState<any[]>([]);
    const [slotTime, setSlotTime] = useState<{ date: Date, hour: number } | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedBookingToConfirm, setSelectedBookingToConfirm] = useState<any>(null);

    // Xử lý Responsive & Ngày tháng
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getDaysToRender = () => {
        if (isMobile) return [new Date(currentDate)];
        const week = [];
        const day = currentDate.getDay();
        const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(currentDate);
        monday.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            week.push(d);
        }
        return week;
    };
    const daysToRender = getDaysToRender();

    // Lấy API (Giả sử Lễ tân dùng chung API GET /booking để lấy toàn bộ lịch)
    const fetchBookings = async () => {
        try {
            const res = await axiosClient.get('/booking');
            setBookings(res.data);
        } catch (error) {
            console.error("Lỗi lấy lịch:", error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [currentDate]);

    // Các hàm mở Modal
    const handleOpenSlotDetails = (bookingsInSlot: any[], date: Date, hour: number) => {
        setSlotBookings(bookingsInSlot);
        setSlotTime({ date, hour });
        setIsListModalOpen(true);
    };

    const handleSelectBookingForConfirm = (booking: any) => {
        setIsListModalOpen(false); // Đóng modal danh sách
        setSelectedBookingToConfirm(booking);
        setIsConfirmModalOpen(true); // Mở modal xác nhận
    };

    // CALL API CHECKIN LÊN BACKEND
    const handleConfirmCheckin = async (status: 'COMPLETED' | 'LATE_CANCEL') => {
        try {
            // Dựa vào DTO CheckInRequestDto: { bookingId, subscriptionId, status }
            await axiosClient.post('/checkin/pt', {
                bookingId: selectedBookingToConfirm.bookingId,
                subscriptionId: selectedBookingToConfirm.subscriptionId || 1, // Backend cần ID này
                status: status
            });

            alert('Cập nhật trạng thái thành công!');
            setIsConfirmModalOpen(false);
            fetchBookings(); // Tải lại lịch, lúc này lịch đó không còn là CONFIRMED nên sẽ biến mất khỏi bảng
        } catch (error: any) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận!');
        }
    };

    return (
        <div className="flex flex-col h-screen pt-16 bg-[#0a0a0a] text-white overflow-hidden">
            <div className="flex flex-col flex-1 p-3 md:p-6 overflow-hidden">

                {/* Thanh Tiêu Đề Điều Hướng Đơn Giản */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 shrink-0">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider">
                            Quản Lý <span className="text-red-600">Check-in PT</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Xác nhận lịch tập cho hội viên.</p>
                    </div>

                    <div className="flex items-center justify-between w-full lg:w-auto bg-[#111111] border border-gray-800 rounded-lg shadow px-2 py-1.5 shrink-0">
                        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - (isMobile ? 1 : 7))))} className="px-3 py-1.5 text-xs md:text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded transition">&lt;</button>
                        <span className="font-bold text-white text-xs md:text-sm whitespace-nowrap px-2 md:px-4">
                            {isMobile ? daysToRender[0].toLocaleDateString('vi-VN') : `${daysToRender[0].toLocaleDateString('vi-VN')} - ${daysToRender[6].toLocaleDateString('vi-VN')}`}
                        </span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + (isMobile ? 1 : 7))))} className="px-3 py-1.5 text-xs md:text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded transition">&gt;</button>
                        {!isMobile && <button onClick={() => setCurrentDate(new Date())} className="ml-2 px-3 py-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded transition shadow">Hôm nay</button>}
                    </div>
                </div>

                <CheckinGrid
                    isMobile={isMobile}
                    daysToRender={daysToRender}
                    bookings={bookings}
                    onOpenSlotDetails={handleOpenSlotDetails}
                />
            </div>

            <SlotListModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                slotBookings={slotBookings}
                slotTime={slotTime}
                onSelectBooking={handleSelectBookingForConfirm}
            />

            <ConfirmCheckinModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                booking={selectedBookingToConfirm}
                onConfirm={handleConfirmCheckin}
            />
        </div>
    );
}