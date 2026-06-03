import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient'; // Đảm bảo đúng đường dẫn tới file axiosClient.ts của bạn

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Các trạng thái của trang: processing (đang xử lý), success (thành công), failed (thất bại)
    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [message, setMessage] = useState('Đang xác thực giao dịch với ngân hàng...');

    useEffect(() => {
        const verifyPayment = async () => {
            const queryParams = location.search;

            if (!queryParams) {
                console.error("Không có thông tin thanh toán trên URL!");
                setStatus('failed');
                setMessage("Thông tin thanh toán không hợp lệ.");
                return;
            }

            // 1. LẤY MÃ PHẢN HỒI THỰC TẾ TỪ URL CỦA VNPAY
            const urlParams = new URLSearchParams(queryParams);
            const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');

            try {
                // 2. Vẫn gọi Backend để nó chạy logic cập nhật Database
                const response = await axiosClient.get(`/online-payment/vnpay-ipn${queryParams}`);

                // 3. XỬ LÝ LOGIC HIỂN THỊ
                if (vnp_ResponseCode === '00') {
                    // Trạng thái '00': Khách ĐÃ TRẢ TIỀN thành công
                    if (response.data.RspCode === '00' || response.data.RspCode === '02') {
                        setStatus('success');
                        setMessage("Gói tập của bạn đã được kích hoạt thành công!");
                    } else {
                        setStatus('failed');
                        setMessage(response.data.Message || "Giao dịch không thành công.");
                    }
                } else {
                    // Nếu khách bấm HỦY (mã 24) hoặc THẺ LỖI, vnp_ResponseCode sẽ khác '00'
                    setStatus('failed');
                    setMessage("Giao dịch đã bị hủy hoặc thanh toán thất bại.");
                }

            } catch (error: any) {
                console.error("Lỗi khi gọi API Backend:", error);
                setStatus('failed');
                setMessage("Không thể kết nối với máy chủ để xác nhận thanh toán.");
            }
        };

        verifyPayment();
    }, [location.search]);

    return (
        <div className="p-24 min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 font-sans">
            <div className="max-w-md w-full bg-[#111111] border border-gray-800 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">

                {/* Trang trí: Đốm sáng đỏ mờ phía sau */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl"></div>

                {/* TRẠNG THÁI: ĐANG XỬ LÝ */}
                {status === 'processing' && (
                    <div className="py-10">
                        <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">
                            Đang kiểm tra <span className="text-red-600">Giao dịch</span>
                        </h2>
                        <p className="text-gray-400">{message}</p>
                    </div>
                )}

                {/* TRẠNG THÁI: THÀNH CÔNG */}
                {status === 'success' && (
                    <div className="py-6 animate-fadeIn">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
                            Thanh toán thành công
                        </h2>
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                            {message} <br /> Chào mừng bạn gia nhập cộng đồng Gym của chúng tôi.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:-translate-y-1"
                        >
                            Bắt đầu tập luyện ngay
                        </button>
                    </div>
                )}

                {/* TRẠNG THÁI: THẤT BẠI */}
                {status === 'failed' && (
                    <div className="py-6 animate-fadeIn">
                        <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
                            Thất bại
                        </h2>
                        <p className="text-gray-400 text-lg mb-8">
                            {message}
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full border-2 border-gray-700 hover:border-red-600 text-gray-300 hover:text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all duration-300 mb-4"
                        >
                            Thử thanh toán lại
                        </button>
                        <p className="text-sm text-gray-500">Nếu bạn đã bị trừ tiền, vui lòng liên hệ lễ tân để được hỗ trợ.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;