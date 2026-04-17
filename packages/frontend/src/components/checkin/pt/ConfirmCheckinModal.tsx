import { WorkLogStatus } from '@gym/shared';
import React, { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    onConfirm: (status: WorkLogStatus) => Promise<void>;
}

export default function ConfirmCheckinModal({ isOpen, onClose, booking, onConfirm }: Props) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !booking) return null;

    const handleAction = async (status: WorkLogStatus) => {
        setLoading(true);
        await onConfirm(status);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onMouseDown={onClose}>
            <div className="bg-[#111111] border border-gray-800 rounded-xl shadow-2xl w-full max-w-sm flex flex-col" onMouseDown={(e) => e.stopPropagation()}>

                <div className="bg-[#1a1a1a] border-b border-gray-800 p-4 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Xác Nhận Check-in</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-2xl">&times;</button>
                </div>

                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <img src={`https://ui-avatars.com/api/?background=333&color=fff&name=${booking.memberName}`} className="w-14 h-14 rounded-full border-2 border-gray-600 mr-4" alt="avatar" />
                        <div>
                            <div className="font-bold text-lg text-white">{booking.memberName}</div>
                            <div className="text-gray-400 text-sm mt-0.5">PT: {booking.coachName || 'N/A'}</div>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800 mb-6 text-sm">
                        <p className="text-gray-400 mb-2">Vui lòng xác nhận trạng thái buổi tập để hệ thống tự động trừ buổi / tính lương cho PT.</p>
                        <ul className="text-gray-300 list-disc pl-5 space-y-1">
                            <li><span className="font-bold text-green-500">Hoàn thành:</span> Khách đã tập xong.</li>
                            <li><span className="font-bold text-yellow-500">Huỷ muộn:</span> Khách không đến và vẫn bị trừ buổi.</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            disabled={loading}
                            onClick={() => handleAction(WorkLogStatus.COMPLETED)}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition uppercase tracking-wider text-sm shadow-lg shadow-green-600/20 disabled:opacity-50"
                        >
                            {loading ? 'Đang xử lý...' : 'Hoàn Thành (Có Mặt)'}
                        </button>

                        <button
                            disabled={loading}
                            onClick={() => handleAction(WorkLogStatus.LATE_CANCEL)}
                            className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition uppercase tracking-wider text-sm shadow-lg shadow-yellow-600/20 disabled:opacity-50"
                        >
                            {loading ? 'Đang xử lý...' : 'Huỷ Muộn (Vắng Mặt)'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}