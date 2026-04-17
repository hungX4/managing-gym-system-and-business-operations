import React from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    slotBookings: any[];
    slotTime: { date: Date, hour: number } | null;
    onSelectBooking: (booking: any) => void;
}

export default function SlotListModal({ isOpen, onClose, slotBookings, slotTime, onSelectBooking }: Props) {
    if (!isOpen || !slotTime) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onMouseDown={onClose}>
            <div className="bg-[#111111] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onMouseDown={(e) => e.stopPropagation()}>

                <div className="bg-[#1a1a1a] p-4 rounded-t-xl flex justify-between items-center border-b border-gray-800">
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-wider">Danh Sách Check-in</h2>
                        <p className="text-xs font-medium text-red-500 mt-1">
                            Ca: {slotTime.hour}:00 - {slotTime.hour + 1}:00 ({slotTime.date.toLocaleDateString('vi-VN')})
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-2xl">&times;</button>
                </div>

                <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                    {slotBookings.map((booking) => (
                        <div key={booking.bookingId} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 flex justify-between items-center hover:border-red-600/50 transition">
                            <div className="flex items-center gap-3">
                                <img src={`https://ui-avatars.com/api/?background=333&color=fff&name=${booking.memberName}`} className="w-10 h-10 rounded-full border border-gray-600" alt="avatar" />
                                <div>
                                    <div className="font-bold text-gray-200 text-sm">{booking.memberName}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">PT: <span className="text-gray-300 font-medium">{booking.coachName || 'N/A'}</span></div>
                                </div>
                            </div>
                            <button
                                onClick={() => onSelectBooking(booking)}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded uppercase tracking-wider transition shadow-lg"
                            >
                                Xử lý
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}