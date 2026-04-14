import React from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedBooking: any;
    onCancelBooking: () => void;
}

export default function BookingDetailsModal({ isOpen, onClose, selectedBooking, onCancelBooking }: Props) {
    if (!isOpen || !selectedBooking) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onMouseDown={onClose}>
            <div className="bg-[#111111] border border-gray-800 rounded-xl shadow-2xl w-full max-w-sm flex flex-col" onMouseDown={(e) => e.stopPropagation()}>

                <div className="bg-[#1a1a1a] border-b border-gray-800 p-4 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Chi Tiết Lịch Tập</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-2xl">&times;</button>
                </div>

                <div className="p-6">
                    {/* Khối Avatar & Tên User */}
                    <div className="flex items-center mb-6">
                        <img src={`https://ui-avatars.com/api/?background=333&color=fff&name=${selectedBooking.memberName}`} className="w-16 h-16 rounded-full border-2 border-gray-600 mr-4" alt="avatar" />
                        <div>
                            <div className="font-bold text-xl text-white">{selectedBooking.memberName}</div>
                            <div className="text-gray-400 mt-1">{selectedBooking.memberPhone}</div>
                        </div>
                    </div>

                    {/* Khối Thông tin */}
                    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800 mb-6 text-sm">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500 font-medium">Trạng thái:</span>
                            <span className="font-bold text-blue-400">{selectedBooking.status}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500 font-medium">Thời gian:</span>
                            <span className="font-medium text-gray-200">
                                {new Date(selectedBooking.startTime).getHours()}:00 - {new Date(selectedBooking.endTime).getHours()}:00
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">Ngày tập:</span>
                            <span className="font-medium text-gray-200">
                                {new Date(selectedBooking.startTime).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    </div>

                    {/* Các nút hành động */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                        >
                            Đóng
                        </button>

                        {/* Không cho huỷ nếu trạng thái đã là COMPLETED */}
                        {selectedBooking.status !== 'COMPLETED' && (
                            <button
                                onClick={onCancelBooking}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition uppercase tracking-wider text-sm shadow-lg shadow-red-600/20"
                            >
                                Huỷ Lịch Này
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}