import React, { useState } from 'react';
import { useTrialForm } from '../../hooks/trial/useTrialForm'

const TrialSection = () => {
    const { formData, isLoading, handleChange, handleSubmit } = useTrialForm();
    return (
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
                    <form className="flex flex-col space-y-8" onSubmit={handleSubmit}>
                        <div className="relative">
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Họ và Tên *"
                                className="w-full border-b border-gray-400 py-2 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                                required
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Số điện thoại *"
                                className="w-full border-b border-gray-400 py-2 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                                required
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="w-full border-b border-gray-400 py-2 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                placeholder="Bạn có mong muốn gì? (Giảm cân, tăng cơ, ...)"
                                rows={1}
                                className="w-full border-b border-gray-400 py-2 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors resize-none"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-12 uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        ĐANG GỬI...
                                    </>
                                ) : (
                                    'Đăng ký'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </section>
    );
};

export default TrialSection;