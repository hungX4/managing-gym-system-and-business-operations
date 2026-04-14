import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

// Helper: Lấy danh sách 7 ngày trong tuần từ 1 ngày bất kỳ
const getWeekDays = (currentDate: Date) => {
    const week = [];
    // Lấy thứ hiện tại (0 là Chủ nhật, 1-6 là T2-T7) -> Tính ra ngày Thứ 2 của tuần đó
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(currentDate.setDate(diff));

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        week.push(d);
    }
    return week;
};

// Mảng các giờ từ 5h đến 20h (thể hiện slot 5h-6h, 6h-7h,... đến 20h-21h)
const HOURLY_SLOTS = Array.from({ length: 16 }, (_, i) => i + 5);

export default function BookingPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const weekDays = getWeekDays(new Date(currentDate));

    const [bookings, setBookings] = useState<any[]>([]);

    // --- STATE CHO MODAL & SEARCH ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date, hour: number } | null>(null);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);

    // Lấy danh sách lịch của Coach tuần này
    const fetchBookings = async () => {
        try {
            // Gọi API GET /bookings (Bạn nhớ truyền param date từ T2 đến CN để filter backend nếu có)
            const res = await axiosClient.get('/booking');
            setBookings(res.data);
        } catch (error) {
            console.error("Lỗi lấy lịch:", error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [currentDate]);

    // DEBOUNCE SEARCH MỘT CÁCH HIỆU QUẢ
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchKeyword.trim().length > 0) {
                setIsSearching(true);
                try {
                    const res = await axiosClient.get(`/user/search?keyword=${searchKeyword}`);
                    setSearchResults(res.data); // Backend đã limit 3 kết quả
                } catch (error) {
                    console.error("Lỗi tìm kiếm:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500); // Ngừng gõ 500ms mới gọi API

        return () => clearTimeout(timer);
    }, [searchKeyword]);

    // --- HANDLER FUNCTIONS ---
    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const openBookingModal = (date: Date, hour: number) => {
        setSelectedSlot({ date, hour });
        setSearchKeyword('');
        setSearchResults([]);
        setSelectedMember(null);
        setIsModalOpen(true);
    };

    const handleCreateBooking = async () => {
        if (!selectedMember || !selectedSlot) return;

        // Chuẩn bị startTime, endTime
        const startTime = new Date(selectedSlot.date);
        startTime.setHours(selectedSlot.hour, 0, 0, 0);

        const endTime = new Date(selectedSlot.date);
        endTime.setHours(selectedSlot.hour + 1, 0, 0, 0);

        try {
            // Decode JWT lấy coachId (Hoặc lấy từ UserContext nếu bạn có)
            // Tạm thời hardcode gửi payload, bạn cần lấy id coach đang đăng nhập
            const coachId = localStorage.getItem('userId'); // Thay bằng logic lấy ID của bạn

            await axiosClient.post('/bookings', {
                coachId: String(coachId),
                memberId: selectedMember.memberId, // Lưu ý: Kiểu uuid trong DB là string
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                phone: selectedMember.phone,
                type: 'GYM' // Hoặc YOGA/DANCE tuỳ loại PT
            });

            alert("Đặt lịch thành công!");
            setIsModalOpen(false);
            fetchBookings(); // Refresh lịch
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi đặt lịch");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* HEADER ĐIỀU HƯỚNG TUẦN */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Lịch Dạy Của Tôi</h1>
                <div className="flex items-center space-x-4 bg-white rounded-lg shadow px-4 py-2">
                    <button onClick={handlePrevWeek} className="text-gray-500 hover:text-blue-600 font-bold">&lt; Tuần trước</button>
                    <span className="font-semibold text-gray-700">
                        {weekDays[0].toLocaleDateString('vi-VN')} - {weekDays[6].toLocaleDateString('vi-VN')}
                    </span>
                    <button onClick={handleNextWeek} className="text-gray-500 hover:text-blue-600 font-bold">Tuần sau &gt;</button>
                </div>
            </div>

            {/* BẢNG LỊCH */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="grid grid-cols-8 border-b bg-gray-100">
                    <div className="p-4 text-center font-bold text-gray-500 border-r">Giờ</div>
                    {weekDays.map((date, idx) => (
                        <div key={idx} className="p-4 text-center border-r last:border-r-0">
                            <div className="font-semibold text-gray-700">
                                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][idx]}
                            </div>
                            <div className="text-sm text-gray-500">{date.getDate()}/{date.getMonth() + 1}</div>
                        </div>
                    ))}
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                    {HOURLY_SLOTS.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 border-b">
                            {/* Cột Giờ */}
                            <div className="p-3 text-center border-r font-medium text-gray-500 flex items-center justify-center bg-gray-50">
                                {hour}:00 - {hour + 1}:00
                            </div>

                            {/* Cột Các Ngày Trong Tuần */}
                            {weekDays.map((date, idx) => {
                                // Kiểm tra xem giờ này ngày này có lịch không
                                const existingBooking = bookings.find(b => {
                                    const bDate = new Date(b.startTime);
                                    return bDate.getDate() === date.getDate() && bDate.getHours() === hour;
                                });

                                return (
                                    <div
                                        key={idx}
                                        className={`p-2 border-r last:border-r-0 min-h-[80px] cursor-pointer transition-colors ${existingBooking ? 'bg-blue-50' : 'hover:bg-blue-50/50'
                                            }`}
                                        onClick={() => !existingBooking && openBookingModal(date, hour)} // Chỉ mở modal nếu trống
                                    >
                                        {existingBooking ? (
                                            <div className="bg-blue-500 text-white text-xs p-2 rounded shadow-sm h-full">
                                                <div className="font-bold">{existingBooking.memberName}</div>
                                                <div>{existingBooking.memberPhone}</div>
                                                <div className="mt-1 opacity-80">{existingBooking.status}</div>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL ĐẶT LỊCH */}
            {isModalOpen && selectedSlot && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-[450px] overflow-hidden">
                        <div className="bg-blue-600 text-white p-4">
                            <h2 className="text-lg font-bold">Thêm Lịch PT Mới</h2>
                            <p className="text-sm opacity-80">
                                Khung giờ: {selectedSlot.hour}:00 - {selectedSlot.hour + 1}:00, ngày {selectedSlot.date.toLocaleDateString('vi-VN')}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            {!selectedMember ? (
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tìm Hội viên</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập tên hoặc số điện thoại..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                    />

                                    {/* DROPDOWN GỢI Ý KẾT QUẢ */}
                                    {(searchKeyword.length > 0) && (
                                        <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
                                            {isSearching ? (
                                                <div className="p-3 text-center text-gray-500 text-sm">Đang tìm...</div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map(member => (
                                                    <div
                                                        key={member.memberId}
                                                        className="flex items-center p-3 border-b last:border-0 hover:bg-blue-50 cursor-pointer"
                                                        onClick={() => setSelectedMember(member)}
                                                    >
                                                        {/* AVATAR TRÒN CAO BẰNG 2 HÀNG TEXT */}
                                                        <img
                                                            src={member.avatarUrl || 'https://ui-avatars.com/api/?name=' + member.fullName}
                                                            alt="avatar"
                                                            className="w-12 h-12 rounded-full object-cover border bg-gray-200 mr-3 flex-shrink-0"
                                                        />
                                                        <div>
                                                            <div className="font-bold text-gray-800 leading-tight">{member.fullName}</div>
                                                            <div className="text-sm text-gray-500 mt-1">{member.phone} • Còn: <span className="font-semibold text-blue-600">{member.remainingPtSession} buổi</span></div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-3 text-center text-red-500 text-sm">Không tìm thấy hội viên nào!</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // ĐÃ CHỌN HỘI VIÊN -> HIỆN NÚT XÁC NHẬN
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <div className="flex items-center mb-4">
                                        <img
                                            src={selectedMember.avatarUrl || 'https://ui-avatars.com/api/?name=' + selectedMember.fullName}
                                            className="w-16 h-16 rounded-full border shadow-sm mr-4"
                                        />
                                        <div>
                                            <div className="font-bold text-lg">{selectedMember.fullName}</div>
                                            <div className="text-gray-600">{selectedMember.phone}</div>
                                            <div className="text-blue-600 font-medium">Buổi PT còn lại: {selectedMember.remainingPtSession}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedMember(null)}
                                        className="text-sm text-gray-500 underline hover:text-gray-800"
                                    >
                                        Chọn lại hội viên khác
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                                >
                                    Huỷ bỏ
                                </button>
                                <button
                                    onClick={handleCreateBooking}
                                    disabled={!selectedMember}
                                    className={`px-6 py-2 rounded-lg text-white font-bold ${selectedMember ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                                >
                                    Xác nhận đặt lịch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}