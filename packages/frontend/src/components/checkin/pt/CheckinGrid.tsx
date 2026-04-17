import React from 'react';

const HOURLY_SLOTS = Array.from({ length: 16 }, (_, i) => i + 5);

interface Props {
    isMobile: boolean;
    daysToRender: Date[];
    bookings: any[];
    onOpenSlotDetails: (slotBookings: any[], date: Date, hour: number) => void;
}

export default function CheckinGrid({ isMobile, daysToRender, bookings, onOpenSlotDetails }: Props) {
    return (
        <div className="bg-[#111111] rounded-xl border border-gray-800 shadow-2xl flex-1 flex flex-col overflow-hidden relative mt-4">
            <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">
                <div className={`flex flex-col flex-1 ${isMobile ? 'min-w-full' : 'min-w-[800px]'}`}>

                    {/* THE HEADER ROW */}
                    <div className={`grid ${isMobile ? 'grid-cols-[60px_1fr]' : 'grid-cols-[100px_repeat(7,1fr)]'} bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-20 shrink-0`}>
                        <div className="p-2 md:p-4 text-center font-bold text-gray-500 border-r border-gray-800 flex items-center justify-center text-xs md:text-sm">Giờ</div>
                        {daysToRender.map((date, idx) => (
                            <div key={idx} className="p-2 md:p-3 text-center border-r border-gray-800 last:border-r-0">
                                <div className="font-bold text-gray-300 uppercase text-xs md:text-sm">
                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()]}
                                </div>
                                <div className="text-xs md:text-sm text-red-500 font-semibold mt-0.5">
                                    {date.getDate()}/{date.getMonth() + 1}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* THE BODY ROW */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {HOURLY_SLOTS.map((hour) => (
                            <div key={hour} className={`grid ${isMobile ? 'grid-cols-[60px_1fr]' : 'grid-cols-[100px_repeat(7,1fr)]'} border-b border-gray-800 last:border-b-0`}>

                                <div className="bg-[#1A1A1A] p-3 md:p-4 flex flex-col xl:flex-row items-center justify-center border-t border-gray-800 sticky left-0 z-10 text-gray-400 font-medium text-xs lg:text-sm">
                                    <span>{hour}:00</span><span className="hidden xl:inline mx-1">-</span>
                                    <span className="xl:hidden leading-none my-0.5">-</span><span>{hour + 1}:00</span>
                                </div>

                                {daysToRender.map((date, idx) => {
                                    // Lọc ra CÁC khách hàng đã CONFIRMED trong ô giờ này
                                    const slotBookings = bookings.filter(b => {
                                        const bDate = new Date(b.startTime);
                                        return bDate.getDate() === date.getDate() &&
                                            bDate.getMonth() === date.getMonth() &&
                                            bDate.getHours() === hour &&
                                            b.status === 'CONFIRMED'; // Chỉ hiển thị những lịch đang chờ check-in
                                    });

                                    return (
                                        <div key={idx} className="p-1 border-r border-gray-800 last:border-r-0 min-h-[80px] md:min-h-[100px] hover:bg-[#1f1f1f] transition-colors flex items-center justify-center">
                                            {slotBookings.length > 0 && (
                                                <div
                                                    onClick={() => onOpenSlotDetails(slotBookings, date, hour)}
                                                    className="w-full h-full bg-red-600/20 border border-red-600/50 hover:bg-red-600/40 text-red-500 rounded flex flex-col items-center justify-center cursor-pointer transition-all"
                                                >
                                                    <span className="text-2xl font-bold">{slotBookings.length}</span>
                                                    <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider mt-1">Lịch chờ</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}