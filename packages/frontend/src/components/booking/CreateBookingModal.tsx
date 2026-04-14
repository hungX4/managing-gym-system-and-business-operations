import React from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedSlot: { date: Date; hour: number };
    searchKeyword: string;
    setSearchKeyword: (val: string) => void;
    isSearching: boolean;
    searchResults: any[];
    selectedMember: any;
    setSelectedMember: (val: any) => void;
    onCreateBooking: () => void;
}

export default function CreateBookingModal({
    isOpen,
    onClose,
    selectedSlot,
    searchKeyword,
    setSearchKeyword,
    isSearching,
    searchResults,
    selectedMember,
    setSelectedMember,
    onCreateBooking
}: Props) {
    if (!isOpen || !selectedSlot) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onMouseDown={onClose}>
            <div className="bg-[#111111] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onMouseDown={(e) => e.stopPropagation()}>
                <div className="bg-red-600 text-white p-4 rounded-t-xl flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg font-bold uppercase tracking-wider">Thêm Lịch PT</h2>
                        <p className="text-xs font-medium text-red-200 mt-1">
                            Slot: {selectedSlot.hour}:00 - {selectedSlot.hour + 1}:00, {selectedSlot.date.toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 font-bold text-2xl">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {!selectedMember ? (
                        <div className="relative">
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Tìm Hội viên</label>
                            <input
                                type="text"
                                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 outline-none focus:border-red-600 text-white"
                                placeholder="Nhập tên hoặc SĐT..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                            {(searchKeyword.length > 0) && (
                                <div className="absolute w-full mt-2 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto custom-scrollbar">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-gray-400 text-sm">Đang tìm...</div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map(member => (
                                            <div key={member.memberId} className="flex items-center p-3 border-b border-gray-800 hover:bg-red-600/10 cursor-pointer" onClick={() => setSelectedMember(member)}>
                                                <img src={member.avatarUrl || 'https://ui-avatars.com/api/?background=333&color=fff&name=' + member.fullName} className="w-10 h-10 rounded-full mr-3 border border-gray-600" alt="avatar" />
                                                <div>
                                                    <div className="font-bold text-gray-200 text-sm">{member.fullName}</div>
                                                    <div className="text-xs text-gray-500">{member.phone} • Còn <span className="text-red-500">{member.remainingPtSession} buổi</span></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-red-500 text-sm">Không tìm thấy hội viên!</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center mb-4">
                                <img src={selectedMember.avatarUrl || 'https://ui-avatars.com/api/?background=333&color=fff&name=' + selectedMember.fullName} className="w-14 h-14 rounded-full border-2 border-gray-600 mr-4" alt="avatar" />
                                <div>
                                    <div className="font-bold text-lg text-white">{selectedMember.fullName}</div>
                                    <div className="text-gray-400 text-sm">{selectedMember.phone}</div>
                                    <div className="text-red-500 text-sm mt-1">Buổi PT còn lại: {selectedMember.remainingPtSession}</div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMember(null)} className="text-sm text-gray-500 underline hover:text-white">Chọn lại hội viên</button>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-gray-800">
                        <button onClick={onClose} className="px-4 py-2 border border-gray-700 rounded text-gray-400 hover:text-white">Huỷ</button>
                        <button onClick={onCreateBooking} disabled={!selectedMember} className={`px-6 py-2 rounded font-bold uppercase text-sm ${selectedMember ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}>Xác nhận</button>
                    </div>
                </div>
            </div>
        </div>
    );
}