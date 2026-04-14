// import { useEffect, useState } from "react";
// import axiosClient from "../../api/axiosClient";

// export default function PtCheckinTab() {
//     const [bookings, setBookings] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);

//     //lay danh sach(only CONFIRMED)
//     const fetchBookings = async () => {
//         try {
//             setLoading(true);
//             //co the truyen them date
//             const res = await axiosClient.get('/booking', {
//                 params: { status: 'CONFIRMED' }
//             });
//             setBookings(res.data);
//         } catch (error) {
//             console.error('LỖI KHI TẢI DÁNH SÁCH LỊCH!');
//         } finally {
//             setLoading(false);
//         }
//     }

//     useEffect(() => {
//         fetchBookings();
//     }, []);


// }