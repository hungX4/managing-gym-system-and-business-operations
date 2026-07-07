import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Nhớ sửa lại đường dẫn import axiosClient cho đúng với project của bạn
import axiosClient from '../../api/axiosClient';

// Dùng đúng chuẩn DTO bạn cung cấp
interface PackageResponseDto {
    packageId: number;
    name: string;
    price: number;
    durationDays: number;
    totalSessions: number | null;
    type: string;
    isActive: boolean;
}

const OnlinePaymentComponent = () => {
    const [packages, setPackages] = useState<PackageResponseDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isBuying, setIsBuying] = useState<number | null>(null);
    const navigate = useNavigate();
    //popup when have not login yet
    const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
    const VIP_BENEFITS = [
        "Sử dụng toàn bộ thiết bị Gym",
        "Miễn phí tủ Locker cá nhân",
        "Trải nghiệm bể bơi 4 mùa",
        "Phòng Xông hơi (Sauna)",
        "Đo chỉ số cơ thể InBody",
    ];

    // Fetch danh sách gói tập
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                // Đảm bảo Backend có API GET /packages để lấy danh sách gói tập
                const res = await axiosClient.get('/package');

                // Chỉ lấy những gói đang Active và là loại MEMBERSHIP
                const availablePackages = res.data
                    .filter(
                        (pkg: PackageResponseDto) => pkg.isActive && pkg.type === 'MEMBERSHIP'
                    )
                    .sort((a: PackageResponseDto, b: PackageResponseDto) => a.price - b.price);;
                setPackages(availablePackages);
            } catch (error) {
                console.error("Lỗi khi tải gói tập:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    // Xử lý khi bấm nút Mua
    const handleBuyPackage = async (packageId: number) => {
        // 1. Kiểm tra xem khách đã đăng nhập chưa bằng cách check localStorage
        const isLogged = localStorage.getItem('userId') && localStorage.getItem('accessToken');

        if (!isLogged) {
            // Nếu chưa đăng nhập -> Mở Popup thân thiện và dừng hàm lại
            setShowAuthModal(true);
            return;
        }

        // 2. Nếu đã đăng nhập thì chạy logic mua như bình thường
        setIsBuying(packageId);
        try {
            const payload = {
                packageId: packageId,
                startDate: new Date().toISOString()
            };

            const res = await axiosClient.post('/online-payment/buy-online', payload);

            if (res.data && res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (error: any) {
            console.error("Lỗi tạo thanh toán:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi tạo giao dịch. Vui lòng thử lại!");
        } finally {
            setIsBuying(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#0a0a0a] text-red-500 flex justify-center items-center font-bold text-xl uppercase tracking-widest">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="min-h-[calc(100vh-25vh)] bg-[#0a0a0a] text-white pt-12 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-4">
                        Nâng tầm <span className="text-red-600">Bản thân</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Chọn gói tập phù hợp với mục tiêu của bạn. Thanh toán nhanh chóng, kích hoạt ngay lập tức.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.packageId}
                            className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden hover:border-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all duration-300 flex flex-col"
                        >
                            <div className="p-6 flex-grow">
                                <h2 className="text-2xl font-bold uppercase text-white mb-2 whitespace-nowrap">{pkg.name}</h2>
                                <p className="text-red-500 text-sm font-semibold tracking-wider uppercase mb-5">Thẻ Hội Viên</p>

                                <div className="flex items-baseline mb-6">
                                    <span className="text-4xl font-extrabold">
                                        {new Intl.NumberFormat('vi-VN').format(pkg.price)}
                                    </span>
                                    <span className="text-gray-500 ml-2">VNĐ</span>
                                </div>

                                {/* Danh sách quyền lợi */}
                                <ul className="space-y-4 text-gray-300">
                                    {VIP_BENEFITS.map((benefit, index) => (
                                        <li key={index} className="flex items-start">
                                            {/* Icon Checkmark màu xanh lá cho cảm giác Tích cực/Đã bao gồm */}
                                            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <span className="font-medium">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 bg-black border-t border-gray-800">
                                <button
                                    onClick={() => handleBuyPackage(pkg.packageId)}
                                    disabled={isBuying === pkg.packageId}
                                    className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-200 hover:cursor-pointer ${isBuying === pkg.packageId
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_14px_0_rgba(220,38,38,0.39)]'
                                        }`}
                                >
                                    {isBuying === pkg.packageId ? 'Đang kết nối...' : 'Mua Ngay'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[#111111] border border-gray-800 rounded-2xl max-w-md w-full p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative transform transition-all scale-100 animate-slideUp">

                        {/* Icon cảnh báo nhẹ nhàng */}
                        <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        </div>

                        <h3 className="text-2xl font-black text-center text-white uppercase tracking-wider mb-3">
                            Chưa đăng nhập?
                        </h3>

                        <p className="text-gray-400 text-center mb-8 leading-relaxed">
                            Để bảo vệ quyền lợi và lưu trữ gói tập của bạn an toàn, vui lòng đăng nhập hoặc tạo tài khoản trước khi thanh toán nhé!
                        </p>

                        <div className="flex flex-col space-y-4">
                            <button
                                onClick={() => navigate('/auth')} // Chuyển hướng sang trang đăng nhập
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-all duration-300 shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:-translate-y-1"
                            >
                                Đăng nhập ngay
                            </button>

                            <button
                                onClick={() => setShowAuthModal(false)} // Tắt popup
                                className="w-full bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white font-bold py-3 rounded-xl uppercase tracking-widest transition-all duration-300"
                            >
                                Để sau
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlinePaymentComponent;