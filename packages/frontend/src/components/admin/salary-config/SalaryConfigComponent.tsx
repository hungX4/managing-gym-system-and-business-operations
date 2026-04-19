import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Role,
    CoachType,
    CoachLevel,
    UpdateSalaryConfigDto,
    UpdateSalaryConfigItemDto
} from '@gym/shared'; // Hoặc import từ file DTO của bạn
import axiosClient from '../../../api/axiosClient';
import toast from 'react-hot-toast';

// ==========================================
// 1. MỞ RỘNG DTO CHO GIAO DIỆN (UI STATE)
// ==========================================
// Frontend cần thêm 'tempId' để làm Key cho React map()
// Các thẻ <select> trả về chuỗi rỗng '' nên cần thêm type string để không báo lỗi TypeScript đỏ
interface SalaryConfigUI extends Omit<UpdateSalaryConfigItemDto, 'coachType' | 'coachLevel'> {
    tempId: string;
    coachType?: CoachType | null | string;
    coachLevel?: CoachLevel | null | string;
}

const SalaryConfigComponent: React.FC = () => {
    const [configs, setConfigs] = useState<SalaryConfigUI[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(true);

    // Chỉ lấy những Role được nhận lương (Bỏ Role.MEMBER đi)
    const SALARY_ROLES = [Role.STAFF, Role.COACH, Role.ADMIN];

    // ==========================================
    // 2. GỌI API THẬT (LẤY DỮ LIỆU)
    // ==========================================
    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setIsFetching(true);
            const res = await axiosClient.get('/salaryconfig');
            console.log("Dữ liệu API trả về (res):", res);
            const backendData = res.data.data;

            // Map data từ Backend, gắn thêm tempId để làm Key cho UI
            const mappedData: SalaryConfigUI[] = backendData.map((item: UpdateSalaryConfigItemDto) => ({
                ...item,
                tempId: crypto.randomUUID()
            }));

            setConfigs(mappedData);
        } catch (error: any) {
            console.error("Lỗi lấy dữ liệu:", error);
            toast.error("Không thể tải cấu hình lương: " + (error.response?.data?.message || error.message));
        } finally {
            setIsFetching(false);
        }
    };

    // ==========================================
    // 3. XỬ LÝ LOGIC GIAO DIỆN
    // ==========================================
    const handleConfigChange = (id: string, field: keyof SalaryConfigUI, value: any) => {
        setConfigs(prevConfigs =>
            prevConfigs.map(config => {
                if (config.tempId === id) {
                    let updatedConfig = { ...config, [field]: value };

                    // AUTO DỌN RÁC: Nếu user chọn Role không phải COACH thì tự set null/0
                    if (field === 'role' && value !== Role.COACH) {
                        updatedConfig.coachType = null;
                        updatedConfig.coachLevel = null;
                        updatedConfig.pricePerSession = 0;
                    }
                    return updatedConfig;
                }
                return config;
            })
        );
    };

    const handleAddRow = () => {
        const newRow: SalaryConfigUI = {
            tempId: crypto.randomUUID(),
            role: Role.COACH,
            coachType: '', // Bắt đầu bằng rỗng để ép user phải chọn
            coachLevel: '',
            baseSalary: 0,
            pricePerSession: 0
        };
        setConfigs([...configs, newRow]);
    };

    const handleRemoveRow = (id: string) => {
        setConfigs(configs.filter(config => config.tempId !== id));
    };

    // ==========================================
    // 4. GỌI API THẬT (LƯU DỮ LIỆU - DÙNG ĐÚNG DTO)
    // ==========================================
    const handleSave = async () => {
        setLoading(true);
        try {
            // Ép kiểu chuẩn xác từ State UI sang UpdateSalaryConfigItemDto
            const payloadItems: UpdateSalaryConfigItemDto[] = configs.map(item => {

                // Tạo base item theo chuẩn DTO
                const baseItem: UpdateSalaryConfigItemDto = {
                    configId: item.configId,
                    role: item.role as Role,
                    baseSalary: Number(item.baseSalary),
                };

                // Nếu là COACH thì ép kiểu Type, Level và Price
                if (item.role === Role.COACH) {
                    if (!item.coachType || !item.coachLevel) {
                        throw new Error("Vui lòng chọn đầy đủ Loại và Cấp độ cho tất cả các dòng Coach!");
                    }
                    baseItem.coachType = item.coachType as CoachType;
                    baseItem.coachLevel = item.coachLevel as CoachLevel;
                    baseItem.pricePerSession = Number(item.pricePerSession);
                } else {
                    // Gắn rõ null cho các Role khác để Backend đỡ phải đoán
                    baseItem.coachType = null;
                    baseItem.coachLevel = null;
                    baseItem.pricePerSession = 0;
                }

                return baseItem;
            });

            // Tạo Payload tổng chuẩn theo UpdateSalaryConfigDto
            const finalPayload: UpdateSalaryConfigDto = {
                configs: payloadItems
            };

            // Bắn API PUT
            await axiosClient.put('/salaryconfig', finalPayload);

            toast.success("Lưu cấu hình lương thành công!");
            fetchConfigs(); // Tải lại data mới nhất sau khi lưu thành công

        } catch (error: any) {
            toast.error("Lỗi khi lưu: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // UI RENDER
    // ==========================================
    if (isFetching) {
        return <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans pt-22">

            {/* HEADER TONE ĐỎ ĐEN */}
            <div className="mb-8 border-b border-zinc-800 pb-4">
                <h1 className="text-4xl font-bold uppercase tracking-wide">
                    CẤU HÌNH <span className="text-red-600">LƯƠNG</span>
                </h1>
                <p className="text-zinc-400 mt-2">Quản lý và cập nhật mức lương tiêu chuẩn cho hệ thống FitStation.</p>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto bg-[#111111] border border-zinc-800 rounded-lg p-4 shadow-2xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                        <tr>
                            <th className="py-3 px-4">Chức vụ</th>
                            <th className="py-3 px-4">Loại Coach</th>
                            <th className="py-3 px-4">Cấp độ Coach</th>
                            <th className="py-3 px-4">Lương cứng (VNĐ)</th>
                            <th className="py-3 px-4">Giá / Buổi (VNĐ)</th>
                            <th className="py-3 px-4 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {configs.map((row) => {
                            const isCoach = row.role === Role.COACH;

                            return (
                                <tr key={row.tempId} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors">
                                    {/* ROLE */}
                                    <td className="py-3 px-4">
                                        <select
                                            value={row.role}
                                            onChange={(e) => handleConfigChange(row.tempId, 'role', e.target.value)}
                                            className="bg-black border border-zinc-700 text-white rounded px-3 py-2 w-full focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                        >
                                            {SALARY_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>

                                    {/* COACH TYPE */}
                                    <td className="py-3 px-4">
                                        <select
                                            value={row.coachType || ''}
                                            disabled={!isCoach}
                                            onChange={(e) => handleConfigChange(row.tempId, 'coachType', e.target.value)}
                                            className={`bg-black border border-zinc-700 text-white rounded px-3 py-2 w-full focus:outline-none focus:border-red-600 ${!isCoach ? 'opacity-30 cursor-not-allowed bg-zinc-900' : ''}`}
                                        >
                                            <option value="" disabled>-- Chọn Loại --</option>
                                            {Object.values(CoachType).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </td>

                                    {/* COACH LEVEL */}
                                    <td className="py-3 px-4">
                                        <select
                                            value={row.coachLevel || ''}
                                            disabled={!isCoach}
                                            onChange={(e) => handleConfigChange(row.tempId, 'coachLevel', e.target.value)}
                                            className={`bg-black border border-zinc-700 text-white rounded px-3 py-2 w-full focus:outline-none focus:border-red-600 ${!isCoach ? 'opacity-30 cursor-not-allowed bg-zinc-900' : ''}`}
                                        >
                                            <option value="" disabled>-- Chọn Cấp --</option>
                                            {Object.values(CoachLevel).map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </td>

                                    {/* BASE SALARY */}
                                    <td className="py-3 px-4">
                                        <input
                                            type="number"
                                            value={row.baseSalary}
                                            min="0"
                                            onChange={(e) => handleConfigChange(row.tempId, 'baseSalary', e.target.value)}
                                            className="bg-black border border-zinc-700 text-white rounded px-3 py-2 w-full focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                                        />
                                    </td>

                                    {/* PRICE PER SESSION */}
                                    <td className="py-3 px-4">
                                        <input
                                            type="number"
                                            value={row.pricePerSession}
                                            min="0"
                                            disabled={!isCoach}
                                            onChange={(e) => handleConfigChange(row.tempId, 'pricePerSession', e.target.value)}
                                            className={`bg-black border border-zinc-700 text-white rounded px-3 py-2 w-full focus:outline-none focus:border-red-600 ${!isCoach ? 'opacity-30 cursor-not-allowed bg-zinc-900' : ''}`}
                                        />
                                    </td>

                                    {/* ACTION REMOVE */}
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => handleRemoveRow(row.tempId)}
                                            className="text-zinc-500 hover:text-red-500 transition-colors p-2 rounded hover:bg-zinc-800"
                                            title="Xóa cấu hình này"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mx-auto">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* NÚT THÊM DÒNG */}
                <div className="p-4 border-t border-zinc-800">
                    <button
                        onClick={handleAddRow}
                        className="text-red-600 hover:text-red-500 font-semibold transition-colors flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-900"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        THÊM CẤU HÌNH MỚI
                    </button>
                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded shadow-lg hover:shadow-red-900/50 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            ĐANG LƯU...
                        </span>
                    ) : 'LƯU TẤT CẢ THAY ĐỔI'}
                </button>
            </div>

        </div>
    );
};

export default SalaryConfigComponent;