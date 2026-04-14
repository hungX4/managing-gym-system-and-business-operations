import React from 'react';
import { HOURLY_SLOTS, getBookingStyle } from './constants';

interface Props {
    isMobile: boolean;
    daysToRender: Date[];
    bookings: any[];
    onOpenBookingModal: (date: Date, hour: number) => void;
    onOpenDetailsModal: (booking: any) => void;
}

export default function CalendarGrid({ isMobile, daysToRender, bookings, onOpenBookingModal, onOpenDetailsModal }: Props) {
    return (
        <div className="bg-[#111111] rounded-xl border border-gray-800 shadow-2xl flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">
                <div className={`flex flex-col flex-1 ${isMobile ? 'min-w-full' : 'min-w-[800px]'}`}>

                    {/* Header Row */}
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

                    {/* Body Row */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {HOURLY_SLOTS.map((hour) => (
                            <div key={hour} className={`grid ${isMobile ? 'grid-cols-[60px_1fr]' : 'grid-cols-[100px_repeat(7,1fr)]'} border-b border-gray-800 last:border-b-0`}>
                                <div className="bg-[#1A1A1A] p-3 md:p-4 flex flex-col xl:flex-row items-center justify-center border-t border-gray-800 sticky left-0 z-10 text-gray-400 font-medium text-xs lg:text-sm">
                                    <span>{hour}:00</span>
                                    <span className="hidden xl:inline mx-1">-</span>
                                    <span className="xl:hidden leading-none my-0.5">-</span>
                                    <span>{hour + 1}:00</span>
                                </div>

                                {daysToRender.map((date, idx) => {
                                    const existingBooking = bookings.find(b => {
                                        const bDate = new Date(b.startTime);
                                        return bDate.getDate() === date.getDate() && bDate.getHours() === hour;
                                    });

                                    return (
                                        <div
                                            key={idx}
                                            className={`p-1 border-r border-gray-800 last:border-r-0 min-h-[80px] md:min-h-[100px] transition-colors hover:bg-[#1f1f1f] cursor-pointer`}
                                            onClick={() => existingBooking ? onOpenDetailsModal(existingBooking) : onOpenBookingModal(date, hour)}
                                        >
                                            {existingBooking && (
                                                <div className={`w-full h-full p-2 rounded shadow-sm flex flex-col justify-center ${getBookingStyle(existingBooking.status)}`}>
                                                    <div className="font-bold text-xs md:text-sm truncate">{existingBooking.memberName}</div>
                                                    <div className="text-[10px] md:text-xs opacity-80 mt-0.5">{existingBooking.memberPhone}</div>
                                                    <div className="mt-auto pt-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider opacity-90">
                                                        {existingBooking.status}
                                                    </div>
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