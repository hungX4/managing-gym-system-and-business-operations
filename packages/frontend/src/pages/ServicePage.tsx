import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronDown, PhoneCall, Sparkles } from 'lucide-react';
import TrialSection from '../components/Home/TrialSection';

const SERVICES_DATA = [
    {
        id: 'gym',
        tag: 'HẠ TẦNG 5 SAO & TECHNOGYM',
        title: 'GYM & STRENGTH',
        subtitle: 'Bứt phá giới hạn thể hình & sức mạnh cơ bắp',
        desc: 'Trang bị 100% thiết bị nhập khẩu từ Technogym & Hammer Strength. Phân khu khoa học từ Cardio, Free Weights đến Machine Area, kết hợp hệ thống đo chỉ số InBody 770.',
        features: [
            'Dàn máy tập chuẩn Olympic nhập khẩu',
            'Đo & phân tích chỉ số cơ thể InBody 3D',
            'HLV 1:1 có bằng cấp quốc tế (NASM, ACE)',
            'Locker & Sauna khô/ướt riêng biệt'
        ],
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
    },
    {
        id: 'yoga',
        tag: 'ZEN ATMOSPHERE & CHỮA LÀNH',
        title: 'YOGA & MINDFULNESS',
        subtitle: 'Cân bằng tâm trí, dẻo dai cột sống & tĩnh lặng',
        description: 'Phòng Studio cách âm chuẩn Zen với thảm Liforme cao cấp, hệ thống lọc không khí ion âm. Đa dạng lớp từ Hatha, Vinyasa đến Yoga Chuông Xoay.',
        features: [
            'HLV gốc Ấn Độ & Chuyên gia hàng đầu',
            'Hơn 30+ lớp Yoga/tuần đa dạng khung giờ',
            'Không gian tĩnh lặng cách âm tuyệt đối',
            'Miễn phí thảm tập cao cấp & trà thảo mộc'
        ],
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop',
    },
    {
        id: 'boxing',
        tag: 'ĐỐT 1000 KCAL/GIỜ & PHẢN XẠ',
        title: 'BOXING & COMBAT',
        subtitle: 'Giải tỏa căng thẳng, master kỹ năng tự vệ',
        description: 'Sàn đài Octagon & Ring Boxing tiêu chuẩn thi đấu. Kết hợp Kickboxing, Muay Thai giúp phát triển thể lực toàn diện và phản xạ nhạy bén.',
        features: [
            'Sàn đấu Octagon & bao cát Heavy Bag chuyên nghiệp',
            'Giáo án huấn luyện từ các võ sĩ Championship',
            'Trang bị đầy đủ găng, băng quấn, giáp bảo hộ',
            'Đốt calo liên tục trong và sau giờ tập'
        ],
        image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1200&auto=format&fit=crop',
    },
    {
        id: 'kids',
        tag: 'RÈN LUYỆN THỂ CHẤT PHÁT TRIỂN',
        title: 'GYM KIDS & ATHLETIC',
        subtitle: 'Tăng chiều cao & tư duy vận động chuẩn khoa học',
        description: 'Chương trình thể chất thiết kế riêng cho độ tuổi từ 6 - 15 tuổi. Giúp trẻ tăng cường chiều cao, cải thiện tư thế gù lưng và tăng tự tin.',
        features: [
            'Dụng cụ tập scaled-down an toàn tuyệt đối',
            'HLV giàu kinh nghiệm sư phạm & tâm lý trẻ',
            'Bài tập phát triển chiều cao & phản xạ',
            'Môi trường năng động, kết nối lành mạnh'
        ],
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
    }
];

