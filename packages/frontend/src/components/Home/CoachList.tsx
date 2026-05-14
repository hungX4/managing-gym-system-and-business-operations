import React, { useEffect, useState, useRef } from 'react';
import { coachApi } from '../../api/coachApi';

interface Coach {
    userId: string;
    fullName: string;
    phone: string;
    avatarUrl: string | null;
    coachType: string | null;
    coachLevel: string | null;
    bio: string | null;
}

const CoachList: React.FC = () => {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState(true);

    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                const res = await coachApi.getAllCoaches();
                setCoaches(res.data);
            } catch (error) {
                console.error("Lỗi tải danh sách HLV:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCoaches();
    }, []);

    const slideLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
        }
    };

    const slideRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
    };

    if (loading) return (
        <div className="py-20 bg-white flex justify-center items-center text-red-600 text-xl font-bold tracking-widest animate-pulse">
            ĐANG TẢI DỮ LIỆU...
        </div>
    );

    return (
        // Xóa min-h-[70vh], chỉ dùng py-12 để dải trắng vừa vặn, không bị thừa trên dưới
        <div className="bg-white py-12 px-4 sm:px-6 flex flex-col justify-center">
            <div className="max-w-6xl mx-auto w-full">

                {/* Phần Tiêu đề */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-2">
                        Đội Ngũ <span className="text-red-600">Huấn Luyện Viên</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
                        Đồng hành cùng những chuyên gia hàng đầu để đạt được mục tiêu hình thể của bạn.
                    </p>
                </div>

                {/* Khu vực Slider thu gọn lại max-w-5xl để mũi tên không bị quá xa */}
                <div className="relative group flex items-center justify-center max-w-5xl mx-auto">

                    {/* Nút Cuộn Trái (neo sát vào rìa của max-w-5xl) */}
                    <button
                        onClick={slideLeft}
                        className="absolute -left-4 md:-left-12 z-10 p-2.5 bg-white border border-gray-200 text-red-600 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:bg-red-50 hover:scale-110 transition-all duration-300 focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Container chứa Card */}
                    <div
                        ref={sliderRef}
                        // 🔥 LOGIC QUAN TRỌNG: Nếu số coach < 4 thì tự động căn giữa (justify-center), ngược lại thì dạt trái để trượt
                        className={`flex gap-6 overflow-x-hidden scroll-smooth w-full py-4 px-2 ${coaches.length < 4 ? 'justify-center' : 'justify-start'}`}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {coaches.map((coach) => (
                            // Giữ nguyên kích thước nhỏ nhắn: w-[280px], h-[420px]
                            <div
                                key={coach.userId}
                                className="flex-none w-[280px] h-[420px] bg-[#0f172a] rounded-2xl overflow-hidden hover:border-red-600/50 transition-all duration-300 group shadow-lg hover:shadow-2xl flex flex-col border border-gray-800"
                            >
                                {/* Avatar Section */}
                                <div className="h-48 w-full overflow-hidden relative bg-gray-800 flex-shrink-0">
                                    <img
                                        src={coach.avatarUrl || 'https://via.placeholder.com/400x400?text=No+Avatar'}
                                        alt={coach.fullName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
                                    <div className="absolute bottom-3 left-3">
                                        <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-sm shadow-md">
                                            {coach.coachLevel || 'Trainer'}
                                        </span>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-wide truncate">
                                        {coach.fullName}
                                    </h3>
                                    <p className="text-red-500 font-medium mb-3 text-xs tracking-widest uppercase truncate">
                                        {coach.coachType || 'Personal Trainer'}
                                    </p>
                                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                                        {coach.bio || 'Chưa cập nhật tiểu sử.'}
                                    </p>

                                    <button className="mt-auto w-full py-2.5 bg-transparent border-2 border-gray-700 hover:border-red-600 hover:bg-red-600 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-all duration-300">
                                        Đặt Lịch Ngay
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Nút Cuộn Phải */}
                    <button
                        onClick={slideRight}
                        className="absolute -right-4 md:-right-12 z-10 p-2.5 bg-white border border-gray-200 text-red-600 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:bg-red-50 hover:scale-110 transition-all duration-300 focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .overflow-x-hidden::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </div>
    );
};

export default CoachList;