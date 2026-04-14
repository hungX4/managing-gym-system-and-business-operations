import React, { useState } from 'react';

// 1. Định nghĩa Interface cho Banner
interface Banner {
    id: number;
    title: string;
    subTitle: string;
    description: string;
    features: string[];
    image: string;
}

// Thêm data cho đủ 4 banner để hiện 4 chấm tròn
const banners: Banner[] = [
    {
        id: 1,
        title: "HIỆU CHỈNH",
        subTitle: "TẬP LUYỆN",
        description: "CORRECTIVE EXERCISE PROGRAM",
        features: ["TẬP LUYỆN KHOA HỌC", "GIẢI QUYẾT CƠN ĐAU TỪ GỐC"],
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    },
    {
        id: 2,
        title: "CƠ BẮP",
        subTitle: "XÂY DỰNG",
        description: "ADVANCED MUSCLE BUILDING",
        features: ["GIÁO ÁN CHUYÊN NGHIỆP", "PT KÈM 1-1"],
        image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    },
    {
        id: 3,
        title: "GIẢM MỠ",
        subTitle: "TỐC ĐỘ",
        description: "FAT LOSS KICKSTARTER",
        features: ["ĐỐT CALO TỐI ĐA", "TĂNG CƯỜNG THỂ LỰC"],
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    },
    {
        id: 4,
        title: "THƯ GIÃN",
        subTitle: "YOGA VÀ",
        description: "MIND & BODY BALANCE",
        features: ["CÂN BẰNG THÂN TÂM", "TĂNG ĐỘ DẺO DAI"],
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    }
];

const HeroCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [startX, setStartX] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // Thêm state để lưu khoảng cách đang kéo (dùng cho hiệu ứng mượt)
    const [dragOffset, setDragOffset] = useState<number>(0);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        if ('pageX' in e) {
            setStartX(e.pageX);
        } else {
            setStartX(e.touches[0].clientX);
        }
    };

    // Hàm xử lý khi đang kéo/vuốt
    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;

        const currentX = 'pageX' in e ? e.pageX : e.touches[0].clientX;
        const diff = currentX - startX;

        // Cập nhật vị trí ngay lập tức để banner chạy theo tay
        setDragOffset(diff);
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        // Ngưỡng vuốt (ví dụ: vuốt qua 75px thì mới chuyển slide)
        const threshold = 75;

        if (dragOffset > threshold) {
            prevSlide();
        } else if (dragOffset < -threshold) {
            nextSlide();
        }

        // Reset lại vị trí kéo về 0 sau khi nhả chuột/tay
        setDragOffset(0);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    const handleScrollToTrial = () => {
        const section = document.getElementById('trial-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' }); // Lệnh cuộn mượt
        }
    };

    return (
        <div
            // Đổi h-screen thành h-[85vh] ở đây
            className="relative w-full h-screen bg-black overflow-hidden select-none cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
        >
            <div
                // Nếu đang kéo (isDragging) thì bỏ transition đi để ảnh bám sát vào tay/chuột.
                // Nếu nhả ra (!isDragging) thì bật transition để nó trượt mượt về vị trí chốt.
                className={`flex h-full ${isDragging ? 'transition-none' : 'transition-transform duration-500 ease-out'}`}
                // Công thức: -VịTríIndex + KhoảngCáchKéo
                style={{ transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))` }}
            >
                {banners.map((banner) => (
                    <div key={banner.id} className="min-w-full h-full relative">
                        <div className="absolute inset-0">
                            <img src={banner.image} alt="Banner" className="w-full h-full object-cover opacity-40 pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                        </div>

                        <div className="relative h-full flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {/* Bỏ cursor-grab ở đây vì đã đưa lên thẻ div ngoài cùng */}
                            <div className="w-full md:w-2/3 pt-32">
                                <div className="mb-6 relative pointer-events-none">
                                    <h2 className="text-4xl md:text-5xl font-light tracking-widest text-gray-300">
                                        {banner.subTitle}
                                    </h2>
                                    <h1 className="text-6xl leading-snug md:text-8xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500" style={{ WebkitTextStroke: '1px white' }}>
                                        {banner.title}
                                    </h1>
                                    <p className="text-red-600 font-bold tracking-[0.3em] mt-2 text-sm md:text-base">
                                        {banner.description}
                                    </p>
                                </div>

                                <div className="border border-red-600/30 bg-red-900/10 p-6 rounded-sm w-fit backdrop-blur-sm mb-8 pointer-events-none">
                                    <ul className="space-y-3">
                                        {banner.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-white font-medium uppercase text-sm md:text-base">
                                                <span className="text-cyan-400 mr-3">▶</span> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Tránh việc click vào nút bị tính là vuốt, z-index cao hơn */}
                                <button onClick={handleScrollToTrial} className="mt-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-sm font-bold uppercase transition relative z-10">
                                    Trải nghiệm ngay
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Khung chứa 4 chấm tròn (Dots) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-4 z-20">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài gây lỗi kéo
                            setCurrentIndex(idx);
                        }}
                        // Style chấm tròn: w-3 h-3 rounded-full
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === idx
                            ? 'bg-red-600 scale-125' // Phóng to nhẹ chấm đang active
                            : 'bg-gray-500 hover:bg-gray-300'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;