export default function ServicesPage() {
    const [selectedService, setSelectedService] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans antialiased overflow-x-hidden selection:bg-red-600 selection:text-white">

            {/* 1. HERO HEADER (FULL 100% MÀN HÌNH & NÚT MŨI TÊN SCROLL) */}
            <section className="relative w-full h-screen -mt-16 pt-16 flex flex-col items-center justify-center border-b border-neutral-800/80 overflow-hidden bg-[#050505]">

                {/* Background Full Màn Hình */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=2400&auto=format&fit=crop"
                        alt="Hero background"
                        className="w-full h-full object-cover object-center opacity-25 filter grayscale contrast-125 scale-105"
                    />
                    {/* Lớp phủ gradient hòa tan nền */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/50" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/80" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[180px] pointer-events-none" />
                </div>

                {/* Nội dung căn giữa màn hình */}
                <div className="relative z-10 max-w-[1920px] mx-auto px-4 text-center space-y-6 sm:space-y-8">



                    {/* Tiêu đề Responsive */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-6xl md:text-5xl lg:text-6xl 2xl:text-7xl font-black uppercase tracking-tight text-neutral-400 leading-none flex flex-col xl:flex-row items-center justify-center gap-x-6 gap-y-2"
                    >
                        <span>CHÚNG TÔI LÀ</span>
                        <span className="text-red-700 md:text-7xl lg:text-8xl 2xl:text-9xl">FIT STATION</span>
                    </motion.h1>

                </div>

                {/* 🟢 MŨI TÊN CHỈ XUỐNG DƯỚI (CLICK ĐỂ SKROLL MƯỢT XUỐNG DỊCH VỤ) */}
                <motion.button
                    onClick={() => {
                        document.getElementById('services-list')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-neutral-400 hover:text-white transition-colors cursor-pointer group"
                >
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-500 group-hover:text-neutral-300">
                        Cuộn xuống
                    </span>
                    <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center group-hover:border-red-500/50 transition-colors">
                        <ChevronDown className="w-5 h-5 text-red-500 animate-bounce" />
                    </div>
                </motion.button>

            </section>

            {/* 2. SERVICES LIST - TRÀN TỪ 2 BÊN MÈP VÀO */}
            <section className="w-full">
                {SERVICES_DATA.map((service, index) => {
                    const isEven = index % 2 === 0;

                    // Khai báo hướng đẩy trượt từ 2 bên mép
                    const leftSlideAnimation = {
                        initial: { opacity: 0, x: isEven ? -160 : 160 },
                        whileInView: { opacity: 1, x: 0 },
                        viewport: { once: false, amount: 0.2 },
                        transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const }
                    };

                    const rightSlideAnimation = {
                        initial: { opacity: 0, x: isEven ? 160 : -160 },
                        whileInView: { opacity: 1, x: 0 },
                        viewport: { once: false, amount: 0.2 },
                        transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const }
                    };

                    return (
                        <div
                            key={service.id}
                            className="border-b border-neutral-800/70 py-16 lg:py-24 px-4 sm:px-8 lg:px-12 w-full overflow-hidden"
                        >
                            <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

                                {/* BÊN A: CỤM HÌNH ẢNH (TRÀN TỪ TRÁI HOẶC PHẢI) */}
                                <motion.div
                                    {...leftSlideAnimation}
                                    className={`lg:col-span-7 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}
                                >
                                    <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl group">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-black/80 backdrop-blur-md border border-neutral-700/80 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-semibold text-neutral-300">
                                            {service.tag}
                                        </div>
                                    </div>
                                </motion.div>


                                {/* BÊN B: CỤM CHỮ (TRÀN TỪ HƯỚNG NGƯỢC LẠI) */}
                                <motion.div
                                    {...rightSlideAnimation}
                                    className={`lg:col-span-5 space-y-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}
                                >
                                    <div className="space-y-3">
                                        <h2 className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight leading-none">
                                            {service.title}
                                        </h2>
                                        <p className="text-sm sm:text-base font-medium text-red-500">
                                            {service.subtitle}
                                        </p>
                                    </div>

                                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                                        {service.desc || service.description}
                                    </p>

                                    {/* Danh sách đặc quyền */}
                                    <div className="space-y-2.5 pt-2 border-t border-neutral-800/80">
                                        {service.features.map((feat, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center text-[10px] shrink-0 font-bold">
                                                    ✓
                                                </div>
                                                <span className="text-xs sm:text-sm text-neutral-300 font-medium">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Nút hành động đơn giản, sắc nét */}
                                    <div className="pt-4">
                                        <button
                                            onClick={() => setSelectedService(service.title)}
                                            className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold px-7 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg active:scale-95"
                                        >
                                            <span>Đăng ký tư vấn</span>
                                            <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>

                            </div>
                        </div>
                    );
                })}
            </section>


            <TrialSection />

        </div>
    );
}