
import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient'; // Chú ý sửa lại đường dẫn import
import CalendarToolbar from '../components/booking/CalenderToolbar';
import CalendarGrid from '../components/booking/CalenderGrid'
import CreateBookingModal from '../components/booking/CreateBookingModal';
import BookingDetailsModal from '../components/booking/BookingDetailsModals';
import toast from 'react-hot-toast';
import { BookingResponseDto, CoachType, CreateBookingRequestDto } from '@gym/shared';


export default function BookingPage() {
    // 1. STATE MANAGEMENT
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);
    const [bookings, setBookings] = useState<BookingResponseDto[]>([]);

    // Modal Create State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date, hour: number } | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);

    // Modal Details State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    // const [errorMsg, setErrorMsg] = useState(null);
    // 2. LOGIC RESPONSIVE & CALENDAR
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

    // 3. API CALLS
    const fetchBookings = async () => {
        try {
            const res = await axiosClient.get<BookingResponseDto[]>('/booking');
            setBookings(res.data.filter((b: any) => b.status !== 'CANCELLED'));
        } catch (error) {
            console.error("Lỗi lấy lịch:", error);
            toast.error("KHÔNG TẢI ĐƯỢC LỊCH!")
            setBookings([]);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [currentDate]);

    // Search Debounce API
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchKeyword.trim().length > 0) {
                setIsSearching(true);
                try {
                    const res = await axiosClient.get(`/user/search?keyword=${searchKeyword}`);
                    setSearchResults(res.data);
                } catch (error) {
                    console.error("Lỗi tìm kiếm:", error);
                    console.trace("🔍 Chi tiết Stack Trace của lỗi này:");
                    // setErrorMsg(error.response?.data?.message || "Không thể tải dữ liệu.");
                    toast.error("LỖI TÌM KIẾM!!!");
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    const handleCreateBooking = async () => {
        if (!selectedMember || !selectedSlot) return;
        const startTime = new Date(selectedSlot.date);
        startTime.setHours(selectedSlot.hour, 0, 0, 0);
        const endTime = new Date(selectedSlot.date);
        endTime.setHours(selectedSlot.hour + 1, 0, 0, 0);

        try {
            const coachId = localStorage.getItem('userId');
            const payload: CreateBookingRequestDto = {
                coachId: String(coachId),
                memberId: selectedMember.memberId, // Chắc chắn UserProfileDto của bạn có trường này
                startTime: startTime,
                endTime: endTime,
                phone: selectedMember.phone,
                type: CoachType.GYM // Hoặc Enum CoachType.GYM nếu bạn import từ enum
            };
            await axiosClient.post(
                '/booking',
                payload
            );
            toast.success("ĐẶT LỊCH THÀNH CÔNG!")
            setIsModalOpen(false);
            fetchBookings();
        } catch (error: any) {
            toast.error("KHÔNG THỂ ĐẶT LỊCH!")
        }
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking) return;
        if (!window.confirm("Bạn có chắc chắn muốn huỷ lịch tập này?")) return;

        try {
            await axiosClient.delete(`/booking/${selectedBooking.bookingId}`);
            toast.success("ĐÃ HỦY LỊCH!")
            setIsDetailsModalOpen(false);
            setSelectedBooking(null);
            fetchBookings();
        } catch (error: any) {
            toast.success("ĐÃ XẢY RA LỖI!")
        }
    };

    // 4. HANDLERS
    const handlePrev = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - (isMobile ? 1 : 7));
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (isMobile ? 1 : 7));
        setCurrentDate(newDate);
    };

    const handleToday = () => setCurrentDate(new Date());

    const openBookingModal = (date: Date, hour: number) => {
        setSelectedSlot({ date, hour });
        setSearchKeyword('');
        setSearchResults([]);
        setSelectedMember(null);
        setIsModalOpen(true);
    };

    const openDetailsModal = (booking: any) => {
        setSelectedBooking(booking);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className="flex flex-col h-screen pt-16 bg-[#0a0a0a] text-white overflow-hidden">
            <div className="flex flex-col flex-1 p-3 md:p-6 overflow-hidden">
                <CalendarToolbar
                    isMobile={isMobile}
                    daysToRender={daysToRender}
                    onToday={handleToday}
                    onPrev={handlePrev}
                    onNext={handleNext}
                />

                <CalendarGrid
                    isMobile={isMobile}
                    daysToRender={daysToRender}
                    bookings={bookings}
                    onOpenBookingModal={openBookingModal}
                    onOpenDetailsModal={openDetailsModal}
                />
            </div>

            {/* Các Modal sẽ nhận Props từ Container để hiển thị & gọi API */}
            {isModalOpen && selectedSlot && (
                <CreateBookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedSlot={selectedSlot}
                    searchKeyword={searchKeyword}
                    setSearchKeyword={setSearchKeyword}
                    isSearching={isSearching}
                    searchResults={searchResults}
                    selectedMember={selectedMember}
                    setSelectedMember={setSelectedMember}
                    onCreateBooking={handleCreateBooking}
                />
            )}

            {isDetailsModalOpen && selectedBooking && (
                <BookingDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    selectedBooking={selectedBooking}
                    onCancelBooking={handleCancelBooking}
                />
            )}
        </div>
    );
}