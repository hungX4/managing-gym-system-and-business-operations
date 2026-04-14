import React from 'react';

const TrialSection = () => {
    return (
        // id="trial-section" dùng để làm điểm neo (anchor) cho nút cuộn xuống
        // scroll-mt-20 giúp trừ hao khoảng không gian của Navbar khi cuộn đến
        <section id="trial-section" className="w-full bg-white py-16 md:py-24 px-4 md:px-10 lg:px-16 scroll-mt-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-24 items-center">

                {/* Cột trái: Tiêu đề & Văn bản */}
                <div className="w-full md:w-1/2">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-[1.1] tracking-tighter text-black mb-6" style={{ fontFamily: "'Oswald', sans-serif" }}>
                        Trải nghiệm <br /> miễn phí ngay!
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Hãy thử điều gì đó mới mẻ trong năm nay bằng cách tham gia thế giới trải nghiệm thú vị và vui nhộn từ chúng tôi. Chúng tôi cung cấp DÙNG THỬ MIỄN PHÍ 7 ngày cho tất cả khách mới. Để lại thông tin của bạn bên cạnh và chúng tôi sẽ liên hệ với bạn trong 24 giờ tới.
                    </p>
                </div>

                {/* Cột phải: Form nhập liệu */}
                <div className="w-full md:w-1/2">
                    <form className="flex flex-col space-y-8" onSubmit={(e) => e.preventDefault()}>
                        <div className="relative">
                            {/* Input chỉ có border-bottom */}
                            <input
                                type="text"
                                placeholder="Họ và Tên *"
                                className="w-full border-b border-gray-400 py-2 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                                required
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="tel"
                                placeholder="Số điện thoại *"
                                className="w-full border-b border-gray-400 py-2 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                                required
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full border-b border-gray-400 py-2 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-12 uppercase transition-colors"
                            >
                                Đăng ký
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </section>
    );
};

export default TrialSection;