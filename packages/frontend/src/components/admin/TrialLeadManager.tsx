import React, { useState } from 'react';
import { Edit, Phone, Mail, User, Clock, Filter, X } from 'lucide-react';
import { TrialStatus } from '@gym/shared';
import { useTrialLeads } from '../../hooks/trial/useTrialLeads';
import { TRIAL_STATUS_CONFIG } from '../../config/trialStatus';
import { useOutletContext } from 'react-router-dom';
const TrialLeadManager = () => {
    const { isSidebarOpen } = useOutletContext<{ isSidebarOpen: boolean }>();//lay state tu container

    //call hook
    const { leads, coaches, loading, filterStatus, setFilterStatus, updateLead } = useTrialLeads();

    // state tắt mở ui giữ ở component
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [editForm, setEditForm] = useState({ status: TrialStatus.UNCONTACTED, adminNote: '', assignedToId: '' });

    const handleOpenEdit = (lead: any) => {
        setSelectedLead(lead);
        setEditForm({
            status: lead.status || TrialStatus.UNCONTACTED,
            adminNote: lead.adminNote || '',
            assignedToId: lead.assignedTo?.id?.toString() || ''
        });
        setIsModalOpen(true);
    };

    const handleUpdate = async () => {
        const success = await updateLead(selectedLead.id, {
            status: editForm.status,
            adminNote: editForm.adminNote,
            assignedToId: editForm.assignedToId ? Number(editForm.assignedToId) : null,
        });
        if (success) setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-300 p-6 font-sans">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className={`transition-all duration-300 ${!isSidebarOpen ? 'pl-8' : ''}`}>
                    <h1 className="text-3xl font-bold text-white uppercase tracking-wider">
                        Khách Hàng <span className="text-red-600">Tiềm Năng</span>
                    </h1>
                    <p className="text-neutral-500 mt-1">Quản lý danh sách đăng ký tập thử từ Website</p>
                </div>

                <div className="flex items-center gap-3 bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                    <Filter size={18} className="text-red-500 ml-2" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as TrialStatus | '')}
                        className="bg-transparent border-none outline-none text-sm text-neutral-200 cursor-pointer pr-4"
                    >
                        <option value="" className="bg-neutral-900">Tất cả trạng thái</option>
                        {/* Render filter từ Enum */}
                        {Object.values(TrialStatus).map(status => (
                            <option key={status} value={status} className="bg-neutral-900">
                                {TRIAL_STATUS_CONFIG[status]?.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-xl shadow-black/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-950 text-neutral-400 uppercase font-semibold text-xs border-b border-red-900/30">
                            <tr>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Liên hệ</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ghi chú</th>
                                <th className="px-6 py-4">Phụ trách</th>
                                <th className="px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-red-500">Đang tải dữ liệu...</td></tr>
                            ) : leads.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10">Không có dữ liệu</td></tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white text-base">{lead.fullName}</div>
                                            <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                                                <Clock size={12} /> {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-neutral-300">
                                                <Phone size={14} className="text-red-500" /> {lead.phoneNumber}
                                            </div>
                                            {lead.email && (
                                                <div className="flex items-center gap-2 text-neutral-400 mt-1 text-xs">
                                                    <Mail size={14} /> {lead.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 whitespace-nowrap w-fit rounded-full text-xs font-medium ${TRIAL_STATUS_CONFIG[lead.status as TrialStatus]?.color || 'bg-neutral-700 text-white'}`}>
                                                {TRIAL_STATUS_CONFIG[lead.status as TrialStatus]?.label || 'Không xác định'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <div className="truncate text-neutral-300" title={lead.guestNote}><span className="text-neutral-500">K:</span> {lead.guestNote || '-'}</div>
                                            <div className="truncate text-red-400 mt-1" title={lead.adminNote}><span className="text-red-800">A:</span> {lead.adminNote || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.assignedTo ? (
                                                <span className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded-md text-xs border border-emerald-400/20">
                                                    <User size={14} /> {lead.assignedTo.fullName}
                                                </span>
                                            ) : (
                                                <span className="text-neutral-500 text-xs italic">Chưa giao</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleOpenEdit(lead)} className="p-2 bg-neutral-800 hover:bg-red-600 hover:text-white text-neutral-400 rounded-lg transition-all">
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Cập nhật (Đã fix dọn dẹp form) */}
            {isModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-5 border-b border-neutral-800 bg-neutral-950">
                            <h3 className="text-lg font-bold text-white">Cập nhật Lead: <span className="text-red-500">{selectedLead.fullName}</span></h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-red-500"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* 1. Chọn trạng thái */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Trạng thái</label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TrialStatus })}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                                >
                                    {Object.values(TrialStatus).map(status => (
                                        <option key={status} value={status}>
                                            {TRIAL_STATUS_CONFIG[status]?.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 2. Chọn nhân viên (Đã fix) */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">
                                    Giao cho Huấn luyện viên
                                </label>
                                <select
                                    value={editForm.assignedToId}
                                    onChange={(e) => setEditForm({ ...editForm, assignedToId: e.target.value })}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                                >
                                    <option value="" className="text-neutral-500">-- Chưa giao cho ai --</option>
                                    {coaches.map(coach => (
                                        <option key={coach.userId} value={coach.userId}>
                                            {coach.fullName} {coach.coachType ? `(${coach.coachType})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 3. Ghi chú */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Ghi chú của Admin/Sale</label>
                                <textarea
                                    rows={3}
                                    placeholder="Ghi chú quá trình chăm sóc..."
                                    value={editForm.adminNote}
                                    onChange={(e) => setEditForm({ ...editForm, adminNote: e.target.value })}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-5 border-t border-neutral-800 flex justify-end gap-3 bg-neutral-950">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 font-medium">Hủy</button>
                            <button onClick={handleUpdate} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-900/50 transition-all">Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrialLeadManager;