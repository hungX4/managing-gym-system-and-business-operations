// config/vnpay.config.ts


const NGROK_URL = 'https://nutlike-bankbook-syndrome.ngrok-free.dev'
export const VNPAY_CONFIG = {
    vnp_TmnCode: process.env.VNP_TMN_CODE!,
    vnp_HashSecret: process.env.VNP_HASH_SECRET!,
    vnp_Url:
        "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",

    vnp_ReturnUrl:
        "http://localhost:5173/payment-success", // Trang FE nhận kết quả
    vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api.transaction",
    vnp_IpnUrl: `${NGROK_URL}/api/v1/online-payment/vnpay-ipn`
};